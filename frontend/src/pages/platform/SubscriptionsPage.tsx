import { useState } from 'react';
import { Button, Form, Input, Modal, Select, Space, Table, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { useCreateSubscription, useSubscriptions } from '@/hooks/useSubscriptions';
import { getApiErrorMessage } from '@/utils/helpers';
import { subscriptionStatusColors } from '@/theme/statusColors';
import type { Subscription, SubscriptionStatus } from '@/types';

interface SubFormValues {
  name: string;
  planCode: 'starter';
  status?: SubscriptionStatus;
}

export function SubscriptionsPage() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<SubFormValues>();

  const { data, isLoading } = useSubscriptions();
  const createSub = useCreateSubscription();

  const handleCreate = async (values: SubFormValues) => {
    try {
      await createSub.mutateAsync(values);
      message.success(t('subscriptions.created'));
      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(getApiErrorMessage(error, t('subscriptions.saveFailed')));
    }
  };

  const columns: ColumnsType<Subscription> = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('subscriptions.planCode'), dataIndex: 'planCode', key: 'planCode' },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: SubscriptionStatus) => (
        <Tag
          color={
            status === 'active'
              ? subscriptionStatusColors.active
              : subscriptionStatusColors.inactive
          }
        >
          {t(`subscriptions.status.${status}`)}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('subscriptions.title')}
        subtitle={t('subscriptions.subtitle')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t('subscriptions.add')}
          </Button>
        }
      />

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.subscriptions ?? []}
        pagination={false}
      />

      <Modal
        title={t('subscriptions.add')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ planCode: 'starter', status: 'active' }}
          onFinish={handleCreate}
        >
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="planCode" label={t('subscriptions.planCode')} rules={[{ required: true }]}>
            <Select
              options={[{ value: 'starter', label: 'Starter' }]}
            />
          </Form.Item>
          <Form.Item name="status" label={t('common.status')}>
            <Select
              options={[
                { value: 'active', label: t('subscriptions.status.active') },
                { value: 'inactive', label: t('subscriptions.status.inactive') },
              ]}
            />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={createSub.isPending}>
              {t('common.save')}
            </Button>
            <Button onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
