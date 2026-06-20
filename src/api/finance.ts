import { mockDelay, mockSuccess, mockPageResult, randomId, randomInt, randomItem, randomDate, randomFloat } from './mock';
import type { PageParams, PageResult } from './request';
import type { PaymentStatus } from '@/utils/constants';

export interface Bill {
  id: string;
  billNo: string;
  elderId: string;
  elderName: string;
  type: 'service' | 'medication' | 'meal' | 'accommodation' | 'deposit' | 'other';
  title: string;
  description: string;
  amount: number;
  discount: number;
  actualAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'cash' | 'wechat' | 'alipay' | 'card' | 'transfer';
  paidAt?: string;
  paymentTransactionId?: string;
  invoiced: boolean;
  invoiceNo?: string;
  billDate: string;
  dueDate: string;
  remark: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  items: BillItem[];
}

export interface BillItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  serviceType?: string;
  serviceDate?: string;
}

export interface Transaction {
  id: string;
  transactionNo: string;
  type: 'income' | 'expense';
  category: string;
  title: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'wechat' | 'alipay' | 'card' | 'transfer';
  relatedBillId?: string;
  relatedElderId?: string;
  relatedElderName?: string;
  operator: string;
  operatorName: string;
  transactionTime: string;
  remark: string;
  createdAt: string;
}

export interface BillQueryParams extends PageParams {
  elderId?: string;
  type?: Bill['type'];
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  billNo?: string;
}

export interface TransactionQueryParams extends PageParams {
  type?: Transaction['type'];
  category?: string;
  startDate?: string;
  endDate?: string;
  relatedElderId?: string;
}

export interface BillCreateParams extends Omit<Bill, 'id' | 'billNo' | 'createdAt' | 'updatedAt'> {}

const billTypes: Bill['type'][] = ['service', 'medication', 'meal', 'accommodation', 'deposit', 'other'];
const billTypeNames: Record<Bill['type'], string> = {
  service: '服务费',
  medication: '药费',
  meal: '餐饮费',
  accommodation: '住宿费',
  deposit: '押金',
  other: '其他费用',
};
const paymentMethods: Bill['paymentMethod'][] = ['cash', 'wechat', 'alipay', 'card', 'transfer'];

const generateBillNo = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = String(randomInt(1, 99999)).padStart(5, '0');
  return `BILL${date}${random}`;
};

