import React from 'react';
import {Form, Input, Space} from 'antd';
import ProFrom, {
  ProFormText,
  ModalForm, ProFormDatePicker,
} from '@ant-design/pro-form';
import {useModel} from "@@/plugin-model/useModel";

export type FormValueType = {
  id: number;
} & Partial<API.PriceDataResult>;
export type UpdatePriceFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updatePriceModalVisible: boolean;
  handleUpdatePriceModalVisible: (visible: boolean) => void;
  values: Partial<FormValueType>;
};

const UpdatePriceForm: React.FC<UpdatePriceFormProps> = (props) => {
  const { initialState } = useModel<any>('@@initialState');
  const [form] = Form.useForm()

  return (
    <ModalForm
      title="编辑"
      width="470px"
      visible={props.updatePriceModalVisible}
      onVisibleChange={props.handleUpdatePriceModalVisible}
      onFinish={props.onSubmit}
      form={form}
      initialValues={{
        user: initialState.currentUser.id,
        id: props.values.id,
        variety: props.values.variety,
        variety_id: props.values.variety_id,
        categories: props.values.categories,
        date: props.values.date
      }}
    >
      <ProFormText
        label="用户"
        name="user"
        width="md"
        hidden
      />
      <ProFormText
        label="ID"
        name="id"
        width="md"
        hidden
      />
      <ProFormText
        name="variety"
        label="种类"
        width="md"
        disabled
      />
      <ProFormText
        name="variety_id"
        label="品种ID"
        width="md"
        hidden
      />
      <Form.List name="categories">
        {(fields) => (
          <>
            {fields.map(({ key, name, fieldKey, ...restField }) => (
              <Space key={key}>
                  <ProFrom.Item
                    {...restField}
                    name={[name, `category${name + 1}`]}
                    fieldKey={fieldKey}
                    label={`类别${name + 1}`}
                  >
                    <Input style={{marginRight: '11px', width: '228px'}} disabled/>
                  </ProFrom.Item>
                  <ProFrom.Item
                    {...restField}
                    name={[name, 'price']}
                    fieldKey={[fieldKey, 'price']}
                    label={`价格`}
                  >
                    <Input prefix="￥" style={{width: '80px'}}/>
                  </ProFrom.Item>
              </Space>
            ))}
          </>
        )}
      </Form.List>
      <ProFormDatePicker
        label="日期"
        name="date"
        width="md"
        disabled
      />
    </ModalForm>
  );
};

export default UpdatePriceForm;
