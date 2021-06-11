// @ts-ignore
/* eslint-disable */

declare namespace API {
  type UserResult = {
    id: number;
    username?: string;
    password?: string;
    name?: string;
    avatar?: string;
    email?: string;
    country?: string;
    role?: string[];
    address?: string;
    phone?: string;
    last_login?: string;
    date_joined?: string;
    is_active?: boolean;
    is_superuser?: boolean;
  };

  type LoginResult = {
    success?: string;
    status?: string;
    error?: string;
    token?: string;
  };

  type PageParams = {
    uid?: any;
    current?: number;
    pageSize?: number;
  };

  type UserItem = {
    id?: number;
    name?: string;
    username?: string;
    is_active?: boolean;
  };

  type VarietyResult = {
    id?: number;
    name?: string;
    categories?: [];
    create_time?: string;
    update_time?: string;
  }

  type PriceDataResult = {
    id?: number;
    variety?: string;
    variety_id?: number;
    user?: string;
    date?: string;
    categories?: { [key: string]: any }[];
  }

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type SeriesData = {
    type?: string;
    name?: string;
    data?: [];
  }

  type ChartData = {
    x_data?: [];
    legend_data?: [];
    series_data?: SeriesData[];
    tag?: string;
    tag_variety?: boolean;
  }

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
