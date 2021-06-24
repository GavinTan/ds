import React, {useEffect, useRef, useState} from 'react';
import ReactECharts from 'echarts-for-react';
import {Card, Tabs} from "antd";
import {actionPriceData} from "@/services/api/pricedata";
import {PageContainer} from "@ant-design/pro-layout";
import {useModel} from "@@/plugin-model/useModel";

const {TabPane} = Tabs;

const Chart3: React.FC = () => {
  const [data, setData] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const {initialState} = useModel<any>('@@initialState');
  const echartsRef = useRef<any>(null);
  const [start, setStart] = useState<number>(1)
  const [end, setEnd] = useState<number>(100)

  useEffect(() => {
    let mounted = true;

    echartsRef.current?.getEchartsInstance().showLoading();
    actionPriceData({a: 'get_chart3_data'}, {data: {uid: initialState.currentUser.id}}).then(async (res) => {
      if (mounted) {
        setData(res);
        setStart(res.x_data.length - 10);
        setEnd(res.x_data.length);
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
      trigger: 'axis',
      formatter: (params: any) => {
        let name = ''
        let html = ''
        const seriesNameLength: number[] = []
        params.forEach((e: any, i: any) => {
          name = e.name
          seriesNameLength.push(e.seriesName.length)
          html += `
              <div style="display: block;height:20px;${i % 2 === 0 ? 'width: 50%;' : 'width: 50%;'}float:left;">
                  <i style="width: 10px;height: 10px;display: inline-block;background: ${e.color};border-radius: 10px;"></i>
                  <span>${e.seriesName}<b style="float: right;margin-right: 10px">${e.data}</b></span>
              </div>
          `
        })
        return `<div style="width: ${Math.max(...seriesNameLength) * 16 * 2 + 40}px;"><span>${name}</span><br>${html}<div>`

      },

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

  const Tab = (index: number) => {
    return (
      <TabPane tab={`Tab${index}`} key={index}>
        <ReactECharts option={options} ref={echartsRef} style={{height: 'calc(100vh - 320px)'}} onEvents={{
          dataZoom: () => {
            // const {startValue, endValue} = echartsRef.current.getEchartsInstance().getOption().dataZoom[0];
            // const axis = echartsRef.current.getEchartsInstance().getModel().option.xAxis[0];
            // const startDate = axis.data[startValue];
            // const endDate = axis.data[endValue];

          //   echartsRef.current?.getEchartsInstance().showLoading()
          //   actionPriceData({a: 'get_chart3_data'}, {data: {
          //       uid: initialState.currentUser.id,
          //       start_date: startDate,
          //       end_date: endDate
          //   }}).then((res) => {
          //       setData(res)
          //     echartsRef.current?.getEchartsInstance().hideLoading()
          //   })
          }
        }}/>
      </TabPane>
    )
  }

  return (
    <PageContainer>
      <Card>
        <Tabs style={{overflow: 'visible'}}>
          {[1, 2, 3].map((value) => {
            return Tab(value)
          })}
        </Tabs>
      </Card>
    </PageContainer>
  );
};

export default Chart3;
