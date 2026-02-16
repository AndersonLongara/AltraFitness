/**
 * Testes de segurança: nutrition (deleteAdHocLog)
 * Garantir que só é possível deletar log do aluno autenticado.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteAdHocLog } from '@/app/actions/nutrition';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    query: { students: { findFirst: vi.fn() } },
    delete: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';

const mockAuth = vi.mocked(auth);
const mockCurrentUser = vi.mocked(currentUser);
const mockDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ userId: 'user-1' } as any);
  mockCurrentUser.mockResolvedValue({
    id: 'user-1',
    emailAddresses: [{ emailAddress: 'student@test.com' }],
  } as any);
});

describe('deleteAdHocLog – ownership', () => {
  it('lança Unauthorized quando não há usuário', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);
    mockCurrentUser.mockResolvedValue(null);

    await expect(deleteAdHocLog('log-123')).rejects.toThrow('Unauthorized');
  });

  it('lança Student not found quando email não está em students', async () => {
    mockDb.query.students.findFirst.mockResolvedValue(undefined as any);

    await expect(deleteAdHocLog('log-123')).rejects.toThrow('Student not found');
  });

  it('chama db.delete com where (logId + studentId) quando aluno existe', async () => {
    mockDb.query.students.findFirst.mockResolvedValue({ id: 'student-1' } as any);
    const whereFn = vi.fn().mockResolvedValue(undefined);
    mockDb.delete.mockReturnValue({ where: whereFn } as any);

    await deleteAdHocLog('log-123');

    expect(mockDb.delete).toHaveBeenCalled();
    expect(whereFn).toHaveBeenCalledTimes(1);
  });
});
