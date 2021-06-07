// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取详情 */
export async function getPriceData(options: { id: number }) {
  return request<API.PriceDataResult>(`/api/price/${options.id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 动作请求 */
export async function actionPriceData(
  params?: {
    // query
    a?: string;
  },
  options?: { [key: string]: any }
  ) {
  return request<any>(`/api/price/action/`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取所有数据 */
export async function getAllPriceData(
  params?: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
    a?: string;
    c?: string;
    qd?: string;
    uid?: number;
  },
  options?: { [key: string]: any }
  ) {
  return request<API.PriceDataResult>(`/api/price/`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建 */
export async function createPriceData(options: { data: { [key: string]: any }}) {
  return request<API.PriceDataResult>('/api/price/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 更新 */
export async function updatePriceData(options: { id: number, data: { [key: string]: any }}) {
  return request<API.PriceDataResult>(`/api/price/${options.id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 局部更新 */
export async function partialUpdatePriceData(options: { id: number, data: { [key: string]: any }}) {
  return request<API.PriceDataResult>(`/api/price/${options.id}/`, {
    method: 'PATCH',
    ...(options || {}),
  });
}

/** 批量删除 */
export async function multipleDeletePriceData(options: { data: { ids: number[] } }) {
  return request<API.PriceDataResult>(`/api/price/multiple_delete/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
