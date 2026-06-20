import { useState, useEffect, useMemo, useCallback } from 'react';
import type { EChartsOption, EChartsCoreOption } from 'echarts';
import { randomInt, randomFloat } from '@/api/mock';
import { getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth, getDateRange } from '@/utils/date';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'gauge';

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface ChartDataPoint {
  name: string;
  value: number | number[];
  [key: string]: unknown;
}

export interface ChartSeries {
  name: string;
  type: ChartType;
  data: number[] | ChartDataPoint[];
  color?: string;
  areaStyle?: unknown;
  smooth?: boolean;
  [key: string]: unknown;
}

export interface ChartConfig {
  title?: string;
  xAxisData?: string[];
  series: ChartSeries[];
  legend?: string[];
  colors?: string[];
  tooltip?: unknown;
  grid?: unknown;
}

export interface UseChartOptions {
  autoFetch?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
}

export interface TrendData {
  date: string;
  value: number;
  [key: string]: unknown;
}

export interface HealthChartData {
  dates: string[];
  heartRate: number[];
  bloodPressureSystolic: number[];
  bloodPressureDiastolic: number[];
  bloodSugar: number[];
  bloodOxygen: number[];
  temperature: number[];
}

export interface ServiceChartData {
  types: string[];
  counts: number[];
  amounts: number[];
}

export interface AlertChartData {
  types: string[];
  counts: number[];
  levels: { name: string; value: number }[];
}

export interface FinanceChartData {
  dates: string[];
  income: number[];
  expense: number[];
}

export const DEFAULT_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#fa8c16',
  '#eb2f96',
];

export const HEALTH_COLORS = {
  heartRate: '#f5222d',
  bloodPressure: '#faad14',
  bloodSugar: '#722ed1',
  bloodOxygen: '#1890ff',
  temperature: '#13c2c2',
  weight: '#52c41a',
};

export const useChart = (
  dataFetcher?: () => Promise<ChartConfig>,
  options: UseChartOptions = {}
) => {
  const { autoFetch = true, emptyMessage = '暂无数据', loadingMessage = '加载中...' } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [config, setConfig] = useState<ChartConfig | null>(null);

  const fetchData = useCallback(async () => {
    if (!dataFetcher) return;

    setLoading(true);
    setError(null);
    try {
      const result = await dataFetcher();
      setConfig(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载数据失败'));
    } finally {
      setLoading(false);
    }
  }, [dataFetcher]);

  useEffect(() => {
    if (autoFetch && dataFetcher) {
      fetchData();
    }
  }, [autoFetch, dataFetcher, fetchData]);

  const eChartsOption = useMemo((): EChartsOption => {
    if (!config) {
      return {
        title: {
          text: loading ? loadingMessage : emptyMessage,
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
            fontWeight: 'normal',
          },
        },
      };
    }

    const series = config.series.map(s => ({
      ...s,
      type: s.type === 'area' ? 'line' : s.type,
      ...(s.type === 'area' ? { areaStyle: s.areaStyle || { opacity: 0.3 } } : {}),
    })) as unknown as EChartsOption['series'];

    return {
      title: config.title
        ? {
            text: config.title,
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 600,
            },
          }
        : undefined,
      tooltip: config.tooltip || {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: config.legend
        ? {
            data: config.legend,
            bottom: 10,
          }
        : undefined,
      grid: config.grid || {
        left: '3%',
        right: '4%',
        bottom: config.legend ? 50 : 20,
        top: config.title ? 50 : 20,
        containLabel: true,
      },
      color: config.colors || DEFAULT_COLORS,
      xAxis: config.xAxisData
        ? {
            type: 'category',
            boundaryGap: true,
            data: config.xAxisData,
            axisLine: {
              lineStyle: {
                color: '#e8e8e8',
              },
            },
            axisLabel: {
              color: '#666',
            },
          }
        : undefined,
      yAxis: config.xAxisData
        ? {
            type: 'value',
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: '#f0f0f0',
                type: 'dashed',
              },
            },
            axisLabel: {
              color: '#666',
            },
          }
        : undefined,
      series,
    };
  }, [config, loading, loadingMessage, emptyMessage]);

  const isEmpty = !loading && !error && (!config || config.series.every(s => s.data.length === 0));

  return {
    loading,
    error,
    config,
    eChartsOption,
    isEmpty,
    reload: fetchData,
    setConfig,
  };
};

