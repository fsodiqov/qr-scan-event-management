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
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import {
  useCreateOrganizationUser,
  useDeleteOrganizationUser,
  useOrganizationUsers,
  useUpdateOrganizationUser,
} from '@/hooks/useOrganizationUsers';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { getApiErrorMessage } from '@/utils/helpers';
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationUser | null>(null);
  const [createForm] = Form.useForm<MemberFormValues>();
  const [editForm] = Form.useForm<EditMemberFormValues>();

  const params = useMemo(() => ({ page, limit: 10 }), [page]);
  const { data, isLoading } = useOrganizationUsers(params);
  const createMember = useCreateOrganizationUser();
  const updateMember = useUpdateOrganizationUser();
  const deleteMember = useDeleteOrganizationUser();

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
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('common.login'), dataIndex: 'login', key: 'login' },
    {
      title: t('orgUsers.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag>{t(`roles.${role}`)}</Tag>,
    },
    {
      title: t('common.status'),
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'default'}>
          {record.isActive ? t('orgUsers.active') : t('orgUsers.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) =>
        record.role !== 'owner' ? (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              aria-label={t('common.edit')}
            />
            <Popconfirm title={t('orgUsers.removeConfirm')} onConfirm={() => handleDelete(record.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('orgUsers.title')}
        subtitle={t('orgUsers.subtitle')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            block={isMobile}
          >
            {t('orgUsers.add')}
          </Button>
        }
      />

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.members ?? []}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize: 10,
          total: data?.meta?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
        }}
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
