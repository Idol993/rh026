import { Card, Tag, Timeline, Rate } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { CareService } from '@/types';
import { mockCareServices } from '@/mock';

const statusMap: Record<CareService['status'], { color: string; text: string }> = {
  completed: { color: 'green', text: '已完成' },
  in_progress: { color: 'blue', text: '进行中' },
  scheduled: { color: 'default', text: '已安排' },
  missed: { color: 'orange', text: '已错过' },
  cancelled: { color: 'red', text: '已取消' },
};

const elderId = 'elder1';
const services: CareService[] = mockCareServices
  .filter((s) => s.elderId === elderId)
  .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  .slice(0, 15);

export default function FamilyServices() {
  return (
    <div style={{ padding: 12, maxWidth: 480, margin: '0 auto' }}>
      <Card title="服务记录" style={{ borderRadius: 12 }}>
        <Timeline
          items={services.map((s) => ({
            dot: s.status === 'in_progress' ? <ClockCircleOutlined style={{ fontSize: 16, color: '#1890ff' }} /> : undefined,
            children: (
              <Card
                size="small"
                style={{ borderRadius: 10, marginBottom: 4 }}
                styles={{ body: { padding: '10px 12px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{s.type}</span>
                  <Tag color={statusMap[s.status].color}>{statusMap[s.status].text}</Tag>
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: '22px' }}>
                  <div>🕐 {new Date(s.scheduledAt).toLocaleString()}</div>
                  <div>👤 护工：{s.caregiverName}</div>
                  {s.duration && <div>⏱️ 时长：{s.duration}分钟</div>}
                  {s.elderStatus && <div>📋 老人状态：{s.elderStatus}</div>}
                  {s.notes && <div style={{ color: '#999' }}>📝 {s.notes}</div>}
                  {s.rating && (
                    <div style={{ marginTop: 4 }}>
                      评价：<Rate disabled defaultValue={s.rating} style={{ fontSize: 12 }} />
                      {s.feedback && <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>{s.feedback}</span>}
                    </div>
                  )}
                </div>
              </Card>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
