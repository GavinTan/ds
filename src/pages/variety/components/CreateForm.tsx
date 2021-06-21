import React from 'react';
import { Form } from 'antd';
import {
  ProFormText,
  ModalForm
} from '@ant-design/pro-form';
import {useModel} from "@@/plugin-model/useModel";

export type FormValueType = Partial<API.VarietyResult>;
export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  createModalVisible: boolean;
  handleCreateModalVisible: (visible: boolean) => void;
  values: Partial<FormValueType>;
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const {initialState} = useModel('@@initialState');

  return (
    <ModalForm
      title="新建品种"
      width="420px"
      visible={props.createModalVisible}
      onVisibleChange={props.handleCreateModalVisible}
      onFinish={props.onSubmit}
    >
      <ProFormText
        label="用户"
        name="user"
        width="md"
        initialValue={initialState?.currentUser?.id}
        hidden
      />
      <ProFormText
        name="name"
        label="名称"
        rules={[{required: true, whitespace: true}]}
        width="md"
      />
      <Form.List name="categories" initialValue={[1, 2, 3, 4]}>
        {(fields) => (
          <>
            {fields.map(({key, name, fieldKey, ...restField}) => (
              <ProFormText
                {...restField}
                key={key}
                name={[name, `category${name + 1}`]}
                fieldKey={fieldKey}
                rules={[{required: true, whitespace: true, message: `请输入类别${name + 1}`}]}
                label={`类别${name + 1}`}
                width="md"
              />
            ))}
          </>
        )}
      </Form.List>
    </ModalForm>
  );
};

export default CreateForm;
