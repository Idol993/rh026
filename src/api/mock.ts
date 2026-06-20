export const mockDelay = <T>(data: T | (() => T), delay: number = 300): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = typeof data === 'function' ? (data as () => T)() : data;
      resolve(result);
    }, delay);
  });
};

export const mockSuccess = <T>(data: T, message: string = '操作成功') => {
  return {
    code: 200,
    success: true,
    data,
    message,
    timestamp: Date.now(),
  };
};

export const mockPageResult = <T>(list: T[], page: number = 1, pageSize: number = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedList = list.slice(start, end);
  return {
    list: paginatedList,
    total: list.length,
    page,
    pageSize,
    totalPages: Math.ceil(list.length / pageSize),
  };
};

export const randomId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min: number, max: number, decimals: number = 1): number => {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
};

export const randomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const randomDate = (daysAgo: number = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

export const randomPhone = (): string => {
  const prefixes = ['138', '139', '150', '151', '152', '188', '189', '177', '178'];
  const prefix = randomItem(prefixes);
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
};

export const randomName = (): string => {
  const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英', '建国', '建华', '玉梅', '凤英', '玉兰', '桂兰', '丽华', '秀兰'];
  const surname = randomItem(surnames);
  const name = randomItem(names);
  return surname + name;
};

export const randomAddress = (): string => {
  const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '河南省', '四川省', '湖北省', '湖南省'];
  const cities = ['海淀区', '浦东新区', '广州市', '深圳市', '南京市', '杭州市', '济南市', '郑州市', '成都市', '武汉市'];
  const streets = ['中山路', '人民路', '解放路', '建设大道', '长江路', '黄河路', '珠江路', '松花江路', '淮河路', '长江大道'];
  const province = randomItem(provinces);
  const city = randomItem(cities);
  const street = randomItem(streets);
  const number = randomInt(1, 999);
  return `${province}${city}${street}${number}号`;
};

export default mockDelay;
