import type {
  FullConfig, FullResult, Reporter, Suite, TestCase, TestResult, TestStep,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { ReportingLabsOptions, ReportData, TestData, ResultData, StepData, AttachmentData, Status } from './types';
import { renderHtml } from './template';
import { makeMasker, parseCsv } from './mask';
import type { HistoryEntry } from './types';

const DEFAULT_EMBED_LIMIT = 2 * 1024 * 1024;

export default class ReportingLabsReporter implements Reporter {
  private options: ReportingLabsOptions;
  private config!: FullConfig;
  private suite!: Suite;
  private startTime = Date.now();
  private outDir = '';
  private assetsDir = '';
  private assetCounter = 0;
  private masker = makeMasker();

  constructor(options: ReportingLabsOptions = {}) {
    this.options = options;
    this.masker = makeMasker(options.maskKeys ?? []);
  }

  printsToStdio() { return false; }

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.suite = suite;
    this.startTime = Date.now();
    const base = config.configFile ? path.dirname(config.configFile) : process.cwd();
    this.outDir = path.resolve(base, this.options.outputFolder ?? 'reporting-labs');
    this.assetsDir = path.join(this.outDir, 'assets');
    fs.rmSync(this.outDir, { recursive: true, force: true });
    fs.mkdirSync(this.assetsDir, { recursive: true });
  }

  async onEnd(result: FullResult) {
    const tests: TestData[] = [];
    const projects = new Set<string>();
    let workers = 0;

    for (const test of this.suite.allTests()) {
      const project = test.parent.project()?.name ?? '';
      projects.add(project);
      const results = test.results.map(r => {
        workers = Math.max(workers, r.parallelIndex + 1);
        return this.serializeResult(r, test);
      });
      const outcome = this.outcome(test);
      tests.push({
        id: test.id,
        title: test.title,
        path: this.titlePath(test),
        file: path.relative(this.config.configFile ? path.dirname(this.config.configFile) : this.config.rootDir, test.location.file),
        line: test.location.line,
        project,
        tags: test.tags,
        annotations: test.annotations,
        meta: this.extractMeta(test),
        outcome,
        duration: results.reduce((a, r) => a + r.duration, 0),
        results,
      });
    }

    const stats = { passed: 0, failed: 0, skipped: 0, flaky: 0, timedOut: 0, interrupted: 0, total: tests.length } as ReportData['stats'];
    for (const t of tests) stats[t.outcome]++;

    const base = this.config.configFile ? path.dirname(this.config.configFile) : process.cwd();
    const histOn = this.options.history?.enabled ?? true;
    const { file: histFile, entries } = histOn ? this.loadHistory(base) : { file: '', entries: [] as HistoryEntry[] };
    const failedCount = stats.failed + stats.timedOut + stats.interrupted;
    const current: HistoryEntry = { time: this.startTime, duration: result.duration ?? Date.now() - this.startTime, passed: stats.passed, failed: failedCount, flaky: stats.flaky, skipped: stats.skipped, total: stats.total, label: this.options.metadata?.build ?? this.options.metadata?.branch };
    const history = [...entries, current].slice(-(this.options.history?.keep ?? 30));
    if (histOn) { try { fs.writeFileSync(histFile, JSON.stringify(history, null, 1)); } catch { /* read-only fs */ } }
    const bdd = this.options.bdd ?? tests.some(t => t.results.some(r => r.steps.some(st => /^(Given|When|Then|And|But)\b/.test(st.title))));

    const data: ReportData = {
      title: this.options.title ?? 'Test report',
      generatedAt: Date.now(),
      startTime: this.startTime,
      duration: result.duration ?? Date.now() - this.startTime,
      metadata: this.options.metadata ?? {},
      projects: [...projects],
      workers,
      stats,
      tests,
      history,
      bdd,
      options: {
        logo: this.options.logo,
        accent: this.options.accent,
        theme: this.options.theme ?? 'auto',
        palette: this.options.palette ?? 'lab',
        embedFonts: this.options.embedFonts ?? true,
        sections: this.options.sections ?? [],
        widgets: {
          runStrip: this.options.widgets?.runStrip ?? true,
          outcome: this.options.widgets?.outcome ?? true,
          attention: this.options.widgets?.attention ?? true,
          dimensions: this.options.widgets?.dimensions ?? true,
          timeline: this.options.widgets?.timeline ?? true,
          durations: this.options.widgets?.durations ?? true,
          tags: this.options.widgets?.tags ?? true,
          slowest: this.options.widgets?.slowest ?? true,
          projects: this.options.widgets?.projects ?? true,
        },
        dimensions: this.dimensions(),
        dimensionOrder: {
          priority: ['P0', 'P1', 'P2', 'P3', 'P4'],
          severity: ['blocker', 'critical', 'major', 'high', 'medium', 'normal', 'minor', 'low', 'trivial'],
          ...(this.options.dimensionOrder ?? {}),
        },
        project: this.options.project,
        links: this.options.links ?? {},
        customCss: this.options.customCss ?? '',
      },
    };

    const file = path.join(this.outDir, this.options.outputFile ?? 'index.html');
    fs.writeFileSync(file, renderHtml(data), 'utf8');
    if (this.options.announce !== false) {
      const rel = path.relative(process.cwd(), file);
      console.log(`\n  reporting-labs: report written to ${rel}\n`);
    }
  }

  // ---- helpers -------------------------------------------------------------

  private toDataBlock(name: string, raw: string): ResultData['data'][number] {
    let v: any; try { v = JSON.parse(raw); } catch { return { name, kind: 'text', text: this.masker.maskStr(raw) }; }
    if (v && typeof v === 'object' && typeof v.csv === 'string' && Object.keys(v).length === 1) {
      const { columns, rows } = parseCsv(v.csv);
      const masked = rows.map(r => r.map((c, i) => this.masker.isSensitive(columns[i] ?? '') ? '****' : this.masker.maskStr(c)));
      return { name, kind: 'table', columns, rows: masked };
    }
    v = this.masker.mask(v);
    if (Array.isArray(v) && v.length && v.every(x => x && typeof x === 'object' && !Array.isArray(x))) {
      const columns = [...new Set(v.flatMap((x: any) => Object.keys(x)))];
      return { name, kind: 'table', columns, rows: v.map((x: any) => columns.map(c => fmt(x[c]))) };
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) return { name, kind: 'kv', kv: Object.entries(v).map(([k, x]) => [k, fmt(x)]) };
    return { name, kind: 'text', text: JSON.stringify(v, null, 2) };
  }

  private loadHistory(base: string): { file: string; entries: HistoryEntry[] } {
    const file = path.resolve(base, this.options.history?.file ?? 'reporting-labs.history.json');
    let entries: HistoryEntry[] = [];
    try { entries = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* first run */ }
    return { file, entries };
  }

  private dimensions(): string[] {
    return (this.options.dimensions ?? ['priority', 'severity', 'feature', 'owner']).map(d => d.toLowerCase());
  }

  /** Pull dimension values from annotations and tags. */
  private extractMeta(test: TestCase): Record<string, string> {
    const dims = this.dimensions();
    const meta: Record<string, string> = {};
    for (const a of test.annotations) {
      const k = a.type.toLowerCase();
      if (dims.includes(k) && a.description) meta[k] = a.description;
    }
    for (const raw of test.tags) {
      const tag = raw.replace(/^@/, '');
      const m = tag.match(/^([a-z_-]+)[:=](.+)$/i);
      if (m && dims.includes(m[1].toLowerCase())) { meta[m[1].toLowerCase()] = m[2]; continue; }
      if (/^P[0-4]$/i.test(tag) && dims.includes('priority') && !meta.priority) meta.priority = tag.toUpperCase();
      if (/^(blocker|critical|major|minor|trivial)$/i.test(tag) && dims.includes('severity') && !meta.severity) meta.severity = tag.toLowerCase();
    }
    return meta;
  }

  private outcome(test: TestCase): Status {
    const o = test.outcome();
    if (o === 'expected') return test.results.some(r => r.status === 'skipped') && test.results.length === 1 ? 'skipped' : 'passed';
    if (o === 'skipped') return 'skipped';
    if (o === 'flaky') return 'flaky';
    const last = test.results[test.results.length - 1];
    if (last?.status === 'timedOut') return 'timedOut';
    if (last?.status === 'interrupted') return 'interrupted';
    return 'failed';
  }

  private titlePath(test: TestCase): string[] {
    const parts: string[] = [];
    let s: Suite | undefined = test.parent;
    while (s) {
      if (s.type === 'describe' && s.title) parts.unshift(s.title);
      s = s.parent;
    }
    return parts;
  }

  private serializeResult(r: TestResult, test: TestCase): ResultData {
    const logs: ResultData['logs'] = [], data: ResultData['data'] = [], api: ResultData['api'] = [];
    const normal: TestResult['attachments'] = [];
    for (const a of r.attachments) {
      const body = a.body ?? (a.path && fs.existsSync(a.path) ? fs.readFileSync(a.path) : undefined);
      if (a.contentType === 'application/x-rl-log' && body) { try { const l = JSON.parse(body.toString()); logs.push({ t: l.t, msg: this.masker.maskStr(String(l.msg)) }); } catch { /* ignore */ } continue; }
      if (a.contentType === 'application/x-rl-api' && body) { try { api.push(this.masker.mask(JSON.parse(body.toString())) as any); } catch { /* ignore */ } continue; }
      if (a.contentType === 'application/x-rl-data' && body) { data.push(this.toDataBlock(a.name, body.toString())); continue; }
      if (body && (a.contentType === 'text/csv' || /\.csv$/i.test(a.name))) { data.push(this.toDataBlock(a.name, JSON.stringify({ csv: body.toString() }))); continue; }
      normal.push(a);
    }
    return {
      logs: logs.sort((x, y) => x.t - y.t), data, api,
      retry: r.retry,
      status: r.status,
      duration: r.duration,
      startTime: r.startTime.getTime(),
      workerIndex: r.parallelIndex,
      errors: r.errors.map(e => ({
        message: stripAnsi(e.message ?? ''),
        stack: e.stack ? stripAnsi(e.stack) : undefined,
        snippet: (e as any).snippet ? stripAnsi((e as any).snippet) : undefined,
      })),
      steps: r.steps.map(s => this.serializeStep(s)),
      attachments: normal.map(a => this.serializeAttachment(a, test)).filter(Boolean) as AttachmentData[],
      stdout: r.stdout.map(c => stripAnsi(c.toString())),
      stderr: r.stderr.map(c => stripAnsi(c.toString())),
    };
  }

  private serializeStep(s: TestStep): StepData {
    return {
      title: s.title,
      category: s.category,
      duration: s.duration,
      error: s.error?.message ? stripAnsi(s.error.message) : undefined,
      steps: s.steps.map(c => this.serializeStep(c)),
    };
  }

  private serializeAttachment(a: TestResult['attachments'][number], test: TestCase): AttachmentData | null {
    const out: AttachmentData = { name: a.name, contentType: a.contentType };
    const embed = this.options.embedAttachments ?? true;
    const limit = this.options.embedLimit ?? DEFAULT_EMBED_LIMIT;
    const isImage = a.contentType.startsWith('image/');
    const isVideo = a.contentType.startsWith('video/');
    const isText = a.contentType.startsWith('text/') || a.contentType.includes('json');
    const canEmbed = embed && (isImage || (isVideo && this.options.embedVideos));

    let body: Buffer | undefined = a.body;
    if (!body && a.path && fs.existsSync(a.path)) {
      const size = fs.statSync(a.path).size;
      out.size = size;
      if (size <= limit && (canEmbed || isText)) body = fs.readFileSync(a.path);
    }
    if (body) {
      out.size = out.size ?? body.length;
      if (isText) { out.text = this.masker.maskStr(body.toString('utf8').slice(0, 20000)); return out; }
      if (canEmbed && body.length <= limit) { out.src = `data:${a.contentType};base64,${body.toString('base64')}`; return out; }
      if (!a.path) {
        // body-only attachment that we don't want inline (large or binary): write it to assets
        const name = `${sanitize(test.title)}-${a.name.replace(/[^a-z0-9.-]/gi, '_')}-${this.assetCounter++}${extFor(a.contentType)}`;
        fs.writeFileSync(path.join(this.assetsDir, name), body);
        out.src = `assets/${name}`;
        return out;
      }
    }
    if (a.path && fs.existsSync(a.path)) {
      const ext = path.extname(a.path) || extFor(a.contentType);
      const name = `${sanitize(test.title)}-${a.name.replace(/[^a-z0-9.-]/gi, '_')}-${this.assetCounter++}${ext}`;
      fs.copyFileSync(a.path, path.join(this.assetsDir, name));
      out.src = `assets/${name}`;
      return out;
    }
    return null;
  }
}

function extFor(ct: string) {
  const m: Record<string, string> = { 'image/png': '.png', 'image/jpeg': '.jpg', 'video/webm': '.webm', 'video/mp4': '.mp4', 'application/zip': '.zip', 'application/pdf': '.pdf' };
  return m[ct] ?? '';
}
function fmt(v: unknown): string {
  if (v == null) return '';
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
}
function stripAnsi(s: string) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\u001b\[[0-9;]*m/g, '');
}
function sanitize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}
