import { useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/constants/permissions';
import { PageHeader } from '@/components/common/PageHeader';
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
  useUpdateEventStatus,
} from '@/hooks/useEvents';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage } from '@/utils/helpers';
import type { Event, EventStatus } from '@/types';

const STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'default',
  active: 'green',
  closed: 'red',
};

interface EventFormValues {
  title: string;
  description?: string;
  location: string;
  eventDate: dayjs.Dayjs;
  status?: EventStatus;
}

export function EventsPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canManageEvents = hasPermission(PERMISSIONS.ORG_EVENTS_MANAGE);
  const isMobile = useIsMobile();
  const { eventStatus, eventStatusOptions } = useStatusLabels();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<EventStatus | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form] = Form.useForm<EventFormValues>();

  const params = useMemo(
    () => ({ page, limit: 10, status: statusFilter }),
    [page, statusFilter],
  );

  const { data, isLoading } = useEvents(params);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const updateStatus = useUpdateEventStatus();
  const deleteEvent = useDeleteEvent();

  const openCreateModal = () => {
    setEditingEvent(null);
    form.resetFields();
    form.setFieldsValue({ status: 'draft' });
    setModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: dayjs(event.eventDate),
      status: event.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: EventFormValues) => {
    const payload = {
      title: values.title,
      description: values.description,
      location: values.location,
      eventDate: values.eventDate.toISOString(),
      status: values.status,
    };

    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent._id, payload });
        message.success(t('events.updated'));
      } else {
        await createEvent.mutateAsync(payload);
        message.success(t('events.created'));
      }
      setModalOpen(false);
    } catch (error) {
      message.error(getApiErrorMessage(error, t('events.saveFailed')));
    }
  };

  const handleStatusChange = async (id: string, status: EventStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      message.success(t('events.statusUpdated'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('events.statusFailed')));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
      message.success(t('events.deleted'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('events.deleteFailed')));
    }
  };

  const columns: ColumnsType<Event> = [
    { title: t('common.title'), dataIndex: 'title', key: 'title' },
    {
      title: t('common.location'),
      dataIndex: 'location',
      key: 'location',
      responsive: ['md'],
    },
    {
      title: t('common.date'),
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (value) => formatDate(value),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: EventStatus) => (
        <Tag color={STATUS_COLORS[status]}>{eventStatus(status)}</Tag>
      ),
    },
    {
      title: t('common.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      render: (value) => formatDateTime(value),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      fixed: isMobile ? 'right' : undefined,
      render: (_, record) => (
        <Space wrap>
          {canManageEvents ? (
            <>
              <Select
                size="small"
                value={record.status}
                style={{ width: isMobile ? 110 : 130 }}
                onChange={(value) => handleStatusChange(record._id, value)}
                options={eventStatusOptions()}
              />
              <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
              <Popconfirm title={t('events.deleteConfirm')} onConfirm={() => handleDelete(record._id)}>
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          ) : (
            <Tag color={STATUS_COLORS[record.status]}>{eventStatus(record.status)}</Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('events.title')}
        subtitle={t('events.subtitle')}
        extra={
          canManageEvents ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} block={isMobile}>
              {t('events.addEvent')}
            </Button>
          ) : undefined
        }
      />

      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Select
          allowClear
          placeholder={t('events.filterStatus')}
          style={{ width: '100%', maxWidth: 200 }}
          value={statusFilter}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          options={eventStatusOptions()}
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.events ?? []}
        size={isMobile ? 'small' : 'middle'}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize: 10,
          total: data?.meta?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
          simple: isMobile,
        }}
      />

      <Modal
        title={editingEvent ? t('events.editEvent') : t('events.createEvent')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createEvent.isPending || updateEvent.isPending}
        destroyOnClose
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        width={isMobile ? '100%' : 520}
        style={isMobile ? { top: 16, maxWidth: 'calc(100vw - 32px)' } : undefined}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label={t('common.title')}
            name="title"
            rules={[{ required: true, message: t('events.titleRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label={t('common.description')} name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label={t('common.location')}
            name="location"
            rules={[{ required: true, message: t('events.locationRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('events.eventDate')}
            name="eventDate"
            rules={[{ required: true, message: t('events.dateRequired') }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={t('common.status')} name="status">
            <Select options={eventStatusOptions()} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