export const useHealthTrendChart = (elderId?: string, days: number = 7) => {
  const generateData = useCallback((): HealthChartData => {
    const { startDate, endDate } = getDateRange(days);
    const dates: string[] = [];
    const heartRate: number[] = [];
    const bloodPressureSystolic: number[] = [];
    const bloodPressureDiastolic: number[] = [];
    const bloodSugar: number[] = [];
    const bloodOxygen: number[] = [];
    const temperature: number[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0].slice(5));
      heartRate.push(randomInt(65, 90));
      bloodPressureSystolic.push(randomInt(100, 135));
      bloodPressureDiastolic.push(randomInt(65, 85));
      bloodSugar.push(randomFloat(4.0, 6.5, 1));
      bloodOxygen.push(randomInt(96, 99));
      temperature.push(randomFloat(36.2, 37.0, 1));
    }

    return { dates, heartRate, bloodPressureSystolic, bloodPressureDiastolic, bloodSugar, bloodOxygen, temperature };
  }, [days, elderId]);

  const [data, setData] = useState<HealthChartData>(generateData());

  useEffect(() => {
    setData(generateData());
  }, [generateData]);

  const getChartConfig = useCallback(
    (metrics: ('heartRate' | 'bloodPressure' | 'bloodSugar' | 'bloodOxygen' | 'temperature')[] = ['heartRate']): ChartConfig => {
      const series: ChartSeries[] = [];

      metrics.forEach(metric => {
        if (metric === 'heartRate') {
          series.push({
            name: '心率',
            type: 'line',
            data: data.heartRate,
            color: HEALTH_COLORS.heartRate,
            smooth: true,
            yAxisIndex: 0,
          });
        } else if (metric === 'bloodPressure') {
          series.push(
            {
              name: '收缩压',
              type: 'line',
              data: data.bloodPressureSystolic,
              color: HEALTH_COLORS.bloodPressure,
              smooth: true,
            },
            {
              name: '舒张压',
              type: 'line',
              data: data.bloodPressureDiastolic,
              color: '#13c2c2',
              smooth: true,
            }
          );
        } else if (metric === 'bloodSugar') {
          series.push({
            name: '血糖',
            type: 'line',
            data: data.bloodSugar,
            color: HEALTH_COLORS.bloodSugar,
            smooth: true,
          });
        } else if (metric === 'bloodOxygen') {
          series.push({
            name: '血氧',
            type: 'line',
            data: data.bloodOxygen,
            color: HEALTH_COLORS.bloodOxygen,
            smooth: true,
          });
        } else if (metric === 'temperature') {
          series.push({
            name: '体温',
            type: 'line',
            data: data.temperature,
            color: HEALTH_COLORS.temperature,
            smooth: true,
          });
        }
      });

      return {
        xAxisData: data.dates,
        series,
        legend: series.map(s => s.name),
        colors: series.map(s => s.color as string),
      };
    },
    [data]
  );

  const getGaugeConfig = useCallback(
    (value: number, min: number, max: number, title: string, unit: string): EChartsOption => {
      return {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min,
            max,
            radius: '100%',
            center: ['50%', '75%'],
            axisLine: {
              lineStyle: {
                width: 20,
                color: [
                  [0.3, '#f5222d'],
                  [0.7, '#faad14'],
                  [1, '#52c41a'],
                ],
              },
            },
            pointer: {
              icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
              length: '60%',
              width: 10,
              itemStyle: {
                color: 'auto',
              },
            },
            axisTick: {
              length: 8,
              lineStyle: {
                color: 'auto',
                width: 1,
              },
            },
            splitLine: {
              length: 15,
              lineStyle: {
                color: 'auto',
                width: 2,
              },
            },
            axisLabel: {
              color: '#666',
              fontSize: 12,
              distance: -40,
            },
            title: {
              offsetCenter: [0, '-20%'],
              fontSize: 14,
              color: '#666',
            },
            detail: {
              fontSize: 24,
              fontWeight: 'bold',
              offsetCenter: [0, '0%'],
              formatter: `{value} ${unit}`,
              color: 'auto',
            },
            data: [
              {
                value,
                name: title,
              },
            ],
          },
        ],
      };
    },
    []
  );

  return {
    data,
    getChartConfig,
    getGaugeConfig,
    refresh: () => setData(generateData()),
  };
};

export const useServiceStatsChart = (timeRange: TimeRange = 'week') => {
  const generateData = useCallback((): ServiceChartData => {
    const types = ['日常照料', '护理服务', '医疗服务', '康复服务', '心理服务', '餐饮服务'];
    const counts = types.map(() => randomInt(10, 100));
    const amounts = types.map(() => randomFloat(500, 5000, 0));
    return { types, counts, amounts };
  }, [timeRange]);

  const [data, setData] = useState<ServiceChartData>(generateData());

  useEffect(() => {
    setData(generateData());
  }, [generateData]);

  const getBarChartConfig = useCallback((): ChartConfig => {
    return {
      xAxisData: data.types,
      series: [
        {
          name: '服务次数',
          type: 'bar',
          data: data.counts,
          color: '#1890ff',
          barWidth: '40%',
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
    };
  }, [data]);

  const getPieChartConfig = useCallback((): EChartsOption => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      color: DEFAULT_COLORS,
      series: [
        {
          name: '服务类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.types.map((type, index) => ({
            name: type,
            value: data.counts[index],
          })),
        },
      ],
    };
  }, [data]);

  return {
    data,
    getBarChartConfig,
    getPieChartConfig,
    refresh: () => setData(generateData()),
  };
};

