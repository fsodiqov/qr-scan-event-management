import { useEffect } from 'react';
import { Alert, Button, Card, Form, Input, Space, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCreateUser, useUpdateUser, useUser } from '@/hooks/useUsers';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/helpers';
import type { CreateUserPayload } from '@/types';

interface UserFormValues {
  name: string;
  phone: string;
  email?: string;
  organization?: string;
  photoUrl?: string;
  password?: string;
}

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<UserFormValues>();

  const { data: user, isLoading } = useUser(id);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        phone: user.phone,
        email: user.email,
        organization: user.organization,
        photoUrl: user.photoUrl,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit && id) {
        await updateUser.mutateAsync({ id, payload: values });
        message.success('User updated');
        navigate(ROUTES.USERS);
        return;
      }

      const payload: CreateUserPayload = {
        ...values,
        role: 'participant',
      };

      const result = await createUser.mutateAsync(payload);

      if (result.tempPassword) {
        message.success(`User created. Temp password: ${result.tempPassword}`, 8);
      } else {
        message.success('User created');
      }

      navigate(ROUTES.USER_QR(result.user._id));
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to save user'));
    }
  };

  if (isEdit && isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit User' : 'Add User'}
        subtitle={isEdit ? 'Update participant details' : 'Register a new participant'}
      />

      <Card style={{ maxWidth: 640 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input placeholder="+998901234567" />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item label="Organization" name="organization">
            <Input placeholder="Company or school" />
          </Form.Item>

          <Form.Item label="Photo URL" name="photoUrl" rules={[{ type: 'url' }]}>
            <Input placeholder="https://example.com/photo.jpg" />
          </Form.Item>

          {!isEdit && (
            <Form.Item label="Password (optional)" name="password">
              <Input.Password placeholder="Leave empty to auto-generate" />
            </Form.Item>
          )}

          {isEdit && (
            <Form.Item label="New Password (optional)" name="password">
              <Input.Password placeholder="Leave empty to keep current" />
            </Form.Item>
          )}

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={createUser.isPending || updateUser.isPending}
            >
              {isEdit ? 'Save Changes' : 'Create User'}
            </Button>
            <Button onClick={() => navigate(ROUTES.USERS)}>Cancel</Button>
          </Space>
        </Form>

        {!isEdit && (
          <Alert
            style={{ marginTop: 24 }}
            type="info"
            showIcon
            message="A QR code will be generated automatically after creating the user."
          />
        )}
      </Card>
    </div>
  );
}
