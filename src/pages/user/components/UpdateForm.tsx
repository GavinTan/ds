import React from 'react';
import ProFrom, {
  ProFormSelect,
  ProFormText,
  ModalForm,
} from '@ant-design/pro-form';

export type FormValueType = {
  id: number;
} & Partial<API.UserResult>;
export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  handleUpdateModalVisible: (visible: boolean) => void;
  values: Partial<API.UserResult>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  return (
    <ModalForm
      title="编辑用户"
      width="500px"
      visible={props.updateModalVisible}
      onVisibleChange={props.handleUpdateModalVisible}
      onFinish={props.onSubmit}
    >
      <ProFormText
        width="xs"
        name="id"
        label="ID"
        hidden
        initialValue={props.values.id}
      />
      <ProFrom.Group>
        <ProFormText
          name="username"
          label="用户名"
          rules={[{required: true}]}
          initialValue={props.values.username}
        />
        <ProFormText.Password
          name="password"
          label={"密码"}
          rules={[{required: true}]}
          initialValue={'*'.repeat(10)}
        />
      </ProFrom.Group>
      <ProFrom.Group>
        <ProFormText
          name="name"
          label="姓名"
          rules={[{required: true}]}
          initialValue={props.values.name}
        />
        <ProFormText
          name="email"
          label="邮箱"
          initialValue={props.values.email}
        />
      </ProFrom.Group>
      <ProFormSelect
        label="用户类型"
        width="md"
        name="is_superuser"
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
        initialValue={`${props.values.is_superuser}`}
      />
    </ModalForm>
  );
};

export default UpdateForm;