const mockBills: Bill[] = Array.from({ length: 100 }, (_, index) => {
  const type = randomItem(billTypes);
  const status = randomItem<PaymentStatus>(['unpaid', 'paid', 'paid', 'paid', 'refunded', 'partial']);
  const amount = randomFloat(100, 5000);
  const discount = Math.random() > 0.7 ? randomFloat(0, 500) : 0;
  const actualAmount = Number((amount - discount).toFixed(2));
  const billDate = randomDate(90);
  return {
    id: `bill_${index + 1}`,
    billNo: generateBillNo(),
    elderId: `elder_${randomInt(1, 50)}`,
    elderName: '',
    type,
    title: billTypeNames[type],
    description: `${billTypeNames[type]}账单`,
    amount,
    discount,
    actualAmount,
    paymentStatus: status,
    paymentMethod: status !== 'unpaid' ? randomItem(paymentMethods) : undefined,
    paidAt: status !== 'unpaid' ? randomDate(30) : undefined,
    paymentTransactionId: status !== 'unpaid' ? `TXN${randomInt(1, 100000)}` : undefined,
    invoiced: status === 'paid' && Math.random() > 0.5,
    invoiceNo: status === 'paid' && Math.random() > 0.5 ? `INV${randomInt(1, 100000)}` : undefined,
    billDate: new Date(billDate).toISOString().split('T')[0],
    dueDate: new Date(new Date(billDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remark: '',
    createdBy: `staff_${randomInt(1, 20)}`,
    createdByName: '财务人员',
    createdAt: billDate,
    updatedAt: randomDate(30),
    items: Array.from({ length: randomInt(1, 5) }, (_, i) => ({
      id: `item_${index}_${i}`,
      name: `${billTypeNames[type]}项目${i + 1}`,
      description: '服务项目详情',
      quantity: randomInt(1, 10),
      unitPrice: randomFloat(10, 500),
      amount: 0,
      serviceDate: randomDate(30),
    })),
  };
}).map(bill => ({
  ...bill,
  items: bill.items.map(item => ({
    ...item,
    amount: Number((item.quantity * item.unitPrice).toFixed(2)),
  })),
}));

const transactionCategories = {
  income: ['服务费收入', '药费收入', '餐饮收入', '住宿收入', '押金收入', '其他收入'],
  expense: ['人员工资', '物资采购', '设备维护', '水电费', '租金', '其他支出'],
};

const mockTransactions: Transaction[] = Array.from({ length: 150 }, (_, index) => {
  const type = randomItem<Transaction['type']>(['income', 'income', 'income', 'expense']);
  return {
    id: `txn_${index + 1}`,
    transactionNo: `TXN${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(randomInt(1, 99999)).padStart(5, '0')}`,
    type,
    category: randomItem(transactionCategories[type]),
    title: randomItem(transactionCategories[type]),
    description: type === 'income' ? '收到费用' : '支付款项',
    amount: type === 'income' ? randomFloat(100, 10000) : randomFloat(100, 5000),
    paymentMethod: randomItem(paymentMethods),
    relatedBillId: `bill_${randomInt(1, 100)}`,
    relatedElderId: `elder_${randomInt(1, 50)}`,
    relatedElderName: '',
    operator: `staff_${randomInt(1, 20)}`,
    operatorName: '财务人员',
    transactionTime: randomDate(90),
    remark: '',
    createdAt: randomDate(90),
  };
});

export const getBillList = async (params: BillQueryParams = {}): Promise<PageResult<Bill>> => {
  return mockDelay(() => {
    let filtered = [...mockBills];
    const { elderId, type, paymentStatus, startDate, endDate, billNo, page = 1, pageSize = 10 } = params;
    if (elderId) {
      filtered = filtered.filter(b => b.elderId === elderId);
    }
    if (type) {
      filtered = filtered.filter(b => b.type === type);
    }
    if (paymentStatus) {
      filtered = filtered.filter(b => b.paymentStatus === paymentStatus);
    }
    if (startDate) {
      filtered = filtered.filter(b => b.billDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(b => b.billDate <= endDate);
    }
    if (billNo) {
      filtered = filtered.filter(b => b.billNo.includes(billNo));
    }
    filtered.sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime());
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const getBillDetail = async (id: string): Promise<Bill> => {
  return mockDelay(() => {
    const bill = mockBills.find(b => b.id === id);
    if (!bill) {
      throw new Error('账单不存在');
    }
    return mockSuccess(bill).data;
  }, 200);
};

export const createBill = async (data: BillCreateParams): Promise<Bill> => {
  return mockDelay(() => {
    const newBill: Bill = {
      ...data,
      id: randomId(),
      billNo: generateBillNo(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBills.unshift(newBill);
    return mockSuccess(newBill, '创建成功').data;
  }, 300);
};

export const updateBill = async (id: string, data: Partial<BillCreateParams>): Promise<Bill> => {
  return mockDelay(() => {
    const index = mockBills.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('账单不存在');
    }
    const updated = { ...mockBills[index], ...data, updatedAt: new Date().toISOString() };
    mockBills[index] = updated;
    return mockSuccess(updated, '更新成功').data;
  }, 300);
};

export const deleteBill = async (id: string): Promise<void> => {
  return mockDelay(() => {
    const index = mockBills.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('账单不存在');
    }
    mockBills.splice(index, 1);
    return mockSuccess(undefined, '删除成功').data;
  }, 200);
};

export const payBill = async (id: string, paymentMethod: Bill['paymentMethod']): Promise<Bill> => {
  return mockDelay(() => {
    const index = mockBills.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('账单不存在');
    }
    const now = new Date();
    const updated = {
      ...mockBills[index],
      paymentStatus: 'paid' as PaymentStatus,
      paymentMethod,
      paidAt: now.toISOString(),
      paymentTransactionId: `TXN${randomInt(1, 100000)}`,
      updatedAt: now.toISOString(),
    };
    mockBills[index] = updated;
    return mockSuccess(updated, '支付成功').data;
  }, 300);
};

export const refundBill = async (id: string, reason: string): Promise<Bill> => {
  return mockDelay(() => {
    const index = mockBills.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('账单不存在');
    }
    const updated = {
      ...mockBills[index],
      paymentStatus: 'refunded' as PaymentStatus,
      remark: reason,
      updatedAt: new Date().toISOString(),
    };
    mockBills[index] = updated;
    return mockSuccess(updated, '退款成功').data;
  }, 300);
};

export const getTransactionList = async (params: TransactionQueryParams = {}): Promise<PageResult<Transaction>> => {
  return mockDelay(() => {
    let filtered = [...mockTransactions];
    const { type, category, startDate, endDate, relatedElderId, page = 1, pageSize = 10 } = params;
    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }
    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.transactionTime) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(t => new Date(t.transactionTime) <= new Date(endDate));
    }
    if (relatedElderId) {
      filtered = filtered.filter(t => t.relatedElderId === relatedElderId);
    }
    filtered.sort((a, b) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime());
    return mockSuccess(mockPageResult(filtered, page, pageSize)).data;
  }, 300);
};

