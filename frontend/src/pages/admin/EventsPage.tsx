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
import { PageHeader } from '@/components/common/PageHeader';
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
  useUpdateEventStatus,
} from '@/hooks/useEvents';
import { EVENT_STATUS_LABELS } from '@/utils/constants';
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
        message.success('Event updated');
      } else {
        await createEvent.mutateAsync(payload);
        message.success('Event created');
      }
      setModalOpen(false);
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to save event'));
    }
  };

  const handleStatusChange = async (id: string, status: EventStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      message.success('Event status updated');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to update status'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
      message.success('Event deleted');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to delete event'));
    }
  };

  const columns: ColumnsType<Event> = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    {
      title: 'Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (value) => formatDate(value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: EventStatus) => (
        <Tag color={STATUS_COLORS[status]}>{EVENT_STATUS_LABELS[status]}</Tag>
      ),
    },
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
        <Space wrap>
          <Select
            size="small"
            value={record.status}
            style={{ width: 110 }}
            onChange={(value) => handleStatusChange(record._id, value)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this event?" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Create and manage events"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add Event
          </Button>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Filter by status"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.events ?? []}
        pagination={{
          current: page,
          pageSize: 10,
          total: data?.meta?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />

      <Modal
        title={editingEvent ? 'Edit Event' : 'Create Event'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createEvent.isPending || updateEvent.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: 'Location is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Event Date"
            name="eventDate"
            rules={[{ required: true, message: 'Event date is required' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
