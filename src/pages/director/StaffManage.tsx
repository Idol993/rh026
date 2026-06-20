import { useState } from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { User } from '@/types';
import { mockUsers } from '@/mock';

const roleMap: Record<string, { label: string; color: string }> = {
  nurse: { label: '护士', color: 'blue' },
  caregiver: { label: '护工', color: 'green' },
  director: { label: '院长', color: 'purple' },
};

const areas = ['一楼东区', '一楼西区', '二楼东区', '二楼西区', '三楼东区', '三楼西区', '特护区'];

interface StaffRow extends User {
  area?: string;
}

const staffData: StaffRow[] = mockUsers
  .filter((u) => u.role === 'nurse' || u.role === 'caregiver')
  .map((u, i) => ({ ...u, area: areas[i % areas.length] }));

const scheduleData = [
  { name: '王护工', role: 'caregiver' as const, mon: '白班', tue: '白班', wed: '夜班', thu: '夜班', fri: '休息', sat: '白班', sun: '白班', area: '一楼东区' },
  { name: '李护士', role: 'nurse' as const, mon: '白班', tue: '白班', wed: '白班', thu: '白班', fri: '白班', sat: '夜班', sun: '休息', area: '二楼西区' },
  { name: '赵护工', role: 'caregiver' as const, mon: '夜班', tue: '夜班', wed: '白班', thu: '白班', fri: '白班', sat: '休息', sun: '夜班', area: '三楼东区' },
  { name: '钱护工', role: 'caregiver' as const, mon: '休息', tue: '白班', wed: '夜班', thu: '白班', fri: '夜班', sat: '白班', sun: '白班', area: '特护区' },
];

const shiftColor: Record<string, string> = { '白班': 'blue', '夜班': 'purple', '休息': 'default' };

export default function StaffManage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: StaffRow) => {
    setEditingStaff(record);
    form.setFieldsValue({ ...record, area: record.area });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then(() => {
      message.success(editingStaff ? '编辑成功' : '新增成功');
      setModalVisible(false);
    });
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    {
      title: '角色', dataIndex: 'role', key: 'role',
      render: (role: string) => <Tag color={roleMap[role]?.color}>{roleMap[role]?.label || role}</Tag>,
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '入职日期', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '在职' : '离职'}</Tag>,
    },
    { title: '负责区域', dataIndex: 'area', key: 'area' },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: StaffRow) => (
        <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="员工列表"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增员工</Button>}
        style={{ marginBottom: 16 }}
      >
        <Table rowKey="id" columns={columns} dataSource={staffData} pagination={{ pageSize: 10 }} />
      </Card>

      <Card title="本周排班简表">
        <Table
          rowKey="name"
          pagination={false}
          dataSource={scheduleData}
          columns={[
            { title: '姓名', dataIndex: 'name', key: 'name' },
            { title: '角色', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color={roleMap[r]?.color}>{roleMap[r]?.label}</Tag> },
            { title: '区域', dataIndex: 'area', key: 'area' },
            ...['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => ({
              title: { mon: '周一', tue: '周二', wed: '周三', thu: '周四', fri: '周五', sat: '周六', sun: '周日' }[day],
              dataIndex: day,
              key: day,
              render: (v: string) => <Tag color={shiftColor[v]}>{v}</Tag>,
            })),
          ]}
        />
      </Card>

      <Modal
        title={editingStaff ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" options={[{ value: 'nurse', label: '护士' }, { value: 'caregiver', label: '护工' }]} />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="createdAt" label="入职日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="area" label="负责区域">
            <Select placeholder="请选择区域" options={areas.map((a) => ({ value: a, label: a }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
