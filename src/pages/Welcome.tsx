import React from 'react';
import {Result} from 'antd';
import {SmileOutlined} from "@ant-design/icons";


export default (): React.ReactNode => {
  return (
    <Result
      icon={<SmileOutlined/>}
      title="Welcome to Data System!"
    />

  );
};
