import React from 'react';
import ProFrom, {
  ProFormSelect,
  ProFormText,
  ModalForm,
} from '@ant-design/pro-form';
import {Form} from "antd";

export type FormValueType = {
  password?: string;
} & Partial<API.UserItem>;
export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  createModalVisible: boolean;
  handleCreateModalVisible: (visible: boolean) => void;
  values: Partial<FormValueType>;
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const [form] = Form.useForm()

  return (
    <ModalForm
      title="新建用户"
      width="500px"
      visible={props.createModalVisible}
      onVisibleChange={props.handleCreateModalVisible}
      onFinish={props.onSubmit}
      form={form}
    >
      <ProFrom.Group>
        <ProFormText
          name="username"
          label="用户名"
          rules={[{required: true}]}
        />
        <ProFormText.Password
          name="password"
          label={"密码"}
          rules={[{required: true}]}
        />
      </ProFrom.Group>
      <ProFrom.Group>
        <ProFormText
          name="name"
          label="姓名"
          rules={[{required: true}]}
        />
        <ProFormText
          name="email"
          label="邮箱"
        />
      </ProFrom.Group>
      <ProFormSelect
        label="用户类型"
        name="is_superuser"
        width={420}
        options={[
          {
            value: 'false',
            label: '用户',
          },
          {
            value: 'true',
            label: '管理员',
          }
        ]}
        initialValue={'false'}
        fieldProps={{
          onSelect: ((value) => {
            form.setFieldsValue({
              role: value === 'true' ? ['admin'] : ['user']
            })
          })
        }}
      />
      <ProFormSelect
        name="limit_login_time"
        label="限制登录时段"
        width={420}
        mode="multiple"
        options={[
          {label: '星期一', value: 1},
          {label: '星期二', value: 2},
          {label: '星期三', value: 3},
          {label: '星期四', value: 4},
          {label: '星期五', value: 5},
          {label: '星期六', value: 6},
          {label: '星期天', value: 7}
          ]}
        initialValue={[6, 7]}
      />
      <ProFormText
        label="权限"
        width="md"
        name="role"
        initialValue={['user']}
        hidden
      />
    </ModalForm>
  );
};

export default CreateForm;
