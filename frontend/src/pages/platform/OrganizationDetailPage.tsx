import { useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  useOrganization,
  useOrganizationMembers,
  useUpdateOrganization,
  useUpdateOrganizationMember,
} from '@/hooks/useOrganizations';
import { getApiErrorMessage } from '@/utils/helpers';
import type { OrganizationStatus, OrganizationUser, Role } from '@/types';

interface EditMemberFormValues {
  name: string;
  login: string;
  phone?: string;
  password?: string;
  role?: Role;
  isActive: boolean;
}

export function OrganizationDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: organization, isLoading } = useOrganization(id);
  const { data: membersData, isLoading: membersLoading } = useOrganizationMembers(id, {
    limit: 50,
  });
  const updateOrg = useUpdateOrganization();
  const updateMember = useUpdateOrganizationMember(id!);
  const [editingMember, setEditingMember] = useState<OrganizationUser | null>(null);
  const [editForm] = Form.useForm<EditMemberFormValues>();

  const handleStatusChange = async (status: OrganizationStatus) => {
    if (!id) return;
    try {
      await updateOrg.mutateAsync({ id, payload: { status } });
      message.success(t('organizations.updated'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('organizations.saveFailed')));
    }
  };

  const openEditModal = (member: OrganizationUser) => {
    setEditingMember(member);
    editForm.setFieldsValue({
      name: member.name,
      login: member.login ?? '',
      phone: member.phone,
      role: member.role as Role,
      isActive: member.isActive,
      password: undefined,
    });
  };

  const closeEditModal = () => {
    setEditingMember(null);
    editForm.resetFields();
  };

  const handleUpdateMember = async (values: EditMemberFormValues) => {
    if (!editingMember) return;

    try {
      await updateMember.mutateAsync({
        memberId: editingMember.id,
        payload: {
          name: values.name,
          login: values.login,
          phone: values.phone,
          ...(values.role && values.role !== 'owner' && values.role !== 'super_admin'
            ? { role: values.role as 'admin' | 'operator' }
            : {}),
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

  if (isLoading || !organization) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  const subscription =
    typeof organization.subscriptionId === 'object'
      ? organization.subscriptionId
      : null;

  const memberColumns: ColumnsType<OrganizationUser> = [
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
      render: (_, record) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => openEditModal(record)}
          aria-label={t('common.edit')}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={organization.name} subtitle={organization.slug} />

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={t('common.name')}>{organization.name}</Descriptions.Item>
          <Descriptions.Item label={t('organizations.slug')}>{organization.slug}</Descriptions.Item>
          <Descriptions.Item label={t('common.status')}>
            <Select
              value={organization.status ?? 'active'}
              style={{ width: 160 }}
              onChange={handleStatusChange}
              loading={updateOrg.isPending}
              options={[
                { value: 'active', label: t('organizations.status.active') },
                { value: 'suspended', label: t('organizations.status.suspended') },
              ]}
            />
          </Descriptions.Item>
          <Descriptions.Item label={t('organizations.subscription')}>
            {subscription ? <Tag>{subscription.name}</Tag> : t('common.empty')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('organizations.members')}>
        <Table
          rowKey="id"
          loading={membersLoading}
          columns={memberColumns}
          dataSource={membersData?.members ?? []}
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </Card>

      <Modal
        title={t('orgUsers.edit')}
        open={Boolean(editingMember)}
        onCancel={closeEditModal}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateMember}>
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="login" label={t('common.login')} rules={[{ required: true, message: t('auth.loginRequired') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('common.phone')}>
            <Input />
          </Form.Item>
          {editingMember?.role !== 'owner' && (
            <Form.Item name="role" label={t('orgUsers.role')} rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'admin', label: t('roles.admin') },
                  { value: 'operator', label: t('roles.operator') },
                ]}
              />
            </Form.Item>
          )}
          <Form.Item name="isActive" label={t('common.status')} valuePropName="checked">
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
