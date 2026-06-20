import { useEffect, useRef, useState } from 'react';
import { Card, Tag, Badge, Table } from 'antd';
import ReactECharts from 'echarts-for-react';
import { Users, AlertTriangle, CheckCircle, Pill, Wifi } from 'lucide-react';
import { mockElders, mockAlerts, mockCareServices } from '@/mock';
import { formatDateTime } from '@/utils/date';
import type { Alert } from '@/types';

const STATS = [
  { title: '老人总数', value: 68, icon: Users, color: '#1E88E5', bg: '#E3F2FD' },
  { title: '今日预警', value: 5, icon: AlertTriangle, color: '#F44336', bg: '#FFEBEE', pulse: true },
  { title: '服务完成率', value: 92, suffix: '%', icon: CheckCircle, color: '#4CAF50', bg: '#E8F5E9' },
  { title: '用药依从率', value: 87, suffix: '%', icon: Pill, color: '#FF9800', bg: '#FFF3E0' },
  { title: '设备在线率', value: 95, suffix: '%', icon: Wifi, color: '#1E88E5', bg: '#E3F2FD' },
];

const CARE_LEVEL_DATA = [
  { name: '特级', value: 8, color: '#F44336' },
  { name: '一级', value: 22, color: '#FF9800' },
  { name: '二级', value: 25, color: '#1E88E5' },
  { name: '三级', value: 13, color: '#4CAF50' },
];

const TREND_DAYS = ['06-15', '06-16', '06-17', '06-18', '06-19', '06-20', '06-21'];
const TREND_DATA = [3, 5, 2, 7, 4, 6, 5];

const ALERT_TYPE_LABEL: Record<string, string> = {
  fall: '跌倒', inactivity: '活动异常', out_of_bed: '离床', heart_rate: '心率异常',
  respiration: '呼吸异常', sos: '紧急呼叫', medication_miss: '漏服药物', door: '门磁', smoke: '烟雾', gas: '燃气',
};

const LEVEL_COLOR: Record<number, string> = { 1: '#FF9800', 2: '#FF9800', 3: '#F44336' };
const STATUS_TAG: Record<string, { color: string; text: string }> = {
  pending: { color: 'red', text: '待处理' },
  acknowledged: { color: 'orange', text: '已确认' },
  processing: { color: 'blue', text: '处理中' },
  resolved: { color: 'green', text: '已解决' },
  closed: { color: 'default', text: '已关闭' },
};

const pieOption = {
  tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
  legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
  series: [{
    type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
    avoidLabelOverlap: false,
    itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
    labelLine: { show: false },
    data: CARE_LEVEL_DATA.map(d => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
  }],
};

const trendOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
  xAxis: { type: 'category', data: TREND_DAYS, boundaryGap: false, axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { color: '#666' } },
  yAxis: { type: 'value', minInterval: 1, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } } },
  series: [{
    type: 'line', data: TREND_DATA, smooth: true,
    lineStyle: { color: '#F44336', width: 2 },
    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(244,67,54,0.3)' }, { offset: 1, color: 'rgba(244,67,54,0.05)' }] } },
    itemStyle: { color: '#F44336' },
    symbol: 'circle', symbolSize: 6,
  }],
};

const barOption = {
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { bottom: 0, itemWidth: 12, itemHeight: 12 },
  grid: { left: '3%', right: '4%', bottom: '18%', top: '8%', containLabel: true },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { color: '#666' } },
  yAxis: { type: 'value', max: 100, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } } },
  series: [
    { name: '家属满意度', type: 'bar', data: [88, 90, 85, 92, 89, 93], barWidth: '30%', itemStyle: { color: '#1E88E5', borderRadius: [4, 4, 0, 0] } },
    { name: '用药依从率', type: 'bar', data: [82, 85, 80, 88, 86, 87], barWidth: '30%', itemStyle: { color: '#FF9800', borderRadius: [4, 4, 0, 0] } },
  ],
};

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sorted = [...mockAlerts].sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
    setAlerts(sorted.slice(0, 8));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const el = scrollRef.current;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
          el.scrollTop = 0;
        } else {
          el.scrollTop += 1;
        }
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const todayServices = mockCareServices.filter(s => {
    const d = new Date(s.scheduledAt).toDateString();
    return d === new Date().toDateString();
  });
  const completedCount = todayServices.filter(s => s.status === 'completed').length;
  const totalToday = todayServices.length || 1;
  const overdueCount = todayServices.filter(s => s.status === 'missed').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map(item => (
          <Card key={item.title} className="rounded-xl shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm mb-1">{item.title}</div>
                <div className="text-3xl font-bold" style={{ color: item.color }}>
                  {item.value}{item.suffix || ''}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                <item.icon size={24} style={{ color: item.color }} />
              </div>
            </div>
            {item.pulse && (
              <div className="mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-500">实时监控中</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="护理等级分布" className="rounded-xl shadow-sm" bodyStyle={{ padding: '12px 20px' }}>
          <ReactECharts option={pieOption} style={{ height: 260 }} />
        </Card>
        <Card title="近7天健康异常趋势" className="rounded-xl shadow-sm" bodyStyle={{ padding: '12px 20px' }}>
          <ReactECharts option={trendOption} style={{ height: 260 }} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="今日预警列表" className="rounded-xl shadow-sm" bodyStyle={{ padding: '0 0 12px 0' }}
          extra={<Badge count={alerts.filter(a => a.status === 'pending').length} />}>
          <div ref={scrollRef} className="overflow-hidden" style={{ height: 260 }}>
            <Table
              dataSource={alerts}
              rowKey="id"
              size="small"
              pagination={false}
              showHeader={true}
              style={{ fontSize: 12 }}
              columns={[
                {
                  title: '级别', dataIndex: 'level', width: 60,
                  render: (v: number) => <Tag color={LEVEL_COLOR[v]}>{v}级</Tag>,
                },
                {
                  title: '类型', dataIndex: 'type', width: 80, ellipsis: true,
                  render: (v: string) => ALERT_TYPE_LABEL[v] || v,
                },
                { title: '老人', dataIndex: 'elderName', width: 70, ellipsis: true },
                {
                  title: '时间', dataIndex: 'triggeredAt', width: 90,
                  render: (v: string) => formatDateTime(v, 'MM-DD HH:mm'),
                },
                {
                  title: '状态', dataIndex: 'status', width: 70,
                  render: (v: string) => {
                    const s = STATUS_TAG[v] || { color: 'default', text: v };
                    return <Tag color={s.color}>{s.text}</Tag>;
                  },
                },
              ]}
            />
          </div>
        </Card>

        <Card title="服务工单统计" className="rounded-xl shadow-sm">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{totalToday}</div>
              <div className="text-xs text-gray-500 mt-1">今日工单</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{Math.round((completedCount / totalToday) * 100)}%</div>
              <div className="text-xs text-gray-500 mt-1">完成率</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50">
              <div className="text-2xl font-bold text-orange-500">{overdueCount}</div>
              <div className="text-xs text-gray-500 mt-1">超时工单</div>
            </div>
          </div>
          <div className="space-y-2">
            {['晨间护理', '协助进食', '康复训练', '生命体征测量'].map((s, i) => {
              const pct = [95, 88, 76, 100][i];
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 truncate">{s}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 90 ? '#4CAF50' : pct >= 70 ? '#FF9800' : '#F44336' }} />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="家属满意度与用药依从率" className="rounded-xl shadow-sm" bodyStyle={{ padding: '12px 20px' }}>
        <ReactECharts option={barOption} style={{ height: 240 }} />
      </Card>
    </div>
  );
}
