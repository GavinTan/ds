// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取当前的用户 */
export async function getUserData(options: { id: number }) {
  return request<API.UserResult>(`/api/user/${options.id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有用户 */
export async function getAllUserData(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options: { [key: string]: any }
  ) {
  return request<API.UserResult>(`/api/user/`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建用户 */
export async function createUser(options: { data: { [key: string]: any }}) {
  return request<API.UserResult>('/api/user/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 更新用户 */
export async function updateUser(options: { id: number, data: { [key: string]: any }}) {
  return request<API.UserResult>(`/api/user/${options.id}/`, {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 批量删除用户 */
export async function multipleDeleteUser(options: { data: { ids: number[] } }) {
  return request<API.UserResult>(`/api/user/multiple_delete/`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 登出接口 */
export async function logout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/user/logout/', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口  */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/user/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}
