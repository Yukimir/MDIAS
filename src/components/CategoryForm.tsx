import React, { useEffect } from 'react';
import { Form, Input, Switch, InputNumber, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FileCategory } from '../types';

const { TextArea } = Input;

interface CategoryFormProps {
  category?: FileCategory;
  onSubmit: (values: Omit<FileCategory, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation(['common', 'category']);
  const [form] = Form.useForm();

  // 如果是编辑模式，填充表单
  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        required: category.required,
        order: category.order,
      });
    }
  }, [category, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        required: true,
        order: 1,
      }}
    >
      <Form.Item
        name="name"
        label={t('category:form.name')}
        rules={[
          { required: true, message: t('category:validation.nameRequired') },
          { min: 2, max: 50, message: t('category:validation.nameLength') },
        ]}
      >
        <Input 
          placeholder={t('category:form.namePlaceholder')}
          maxLength={50}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="description"
        label={t('category:form.description')}
        rules={[
          { required: true, message: t('category:validation.descriptionRequired') },
          { min: 5, max: 200, message: t('category:validation.descriptionLength') },
        ]}
      >
        <TextArea
          placeholder={t('category:form.descriptionPlaceholder')}
          rows={3}
          maxLength={200}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="required"
        label={t('category:form.required')}
        valuePropName="checked"
      >
        <Switch
          checkedChildren={t('category:form.requiredOptions.true')}
          unCheckedChildren={t('category:form.requiredOptions.false')}
        />
      </Form.Item>

      <Form.Item
        name="order"
        label={t('category:form.order')}
        rules={[
          { required: true, message: t('form.required') },
          { type: 'number', min: 1, max: 999, message: '显示顺序必须在1-999之间' },
        ]}
      >
        <InputNumber
          min={1}
          max={999}
          style={{ width: '100%' }}
          placeholder="请输入显示顺序"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t('button.save')}
          </Button>
          <Button onClick={onCancel}>
            {t('button.cancel')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}; 