export const useAlertStatsChart = () => {
  const generateData = useCallback((): AlertChartData => {
    const types = ['健康异常', '跌倒告警', '紧急呼救', '用药提醒', '设备异常', '异常行为'];
    const counts = types.map(() => randomInt(0, 50));
    const levels = [
      { name: '紧急', value: randomInt(0, 10) },
      { name: '高', value: randomInt(5, 20) },
      { name: '中', value: randomInt(10, 30) },
      { name: '低', value: randomInt(15, 40) },
    ];
    return { types, counts, levels };
  }, []);

  const [data, setData] = useState<AlertChartData>(generateData());

  const getBarChartConfig = useCallback((): ChartConfig => {
    return {
      xAxisData: data.types,
      series: [
        {
          name: '告警数量',
          type: 'bar',
          data: data.counts,
          color: '#f5222d',
          barWidth: '50%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
    };
  }, [data]);

  const getPieChartConfig = useCallback((): EChartsOption => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        bottom: 10,
      },
      color: ['#f5222d', '#fa8c16', '#faad14', '#52c41a'],
      series: [
        {
          name: '告警级别',
          type: 'pie',
          radius: '60%',
          center: ['50%', '45%'],
          data: data.levels,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }, [data]);

  return {
    data,
    getBarChartConfig,
    getPieChartConfig,
    refresh: () => setData(generateData()),
  };
};

export const useFinanceChart = (timeRange: TimeRange = 'month') => {
  const generateData = useCallback((): FinanceChartData => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const dates: string[] = [];
    const income: number[] = [];
    const expense: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0].slice(5));
      income.push(randomFloat(1000, 5000, 0));
      expense.push(randomFloat(500, 2500, 0));
    }

    return { dates, income, expense };
  }, [timeRange]);

  const [data, setData] = useState<FinanceChartData>(generateData());

  useEffect(() => {
    setData(generateData());
  }, [generateData]);

  const getAreaChartConfig = useCallback((): ChartConfig => {
    return {
      xAxisData: data.dates,
      series: [
        {
          name: '收入',
          type: 'area',
          data: data.income,
          color: '#52c41a',
          smooth: true,
        },
        {
          name: '支出',
          type: 'area',
          data: data.expense,
          color: '#f5222d',
          smooth: true,
        },
      ],
      legend: ['收入', '支出'],
      colors: ['#52c41a', '#f5222d'],
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const p = params as Array<{ axisValue: string; seriesName: string; value: number }>;
          let result = `<div>${p[0].axisValue}</div>`;
          p.forEach(item => {
            result += `<div>${item.seriesName}: ¥${item.value.toLocaleString()}</div>`;
          });
          return result;
        },
      },
    };
  }, [data]);

  return {
    data,
    getAreaChartConfig,
    refresh: () => setData(generateData()),
  };
};

export const useTimeRange = (defaultRange: TimeRange = 'week') => {
  const [range, setRange] = useState<TimeRange>(defaultRange);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const rangeDates = useMemo(() => {
    const now = new Date();
    switch (range) {
      case 'today':
        return {
          start: getStartOfDay(now),
          end: getEndOfDay(now),
          label: '今日',
        };
      case 'week':
        return {
          start: getStartOfWeek(now),
          end: getEndOfWeek(now),
          label: '本周',
        };
      case 'month':
        return {
          start: getStartOfMonth(now),
          end: getEndOfMonth(now),
          label: '本月',
        };
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart);
        quarterEnd.setMonth(quarterEnd.getMonth() + 3);
        quarterEnd.setDate(0);
        return {
          start: quarterStart.toISOString().split('T')[0],
          end: quarterEnd.toISOString().split('T')[0],
          label: '本季度',
        };
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        return {
          start: yearStart.toISOString().split('T')[0],
          end: yearEnd.toISOString().split('T')[0],
          label: '本年',
        };
      case 'custom':
        return {
          start: customStart,
          end: customEnd,
          label: '自定义',
        };
      default:
        return {
          start: '',
          end: '',
          label: '',
        };
    }
  }, [range, customStart, customEnd]);

  return {
    range,
    setRange,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    ...rangeDates,
  };
};

export default useChart;