export const getFinanceStats = async (params?: { startDate?: string; endDate?: string; elderId?: string }): Promise<{
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  totalBills: number;
  unpaidBills: number;
  unpaidAmount: number;
  paidBills: number;
  paidAmount: number;
  refundedBills: number;
  refundedAmount: number;
  billTypeStats: Record<Bill['type'], { count: number; amount: number }>;
  dailyStats: { date: string; income: number; expense: number }[];
  monthlyStats: { month: string; income: number; expense: number }[];
}> => {
  return mockDelay(() => {
    let bills = mockBills;
    let transactions = mockTransactions;
    if (params?.elderId) {
      bills = bills.filter(b => b.elderId === params.elderId);
      transactions = transactions.filter(t => t.relatedElderId === params.elderId);
    }
    if (params?.startDate) {
      bills = bills.filter(b => b.billDate >= params.startDate!);
      transactions = transactions.filter(t => new Date(t.transactionTime) >= new Date(params.startDate!));
    }
    if (params?.endDate) {
      bills = bills.filter(b => b.billDate <= params.endDate!);
      transactions = transactions.filter(t => new Date(t.transactionTime) <= new Date(params.endDate!));
    }
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const unpaid = bills.filter(b => b.paymentStatus === 'unpaid');
    const paid = bills.filter(b => b.paymentStatus === 'paid');
    const refunded = bills.filter(b => b.paymentStatus === 'refunded');
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        income: randomFloat(1000, 5000),
        expense: randomFloat(500, 2000),
      };
    });
    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        income: randomFloat(30000, 100000),
        expense: randomFloat(10000, 50000),
      };
    });
    return mockSuccess({
      totalIncome: Number(income.toFixed(2)),
      totalExpense: Number(expense.toFixed(2)),
      netProfit: Number((income - expense).toFixed(2)),
      totalBills: bills.length,
      unpaidBills: unpaid.length,
      unpaidAmount: Number(unpaid.reduce((sum, b) => sum + b.actualAmount, 0).toFixed(2)),
      paidBills: paid.length,
      paidAmount: Number(paid.reduce((sum, b) => sum + b.actualAmount, 0).toFixed(2)),
      refundedBills: refunded.length,
      refundedAmount: Number(refunded.reduce((sum, b) => sum + b.actualAmount, 0).toFixed(2)),
      billTypeStats: {
        service: { count: bills.filter(b => b.type === 'service').length, amount: bills.filter(b => b.type === 'service').reduce((sum, b) => sum + b.actualAmount, 0) },
        medication: { count: bills.filter(b => b.type === 'medication').length, amount: bills.filter(b => b.type === 'medication').reduce((sum, b) => sum + b.actualAmount, 0) },
        meal: { count: bills.filter(b => b.type === 'meal').length, amount: bills.filter(b => b.type === 'meal').reduce((sum, b) => sum + b.actualAmount, 0) },
        accommodation: { count: bills.filter(b => b.type === 'accommodation').length, amount: bills.filter(b => b.type === 'accommodation').reduce((sum, b) => sum + b.actualAmount, 0) },
        deposit: { count: bills.filter(b => b.type === 'deposit').length, amount: bills.filter(b => b.type === 'deposit').reduce((sum, b) => sum + b.actualAmount, 0) },
        other: { count: bills.filter(b => b.type === 'other').length, amount: bills.filter(b => b.type === 'other').reduce((sum, b) => sum + b.actualAmount, 0) },
      },
      dailyStats,
      monthlyStats,
    }).data;
  }, 300);
};

export const getElderBills = async (elderId: string): Promise<Bill[]> => {
  return mockDelay(() => {
    const bills = mockBills
      .filter(b => b.elderId === elderId)
      .sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime());
    return mockSuccess(bills).data;
  }, 200);
};

export const getElderBalance = async (elderId: string): Promise<{
  totalPaid: number;
  totalUnpaid: number;
  deposit: number;
  balance: number;
}> => {
  return mockDelay(() => {
    const bills = mockBills.filter(b => b.elderId === elderId);
    const paid = bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.actualAmount, 0);
    const unpaid = bills.filter(b => b.paymentStatus === 'unpaid').reduce((sum, b) => sum + b.actualAmount, 0);
    const deposit = bills.filter(b => b.type === 'deposit' && b.paymentStatus === 'paid').reduce((sum, b) => sum + b.actualAmount, 0);
    return mockSuccess({
      totalPaid: Number(paid.toFixed(2)),
      totalUnpaid: Number(unpaid.toFixed(2)),
      deposit: Number(deposit.toFixed(2)),
      balance: Number((deposit - unpaid).toFixed(2)),
    }).data;
  }, 200);
};

export const generateInvoice = async (billId: string): Promise<{ invoiceUrl: string; invoiceNo: string }> => {
  return mockDelay(() => {
    return mockSuccess({
      invoiceUrl: `/api/finance/invoice/${billId}`,
      invoiceNo: `INV${randomInt(1, 100000)}`,
    }).data;
  }, 500);
};

export const exportBills = async (params?: BillQueryParams): Promise<void> => {
  return mockDelay(() => {
    console.log('Export bills with params:', params);
    return mockSuccess(undefined, '导出成功').data;
  }, 500);
};

export default {
  getBillList,
  getBillDetail,
  createBill,
  updateBill,
  deleteBill,
  payBill,
  refundBill,
  getTransactionList,
  getFinanceStats,
  getElderBills,
  getElderBalance,
  generateInvoice,
  exportBills,
};
