import {PlusOutlined} from '@ant-design/icons';
import type {FormInstance} from 'antd';
import {Button, message} from 'antd';
import React, {useRef, useState} from 'react';
import {FooterToolbar, PageContainer} from '@ant-design/pro-layout';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type {FormValueType} from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import {createVariety, getAllVarietyData, multipleDeleteVariety, updateVariety} from '@/services/api/variety';
import moment from "moment";
import './index.less'
import {useModel} from "@@/plugin-model/useModel";

/**
 * 添加
 *
 * @param fields
 */

const handleCreate = async (fields: API.VarietyResult) => {
  const hide = message.loading('正在添加');

  try {
    await createVariety({
      data: {...fields}
    });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
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
    await updateVariety({
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

const handleMultipleDelete = async (selectedRows: API.VarietyResult[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await multipleDeleteVariety({
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

const VarietyList: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const [currentRow, setCurrentRow] = useState<API.VarietyResult>();
  const [selectedRowsState, setSelectedRows] = useState<API.VarietyResult[]>([]);
  const {initialState} = useModel('@@initialState');

  const columns: ProColumns<API.VarietyResult>[] = [
    {
      title: '品种',
      dataIndex: 'name',
      align: "center",
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
      title: '类别',
      dataIndex: 'categories',
      align: "center",
      renderText: (_: []) => {
        const d: never[] = [];
        _.forEach((item) => {
          Object.keys(item).forEach((key) => {
            d.push(item[key])
          })
        })
        return d.join()
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
      title: '添加时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      align: "center",
      search: false
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (text, record: API.VarietyResult) => [
        <a
          key="update"
          onClick={() => {
            setUpdateModalVisible(true);
            setCurrentRow(record);
          }}
          className={
            initialState?.currentUser?.is_superuser === false &&
            (moment().get('date') !== moment(record.create_time).get('date') &&
              'disabled' || '') || ''
          }
        >
          编辑
        </a>,
      ],
    },
  ];
  return (
    <PageContainer header={{title: '', breadcrumb: {}}}>
      <ProTable<API.VarietyResult, API.PageParams>
        headerTitle="品种列表"
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
            key="create"
            onClick={() => {
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined/> 新建
          </Button>,
        ]}
        params={{uid: initialState?.currentUser?.id}}
        request={getAllVarietyData}
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
      {createModalVisible && <CreateForm
        onSubmit={async (value) => {
          const success = await handleCreate(value as API.VarietyResult);

          if (success) {
            setCreateModalVisible(false);
            setCurrentRow(undefined);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          setCreateModalVisible(false);
          setCurrentRow(undefined);
        }}
        createModalVisible={createModalVisible}
        handleCreateModalVisible={setCreateModalVisible}
        values={currentRow || {}}
      />
      }
      {updateModalVisible && <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);

          if (success) {
            setUpdateModalVisible(false);
            setCurrentRow(undefined);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          setUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        handleUpdateModalVisible={setUpdateModalVisible}
        values={currentRow || {}}
      />
      }
    </PageContainer>
  );
};

export default VarietyList;
