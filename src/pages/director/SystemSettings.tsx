import { useState } from 'react';
import { Tabs, Card, Form, Input, Button, message, Table, Tag, Select } from 'antd';
import type { Device } from '@/types';
import { mockElders } from '@/mock';

const deviceTypeMap: Record<string, string> = {
  mattress: '智能床垫', bracelet: '健康手环', pillbox: '智能药盒',
  smoke: '烟雾报警器', gas: '燃气报警器', door: '门磁传感器',
};

const deviceStatusMap: Record<string, { color: string; text: string }> = {
  online: { color: 'green', text: '在线' },
  offline: { color: 'default', text: '离线' },
  error: { color: 'red', text: '故障' },
};

const allDevices = mockElders.flatMap((elder) =>
  elder.devices.map((d) => ({ ...d, elderName: elder.name, elderId: elder.id }))
);

const logData = [
  { id: '1', user: '张院长', action: '修改机构联系电话', time: '2026-06-21 09:15', ip: '192.168.1.10' },
  { id: '2', user: '李护士', action: '新增护工排班', time: '2026-06-20 14:30', ip: '192.168.1.22' },
  { id: '3', user: '张院长', action: '修改权限配置', time: '2026-06-19 16:00', ip: '192.168.1.10' },
  { id: '4', user: '系统', action: '设备健康手环(BR-elder1-002)离线告警', time: '2026-06-18 08:22', ip: '-' },
  { id: '5', user: '张院长', action: '新增员工钱护工', time: '2026-06-17 10:45', ip: '192.168.1.10' },
  { id: '6', user: '李护士', action: '修改排班规则', time: '2026-06-16 09:00', ip: '192.168.1.22' },
];

const roleList = [
  { key: 'director', name: '院长', perms: '全部权限' },
  { key: 'nurse', name: '护士', perms: '健康监测、告警处理、用药管理、护理记录' },
  { key: 'caregiver', name: '护工', perms: '服务执行、护理记录' },
  { key: 'family', name: '家属', perms: '查看健康数据、服务记录、探视预约、缴费' },
];

export default function SystemSettings() {
  const [settingsForm] = Form.useForm();

  const handleSaveSettings = () => {
    settingsForm.validateFields().then(() => {
      message.success('设置保存成功');
    });
  };

  return (
    <Card>
      <Tabs
        items={[
          {
            key: 'basic',
            label: '基础设置',
            children: (
              <Form
                form={settingsForm}
                layout="vertical"
                style={{ maxWidth: 500 }}
                initialValues={{
                  orgName: '阳光康养智慧养老中心',
                  phone: '010-88886666',
                  address: '北京市朝阳区幸福路88号',
                }}
              >
                <Form.Item name="orgName" label="机构名称" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="address" label="机构地址">
                  <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={handleSaveSettings}>保存设置</Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'permission',
            label: '权限管理',
            children: (
              <Table
                rowKey="key"
                pagination={false}
                dataSource={roleList}
                columns={[
                  { title: '角色', dataIndex: 'name', key: 'name' },
                  { title: '权限范围', dataIndex: 'perms', key: 'perms' },
                  {
                    title: '操作', key: 'action',
                    render: () => <Button type="link" size="small">编辑权限</Button>,
                  },
                ]}
              />
            ),
          },
          {
            key: 'device',
            label: '设备管理',
            children: (
              <Table
                rowKey="id"
                dataSource={allDevices}
                pagination={{ pageSize: 10 }}
                columns={[
                  { title: '设备类型', dataIndex: 'type', key: 'type', render: (t: Device['type']) => deviceTypeMap[t] || t },
                  { title: '设备名称', dataIndex: 'name', key: 'name' },
                  { title: '序列号', dataIndex: 'serialNumber', key: 'serialNumber' },
                  { title: '绑定老人', dataIndex: 'elderName', key: 'elderName' },
                  {
                    title: '状态', dataIndex: 'status', key: 'status',
                    render: (s: Device['status']) => <Tag color={deviceStatusMap[s].color}>{deviceStatusMap[s].text}</Tag>,
                  },
                  {
                    title: '最后在线', dataIndex: 'lastOnline', key: 'lastOnline',
                    render: (v: string) => new Date(v).toLocaleString(),
                  },
                  {
                    title: '操作', key: 'action',
                    render: () => (
                      <>
                        <Button type="link" size="small">编辑</Button>
                        <Button type="link" size="small">解绑</Button>
                      </>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: 'log',
            label: '操作日志',
            children: (
              <Table
                rowKey="id"
                dataSource={logData}
                pagination={{ pageSize: 10 }}
                columns={[
                  { title: '操作人', dataIndex: 'user', key: 'user' },
                  { title: '操作内容', dataIndex: 'action', key: 'action' },
                  { title: '时间', dataIndex: 'time', key: 'time' },
                  { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
                ]}
              />
            ),
          },
        ]}
      />
    </Card>
  );
}
