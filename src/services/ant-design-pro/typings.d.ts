// @ts-ignore
/* eslint-disable */

declare namespace API1 {
  type CurrentUser = {
    id?: number;
    username?: string;
    name?: string;
    avatar?: string;
    email?: string;
    country?: string;
    role?: string[];
    address?: string;
    phone?: string;
    last_login?: string;
    date_joined?: string;
  };

  type LoginResult = {
    success?: string;
    data?: { status?: string, token?: string }
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type UserListItem = {
    id?: number;
    username?: string;
    avatar?: string;
    name?: string;
    is_active?: boolean;
    last_login?: string;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
