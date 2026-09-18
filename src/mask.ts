const DEFAULT_KEYS = ['password', 'passwd', 'pwd', 'secret', 'token', 'apikey', 'api_key', 'api-key', 'authorization', 'auth', 'cookie', 'set-cookie', 'session', 'credential', 'private', 'ssn', 'cvv', 'card'];
const VALUE_PATTERNS = [
  /\b(Bearer|Basic|Token)\s+[A-Za-z0-9._~+\/=-]{8,}/gi,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g, // JWT
  /\b(sk|pk|ghp|xox[abp]|AKIA)[_-]?[A-Za-z0-9]{12,}\b/g,
  /(password|passwd|pwd|token|secret|api[_-]?key)(\s*[=:]\s*)([^\s&;,"']+)/gi,
];

export function makeMasker(extraKeys: string[] = []) {
  const keys = [...DEFAULT_KEYS, ...extraKeys.map(k => k.toLowerCase())];
  const isSensitive = (k: string) => { const l = k.toLowerCase(); return keys.some(s => l === s || l.includes(s)); };
  const maskStr = (s: string) => VALUE_PATTERNS.reduce((acc, re) => acc.replace(re, (m, ...g) => {
    if (g.length >= 3 && typeof g[1] === 'string' && /[=:]/.test(g[1])) return g[0] + g[1] + '****';
    return m.split(/\s+/)[0] + ' ****';
  }), s);
  const mask = (v: unknown, key = ''): unknown => {
    if (key && isSensitive(key)) return '****';
    if (typeof v === 'string') return maskStr(v);
    if (Array.isArray(v)) return v.map(x => mask(x));
    if (v && typeof v === 'object') { const o: Record<string, unknown> = {}; for (const [k, x] of Object.entries(v as Record<string, unknown>)) o[k] = mask(x, k); return o; }
    return v;
  };
  return { mask, maskStr, isSensitive };
}

export function parseCsv(text: string): { columns: string[]; rows: string[][] } {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  const split = (l: string) => { const out: string[] = []; let cur = '', q = false; for (const c of l) { if (c === '"') q = !q; else if (c === ',' && !q) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out.map(s => s.trim()); };
  const [head, ...body] = lines.map(split);
  return { columns: head ?? [], rows: body };
}
