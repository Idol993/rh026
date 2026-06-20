export type StorageKey = 
  | 'token' 
  | 'userInfo' 
  | 'theme' 
  | 'language' 
  | 'rememberLogin' 
  | 'loginUsername' 
  | 'permissions' 
  | 'currentElderId' 
  | 'sidebarCollapsed';

const prefix = 'elder_care_';

const getKey = (key: StorageKey): string => `${prefix}${key}`;

export const storage = {
  get<T = unknown>(key: StorageKey, defaultValue?: T): T | null {
    try {
      const value = localStorage.getItem(getKey(key));
      if (value === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(value) as T;
    } catch {
      return defaultValue ?? null;
    }
  },

  set<T = unknown>(key: StorageKey, value: T): void {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(getKey(key), stringValue);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(getKey(key));
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear(): void {
    try {
      Object.values(localStorage)
        .filter((_, index) => {
          const key = localStorage.key(index);
          return key?.startsWith(prefix);
        })
        .forEach((_, index) => {
          const key = localStorage.key(index);
          if (key && key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        });
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },

  clearAll(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clearAll error:', error);
    }
  },

  has(key: StorageKey): boolean {
    return localStorage.getItem(getKey(key)) !== null;
  },

  getToken(): string | null {
    const value = localStorage.getItem(getKey('token'));
    if (value === null) return null;
    try {
      return JSON.parse(value) as string;
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    this.set('token', token);
  },

  removeToken(): void {
    this.remove('token');
  },

  getUserInfo<T = unknown>(): T | null {
    const value = localStorage.getItem(getKey('userInfo'));
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  setUserInfo<T = unknown>(userInfo: T): void {
    this.set('userInfo', userInfo);
  },

  removeUserInfo(): void {
    this.remove('userInfo');
  },

  getPermissions(): string[] {
    const value = localStorage.getItem(getKey('permissions'));
    if (value === null) return [];
    try {
      return JSON.parse(value) as string[];
    } catch {
      return [];
    }
  },

  setPermissions(permissions: string[]): void {
    this.set('permissions', permissions);
  },

  removePermissions(): void {
    this.remove('permissions');
  },

  getCurrentElderId(): string | null {
    const value = localStorage.getItem(getKey('currentElderId'));
    if (value === null) return null;
    try {
      return JSON.parse(value) as string;
    } catch {
      return null;
    }
  },

  setCurrentElderId(elderId: string): void {
    this.set('currentElderId', elderId);
  },

  removeCurrentElderId(): void {
    this.remove('currentElderId');
  },
};

export const sessionStorage = {
  get<T = unknown>(key: string, defaultValue?: T): T | null {
    try {
      const value = window.sessionStorage.getItem(key);
      if (value === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(value) as T;
    } catch {
      return defaultValue ?? null;
    }
  },

  set<T = unknown>(key: string, value: T): void {
    try {
      const stringValue = JSON.stringify(value);
      window.sessionStorage.setItem(key, stringValue);
    } catch (error) {
      console.error('SessionStorage set error:', error);
    }
  },

  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('SessionStorage remove error:', error);
    }
  },

  clear(): void {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('SessionStorage clear error:', error);
    }
  },

  has(key: string): boolean {
    return window.sessionStorage.getItem(key) !== null;
  },
};

export default storage;
