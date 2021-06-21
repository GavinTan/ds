import {useState, useCallback} from 'react';

export default () => {
  const [data1, setData1] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: [], n: {}})
  const [data2, setData2] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: [], n: {}})
  const [data3, setData3] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: [], n: {}})
  const [data4, setData4] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: [], n: {}})
  const [tmpData, setTmpData] = useState<{ tab: string, selectCategory: string[], date: string }[]>([])
  return {data1, data2, data3, data4, setData1, setData2, setData3, setData4, tmpData, setTmpData};
};
