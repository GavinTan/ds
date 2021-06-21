import type { FormInstance} from 'antd';
import {Button, message, Drawer, Tag} from 'antd';
import React, {useState, useRef, useEffect} from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { FormValueType } from './components/UpdatePriceForm';
import UpdatePriceForm from './components/UpdatePriceForm';
import InputPriceForm from './components/InputPriceForm';
import { getAllPriceData, createPriceData, updatePriceData, multipleDeletePriceData } from '@/services/api/pricedata';
import { getAllVarietyData } from "@/services/api/variety";
import moment from "moment";
import {useModel} from "@@/plugin-model/useModel";

/**
 * 添加
 *
 * @param fields
 */

const handleInputPrice = async (fields: API.PriceDataResult) => {
  const hide = message.loading('正在录入');

  try {
    await createPriceData({
      data: {...fields }
    });
    hide();
    message.success('录入成功');
    return true;
  } catch (error) {
    hide();
    message.error('录入失败请重试！');
    return false;
  }
};
/**
 * 更新
 *
 * @param fields
 */

const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在编辑');

  try {
    await updatePriceData({
      id: fields.id,
      data: {...fields}
    });
    hide();
    message.success('编辑成功');
    return true;
  } catch (error) {
    hide();
    message.error('编辑失败！');
    return false;
  }
};
/**
 * 删除
 *
 * @param selectedRows
 */

const handleMultipleDelete = async (selectedRows: API.PriceDataResult[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await multipleDeletePriceData({
      data: {
        ids: selectedRows.map((row) => row.id || -1),
      }
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const PriceList: React.FC = () => {
  const [inputPriceModalVisible, setInputPriceModalVisible] = useState<boolean>(false);
  const [updatePriceModalVisible, setUpdatePriceModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const [currentRow, setCurrentRow] = useState<API.PriceDataResult>();
  const [selectedRowsState, setSelectedRows] = useState<API.PriceDataResult[]>([]);
  const [varietySelectList, setVarietySelectList] = useState<{ label: React.ReactNode; value: number; }[]>([]);
  const { initialState } = useModel('@@initialState');


    useEffect(() => {
    getAllVarietyData({a: 'get_variety_list'}).then((res: any) => {
      setVarietySelectList(
        res.data.map((item: any) => ({
          label: item.name,
          value: item.id,
        })),
      );
    });
  }, []);

  const columns: ProColumns<API.PriceDataResult>[] = [
    {
      title: '品种',
      dataIndex: 'variety',
      align: "center",
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
      fieldProps: {
        onChange: (e: any) => {
          if (e.target.value === '') {
            if (formRef.current) {
              formRef.current.submit();
            }
          }
        },
      },
    },
    {
      title: '价格',
      dataIndex: 'categories',
      align: "center",
      render: (text: any) => {
        return text.map((value: any, index: number) => {
          return <Tag key={`category${index + 1}`}>{value[`category${index + 1}`]}: {value.price}￥</Tag>
        })
      },
      fieldProps: {
        onChange: (e: any) => {
          if (e.target.value === '') {
            if (formRef.current) {
              formRef.current.submit();
            }
          }
        },
      },
    },
    {
      title: '日期',
      dataIndex: 'date',
      valueType: 'date'
    },
    {
      title: '用户',
      dataIndex: 'user',
      hideInTable: initialState?.currentUser?.is_superuser === false,
      hideInSearch: initialState?.currentUser?.is_superuser === false,
      hideInForm: initialState?.currentUser?.is_superuser === false,
      fieldProps: {
        onChange: (e: any) => {
          if (e.target.value === '') {
            if (formRef.current) {
              formRef.current.submit();
            }
          }
        },
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (text, record: API.PriceDataResult) => [
        <a
          key="update"
          onClick={() => {
            setUpdatePriceModalVisible(true)
            setCurrentRow(record);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];
  return (
    <PageContainer>
      <ProTable<API.PriceDataResult, API.PageParams>
        headerTitle="价格数据"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        pagination={{
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="input"
            onClick={() => {
              setInputPriceModalVisible(true);
            }}
          >
            录入价格
          </Button>,
        ]}
        params={{uid: initialState?.currentUser?.id}}
        request={getAllPriceData}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项
            </div>
          }
        >
          <Button
            type="primary"
            onClick={async () => {
              await handleMultipleDelete(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >批量删除</Button>
        </FooterToolbar>
      )}
      {inputPriceModalVisible && <InputPriceForm
        onSubmit={async (value) => {
          const success = await handleInputPrice(value);

          if (success) {
            setInputPriceModalVisible(false);
            setCurrentRow(undefined);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          setInputPriceModalVisible(false);
          setCurrentRow(undefined);
        }}
        inputPriceModalVisible={inputPriceModalVisible}
        handleInputPriceModalVisible={setInputPriceModalVisible}
        values={currentRow || {}}
        varietySelectList={varietySelectList}
      />
      }
      {updatePriceModalVisible && currentRow && <UpdatePriceForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);

          if (success) {
            setUpdatePriceModalVisible(false);
            setCurrentRow(undefined);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          setUpdatePriceModalVisible(false);
          setCurrentRow(undefined);
        }}
        updatePriceModalVisible={updatePriceModalVisible}
        handleUpdatePriceModalVisible={setUpdatePriceModalVisible}
        values={currentRow}
      />
      }
      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow && (
          <ProDescriptions<API.PriceDataResult>
            column={3}
            title={currentRow.variety}
          >
            { currentRow.categories?.map((e, i) =>
                <React.Fragment key={i}>
                <ProDescriptions.Item label="类别">{e[`category${i+1}`]}</ProDescriptions.Item>
                <ProDescriptions.Item label="价格">{e.price}</ProDescriptions.Item>
                <ProDescriptions.Item label="日期">{currentRow.date}</ProDescriptions.Item>
                </React.Fragment>
            )
            }
          </ProDescriptions>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default PriceList;
