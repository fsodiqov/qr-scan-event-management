import { useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { ExportCsvButton } from '@/components/common/ExportCsvButton';
import {
  useCreateOrganizationUser,
  useDeleteOrganizationUser,
  useOrganizationUsers,
  useUpdateOrganizationUser,
} from '@/hooks/useOrganizationUsers';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { fetchAllForExport, useCsvExport } from '@/hooks/useCsvExport';
import { getApiErrorMessage } from '@/utils/helpers';
import { tablePagination } from '@/utils/tablePagination';
import { organizationUsersApi } from '@/api';
import { userActiveColors } from '@/theme/statusColors';
import type { OrganizationUser, StaffRole } from '@/types';

interface MemberFormValues {
  name: string;
  login: string;
  phone?: string;
  password?: string;
  role: StaffRole;
}

interface EditMemberFormValues extends MemberFormValues {
  isActive: boolean;
}

export function OrganizationUsersPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationUser | null>(null);
  const [createForm] = Form.useForm<MemberFormValues>();
  const [editForm] = Form.useForm<EditMemberFormValues>();

  const params = useMemo(() => ({ page, limit: pageSize }), [page, pageSize]);
  const { data, isLoading } = useOrganizationUsers(params);
  const createMember = useCreateOrganizationUser();
  const updateMember = useUpdateOrganizationUser();
  const deleteMember = useDeleteOrganizationUser();
  const { exporting, runExport } = useCsvExport();

  const handleExportCsv = () => {
    void runExport(async () => {
      const members = await fetchAllForExport(async (exportPage, limit) => {
        const result = await organizationUsersApi.list({
          page: exportPage,
          limit,
        });
        return {
          items: result.members,
          total: result.meta?.total ?? result.members.length,
        };
      });

      return {
        filenamePrefix: 'team-members',
        headers: [
          t('common.name'),
          t('common.login'),
          t('orgUsers.role'),
          t('common.status'),
        ],
        rows: members.map((member) => [
          member.name,
          member.login ?? '',
          t(`roles.${member.role}`),
          member.isActive ? t('orgUsers.active') : t('orgUsers.inactive'),
        ]),
      };
    });
  };

  const openEditModal = (member: OrganizationUser) => {
    setEditingMember(member);
    editForm.setFieldsValue({
      name: member.name,
      login: member.login ?? '',
      phone: member.phone,
      role: member.role as StaffRole,
      isActive: member.isActive,
      password: undefined,
    });
  };

  const closeEditModal = () => {
    setEditingMember(null);
    editForm.resetFields();
  };

  const handleCreate = async (values: MemberFormValues) => {
    try {
      const result = await createMember.mutateAsync(values);
      if (result.tempPassword) {
        message.success(t('orgUsers.createdWithPassword', { password: result.tempPassword }), 8);
      } else {
        message.success(t('orgUsers.created'));
      }
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (error) {
      message.error(getApiErrorMessage(error, t('orgUsers.saveFailed')));
    }
  };

  const handleUpdate = async (values: EditMemberFormValues) => {
    if (!editingMember) return;

    try {
      await updateMember.mutateAsync({
        id: editingMember.id,
        payload: {
          name: values.name,
          login: values.login,
          phone: values.phone,
          role: values.role,
          isActive: values.isActive,
          status: values.isActive ? 'active' : 'disabled',
          ...(values.password ? { password: values.password } : {}),
        },
      });
      message.success(
        values.password ? t('orgUsers.updatedWithPassword') : t('orgUsers.updated'),
      );
      closeEditModal();
    } catch (error) {
      message.error(getApiErrorMessage(error, t('orgUsers.saveFailed')));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMember.mutateAsync(id);
      message.success(t('orgUsers.removed'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('orgUsers.removeFailed')));
    }
  };

  const columns: ColumnsType<OrganizationUser> = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => (
        <Typography.Text className="team-cell-primary">{value}</Typography.Text>
      ),
    },
    {
      title: t('common.login'),
      dataIndex: 'login',
      key: 'login',
      render: (value: string) => (
        <Typography.Text className="team-cell-secondary">{value}</Typography.Text>
      ),
    },
    {
      title: t('orgUsers.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag className="status-badge team-role-badge">{t(`roles.${role}`)}</Tag>
      ),
    },
    {
      title: t('common.status'),
      key: 'status',
      render: (_, record) => (
        <Tag
          className="status-badge"
          color={record.isActive ? userActiveColors.active : userActiveColors.inactive}
        >
          {record.isActive ? t('orgUsers.active') : t('orgUsers.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) =>
        record.role !== 'owner' ? (
          <div className="team-actions">
            <Button
              size="small"
              type="text"
              className="team-action-btn team-action-edit"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              aria-label={t('common.edit')}
            />
            <Popconfirm
              title={t('orgUsers.removeConfirm')}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                size="small"
                type="text"
                danger
                className="team-action-btn team-action-delete"
                icon={<DeleteOutlined />}
                aria-label={t('common.delete')}
              />
            </Popconfirm>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="team-page">
      <PageHeader
        title={t('orgUsers.title')}
        subtitle={t('orgUsers.subtitle')}
        extra={
          <div className="page-header-actions">
            <ExportCsvButton onClick={handleExportCsv} loading={exporting} block={isMobile} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              block={isMobile}
              className="team-header-cta"
            >
              {t('orgUsers.add')}
            </Button>
          </div>
        }
      />

      <Table
        className="team-table"
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.members ?? []}
        scroll={{ x: 'max-content' }}
        pagination={tablePagination(page, pageSize, data?.meta?.total ?? 0, (nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        })}
      />

      <Modal
        title={t('orgUsers.add')}
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ role: 'admin' }}
          onFinish={handleCreate}
        >
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="login" label={t('common.login')} rules={[{ required: true, message: t('auth.loginRequired') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('common.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t('orgUsers.role')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'admin', label: t('roles.admin') },
                { value: 'operator', label: t('roles.operator') },
              ]}
            />
          </Form.Item>
          <Form.Item name="password" label={t('orgUsers.passwordOptional')}>
            <Input.Password placeholder={t('orgUsers.passwordAuto')} />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={createMember.isPending}>
              {t('common.save')}
            </Button>
            <Button onClick={() => setCreateModalOpen(false)}>{t('common.cancel')}</Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title={t('orgUsers.edit')}
        open={Boolean(editingMember)}
        onCancel={closeEditModal}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="login" label={t('common.login')} rules={[{ required: true, message: t('auth.loginRequired') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('common.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t('orgUsers.role')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'admin', label: t('roles.admin') },
                { value: 'operator', label: t('roles.operator') },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label={t('common.status')}
            valuePropName="checked"
          >
            <Switch checkedChildren={t('orgUsers.active')} unCheckedChildren={t('orgUsers.inactive')} />
          </Form.Item>
          <Form.Item name="password" label={t('orgUsers.newPassword')}>
            <Input.Password placeholder={t('orgUsers.newPasswordHint')} />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={updateMember.isPending}>
              {t('common.save')}
            </Button>
            <Button onClick={closeEditModal}>{t('common.cancel')}</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
