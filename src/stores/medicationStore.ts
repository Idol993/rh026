import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MedicationRecord } from '@/types';
import { mockMedicationRecords } from '@/mock';
import dayjs from 'dayjs';

type InterventionPayload = {
  measures: string[];
  reason?: string;
  note?: string;
  operator?: string;
  assisted: boolean;
};

interface MedState {
  records: MedicationRecord[];
  initialized: boolean;
}

interface MedActions {
  initIfNeeded: () => void;
  confirmTaken: (id: string, operator?: string) => void;
  interveneMissed: (id: string, payload: InterventionPayload) => void;
  updateRecord: (id: string, patch: Partial<MedicationRecord>) => void;
  markHandover: (ids: string[], note: string, fromName: string) => void;
  getTodayRecords: () => MedicationRecord[];
}

export const useMedicationStore = create<MedState & MedActions>()(
  persist(
    (set, get) => ({
      records: [],
      initialized: false,

      initIfNeeded: () => {
        if (!get().initialized) {
          set({ records: mockMedicationRecords, initialized: true });
        }
      },

      confirmTaken: (id, operator = '王护工') => {
        set({
          records: get().records.map(r =>
            r.id === id
              ? {
                  ...r,
                  status: 'taken' as const,
                  takenAt: new Date().toISOString(),
                  notedBy: operator,
                }
              : r
          ),
        });
      },

      interveneMissed: (id, { measures, reason, note, operator = '王护工', assisted }) => {
        set({
          records: get().records.map(r => {
            if (r.id !== id) return r;
            const parts = [];
            if (measures?.length) parts.push(`措施:${measures.join('、')}`);
            if (reason) parts.push(`原因:${reason}`);
            if (note) parts.push(note);
            const merged = [r.note, parts.join('；')].filter(Boolean).join(' | ');
            return {
              ...r,
              status: assisted ? 'taken' : r.status,
              takenAt: assisted ? new Date().toISOString() : r.takenAt,
              notedBy: operator,
              note: merged,
            };
          }),
        });
      },

      updateRecord: (id, patch) => {
        set({
          records: get().records.map(r => (r.id === id ? { ...r, ...patch } : r)),
        });
      },

      markHandover: (ids, note, fromName) => {
        const ts = dayjs().format('HH:mm');
        set({
          records: get().records.map(r => {
            if (!ids.includes(r.id)) return r;
            const merged = [r.note, `【${ts} 交接-${fromName}】${note}`].filter(Boolean).join(' | ');
            return { ...r, note: merged };
          }),
        });
      },

      getTodayRecords: () => {
        const today = dayjs().format('YYYY-MM-DD');
        return get().records.filter(r => dayjs(r.scheduledTime).format('YYYY-MM-DD') === today);
      },
    }),
    {
      name: 'medication-storage',
      partialize: (state) => ({ records: state.records, initialized: state.initialized }),
    }
  )
);
