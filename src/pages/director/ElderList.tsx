import { useState, useMemo } from 'react';
import { Table, Card, Input, Select, Button, Tag, Space, Popconfirm } from 'antd';
import { Plus, Search, Edit3, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockElders } from '@/mock';
import type { Elder } from '@/types';

const CARE_LEVEL_MAP: Record<string, { label: string; color: string }> = {
  special: { label: '特级护理', color: 'red' },
  level1: { label: '一级护理', color: 'orange' },
  level2: { label: '二级护理', color: 'blue' },
  level3: { label: '三级护理', color: 'green' },
};

const CARE_TYPE_MAP: Record<string, string> = { home: '居家照护', institution: '机构照护' };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '在住', color: 'green' },
  discharged: { label: '出院', color: 'orange' },
  deceased: { label: '已故', color: 'default' },
};

export default function ElderList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [careLevel, setCareLevel] = useState<string | undefined>(undefined);
  const [careType, setCareType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return mockElders.filter(e => {
      if (search && !e.name.includes(search) && !e.idCard.includes(search)) return false;
      if (careLevel && e.careLevel !== careLevel) return false;
      if (careType && e.careType !== careType) return false;
      if (status && e.status !== status) return false;
      return true;
    });
  }, [search, careLevel, careType, status]);

  const columns = [
    {
      title: '姓名', dataIndex: 'name', width: 100,
      render: (name: string, record: Elder) => (
        <a className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          onClick={() => navigate(`/director/elders/${record.id}`)}>
          {name}
        </a>
      ),
    },
    {
      title: '性别', dataIndex: 'gender', width: 60,
      render: (v: string) => v === 'male' ? '男' : '女',
    },
    { title: '年龄', dataIndex: 'age', width: 60, sorter: (a: Elder, b: Elder) => a.age - b.age },
    {
      title: '房间号', dataIndex: 'roomNumber', width: 80,
      render: (v: string) => v || '-',
    },
    {
      title: '护理等级', dataIndex: 'careLevel', width: 100,
      render: (v: string) => {
        const item = CARE_LEVEL_MAP[v];
        return item ? <Tag color={item.color}>{item.label}</Tag> : v;
      },
    },
    {
      title: '照护类型', dataIndex: 'careType', width: 100,
      render: (v: string) => CARE_TYPE_MAP[v] || v,
    },
    {
      title: '慢性病', dataIndex: 'chronicDiseases', width: 160, ellipsis: true,
      render: (v: string[]) => v?.length > 0 ? v.join('、') : '-',
    },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v: string) => {
        const s = STATUS_MAP[v] || { label: v, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '操作', width: 160, fixed: 'right' as const,
      render: (_: unknown, record: Elder) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />}
            onClick={() => navigate(`/director/elders/${record.id}`)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<Edit3 size={14} />}>编辑</Button>
          <Popconfirm title="确认删除该老人档案？" okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="rounded-xl shadow-sm" bodyStyle={{ padding: '16px 24px' }}>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="姓名/身份证号" prefix={<Search size={16} className="text-gray-400" />}
            allowClear className="w-56" value={search} onChange={e => setSearch(e.target.value)}
          />
          <Select placeholder="护理等级" allowClear className="w-32" value={careLevel} onChange={setCareLevel}
            options={[
              { value: 'special', label: '特级护理' },
              { value: 'level1', label: '一级护理' },
              { value: 'level2', label: '二级护理' },
              { value: 'level3', label: '三级护理' },
            ]}
          />
          <Select placeholder="照护类型" allowClear className="w-32" value={careType} onChange={setCareType}
            options={[
              { value: 'home', label: '居家照护' },
              { value: 'institution', label: '机构照护' },
            ]}
          />
          <Select placeholder="状态" allowClear className="w-28" value={status} onChange={setStatus}
            options={[
              { value: 'active', label: '在住' },
              { value: 'discharged', label: '出院' },
              { value: 'deceased', label: '已故' },
            ]}
          />
          <div className="flex-1" />
          <Button type="primary" icon={<Plus size={16} />} className="rounded-lg"
            style={{ background: '#1E88E5' }}>
            新增老人
          </Button>
        </div>
      </Card>

      <Card className="rounded-xl shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="middle"
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize,
            total: filtered.length,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </Card>
    </div>
  );
}
