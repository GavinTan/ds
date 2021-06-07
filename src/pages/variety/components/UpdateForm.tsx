import React from 'react';
import {
  ProFormText,
  ModalForm,
} from '@ant-design/pro-form';
import {Form, Space} from 'antd';
import {useModel} from "@@/plugin-model/useModel";


export type FormValueType = {
  id: number;
} & Partial<API.VarietyResult>;
export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  handleUpdateModalVisible: (visible: boolean) => void;
  values: Partial<FormValueType>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { initialState } = useModel('@@initialState');

  return (
    <ModalForm
      title="编辑品种"
      width="400px"
      visible={props.updateModalVisible}
      onVisibleChange={props.handleUpdateModalVisible}
      onFinish={props.onSubmit}
      initialValues={{
        user: initialState?.currentUser?.id,
        id: props.values.id,
        name: props.values.name,
        categories: props.values.categories
      }}
    >
      <ProFormText
        label="用户"
        name="user"
        width="md"
        hidden
      />
      <ProFormText
        width="xs"
        name="id"
        label="ID"
        hidden
      />
      <ProFormText
        name="name"
        label="名称"
        width="md"
        rules={[{required: true, whitespace: true}]}
      />
      <Form.List name="categories">
        {(fields) => (
          <>
            {fields.map(({key, name, fieldKey, ...restField}) => (
              <Space key={key}>
                <ProFormText
                  {...restField}
                  name={[name, `category${name + 1}`]}
                  fieldKey={fieldKey}
                  rules={[{required: true, whitespace: true, message: '请输入名称'}]}
                  label={`类别${name + 1}`}
                  width="md"
                />
              </Space>
            ))}
          </>
        )}
      </Form.List>
    </ModalForm>
  );
};

export default UpdateForm;
