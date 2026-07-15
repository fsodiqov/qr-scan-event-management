import { useMemo, useState } from 'react';
import { Button, Input, Popconfirm, Select, Table, Typography, message } from 'antd';
import { PlusOutlined, QrcodeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { ExportCsvButton } from '@/components/common/ExportCsvButton';
import { useDeleteParticipant, useParticipants } from '@/hooks/useParticipants';
import { useEvents } from '@/hooks/useEvents';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { fetchAllForExport, useCsvExport } from '@/hooks/useCsvExport';
import { ROUTES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage, getEntityName } from '@/utils/helpers';
import { tablePagination } from '@/utils/tablePagination';
import { participantsApi } from '@/api';
import type { Participant } from '@/types';

export function ParticipantsPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [eventId, setEventId] = useState<string | undefined>();

  const params = useMemo(
    () => ({ page, limit: pageSize, search: search || undefined, eventId }),
    [page, pageSize, search, eventId],
  );

  const { data, isLoading } = useParticipants(params);
  const { data: eventsData } = useEvents({ limit: 100 });
  const deleteParticipant = useDeleteParticipant();
  const { exporting, runExport } = useCsvExport();

  const handleExportCsv = () => {
    void runExport(async () => {
      const participants = await fetchAllForExport(async (exportPage, limit) => {
        const result = await participantsApi.list({
          page: exportPage,
          limit,
          search: search || undefined,
          eventId,
        });
        return {
          items: result.participants,
          total: result.meta?.total ?? result.participants.length,
        };
      });

      return {
        filenamePrefix: 'participants',
        headers: [
          t('common.name'),
          t('common.phone'),
          t('common.event'),
          t('common.created'),
        ],
        rows: participants.map((participant) => [
          participant.name,
          participant.phone ?? '',
          getEntityName(participant.eventId),
          formatDateTime(participant.createdAt),
        ]),
      };
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteParticipant.mutateAsync(id);
      message.success(t('participants.deactivated'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('participants.deactivateFailed')));
    }
  };

  const columns: ColumnsType<Participant> = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => (
        <Typography.Text className="participants-cell-primary">{value}</Typography.Text>
      ),
    },
    {
      title: t('common.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (v) => (
        <Typography.Text className="participants-cell-secondary">
          {v ?? t('common.empty')}
        </Typography.Text>
      ),
    },
    {
      title: t('common.event'),
      key: 'event',
      responsive: ['md'],
      render: (_, record) => (
        <Typography.Text className="participants-cell-secondary">
          {getEntityName(record.eventId)}
        </Typography.Text>
      ),
    },
    {
      title: t('common.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      render: (value) => (
        <Typography.Text className="participants-cell-muted">
          {formatDateTime(value)}
        </Typography.Text>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      fixed: isMobile ? 'right' : undefined,
      render: (_, record) => (
        <div className="participants-actions">
          <Button
            size="small"
            className="participants-action-btn participants-action-qr"
            icon={<QrcodeOutlined />}
            onClick={() => navigate(ROUTES.PARTICIPANT_QR(record._id))}
            aria-label={t('participants.qrAlt')}
          >
            {isMobile ? null : 'QR'}
          </Button>
          <Button
            size="small"
            type="text"
            className="participants-action-btn participants-action-edit"
            icon={<EditOutlined />}
            onClick={() => navigate(ROUTES.PARTICIPANT_EDIT(record._id))}
            aria-label={t('common.edit')}
          />
          <Popconfirm
            title={t('participants.deactivateConfirm')}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              size="small"
              type="text"
              danger
              className="participants-action-btn participants-action-delete"
              icon={<DeleteOutlined />}
              aria-label={t('common.delete')}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="participants-page">
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

      <div className="participants-toolbar">
        <Input.Search
          placeholder={t('participants.searchPlaceholder')}
          allowClear
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={(value) => {
            setPage(1);
            setSearch(value.trim());
          }}
          className="participants-toolbar-search"
          aria-label={t('participants.searchPlaceholder')}
        />
        <Select
          allowClear
          placeholder={t('participants.filterEvent')}
          className="participants-toolbar-filter"
          value={eventId}
          onChange={(value) => {
            setPage(1);
            setEventId(value);
          }}
          options={(eventsData?.events ?? []).map((event) => ({
            value: event._id,
            label: event.title,
          }))}
          aria-label={t('participants.filterEvent')}
        />
        <div className="table-toolbar-actions">
          <ExportCsvButton onClick={handleExportCsv} loading={exporting} block={isMobile} />
        </div>
      </div>

      <Table
        className="participants-table"
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.participants ?? []}
        size={isMobile ? 'small' : 'middle'}
        scroll={{ x: 'max-content' }}
        pagination={tablePagination(page, pageSize, data?.meta?.total ?? 0, (nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        })}
      />
    </div>
  );
}
