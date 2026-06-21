import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Alert, AlertNote, HandoverRecord, HandoverItem } from '@/types';
import { mockAlerts } from '@/mock';
import { useCareServiceStore } from './careServiceStore';
import { useMedicationStore } from './medicationStore';
import dayjs from 'dayjs';

interface HandoverPayload {
  toCaregiverId: string;
  toCaregiverName: string;
  shiftNote: string;
  items: HandoverItem[];
}

interface AlertState {
  alerts: Alert[];
  handovers: HandoverRecord[];
  initialized: boolean;
}

const TYPE_MAP: Record<string, string> = {
  fall: '跌倒', inactivity: '活动异常', out_of_bed: '离床超时',
  heart_rate: '心率异常', respiration: '呼吸异常', sos: 'SOS呼救',
  medication_miss: '漏药提醒', door: '门磁告警', smoke: '烟雾报警', gas: '燃气报警',
};

const STATUS_MAP: Record<string, string> = {
  pending: '待处理', acknowledged: '已确认', processing: '处理中',
  resolved: '已解决', closed: '已关闭',
};

const SERVICE_STATUS_MAP: Record<string, string> = {
  scheduled: '待执行', in_progress: '进行中', completed: '已完成',
  missed: '超时', cancelled: '已取消',
};

const _MED_STATUS_MAP: Record<string, string> = {
  scheduled: '待服', taken: '已服', missed: '漏服', refused: '拒服',
};

interface AlertActions {
  initIfNeeded: () => void;
  processStep: (alertId: string, stepIndex: number, actionLabel: string, note: string, userName: string, userId: string) => void;
  addNote: (alertId: string, note: AlertNote) => void;
  updateAlert: (id: string, patch: Partial<Alert>) => void;
  acknowledge: (id: string, userName: string, userId: string) => void;
  resolve: (id: string, note: string, userName: string, userId: string) => void;
  markHandover: (payload: HandoverPayload, fromId: string, fromName: string) => HandoverRecord;
  closeHandoverItem: (handoverId: string, itemRefId: string, closedBy: string) => void;
  getTodayAlerts: () => Alert[];
  getLatestHandoverForToday: () => HandoverRecord | null;
  getHandovers: (filter?: { period?: 'today' | 'week' | 'all'; closed?: boolean }) => HandoverRecord[];
  getHandoverById: (id: string) => HandoverRecord | null;
}

