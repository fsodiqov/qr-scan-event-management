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
import { ExportCsvButton } from '@/components/common/ExportCsvButton';
import {
  useCreateOrganization,
  useOrganizations,
} from '@/hooks/useOrganizations';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { fetchAllForExport, useCsvExport } from '@/hooks/useCsvExport';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage, getEntityId } from '@/utils/helpers';
import { tablePagination } from '@/utils/tablePagination';
import { organizationsApi } from '@/api';
import { orgStatusColors } from '@/theme/statusColors';
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
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<OrgFormValues>();

  const params = useMemo(() => ({ page, limit: pageSize }), [page, pageSize]);
  const { data, isLoading } = useOrganizations(params);
  const { data: subsData } = useSubscriptions({ limit: 50 });
  const createOrg = useCreateOrganization();
  const { exporting, runExport } = useCsvExport();

  const handleExportCsv = () => {
    void runExport(async () => {
      const organizations = await fetchAllForExport(async (exportPage, limit) => {
        const result = await organizationsApi.list({
          page: exportPage,
          limit,
        });
        return {
          items: result.organizations,
          total: result.meta?.total ?? result.organizations.length,
        };
      });

      return {
        filenamePrefix: 'organizations',
        headers: [
          t('common.name'),
          t('organizations.slug'),
          t('common.status'),
        ],
        rows: organizations.map((org) => [
          org.name,
          org.slug,
          t(`organizations.status.${org.status}`),
        ]),
      };
    });
  };

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
        <Tag color={status === 'active' ? orgStatusColors.active : orgStatusColors.inactive}>
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
          <div className="page-header-actions">
            <ExportCsvButton onClick={handleExportCsv} loading={exporting} block={isMobile} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} block={isMobile}>
              {t('organizations.add')}
            </Button>
          </div>
        }
      />

      <Table
        rowKey={(r) => getEntityId(r) ?? r.slug}
        loading={isLoading}
        columns={columns}
        dataSource={data?.organizations ?? []}
        scroll={{ x: 'max-content' }}
        pagination={tablePagination(page, pageSize, data?.meta?.total ?? 0, (nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        })}
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
