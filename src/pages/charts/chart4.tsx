import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, DatePicker, Form, Input, Select, Space, Tabs} from "antd";
import ReactECharts from "echarts-for-react";
import {actionPriceData} from "@/services/api/pricedata";
import {actionVariety} from "@/services/api/variety";
import {useModel} from "@@/plugin-model/useModel";
import ProFrom, {ModalForm, ProFormText} from "@ant-design/pro-form";

const {TabPane} = Tabs;

const Chart4: React.FC = () => {
  const [selectCategoryList, setSelectCategoryList] = useState([])
  const {initialState} = useModel<any>('@@initialState');
  const [data1, setData1] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const [data2, setData2] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const [data3, setData3] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const [data4, setData4] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const echartsRef = useRef<any>(null);
  const [selectTab, setSelectTab] = useState<string>('1')
  const [form] = Form.useForm()

  useEffect(() => {
    actionVariety({a: 'get_select_category_list', uid: initialState.currentUser.id}).then((res) => {
      setSelectCategoryList(res.data)
    })
  }, [])

  const getOption = (key: string) => {
    return {
      title: {
        text: ''
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        // eslint-disable-next-line no-eval
        data: eval(`data${key}`).legend_data
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: 80,
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        // eslint-disable-next-line no-eval
        data: eval(`data${key}`).x_data
      },
      yAxis: {
        type: 'value'
      },
      // eslint-disable-next-line no-eval
      series: eval(`data${key}`).series_data,
      dataZoom: [{
        textStyle: {
          color: '#8392A5'
        },
        handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        dataBackground: {
          areaStyle: {
            color: '#8392A5'
          },
          lineStyle: {
            opacity: 0.8,
            color: '#8392A5'
          }
        },
        brushSelect: true
      }, {
        type: 'inside'
      }],
    }
  }
  const Tab = (index: number) => {
    return (
      <TabPane tab={`Tab${index}`} key={index}>
        <ReactECharts option={getOption(selectTab)} ref={echartsRef} style={{height: 400}}/>
      </TabPane>
    )
  }

  return (
    <Card>
      <Tabs
        onChange={(activeKey) => {
          setSelectTab(activeKey)
          form.setFieldsValue({})
        }}
        tabBarExtraContent={
          <Form
            layout="inline"
            form={form}
            onFinish={(values) => {
              actionPriceData({a: 'get_chart4_data'}, {data: values}).then((res) => {
                echartsRef.current.getEchartsInstance().clear()
                // eslint-disable-next-line no-eval
                eval(`setData${selectTab}`)(res)
              })
            }}
          >
            <Form.List name="selectCategory" initialValue={[1, 2]}>
              {(fields) => (
                <>
                  {fields.map(({key, name, fieldKey, ...restField}) => (
                    <Form.Item
                      {...restField}
                      key={key}
                      name={[name, `category${name + 1}`]}
                      fieldKey={fieldKey}
                      rules={[{required: true, message: "至少选择一项"}]}
                      validateTrigger={[]}
                    >
                      <Select
                        style={{width: 128}} placeholder="请选择"
                        options={selectCategoryList}
                      />
                    </Form.Item>
                  ))}
                </>
              )}
            </Form.List>
            <Form.Item
              name="date"
              rules={[{required: true, message: "至少选择一项"}]}
              validateTrigger={[]}
            >
              <DatePicker/>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查看
              </Button>
            </Form.Item>
          </Form>
        }
      >
        {[1, 2, 3].map((value) => {
          return Tab(value)
        })
        }
      </Tabs>
    </Card>
  )
};

export default Chart4;
