import React, {useEffect, useState} from 'react';
import {Form, Input, Space} from 'antd';
import ProFrom, {
  ProFormText,
  ModalForm, ProFormDatePicker, ProFormSelect,
} from '@ant-design/pro-form';
import moment from "moment";
import {useModel} from "@@/plugin-model/useModel";
import {getAllVarietyData, getVarietyData} from "@/services/api/variety";

export type FormValueType = {} & Partial<API.PriceDataResult>;
export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  inputPriceModalVisible: boolean;
  handleInputPriceModalVisible: (visible: boolean) => void;
  values: Partial<FormValueType>;
  varietySelectList: { label: React.ReactNode; value: number; }[]
};

const InputPriceForm: React.FC<CreateFormProps> = (props) => {
  const {initialState} = useModel<any>('@@initialState');
  const [form] = Form.useForm()
  const [varietySelectList, setVarietySelectList] = useState([])

  useEffect(() => {
    getAllVarietyData({a: 'get_variety_list', uid: initialState.currentUser.id, c: moment().format('YYYY-MM-DD')}).then((res: any) => {
      setVarietySelectList(res.data.map((item: API.VarietyResult) => ({label: item.name, value: item.id})))
    })
  }, [])

  return (
    <ModalForm
      title="录入价格"
      width="470px"
      visible={props.inputPriceModalVisible}
      onVisibleChange={props.handleInputPriceModalVisible}
      onFinish={props.onSubmit}
      form={form}
    >
      <ProFormText
        label="用户"
        name="user"
        width="md"
        initialValue={initialState.currentUser.id}
        hidden
      />
      {varietySelectList &&
      <ProFormSelect
        label="品种"
        width="md"
        name="variety"
        options={varietySelectList}
        fieldProps={{
          onSelect: (value, option) => {
            getVarietyData({id: value, }).then((res) => {
              form.setFieldsValue({categories: res.categories, variety_id: res.id})
            })
          }
        }}
      />
      }
      <ProFormText
        name="variety_id"
        label="品种ID"
        width="md"
        hidden
      />
      <Form.List name="categories">
        {(fields) => (
          <>
            {fields.map(({key, name, fieldKey, ...restField}) => (
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
        initialValue={moment()}
        rules={[{required: true}]}
        fieldProps={{
          disabledDate: (current) => {
            return [6, 7].indexOf(moment(current).isoWeekday()) !== -1
          },
          onChange: (date, dateString) => {
            form.setFieldsValue({variety: [], categories: []})
            getAllVarietyData({a: 'get_variety_list', c: dateString, uid: initialState.currentUser.id}).then((res: any) => {
              setVarietySelectList(res.data.map((item: API.VarietyResult) => ({label: item.name, value: item.id})))
            })
          }
        }}
      />
    </ModalForm>
  );
};

export default InputPriceForm;
