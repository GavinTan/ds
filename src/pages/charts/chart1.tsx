import React, {useEffect, useState} from 'react';
import ReactECharts from 'echarts-for-react';
import {Card} from "antd";
import {actionPriceData} from "@/services/api/pricedata";

const Chart1: React.FC = () => {
  const [data, setData] = useState<API.ChartData>({})

  useEffect(() => {
    actionPriceData({a: 'get_chart1_data'}).then((res) => {
      setData(res)
    })
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
      brushSelect: true
    }, {
      type: 'inside'
    }],
  };

  return (
    <Card>
      <ReactECharts option={options} style={{height: 400}}/>
    </Card>
  );
};

export default Chart1;
