import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.extend(isBetweenPlugin);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.locale('zh-cn');

export type DateInput = string | number | Date | dayjs.Dayjs | null | undefined;

export const formatDate = (date: DateInput, format: string = 'YYYY-MM-DD'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: DateInput, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatTime = (date: DateInput, format: string = 'HH:mm:ss'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date: DateInput): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const formatAge = (birthDate: DateInput): string => {
  if (!birthDate) return '-';
  const age = dayjs().diff(dayjs(birthDate), 'year');
  return `${age}岁`;
};

export const calculateAge = (birthDate: DateInput): number => {
  if (!birthDate) return 0;
  return dayjs().diff(dayjs(birthDate), 'year');
};

export const getAgeFromBirthday = (birthday: string): number => {
  return calculateAge(birthday);
};

export const getDaysDiff = (start: DateInput, end: DateInput): number => {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), 'day');
};

export const getMonthsDiff = (start: DateInput, end: DateInput): number => {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), 'month');
};

export const getHoursDiff = (start: DateInput, end: DateInput): number => {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), 'hour');
};

export const getMinutesDiff = (start: DateInput, end: DateInput): number => {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), 'minute');
};

export const addDays = (date: DateInput, days: number): string => {
  if (!date) return '';
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
};

export const addHours = (date: DateInput, hours: number): string => {
  if (!date) return '';
  return dayjs(date).add(hours, 'hour').format('YYYY-MM-DD HH:mm:ss');
};

export const addMinutes = (date: DateInput, minutes: number): string => {
  if (!date) return '';
  return dayjs(date).add(minutes, 'minute').format('YYYY-MM-DD HH:mm:ss');
};

export const subtractDays = (date: DateInput, days: number): string => {
  if (!date) return '';
  return dayjs(date).subtract(days, 'day').format('YYYY-MM-DD');
};

export const isToday = (date: DateInput): boolean => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isYesterday = (date: DateInput): boolean => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
};

export const isTomorrow = (date: DateInput): boolean => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

export const isThisMonth = (date: DateInput): boolean => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'month');
};

export const isThisYear = (date: DateInput): boolean => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'year');
};

export const isPast = (date: DateInput): boolean => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
};

export const isFuture = (date: DateInput): boolean => {
  if (!date) return false;
  return dayjs(date).isAfter(dayjs());
};

export const getWeekDay = (date: DateInput): string => {
  if (!date) return '';
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[dayjs(date).day()];
};

export const getMonthDays = (date: DateInput): number => {
  if (!date) return 0;
  return dayjs(date).daysInMonth();
};

export const getStartOfDay = (date: DateInput): string => {
  if (!date) return '';
  return dayjs(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
};

export const getEndOfDay = (date: DateInput): string => {
  if (!date) return '';
  return dayjs(date).endOf('day').format('YYYY-MM-DD HH:mm:ss');
};

export const getStartOfMonth = (date: DateInput): string => {
  if (!date) return '';
  return dayjs(date).startOf('month').format('YYYY-MM-DD');
};

export const getEndOfMonth = (date: DateInput): string => {
  if (!date) return '';
  return dayjs(date).endOf('month').format('YYYY-MM-DD');
};

export const getStartOfWeek = (date: DateInput): string => {
  if (!date) return '';
  return dayjs(date).startOf('week').format('YYYY-MM-DD');
};

export const getEndOfWeek = (date: DateInput): string => {
  if (!date) return '';
  return dayjs(date).endOf('week').format('YYYY-MM-DD');
};

export const getDateRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = dayjs().format('YYYY-MM-DD');
  const startDate = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD');
  return { startDate, endDate };
};

export const getMonthRange = (months: number): { startDate: string; endDate: string } => {
  const endDate = dayjs().format('YYYY-MM-DD');
  const startDate = dayjs().subtract(months - 1, 'month').format('YYYY-MM-DD');
  return { startDate, endDate };
};

export const getToday = (format: string = 'YYYY-MM-DD'): string => {
  return dayjs().format(format);
};

export const getNow = (format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs().format(format);
};

export const getCurrentTime = (): string => {
  return dayjs().format('HH:mm:ss');
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 0) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
};

export const formatDurationHours = (hours: number): string => {
  if (hours < 0) return '-';
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) {
    return `${days}天${remainingHours > 0 ? remainingHours + '小时' : ''}`;
  }
  return `${remainingHours}小时`;
};

export const getTimeSlots = (startHour: number = 8, endHour: number = 18, interval: number = 30): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

export const isBetween = (date: DateInput, start: DateInput, end: DateInput): boolean => {
  if (!date || !start || !end) return false;
  return dayjs(date).isBetween(dayjs(start), dayjs(end), 'day', '[]');
};

export const getQuarter = (date: DateInput): number => {
  if (!date) return 0;
  return dayjs(date).quarter();
};

export const getWeekOfYear = (date: DateInput): number => {
  if (!date) return 0;
  return dayjs(date).week();
};

export default dayjs;
