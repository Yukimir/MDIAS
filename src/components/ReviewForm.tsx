import React from 'react';
import { Form, Input, Button, Space, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FileItem } from '../types';

const { TextArea } = Input;

interface ReviewFormProps {
  file: FileItem;
  onSubmit: (action: 'approve' | 'reject', comment: string) => void;
  onCancel: () => void;
  loading?: boolean;
  hideActionSelection?: boolean;
  defaultAction?: 'approve' | 'reject';
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  file,
  onSubmit,
  onCancel,
  loading = false,
  hideActionSelection = false,
  defaultAction = 'approve',
}) => {
  const { t } = useTranslation(['common', 'file']);
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSubmit(values.action, values.comment || '');
  };

  return (
    <div>
      {/* 文件信息 */}
      <div style={{ 
        marginBottom: 16, 
        padding: 12, 
        background: '#f5f5f5', 
        borderRadius: 6 
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>{file.name}</h4>
        <p style={{ margin: '0 0 4px 0', color: '#666' }}>
          <strong>{t('file:form.category')}:</strong> {file.category.name}
        </p>
        <p style={{ margin: 0, color: '#666' }}>
          <strong>{t('file:form.description')}:</strong> {file.description}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          action: defaultAction
        }}
      >
        {/* 审批结果 */}
        {!hideActionSelection && (
          <Form.Item
            name="action"
            label="审批结果"
            rules={[{ required: true, message: '请选择审批结果' }]}
          >
            <Radio.Group>
              <Radio value="approve" style={{ color: '#52c41a' }}>
                {t('file:actions.approve')} - 通过
              </Radio>
              <Radio value="reject" style={{ color: '#ff4d4f' }}>
                {t('file:actions.reject')} - 驳回
              </Radio>
            </Radio.Group>
          </Form.Item>
        )}

        {/* 隐藏的action字段，用于设置默认值 */}
        {hideActionSelection && (
          <Form.Item name="action" hidden>
            <Input />
          </Form.Item>
        )}

        {/* 审批意见 */}
        <Form.Item
          name="comment"
          label={t('file:form.reviewComment')}
          rules={[
            { required: true, message: t('file:validation.reviewCommentRequired') },
            { max: 500, message: '审批意见不能超过500个字符' },
          ]}
        >
          <TextArea
            placeholder={t('file:form.reviewCommentPlaceholder')}
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('button.confirm')}
            </Button>
            <Button onClick={onCancel}>
              {t('button.cancel')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}; 