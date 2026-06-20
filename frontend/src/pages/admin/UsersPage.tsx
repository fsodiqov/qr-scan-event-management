import { useMemo, useState } from 'react';
import { Button, Input, Popconfirm, Space, Table, message } from 'antd';
import { PlusOutlined, QrcodeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { useDeleteUser, useUsers } from '@/hooks/useUsers';
import { ROUTES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage } from '@/utils/helpers';
import type { User } from '@/types';

export function UsersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const params = useMemo(
    () => ({ page, limit: 10, search: search || undefined }),
    [page, search],
  );

  const { data, isLoading } = useUsers(params);
  const deleteUser = useDeleteUser();

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      message.success('User deactivated');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to deactivate user'));
    }
  };

  const columns: ColumnsType<User> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v) => v ?? '—' },
    { title: 'Organization', dataIndex: 'organization', key: 'organization', render: (v) => v ?? '—' },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => formatDateTime(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => navigate(ROUTES.USER_QR(record._id))}
          >
            QR
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(ROUTES.USER_EDIT(record._id))}
          />
          <Popconfirm
            title="Deactivate this user?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage event participants"
        extra={
          <Link to={ROUTES.USER_NEW}>
            <Button type="primary" icon={<PlusOutlined />}>
              Add User
            </Button>
          </Link>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by name, phone, organization"
          allowClear
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={(value) => {
            setPage(1);
            setSearch(value.trim());
          }}
          style={{ width: 320 }}
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.users ?? []}
        pagination={{
          current: page,
          pageSize: 10,
          total: data?.meta?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
