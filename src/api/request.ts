import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/utils/storage';
import { message } from 'antd';

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  success: boolean;
  timestamp: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TIMEOUT = 10000;

const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (res.code === 200 || res.success) {
      return response;
    }
    message.error(res.message || '请求失败');
    if (res.code === 401) {
      storage.removeToken();
      storage.removeUserInfo();
      window.location.href = '/login';
    }
    return Promise.reject(new Error(res.message || 'Error'));
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          message.error('请求参数错误');
          break;
        case 401:
          message.error('未授权，请重新登录');
          storage.removeToken();
          storage.removeUserInfo();
          window.location.href = '/login';
          break;
        case 403:
          message.error('拒绝访问');
          break;
        case 404:
          message.error('请求地址不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        case 502:
          message.error('网关错误');
          break;
        case 503:
          message.error('服务不可用');
          break;
        case 504:
          message.error('网关超时');
          break;
        default:
          message.error(error.message || '网络错误');
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络');
    } else {
      message.error(error.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export const request = <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
  return new Promise((resolve, reject) => {
    service
      .request<ApiResponse<T>>(config)
      .then((response) => {
        resolve(response.data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const get = <T = unknown>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return request<T>({
    method: 'GET',
    url,
    params,
    ...config,
  });
};

export const post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return request<T>({
    method: 'POST',
    url,
    data,
    ...config,
  });
};

export const put = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return request<T>({
    method: 'PUT',
    url,
    data,
    ...config,
  });
};

export const del = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return request<T>({
    method: 'DELETE',
    url,
    data,
    ...config,
  });
};

export const patch = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return request<T>({
    method: 'PATCH',
    url,
    data,
    ...config,
  });
};

export const upload = <T = unknown>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);
  return request<T>({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  });
};

export const download = (url: string, params?: unknown, filename?: string): void => {
  axios
    .get(url, {
      baseURL: BASE_URL,
      params,
      responseType: 'blob',
    })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('Download error:', error);
      message.error('下载失败');
    });
};

export default service;
