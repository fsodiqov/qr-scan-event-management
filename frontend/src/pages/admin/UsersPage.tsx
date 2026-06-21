import { useMemo, useState } from 'react';
import { Button, Input, Popconfirm, Space, Table, message } from 'antd';
import { PlusOutlined, QrcodeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { useDeleteUser, useUsers } from '@/hooks/useUsers';
import { ROUTES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage } from '@/utils/helpers';
import type { User } from '@/types';

export function UsersPage() {
  const { t } = useTranslation();
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
      message.success(t('users.deactivated'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('users.deactivateFailed')));
    }
  };

  const columns: ColumnsType<User> = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('common.phone'), dataIndex: 'phone', key: 'phone', render: (v) => v ?? t('common.empty') },
    { title: t('common.organization'), dataIndex: 'organization', key: 'organization', render: (v) => v ?? t('common.empty') },
    {
      title: t('common.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => formatDateTime(value),
    },
    {
      title: t('common.actions'),
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
            title={t('users.deactivateConfirm')}
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
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        extra={
          <Link to={ROUTES.USER_NEW}>
            <Button type="primary" icon={<PlusOutlined />}>
              {t('users.addUser')}
            </Button>
          </Link>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={t('users.searchPlaceholder')}
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
