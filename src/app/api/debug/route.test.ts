/**
 * Testes de segurança: endpoint /api/debug
 * (REVIEW: não expor diagnóstico em produção)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';

describe('GET /api/debug', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('retorna 404 em produção para não vazar env/DB', async () => {
    process.env.NODE_ENV = 'production';

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toHaveProperty('error', 'Not available');
  });

  it('em desenvolvimento pode retornar diagnóstico (status 200)', async () => {
    process.env.NODE_ENV = 'development';

    const res = await GET();

    expect(res.status).toBe(200);
  });
});