export const useAlertStore = create<AlertState & AlertActions>()(
  persist(
    (set, get) => ({
      alerts: [],
      handovers: [],
      initialized: false,

      initIfNeeded: () => {
        if (!get().initialized) {
          set({ alerts: mockAlerts, handovers: [], initialized: true });
        }
      },

      processStep: (alertId, stepIndex, actionLabel, note, userName, userId) => {
        const stepStatusMap: Record<number, Alert['status']> = {
          0: 'acknowledged',
          1: 'processing',
          2: 'processing',
          3: 'resolved',
        };
        const newNote: AlertNote = {
          id: `an-${Date.now()}`,
          userId,
          userName,
          timestamp: new Date().toISOString(),
          action: actionLabel,
          note,
        };
        const now = new Date().toISOString();
        set({
          alerts: get().alerts.map(a => {
            if (a.id !== alertId) return a;
            return {
              ...a,
              status: stepStatusMap[stepIndex] || a.status,
              acknowledgedAt: stepIndex === 0 ? now : a.acknowledgedAt,
              resolvedAt: stepIndex === 3 ? now : a.resolvedAt,
              handlingNotes: [...a.handlingNotes, newNote],
              assignedTo: userId,
              assignedToName: userName,
            };
          }),
        });
        if (stepIndex === 3) {
          get().closeHandoverItem('*', alertId, userName);
        }
      },

      addNote: (alertId, note) => {
        set({
          alerts: get().alerts.map(a =>
            a.id === alertId ? { ...a, handlingNotes: [...a.handlingNotes, note] } : a
          ),
        });
      },

      updateAlert: (id, patch) => {
        set({
          alerts: get().alerts.map(a => (a.id === id ? { ...a, ...patch } : a)),
        });
      },

      acknowledge: (id, userName, userId) => {
        get().processStep(id, 0, '到场确认', '已确认到场并开始处置', userName, userId);
      },

      resolve: (id, note, userName, userId) => {
        const now = new Date().toISOString();
        const actions = ['到场确认', '处置措施执行', '记录结果', '关闭工单'];
        const notesList: AlertNote[] = actions.map((ac, idx) => ({
          id: `an-${now}-${idx}`,
          userId,
          userName,
          timestamp: new Date(Date.now() + idx * 1000).toISOString(),
          action: ac,
          note: idx === 3 ? note : '处理中...',
        }));
        set({
          alerts: get().alerts.map(a =>
            a.id === id
              ? {
                  ...a,
                  status: 'resolved',
                  acknowledgedAt: notesList[0].timestamp,
                  resolvedAt: notesList[3].timestamp,
                  handlingNotes: [...a.handlingNotes, ...notesList],
                  assignedTo: userId,
                  assignedToName: userName,
                }
              : a
          ),
        });
        get().closeHandoverItem('*', id, userName);
      },

      markHandover: ({ toCaregiverId, toCaregiverName, shiftNote, items }, fromId, fromName) => {
        const record: HandoverRecord = {
          id: `ho-${Date.now()}`,
          fromCaregiverId: fromId,
          fromCaregiverName: fromName,
          toCaregiverId,
          toCaregiverName,
          createdAt: new Date().toISOString(),
          shiftNote,
          items,
        };
        const serviceIds = items.filter(i => i.type === 'service').map(i => i.refId);
        const medIds = items.filter(i => i.type === 'medication').map(i => i.refId);
        const alertIds = items.filter(i => i.type === 'alert').map(i => i.refId);
        if (serviceIds.length) {
          const { markHandover: markSvc } = useCareServiceStore.getState();
          markSvc(serviceIds, shiftNote, fromName);
        }
        if (medIds.length) {
          const { markHandover: markMed } = useMedicationStore.getState();
          markMed(medIds, shiftNote, fromName);
        }
        if (alertIds.length) {
          const ts = dayjs().format('HH:mm');
          set({
            alerts: get().alerts.map(a => {
              if (!alertIds.includes(a.id)) return a;
              return {
                ...a,
                handlingNotes: [
                  ...a.handlingNotes,
                  {
                    id: `an-ho-${Date.now()}-${a.id}`,
                    userId: fromId,
                    userName: fromName,
                    timestamp: new Date().toISOString(),
                    action: `【${ts} 交接给${toCaregiverName}】`,
                    note: shiftNote,
                  },
                ],
              };
            }),
          });
        }
        set({ handovers: [record, ...get().handovers] });
        return record;
      },

      closeHandoverItem: (handoverId, itemRefId, closedBy) => {
        const now = new Date().toISOString();
        set({
          handovers: get().handovers.map(h => {
            if (handoverId !== '*' && h.id !== handoverId) return h;
            const hasItem = h.items.some(i => i.refId === itemRefId);
            if (!hasItem) return h;
            return {
              ...h,
              items: h.items.map(i =>
                i.refId === itemRefId ? { ...i, closedAt: now, closedBy } : i
              ),
            };
          }),
        });
      },

      getTodayAlerts: () => {
        const today = dayjs().format('YYYY-MM-DD');
        return get().alerts.filter(a => dayjs(a.triggeredAt).format('YYYY-MM-DD') === today);
      },

      getLatestHandoverForToday: () => {
        const today = dayjs().format('YYYY-MM-DD');
        const todays = get().handovers.filter(h => dayjs(h.createdAt).format('YYYY-MM-DD') === today);
        return todays[0] || null;
      },

      getHandovers: (filter) => {
        let result = [...get().handovers];
        if (filter?.period === 'today') {
          const today = dayjs().format('YYYY-MM-DD');
          result = result.filter(h => dayjs(h.createdAt).format('YYYY-MM-DD') === today);
        } else if (filter?.period === 'week') {
          const weekAgo = dayjs().subtract(7, 'day');
          result = result.filter(h => dayjs(h.createdAt).isAfter(weekAgo));
        }
        if (filter?.closed === false) {
          result = result.filter(h => h.items.some(i => !i.closedAt));
        } else if (filter?.closed === true) {
          result = result.filter(h => h.items.every(i => i.closedAt));
        }
        return result;
      },

      getHandoverById: (id) => {
        return get().handovers.find(h => h.id === id) || null;
      },
    }),
    {
      name: 'alert-storage',
      partialize: (state) => ({ alerts: state.alerts, handovers: state.handovers, initialized: state.initialized }),
    }
  )
);

export const ALERT_TYPE_MAP = TYPE_MAP;
export const ALERT_STATUS_MAP = STATUS_MAP;
export const CARE_SERVICE_STATUS_MAP = SERVICE_STATUS_MAP;
export const MED_STATUS_MAP = _MED_STATUS_MAP;
