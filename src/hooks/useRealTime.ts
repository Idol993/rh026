import { useState, useEffect, useRef, useCallback } from 'react';
import { randomInt, randomFloat } from '@/api/mock';

export interface RealTimeData<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdate: Date | null;
  updateCount: number;
  isConnected: boolean;
}

export interface UseRealTimeOptions<T> {
  interval?: number;
  autoStart?: boolean;
  initialData?: T;
  onUpdate?: (data: T) => void;
  onError?: (error: Error) => void;
  simulate?: boolean;
}

export interface HealthRealTimeData {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodOxygen: number;
  temperature: number;
  timestamp: Date;
  status: 'normal' | 'warning' | 'danger';
}

export interface AlertRealTimeData {
  id: string;
  type: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  elderId: string;
  elderName: string;
  title: string;
  timestamp: Date;
}

export interface VitalSignData {
  time: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodOxygen: number;
}

const generateHealthData = (): HealthRealTimeData => {
  const heartRate = randomInt(55, 110);
  const systolic = randomInt(85, 150);
  const diastolic = randomInt(55, 95);
  const bloodOxygen = randomInt(90, 100);
  const temperature = randomFloat(35.8, 38.0, 1);

  let status: 'normal' | 'warning' | 'danger' = 'normal';
  if (
    heartRate < 50 ||
    heartRate > 120 ||
    systolic > 160 ||
    systolic < 80 ||
    bloodOxygen < 92 ||
    temperature > 38.0
  ) {
    status = 'danger';
  } else if (
    heartRate < 60 ||
    heartRate > 100 ||
    systolic > 140 ||
    systolic < 90 ||
    bloodOxygen < 95 ||
    temperature > 37.3
  ) {
    status = 'warning';
  }

  return {
    heartRate,
    bloodPressureSystolic: systolic,
    bloodPressureDiastolic: diastolic,
    bloodOxygen,
    temperature,
    timestamp: new Date(),
    status,
  };
};

const generateAlertData = (): AlertRealTimeData => {
  const types = ['health', 'fall', 'sos', 'medication', 'device', 'abnormal'];
  const levels: AlertRealTimeData['level'][] = ['low', 'medium', 'high', 'critical'];
  const type = types[randomInt(0, 5)];
  const levelMap: Record<string, AlertRealTimeData['level']> = {
    health: levels[randomInt(0, 2)],
    fall: 'critical',
    sos: 'critical',
    medication: 'low',
    device: levels[randomInt(0, 1)],
    abnormal: levels[randomInt(1, 3)],
  };
  const titleMap: Record<string, string[]> = {
    health: ['心率异常', '血压偏高', '血氧偏低'],
    fall: ['检测到跌倒事件'],
    sos: ['紧急呼救信号'],
    medication: ['用药提醒'],
    device: ['设备离线', '电量低'],
    abnormal: ['异常行为检测'],
  };

  return {
    id: `alert_rt_${randomInt(1, 100000)}`,
    type,
    level: levelMap[type],
    elderId: `elder_${randomInt(1, 50)}`,
    elderName: '老人姓名',
    title: titleMap[type][randomInt(0, titleMap[type].length - 1)],
    timestamp: new Date(),
  };
};

export function useRealTime<T = unknown>(
  dataGenerator: () => T,
  options: UseRealTimeOptions<T> = {}
): RealTimeData<T> & {
  start: () => void;
  stop: () => void;
  reset: () => void;
  update: () => void;
} {
  const { interval = 3000, autoStart = true, initialData, onUpdate, onError, simulate = true } = options;

  const [state, setState] = useState<RealTimeData<T>>({
    data: initialData ?? null,
    loading: autoStart,
    error: null,
    lastUpdate: null,
    updateCount: 0,
    isConnected: false,
  });

  const intervalRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const updateData = useCallback(() => {
    if (!simulate) return;

    try {
      const newData = dataGenerator();
      setState(prev => ({
        ...prev,
        data: newData,
        loading: false,
        error: null,
        lastUpdate: new Date(),
        updateCount: prev.updateCount + 1,
        isConnected: true,
      }));
      onUpdate?.(newData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState(prev => ({
        ...prev,
        error,
        loading: false,
        isConnected: false,
      }));
      onError?.(error);
    }
  }, [dataGenerator, onUpdate, onError, simulate]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setState(prev => ({ ...prev, loading: true, isConnected: true }));
    updateData();
    intervalRef.current = window.setInterval(updateData, interval);
  }, [interval, updateData]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isRunningRef.current = false;
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    setState({
      data: initialData ?? null,
      loading: false,
      error: null,
      lastUpdate: null,
      updateCount: 0,
      isConnected: false,
    });
  }, [stop, initialData]);

  const update = useCallback(() => {
    updateData();
  }, [updateData]);

  useEffect(() => {
    if (autoStart && simulate) {
      start();
    }
    return () => {
      stop();
    };
  }, [autoStart, simulate, start, stop]);

  return {
    ...state,
    start,
    stop,
    reset,
    update,
  };
}

