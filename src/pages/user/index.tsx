import { PlusOutlined } from '@ant-design/icons';
import type { FormInstance} from 'antd';
import { Button, message, Drawer } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateForm from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import { getAllUserData, updateUser, createUser, multipleDeleteUser } from '@/services/api/user';
import './index.less'
/**
 * 添加
 *
 * @param fields
 */

const handleCreate = async (fields: API.UserItem) => {
  const hide = message.loading('正在添加');

  try {
    await createUser({
      data: {...fields }
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

const handleUpdate = async (fields: API.UserResult) => {
  const hide = message.loading('正在编辑');

  try {
    await updateUser({
      id: fields.id,
      data: {...fields}
    });
    hide();
    message.success('编辑用户成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置用户失败！');
    return false;
  }
};
/**
 * 删除
 *
 * @param selectedRows
 */

const handleMultipleDelete = async (selectedRows: API.UserItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await multipleDeleteUser({
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

const UserList: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const [currentRow, setCurrentRow] = useState<API.UserItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.UserItem[]>([]);

  const columns: ProColumns<API.UserResult>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
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
      title: '姓名',
      dataIndex: 'name',
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
      title: '邮箱',
      dataIndex: 'email',
      search: false
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      hideInForm: true,
      valueEnum: {
        false: {
          text: '禁用',
          status: 'Default',
        },
        true: {
          text: '启用',
          status: 'Processing',
        }
      },
      fieldProps: {
        onChange: () => {
          if (formRef.current) {
            formRef.current.submit();
          }
        },
      },
    },
    {
      title: '登录时间',
      sorter: true,
      dataIndex: 'last_login',
      valueType: 'dateTime',
      search: false
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'date_joined',
      valueType: 'dateTime',
      search: false
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (text, record, _, action) => [
        record.is_active === true &&
        <a
          key="disableUser"
          className={`${record.username === 'admin' && 'disabled'}`}
          onClick={async () => {
            await updateUser({
              id: record.id,
              data: {username: record.username, is_active: false}
            });
            action?.reload();
            message.success('用户禁用成功');
          }}
        >
          禁用
        </a>,
        record.is_active === false &&
        <a
          key="enableUser"
          onClick={async () => {
            await updateUser({
              id: record.id,
              data: {username: record.username, is_active: true}
            });
            action?.reload();
            message.success('用户启用成功');
          }}
        >
          启用
        </a>,
        <a
          key="update"
          onClick={() => {
            setUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];
  return (
    <PageContainer header={{title: '', breadcrumb: {}}}>
      <ProTable<API.UserResult, API.PageParams>
        headerTitle="用户列表"
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
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={getAllUserData}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
          getCheckboxProps: record => ({
            disabled: record.username === 'admin'
          })
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
      <CreateForm
        onSubmit={async (value) => {
          const success = await handleCreate(value);

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
      />}

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.UserItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.UserItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default UserList;
