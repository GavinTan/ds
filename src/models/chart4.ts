import {useState, useCallback} from 'react';

export default () => {
  const [data1, setData1] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const [data2, setData2] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const [data3, setData3] = useState<API.ChartData>({legend_data: [], x_data: [], series_data: []})
  const [tmpData, setTmpData] = useState<{ tab: string, selectCategory: string[], date: string }[]>([])
  return {data1, data2, data3, setData1, setData2, setData3, tmpData, setTmpData};
};
