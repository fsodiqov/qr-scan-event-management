import { useMemo, useState } from 'react';
import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import {
  useCreateOrganization,
  useOrganizations,
} from '@/hooks/useOrganizations';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage, getEntityId } from '@/utils/helpers';
import type { Organization, OrganizationStatus } from '@/types';

interface OrgFormValues {
  name: string;
  slug?: string;
  subscriptionId?: string;
  ownerName: string;
  ownerLogin: string;
  ownerPhone?: string;
  ownerPassword?: string;
}

export function OrganizationsPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<OrgFormValues>();

  const params = useMemo(() => ({ page, limit: 10 }), [page]);
  const { data, isLoading } = useOrganizations(params);
  const { data: subsData } = useSubscriptions({ limit: 50 });
  const createOrg = useCreateOrganization();

  const showOwnerCredentials = (login: string, password: string) => {
    Modal.success({
      title: t('organizations.ownerCredentialsTitle'),
      width: 480,
      content: (
        <div>
          <p>{t('organizations.ownerCredentialsHint')}</p>
          <p>
            <strong>{t('common.login')}:</strong> {login}
          </p>
          <p>
            <strong>{t('auth.password')}:</strong> {password}
          </p>
        </div>
      ),
    });
  };

  const handleCreate = async (values: OrgFormValues) => {
    try {
      const result = await createOrg.mutateAsync({
        name: values.name,
        slug: values.slug,
        subscriptionId: values.subscriptionId,
        owner: {
          name: values.ownerName,
          login: values.ownerLogin,
          phone: values.ownerPhone,
          password: values.ownerPassword,
        },
      });

      const password = values.ownerPassword ?? result.tempPassword;
      message.success(t('organizations.created'));

      if (password) {
        showOwnerCredentials(result.owner.login, password);
      }

      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(getApiErrorMessage(error, t('organizations.saveFailed')));
    }
  };

  const columns: ColumnsType<Organization> = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('organizations.slug'), dataIndex: 'slug', key: 'slug' },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: OrganizationStatus) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {t(`organizations.status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(ROUTES.ORGANIZATION_DETAIL(getEntityId(record)!))}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('organizations.title')}
        subtitle={t('organizations.subtitle')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} block={isMobile}>
            {t('organizations.add')}
          </Button>
        }
      />

      <Table
        rowKey={(r) => getEntityId(r) ?? r.slug}
        loading={isLoading}
        columns={columns}
        dataSource={data?.organizations ?? []}
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
        title={t('organizations.add')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        width={isMobile ? '100%' : 520}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label={t('organizations.slug')}>
            <Input placeholder={t('organizations.slugPlaceholder')} />
          </Form.Item>
          <Form.Item name="subscriptionId" label={t('organizations.subscription')}>
            <Select
              allowClear
              options={(subsData?.subscriptions ?? []).map((s) => ({
                value: s._id,
                label: s.name,
              }))}
            />
          </Form.Item>

          <Divider>{t('organizations.ownerSection')}</Divider>

          <Form.Item
            name="ownerName"
            label={t('organizations.ownerName')}
            rules={[{ required: true, message: t('organizations.ownerNameRequired') }]}
          >
            <Input placeholder={t('organizations.ownerNamePlaceholder')} />
          </Form.Item>
          <Form.Item
            name="ownerLogin"
            label={t('organizations.ownerLogin')}
            rules={[
              { required: true, message: t('organizations.ownerLoginRequired') },
            ]}
          >
            <Input placeholder="owner" />
          </Form.Item>
          <Form.Item name="ownerPhone" label={t('common.phone')}>
            <Input placeholder="+998901234567" />
          </Form.Item>
          <Form.Item name="ownerPassword" label={t('organizations.ownerPassword')}>
            <Input.Password placeholder={t('organizations.ownerPasswordAuto')} />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={createOrg.isPending}>
              {t('common.save')}
            </Button>
            <Button onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
