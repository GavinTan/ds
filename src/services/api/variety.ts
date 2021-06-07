// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取详情 */
export async function getVarietyData(options: { id: number }) {
  return request<API.VarietyResult>(`/api/variety/${options.id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}


/** 动作请求 */
export async function actionVariety(
  params?: {
    // query
    a?: string;
    c?: string;
    uid?: number;
  }
  ) {
  return request<any>(`/api/variety/`, {
    method: 'GET',
    params: {
      ...params,
    }
  });
}

/** 获取所有数据 */
export async function getAllVarietyData(
  params?: {
    // query
    /** 当前的页码 */
    a?: string;
    c?: string;
    uid?: number;
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any }
  ) {
  return request<API.VarietyResult>(`/api/variety/`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建 */
export async function createVariety(options: { data: { [key: string]: any }}) {
  return request<API.VarietyResult>('/api/variety/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 更新 */
export async function updateVariety(options: { id: number, data: { [key: string]: any }}) {
  return request<API.VarietyResult>(`/api/variety/${options.id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 批量删除 */
export async function multipleDeleteVariety(options: { data: { ids: number[] } }) {
  return request<API.VarietyResult>(`/api/variety/multiple_delete/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
