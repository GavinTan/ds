import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, message } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { Link, history } from 'umi';
import { login } from '@/services/api/user';
import styles from './index.less';
import {useModel} from "@@/plugin-model/useModel";
import {getToken, setToken} from "@/utils/auth";

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);
/** 此方法会跳转到 redirect 参数所在的位置 */

const goto = () => {
  if (!history) return;
  setTimeout(() => {
    const { query } = history.location;
    const { redirect } = query as {
      redirect: string;
    };
    history.push(redirect || '/');
  }, 10);
};

const Login: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { initialState, setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();

    if (userInfo) {
      setInitialState({ ...initialState, currentUser: userInfo });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    setSubmitting(true);

    try {
      // 登录
      const res = await login({ ...values });
      if (res.success && res.token) {
        if (values.autoLogin) {
          setToken(res.token, 7)
        } else {
          setToken(res.token)
        }
        message.success("登录成功");
        await fetchUserInfo();
        goto();
        return;
      }// 如果失败去设置用户错误信息
      setUserLoginState(res);
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试';
      message.error(defaultLoginFailureMessage);
    }

    setSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <span className={styles.title}>登录系统</span>
            </Link>
          </div>
          <div className={styles.desc}>
          </div>
        </div>

        <div className={styles.main}>
          <ProForm
            initialValues={{
              autoLogin: getToken(),
            }}
            submitter={{
              searchConfig: {
                submitText: '登录',
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: submitting,
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={async (values) => {
              await handleSubmit(values as API.LoginParams);
            }}
          >


            {userLoginState.status === 'error' && (
              <LoginMessage
                content={userLoginState.error || '账号或密码错误'}
              />
            )}
            {(
              <>
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder="用户名"
                  rules={[
                    {
                      required: true,
                      message: '用户名是必填项！',
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder="密码"
                  rules={[
                    {
                      required: true,
                      message: '密码是必填项！',
                    },
                  ]}
                />
              </>
            )}

            <div
              style={{
                marginBottom: 24,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                自动登录
              </ProFormCheckbox>
            </div>
          </ProForm>
        </div>
      </div>
    </div>
  );
};

export default Login;
