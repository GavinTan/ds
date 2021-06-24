import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, DatePicker, Form, Input, Select, Space, Tabs, Tag} from "antd";
import ReactECharts from "echarts-for-react";
import {actionPriceData} from "@/services/api/pricedata";
import {actionVariety} from "@/services/api/variety";
import {useModel} from "@@/plugin-model/useModel";
import {ProFormText} from "@ant-design/pro-form";
import {PageContainer} from "@ant-design/pro-layout";
import moment from "moment";

const {TabPane} = Tabs;

const Chart4: React.FC = () => {
  const [selectCategoryList, setSelectCategoryList] = useState([])
  const {initialState} = useModel<any>('@@initialState');
  // const [data1, setData1] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  // const [data2, setData2] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  // const [data3, setData3] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const echartsRef = useRef<any>(null);
  const [selectTab, setSelectTab] = useState<string>('1')
  const [form] = Form.useForm()
  const {data1, data2, data3, setData1, setData2, setData3, tmpData} = useModel('chart4')


  useEffect(() => {
    actionVariety({a: 'get_select_category_list'}, {data: {uid: initialState.currentUser.id}}).then((res) => {
      setSelectCategoryList(res.data)
    })
    const isExist = tmpData.some((v) => {
      if (v.tab === selectTab) {
        form.setFieldsValue({selectCategory: v.selectCategory, date: v.date})
      }
      return v.tab === selectTab
    })

    if (!isExist) {
      form.setFieldsValue({selectCategory: [1, 2], date: ''})
    }
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
        left: 60,
        right: 90,
        top: 100,
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
        brushSelect: true,
        // eslint-disable-next-line no-eval
        startValue: eval(`data${selectTab}`).x_data.length - 11,
        // eslint-disable-next-line no-eval
        endValue: eval(`data${selectTab}`).x_data.length - 1
      }, {
        type: 'inside'
      }],
    }
  }
  const Tab = (index: number) => {
    return (
      <TabPane tab={`Tab${index}`} key={index}>
        <ReactECharts option={getOption(selectTab)} ref={echartsRef} style={{height: 'calc(100vh - 320px)'}}/>
      </TabPane>
    )
  }

  useEffect(() => {
    echartsRef.current?.getEchartsInstance().setOption(getOption(selectTab), true)
    // eslint-disable-next-line no-eval
  }, [eval(`data${selectTab}`), echartsRef])

  return (
    <PageContainer>
      <Card>
        <Tabs
          style={{overflow: 'visible'}}
          onChange={(activeKey) => {
            setSelectTab(activeKey)
            const isExist = tmpData.some((v) => {
              if (v.tab === activeKey) {
                form.setFieldsValue({selectCategory: v.selectCategory, date: v.date})
              }
              return v.tab === activeKey
            })

            if (!isExist) {
              form.setFieldsValue({selectCategory: [1, 2], date: ''})
            }
          }}
          tabBarExtraContent={
            <Form
              layout="inline"
              form={form}
              onFinish={(values) => {
                const t: string[] = [];
                tmpData.forEach((v: { tab: string, selectCategory: string[], date: string }) => {
                  if (v.tab === selectTab) {
                    // eslint-disable-next-line no-param-reassign
                    v.selectCategory = values.selectCategory
                    // eslint-disable-next-line no-param-reassign
                    v.date = values.date
                  }
                  t.push(v.tab)
                })
                if (!t.includes(selectTab)) {
                  tmpData.push({tab: selectTab, selectCategory: values.selectCategory, date: values.date})
                }
                echartsRef.current?.getEchartsInstance().showLoading()
                actionPriceData({a: 'get_chart4_data'}, {data: values}).then((res) => {
                  // eslint-disable-next-line no-eval
                  eval(`setData${selectTab}`)(res)
                  echartsRef.current?.getEchartsInstance().hideLoading()
                })
              }}
            >
              <ProFormText
                name="uid"
                initialValue={initialState.currentUser.id}
                hidden
              />
              <Form.List name="selectCategory" initialValue={[1, 2]}>
                {(fields) => (
                  <>
                    {fields.map(({key, name, fieldKey, ...restField}) => (
                      <Space key={key}>
                        <Form.Item
                          {...restField}
                          name={[name, `category${name + 1}`]}
                          fieldKey={[fieldKey, selectTab]}
                          rules={[{required: true, message: "至少选择一项"}]}
                          validateTrigger={[]}
                          label={key === 0 ? '主线' : '副线'}
                        >
                          <Select
                            style={{width: 128}} placeholder="请选择"
                            options={selectCategoryList}
                          />
                        </Form.Item>
                      </Space>
                    ))}
                  </>
                )}
              </Form.List>
              <Form.Item
                name="date"
                rules={[{required: true, message: "请选择日期"}]}
                validateTrigger={[]}
              >
                <DatePicker
                  disabledDate={(current) => {
                    return [6, 7].indexOf(moment(current).isoWeekday()) !== -1
                  }}
                />
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
    </PageContainer>
  )
};

export default Chart4;
