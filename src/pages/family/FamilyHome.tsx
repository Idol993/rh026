import { Card, Tag, Button, Row, Col, List, Badge } from 'antd';
import { HeartOutlined, TeamOutlined, DollarOutlined, PhoneOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Elder, HealthData, CareService, Alert } from '@/types';
import { mockElders, mockHealthData, mockCareServices, mockAlerts } from '@/mock';

const careLevelMap: Record<string, { label: string; color: string }> = {
  level1: { label: '一级护理', color: 'green' },
  level2: { label: '二级护理', color: 'blue' },
  level3: { label: '三级护理', color: 'orange' },
  special: { label: '特护', color: 'red' },
};

const alertLevelMap: Record<number, { color: string; text: string }> = {
  1: { color: 'orange', text: '一般' },
  2: { color: 'red', text: '严重' },
  3: { color: 'volcano', text: '紧急' },
};

export default function FamilyHome() {
  const navigate = useNavigate();
  const elder: Elder = mockElders[0];
  const latestHealth: HealthData | undefined = mockHealthData.find((h) => h.elderId === elder.id);
  const recentServices: CareService[] = mockCareServices.filter((s) => s.elderId === elder.id).slice(0, 3);
  const familyAlerts: Alert[] = mockAlerts.filter((a) => a.elderId === elder.id).slice(0, 3);

  return (
    <div style={{ padding: 12, maxWidth: 480, margin: '0 auto' }}>
      <Card style={{ marginBottom: 12, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{elder.name}</div>
            <div style={{ color: '#888', marginTop: 4 }}>房间 {elder.roomNumber}-{elder.bedNumber}</div>
          </div>
          <Tag color={careLevelMap[elder.careLevel].color} style={{ fontSize: 14, padding: '4px 12px' }}>
            {careLevelMap[elder.careLevel].label}
          </Tag>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a', display: 'inline-block' }} />
          <span style={{ color: '#52c41a' }}>今日状态正常</span>
        </div>
      </Card>

      <Row gutter={8} style={{ marginBottom: 12 }}>
        {[
          { label: '心率', value: latestHealth ? `${latestHealth.heartRate}次/分` : '-', color: '#ff4d4f', icon: '❤️' },
          { label: '血压', value: latestHealth ? `${latestHealth.bloodPressure.systolic}/${latestHealth.bloodPressure.diastolic}` : '-', color: '#1890ff', icon: '🩺' },
          { label: '血氧', value: latestHealth ? `${latestHealth.bloodOxygen}%` : '-', color: '#52c41a', icon: '🫁' },
          { label: '体温', value: latestHealth ? `${latestHealth.temperature}℃` : '-', color: '#faad14', icon: '🌡️' },
        ].map((item) => (
          <Col span={6} key={item.label}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 10 }}>
              <div style={{ fontSize: 18 }}>{item.icon}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="最新服务记录" size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <List
          size="small"
          dataSource={recentServices}
          renderItem={(s) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>{s.type}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>{new Date(s.scheduledAt).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>护工：{s.caregiverName}</div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Card title={<span><WarningOutlined style={{ color: '#ff4d4f' }} /> 预警通知</span>} size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <List
          size="small"
          dataSource={familyAlerts}
          renderItem={(a) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge color={alertLevelMap[a.level].color} text={a.description.slice(0, 20) + '...'} />
                  <Tag color={alertLevelMap[a.level].color}>{alertLevelMap[a.level].text}</Tag>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{new Date(a.triggeredAt).toLocaleString()}</div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Row gutter={8}>
        {[
          { label: '探视预约', icon: <TeamOutlined />, path: '/family/visits', color: '#1890ff' },
          { label: '在线缴费', icon: <DollarOutlined />, path: '/family/bills', color: '#52c41a' },
          { label: '联系护工', icon: <PhoneOutlined />, path: '#', color: '#722ed1' },
        ].map((btn) => (
          <Col span={8} key={btn.label}>
            <Button
              block
              size="large"
              icon={btn.icon}
              style={{ borderRadius: 10, height: 48, color: btn.color, borderColor: btn.color }}
              onClick={() => btn.path !== '#' && navigate(btn.path)}
            >
              {btn.label}
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );
}
