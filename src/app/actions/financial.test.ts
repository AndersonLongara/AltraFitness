/**
 * Testes de segurança: actions financeiras (ownership / IDOR)
 * Garantir que planos e pagamentos são filtrados por trainerId e que
 * createPayment/assignPlan validam aluno do trainer.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  deletePlan,
  togglePlanStatus,
  createPayment,
  markAsPaid,
  deletePayment,
  assignPlanToStudent,
} from '@/app/actions/financial';

vi.mock('@/lib/auth-helpers', () => ({
  getCurrentTrainer: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    delete: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { getCurrentTrainer } from '@/lib/auth-helpers';
import { db } from '@/db';

const mockGetCurrentTrainer = vi.mocked(getCurrentTrainer);
const mockDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCurrentTrainer.mockResolvedValue({
    id: 'trainer-1',
    name: 'Trainer One',
    email: 't1@test.com',
    role: 'trainer',
  });
});

describe('financial actions – ownership (IDOR)', () => {
  describe('deletePlan', () => {
    it('chama getCurrentTrainer antes de deletar', async () => {
      const whereFn = vi.fn().mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue({ where: whereFn } as any);

      await deletePlan('plan-123');

      expect(mockGetCurrentTrainer).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalled();
      expect(whereFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('togglePlanStatus', () => {
    it('chama getCurrentTrainer e usa db.update com where', async () => {
      const setFn = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      mockDb.update.mockReturnValue({ set: setFn } as any);

      await togglePlanStatus('plan-123', false);

      expect(mockGetCurrentTrainer).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
      expect(setFn).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
    });
  });

  describe('createPayment', () => {
    it('lança erro quando aluno não pertence ao trainer', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      await expect(
        createPayment({
          studentId: 'student-outro-trainer',
          amount: 10000,
          dueDate: new Date(),
        })
      ).rejects.toThrow(/Aluno não encontrado ou sem permissão/);

      expect(mockGetCurrentTrainer).toHaveBeenCalled();
    });

    it('insere pagamento quando aluno pertence ao trainer', async () => {
      const valuesFn = vi.fn().mockResolvedValue(undefined);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 'student-1' }]),
        }),
      } as any);
      mockDb.insert.mockReturnValue({ values: valuesFn } as any);

      await createPayment({
        studentId: 'student-1',
        amount: 10000,
        dueDate: new Date(),
      });

      expect(valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          trainerId: 'trainer-1',
          studentId: 'student-1',
          amount: 10000,
          status: 'pending',
        })
      );
    });
  });

  describe('markAsPaid', () => {
    it('chama getCurrentTrainer e update com where', async () => {
      const setFn = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      mockDb.update.mockReturnValue({ set: setFn } as any);

      await markAsPaid('payment-123');

      expect(mockGetCurrentTrainer).toHaveBeenCalled();
      expect(setFn).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid' }));
    });
  });

  describe('deletePayment', () => {
    it('chama getCurrentTrainer e delete com where', async () => {
      const whereFn = vi.fn().mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue({ where: whereFn } as any);

      await deletePayment('payment-123');

      expect(mockGetCurrentTrainer).toHaveBeenCalled();
      expect(whereFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('assignPlanToStudent', () => {
    it('lança quando plano não pertence ao trainer', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      await expect(
        assignPlanToStudent({ studentId: 'student-1', planId: 'plan-outro' })
      ).rejects.toThrow(/Plano não encontrado ou sem permissão/);
    });

    it('lança quando aluno não pertence ao trainer', async () => {
      const whereFn = vi.fn()
        .mockResolvedValueOnce([{ id: 'plan-1', durationMonths: 1 }])
        .mockResolvedValueOnce([]);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({ where: whereFn }),
      } as any);

      await expect(
        assignPlanToStudent({ studentId: 'student-outro', planId: 'plan-1' })
      ).rejects.toThrow(/Aluno não encontrado ou sem permissão/);
    });
  });
});
