import { useMemo, useState } from 'react';
import { Button, Input, Popconfirm, Select, Space, Table, message } from 'antd';
import { PlusOutlined, QrcodeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { useDeleteParticipant, useParticipants } from '@/hooks/useParticipants';
import { useEvents } from '@/hooks/useEvents';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { ROUTES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage, getEntityName } from '@/utils/helpers';
import type { Participant } from '@/types';

export function ParticipantsPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [eventId, setEventId] = useState<string | undefined>();

  const params = useMemo(
    () => ({ page, limit: 10, search: search || undefined, eventId }),
    [page, search, eventId],
  );

  const { data, isLoading } = useParticipants(params);
  const { data: eventsData } = useEvents({ limit: 100 });
  const deleteParticipant = useDeleteParticipant();

  const handleDelete = async (id: string) => {
    try {
      await deleteParticipant.mutateAsync(id);
      message.success(t('participants.deactivated'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('participants.deactivateFailed')));
    }
  };

  const columns: ColumnsType<Participant> = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('common.phone'), dataIndex: 'phone', key: 'phone', render: (v) => v ?? t('common.empty') },
    {
      title: t('common.event'),
      key: 'event',
      responsive: ['md'],
      render: (_, record) => getEntityName(record.eventId),
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
          <Button
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => navigate(ROUTES.PARTICIPANT_QR(record._id))}
          >
            {isMobile ? null : 'QR'}
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(ROUTES.PARTICIPANT_EDIT(record._id))}
          />
          <Popconfirm
            title={t('participants.deactivateConfirm')}
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
        title={t('participants.title')}
        subtitle={t('participants.subtitle')}
        extra={
          <Link to={ROUTES.PARTICIPANT_NEW} style={{ display: 'block', width: isMobile ? '100%' : undefined }}>
            <Button type="primary" icon={<PlusOutlined />} block={isMobile}>
              {t('participants.addParticipant')}
            </Button>
          </Link>
        }
      />

      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Input.Search
          placeholder={t('participants.searchPlaceholder')}
          allowClear
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={(value) => {
            setPage(1);
            setSearch(value.trim());
          }}
          style={{ width: '100%', maxWidth: 320 }}
        />
        <Select
          allowClear
          placeholder={t('participants.filterEvent')}
          style={{ width: '100%', maxWidth: 260 }}
          value={eventId}
          onChange={(value) => {
            setPage(1);
            setEventId(value);
          }}
          options={(eventsData?.events ?? []).map((event) => ({
            value: event._id,
            label: event.title,
          }))}
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.participants ?? []}
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
    </div>
  );
}
