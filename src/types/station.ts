export interface Station {
  id?: number;
  code: string;
  name: string;
  lineArea: string;
  status: 'active' | 'inactive';
  remark: string;
  createTime?: string;
  updateTime?: string;
}

export interface StationQuery {
  code?: string;
  name?: string;
  status?: 'active' | 'inactive';
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}