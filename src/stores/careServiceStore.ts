import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CareService } from '@/types';
import { mockCareServices } from '@/mock';
import dayjs from 'dayjs';

interface ServiceState {
  services: CareService[];
  initialized: boolean;
}

interface ServiceActions {
  initIfNeeded: () => void;
  startService: (id: string) => void;
  completeService: (id: string, payload: { elderStatus: string; notes?: string; duration: number }) => void;
  updateService: (id: string, patch: Partial<CareService>) => void;
  addService: (service: CareService) => void;
  markHandover: (ids: string[], note: string, fromName: string) => void;
  getTodayServices: () => CareService[];
}

export const useCareServiceStore = create<ServiceState & ServiceActions>()(
  persist(
    (set, get) => ({
      services: [],
      initialized: false,

      initIfNeeded: () => {
        if (!get().initialized) {
          set({ services: mockCareServices, initialized: true });
        }
      },

      startService: (id) => {
        set({
          services: get().services.map(s =>
            s.id === id
              ? { ...s, status: 'in_progress' as const, startedAt: new Date().toISOString() }
              : s
          ),
        });
      },

      completeService: (id, { elderStatus, notes, duration }) => {
        set({
          services: get().services.map(s =>
            s.id === id
              ? {
                  ...s,
                  status: 'completed' as const,
                  completedAt: new Date().toISOString(),
                  duration,
                  elderStatus,
                  notes,
                }
              : s
          ),
        });
      },

      updateService: (id, patch) => {
        set({
          services: get().services.map(s => (s.id === id ? { ...s, ...patch } : s)),
        });
      },

      addService: (service) => {
        set({ services: [service, ...get().services] });
      },

      markHandover: (ids, note, fromName) => {
        const ts = new Date().toISOString();
        set({
          services: get().services.map(s =>
            ids.includes(s.id)
              ? {
                  ...s,
                  notes: [s.notes, `【${dayjs(ts).format('HH:mm')} 交接-${fromName}】${note}`]
                    .filter(Boolean)
                    .join(' | '),
                }
              : s
          ),
        });
      },

      getTodayServices: () => {
        const today = dayjs().format('YYYY-MM-DD');
        return get().services.filter(s => dayjs(s.scheduledAt).format('YYYY-MM-DD') === today);
      },
    }),
    {
      name: 'care-services-storage',
      partialize: (state) => ({ services: state.services, initialized: state.initialized }),
    }
  )
);
