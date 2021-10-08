import React, {useEffect, useRef, useState} from 'react';
import ReactECharts from 'echarts-for-react';
import {Card, Form, DatePicker, Button, Radio} from "antd";
import {actionPriceData} from "@/services/api/pricedata";
import {PageContainer} from "@ant-design/pro-layout";
import {useModel} from "@@/plugin-model/useModel";
import {ProFormText} from "@ant-design/pro-form";
import {Fullscreen} from '@alitajs/antd-plus';
import moment from "moment";

const {RangePicker} = DatePicker;

const Chart1: React.FC = () => {
  const [data, setData] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []});
  const {initialState} = useModel<any>('@@initialState');
  const echartsRef = useRef<any>(null);
  const [chatStyle, setChatStyle] = useState<any>({height: 'calc(100vh - 115px)'});
  const [enabled, setEnabled] = useState(false);
  let chartFullScreen = false;

  useEffect(() => {
    let mounted = true;

    echartsRef.current?.getEchartsInstance().showLoading();
    actionPriceData({a: 'get_chart1_data'}, {data: {uid: initialState.currentUser.id}}).then((res) => {
      if (mounted) {
        setData(res);
      }
      echartsRef.current?.getEchartsInstance().hideLoading();
    })

    return () => {
      mounted = false;
    }
  }, [])

  const timelineOptions = [
    { label: '日线', value: 1 },
    { label: '周线', value: 5 },
    { label: '月线', value: 22 }
  ];

  const options = {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      top: 10,
      data: data.legend_data
    },
    grid: {
      left: 60,
      right: 90,
      top: 100,
      bottom: 80,
      containLabel: true,
    },
    toolbox: {
      top: 10,
      right: 20,
      feature: {
        saveAsImage: {title: '下载', name: '图1-1'},
        myFullScreen: {
          show: true,
          title: '全屏',
          icon: 'path://M179.00873 99.777639h59.834603a49.9208 49.9208 0 0 0 0-99.777639H47.794738A48.897439 48.897439 0 0 0 0.04858 49.888819v199.555278a47.810119 47.810119 0 1 0 95.524297 0v-95.940037l201.250219 212.986883a48.321799 48.321799 0 1 0 68.245346-68.437227z m664.384759 0.6396h-60.442223a50.2406 50.2406 0 0 1 0-100.417239H975.854701a49.217239 49.217239 0 0 1 48.257839 50.20862v201.154278a48.289819 48.289819 0 1 1-96.515678 0V154.78326l-203.360899 214.585884a48.801499 48.801499 0 1 1-68.948907-69.076827zM179.00873 924.222361h59.834603a49.9208 49.9208 0 0 1 0 99.777639H47.794738a48.897439 48.897439 0 0 1-47.746158-49.888819v-199.555278a47.810119 47.810119 0 1 1 95.524297 0v95.940037l201.250219-212.986883a48.321799 48.321799 0 1 1 68.245346 68.437227z m664.384759-0.6396h-60.442223a50.2406 50.2406 0 0 0 0 100.417239H975.854701a49.217239 49.217239 0 0 0 48.257839-50.20862v-201.154278a48.289819 48.289819 0 1 0-96.515678 0v96.579638l-203.360899-214.585884a48.801499 48.801499 0 1 0-68.948907 69.076827z',
          onclick: () => {
            setChatStyle({height: '100%', width: '100%', background: 'white'});
            chartFullScreen = !chartFullScreen;
            setEnabled(chartFullScreen);
          }
        }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.x_data
    },
    yAxis: {
      type: 'value'
    },
    series: data.series_data,
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
      startValue: data.x_data.length - 11,
      endValue: data.x_data.length - 1
    }, {
      type: 'inside'
    }],
  };

  return (
    <PageContainer header={{title: '', breadcrumb: {}}}>
      <Card extra={
          <Form
            layout="inline"
            initialValues={{timeline: 1}}
            onFinish={(values) => {
              echartsRef.current.getEchartsInstance().showLoading();
              actionPriceData({a: 'get_chart1_data'}, {data: values}).then((res) => {
                setData(res);
                echartsRef.current.getEchartsInstance().hideLoading();
              })
            }}
          >
            <Form.Item name="timeline">
              <Radio.Group
                options={timelineOptions}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
            <ProFormText
              name="uid"
              initialValue={initialState.currentUser.id}
              hidden
            />
            <Form.Item
              name="dateRange"
            >
              <RangePicker
                disabledDate={(current) => {
                  return [6, 7].indexOf(moment(current).isoWeekday()) !== -1;
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
        <Fullscreen
          enabled={enabled}
          onClose={() => {
            setChatStyle({height: 'calc(100vh - 115px)'});
          }}
        >
          <ReactECharts option={options} ref={echartsRef} style={chatStyle}/>
        </Fullscreen>
      </Card>
    </PageContainer>
  );
};

export default Chart1;
