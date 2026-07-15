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
  Typography,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/constants/permissions';
import { PageHeader } from '@/components/common/PageHeader';
import { ExportCsvButton } from '@/components/common/ExportCsvButton';
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
  useUpdateEventStatus,
} from '@/hooks/useEvents';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { fetchAllForExport, useCsvExport } from '@/hooks/useCsvExport';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage } from '@/utils/helpers';
import { tablePagination } from '@/utils/tablePagination';
import { eventsApi } from '@/api';
import { eventStatusColors } from '@/theme/statusColors';
import type { Event, EventStatus } from '@/types';

interface EventFormValues {
  title: string;
  description?: string;
  location: string;
  eventDate: dayjs.Dayjs;
  status?: EventStatus;
}

function EventStatusBadge({ status, label }: { status: EventStatus; label: string }) {
  return (
    <Tag className="events-status-badge" color={eventStatusColors[status]}>
      {label}
    </Tag>
  );
}

export function EventsPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canManageEvents = hasPermission(PERMISSIONS.ORG_EVENTS_MANAGE);
  const isMobile = useIsMobile();
  const { eventStatus, eventStatusOptions } = useStatusLabels();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<EventStatus | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form] = Form.useForm<EventFormValues>();

  const params = useMemo(
    () => ({ page, limit: pageSize, status: statusFilter }),
    [page, pageSize, statusFilter],
  );

  const { data, isLoading } = useEvents(params);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const updateStatus = useUpdateEventStatus();
  const deleteEvent = useDeleteEvent();
  const { exporting, runExport } = useCsvExport();

  const handleExportCsv = () => {
    void runExport(async () => {
      const events = await fetchAllForExport(async (exportPage, limit) => {
        const result = await eventsApi.list({
          page: exportPage,
          limit,
          status: statusFilter,
        });
        return {
          items: result.events,
          total: result.meta?.total ?? result.events.length,
        };
      });

      return {
        filenamePrefix: 'events',
        headers: [
          t('common.title'),
          t('common.location'),
          t('common.date'),
          t('common.status'),
          t('common.created'),
        ],
        rows: events.map((event) => [
          event.title,
          event.location,
          formatDate(event.eventDate),
          eventStatus(event.status),
          formatDateTime(event.createdAt),
        ]),
      };
    });
  };

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
    {
      title: t('common.title'),
      dataIndex: 'title',
      key: 'title',
      render: (value: string) => (
        <Typography.Text className="events-cell-title">{value}</Typography.Text>
      ),
    },
    {
      title: t('common.location'),
      dataIndex: 'location',
      key: 'location',
      responsive: ['md'],
      render: (value: string) => (
        <Typography.Text className="events-cell-secondary">{value}</Typography.Text>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (value) => (
        <Typography.Text className="events-cell-secondary">{formatDate(value)}</Typography.Text>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: EventStatus) => (
        <EventStatusBadge status={status} label={eventStatus(status)} />
      ),
    },
    {
      title: t('common.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      render: (value) => (
        <Typography.Text className="events-cell-muted">{formatDateTime(value)}</Typography.Text>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      fixed: isMobile ? 'right' : undefined,
      render: (_, record) =>
        canManageEvents ? (
          <div className="events-actions">
            <Select
              size="small"
              value={record.status}
              className="events-actions-status"
              style={{ width: isMobile ? 110 : 130 }}
              onChange={(value) => handleStatusChange(record._id, value)}
              options={eventStatusOptions()}
              aria-label={t('common.status')}
            />
            <Space size={8} className="events-actions-icons" align="center">
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
                aria-label={t('common.edit')}
              />
              <Popconfirm
                title={t('events.deleteConfirm')}
                onConfirm={() => handleDelete(record._id)}
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={t('common.delete')}
                />
              </Popconfirm>
            </Space>
          </div>
        ) : (
          <EventStatusBadge status={record.status} label={eventStatus(record.status)} />
        ),
    },
  ];

  return (
    <div className="events-page">
      <PageHeader title={t('events.title')} subtitle={t('events.subtitle')} />

      <div className="events-toolbar">
        <Select
          allowClear
          placeholder={t('events.filterStatus')}
          className="events-toolbar-filter"
          value={statusFilter}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          options={eventStatusOptions()}
          aria-label={t('events.filterStatus')}
        />
        <div className="table-toolbar-actions">
          <ExportCsvButton onClick={handleExportCsv} loading={exporting} block={isMobile} />
          {canManageEvents && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              block={isMobile}
              className="events-toolbar-cta"
            >
              {t('events.addEvent')}
            </Button>
          )}
        </div>
      </div>

      <Table
        className="events-table"
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.events ?? []}
        size={isMobile ? 'small' : 'middle'}
        scroll={{ x: 'max-content' }}
        pagination={tablePagination(page, pageSize, data?.meta?.total ?? 0, (nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        })}
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
