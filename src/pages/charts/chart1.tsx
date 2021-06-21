import React, {useEffect, useRef, useState} from 'react';
import ReactECharts from 'echarts-for-react';
import {Card, Form, DatePicker, Button} from "antd";
import {actionPriceData} from "@/services/api/pricedata";
import {PageContainer} from "@ant-design/pro-layout";
import {useModel} from "@@/plugin-model/useModel";
import ProFrom, {ProFormDateRangePicker, ProFormText} from "@ant-design/pro-form";
import moment from "moment";

const { RangePicker } = DatePicker;

const Chart1: React.FC = () => {
  const [data, setData] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []});
  const {initialState} = useModel<any>('@@initialState');
  const echartsRef = useRef<any>(null);

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

  const options = {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
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
      feature: {
        saveAsImage: {}
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
    <PageContainer>
      <Card extra={
        <Form
          layout="inline"
          onFinish={(values) => {
            echartsRef.current.getEchartsInstance().showLoading()
            actionPriceData({a: 'get_chart1_data'}, {data: values}).then((res) => {
              setData(res)
              echartsRef.current.getEchartsInstance().hideLoading()
            })
          }}
        >
          <ProFormText
            name="uid"
            initialValue={initialState.currentUser.id}
            hidden
          />
          <Form.Item
            name="dateRange"
          >
            <RangePicker
              disabledDate={(current) => {return [6, 7].indexOf(moment(current).isoWeekday()) !== -1}}
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
        <ReactECharts option={options} ref={echartsRef} style={{height: 'calc(100vh - 320px)'}}/>
      </Card>
    </PageContainer>
  );
};

export default Chart1;
