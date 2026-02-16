/**
 * Testes de segurança: headers em next.config
 * Garantir que X-Frame-Options, X-Content-Type-Options, etc. estão configurados.
 */
import { describe, it, expect } from 'vitest';
import nextConfig from './next.config';

describe('next.config – security headers', () => {
  it('headers() retorna array com regra para todas as rotas', async () => {
    const headers = nextConfig.headers;
    expect(typeof headers).toBe('function');

    const result = await (headers as () => Promise<{ source: string; headers: { key: string; value: string }[] }[]>)();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    const rule = result.find((r) => r.source === '/(.*)');
    expect(rule).toBeDefined();
  });

  it('inclui X-Frame-Options DENY (anti-clickjacking)', async () => {
    const result = await (nextConfig.headers as () => Promise<{ headers: { key: string; value: string }[] }[]>)();
    const rule = result.find((r) => r.source === '/(.*)') ?? result[0];
    const frame = rule.headers.find((h) => h.key === 'X-Frame-Options');
    expect(frame).toEqual({ key: 'X-Frame-Options', value: 'DENY' });
  });

  it('inclui X-Content-Type-Options nosniff', async () => {
    const result = await (nextConfig.headers as () => Promise<{ headers: { key: string; value: string }[] }[]>)();
    const rule = result.find((r) => r.source === '/(.*)') ?? result[0];
    const cto = rule.headers.find((h) => h.key === 'X-Content-Type-Options');
    expect(cto?.value).toBe('nosniff');
  });

  it('inclui Referrer-Policy e Permissions-Policy', async () => {
    const result = await (nextConfig.headers as () => Promise<{ headers: { key: string; value: string }[] }[]>)();
    const rule = result.find((r) => r.source === '/(.*)') ?? result[0];
    const keys = rule.headers.map((h) => h.key);
    expect(keys).toContain('Referrer-Policy');
    expect(keys).toContain('Permissions-Policy');
  });
});
