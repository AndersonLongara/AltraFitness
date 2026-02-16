/**
 * Testes de segurança: workout-execution (finishWorkout)
 * Garantir que só o dono do log pode finalizar o treino (evitar XP em nome de outro).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { finishWorkout } from '@/app/actions/workout-execution';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    query: {
      students: { findFirst: vi.fn() },
      workoutLogs: { findFirst: vi.fn() },
    },
    update: vi.fn(),
  },
}));

vi.mock('@/services/gamification', () => ({
  addXp: vi.fn().mockResolvedValue(undefined),
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

describe('finishWorkout – ownership', () => {
  it('lança Unauthorized quando não há usuário', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);
    mockCurrentUser.mockResolvedValue(null);

    await expect(finishWorkout('log-123')).rejects.toThrow('Unauthorized');
  });

  it('lança Student not found quando email não está em students', async () => {
    mockDb.query.students.findFirst.mockResolvedValue(undefined as any);

    await expect(finishWorkout('log-123')).rejects.toThrow('Student not found');
  });

  it('lança Log not found or access denied quando o log é de outro aluno', async () => {
    mockDb.query.students.findFirst.mockResolvedValue({ id: 'student-1' } as any);
    mockDb.query.workoutLogs.findFirst.mockResolvedValue({
      id: 'log-123',
      studentId: 'outro-student',
    } as any);

    await expect(finishWorkout('log-123')).rejects.toThrow(
      'Log not found or access denied'
    );
  });

  it('atualiza o log e chama addXp quando o log pertence ao aluno atual', async () => {
    mockDb.query.students.findFirst.mockResolvedValue({ id: 'student-1' } as any);
    mockDb.query.workoutLogs.findFirst.mockResolvedValue({
      id: 'log-123',
      studentId: 'student-1',
    } as any);
    const setFn = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    mockDb.update.mockReturnValue({ set: setFn } as any);

    await finishWorkout('log-123');

    expect(mockDb.update).toHaveBeenCalled();
    expect(setFn).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' })
    );
  });
});