export function useRealTimeHealth(
  elderId?: string,
  options: Omit<UseRealTimeOptions<HealthRealTimeData>, 'initialData'> = {}
) {
  return useRealTime<HealthRealTimeData>(generateHealthData, {
    ...options,
    initialData: generateHealthData(),
  });
}

export function useRealTimeAlerts(
  options: Omit<UseRealTimeOptions<AlertRealTimeData>, 'initialData'> = {}
) {
  return useRealTime<AlertRealTimeData>(generateAlertData, {
    ...options,
    interval: options.interval ?? 10000,
  });
}

export function useVitalSignsHistory(
  elderId?: string,
  maxPoints: number = 20,
  interval: number = 3000
) {
  const [data, setData] = useState<VitalSignData[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const newPoint: VitalSignData = {
        time: timeStr,
        heartRate: randomInt(60, 100),
        bloodPressureSystolic: randomInt(90, 140),
        bloodPressureDiastolic: randomInt(60, 90),
        bloodOxygen: randomInt(95, 100),
      };

      setData(prev => {
        const updated = [...prev, newPoint];
        if (updated.length > maxPoints) {
          return updated.slice(updated.length - maxPoints);
        }
        return updated;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [maxPoints, interval, elderId]);

  return {
    data,
    latest: data[data.length - 1] ?? null,
    clear: () => setData([]),
  };
}

export function useCountdown(
  targetDate: Date | number,
  options: { onComplete?: () => void; autoStart?: boolean } = {}
) {
  const { onComplete, autoStart = true } = options;
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
    completed: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    completed: false,
  });

  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<number | null>(null);

  const calculateTimeLeft = useCallback(() => {
    const target = targetDate instanceof Date ? targetDate.getTime() : targetDate;
    const now = Date.now();
    const difference = target - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        completed: true,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
      completed: false,
    };
  }, [targetDate]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    if (autoStart) {
      setIsRunning(true);
    }
  }, [autoStart, calculateTimeLeft]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.completed) {
        stop();
        onComplete?.();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, calculateTimeLeft, onComplete, stop]);

  return {
    ...timeLeft,
    isRunning,
    start,
    stop,
    reset: () => setTimeLeft(calculateTimeLeft()),
    format: (separator: string = ':') => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      if (timeLeft.days > 0) {
        return `${timeLeft.days}天 ${pad(timeLeft.hours)}${separator}${pad(timeLeft.minutes)}${separator}${pad(timeLeft.seconds)}`;
      }
      return `${pad(timeLeft.hours)}${separator}${pad(timeLeft.minutes)}${separator}${pad(timeLeft.seconds)}`;
    },
  };
}

export function useClock(format: string = 'YYYY-MM-DD HH:mm:ss', updateInterval: number = 1000) {
  const [time, setTime] = useState<Date>(new Date());
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekDay = weekDays[now.getDay()];

      setFormattedTime(
        format
          .replace('YYYY', String(year))
          .replace('MM', month)
          .replace('DD', day)
          .replace('HH', hours)
          .replace('mm', minutes)
          .replace('ss', seconds)
          .replace('dddd', weekDay)
      );
    };

    updateTime();
    const timer = setInterval(updateTime, updateInterval);
    return () => clearInterval(timer);
  }, [format, updateInterval]);

  return { time, formattedTime };
}

export default useRealTime;
