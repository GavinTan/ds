// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取详情 */
export async function getCategoryData(options: { id: number }) {
  return request<API.UserResult>(`/api/category/${options.id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有数据 */
export async function getAllCategoryData(
  params: {
    // query
    /** 当前的页码 */
    offset?: number;
    /** 页面的容量 */
    limit?: number;
  },
  options: { [key: string]: any }
  ) {
  return request<API.UserResult>(`/api/category/`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建 */
export async function createCategory(options: { data: { [key: string]: any }}) {
  return request<API.UserResult>('/api/category/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 更新 */
export async function updateCategory(options: { id: number, data: { [key: string]: any }}) {
  return request<API.UserResult>(`/api/category/${options.id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 批量删除 */
export async function multipleDeleteCategory(options: { data: { ids: number[] } }) {
  return request<API.UserResult>(`/api/category/multiple_delete/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
