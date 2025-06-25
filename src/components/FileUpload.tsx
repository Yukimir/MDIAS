import React, { useState } from 'react';
import { Upload, Form, Input, Select, Button, Space, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadProps } from 'antd';
import type { FileCategory } from '../types';

const { Dragger } = Upload;
const { TextArea } = Input;

interface FileUploadProps {
  categories: FileCategory[];
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  categories,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation(['common', 'file']);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      // 检查文件大小 (50MB限制)
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('文件大小不能超过50MB');
        return false;
      }
      
      // 检查文件类型
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        message.error('不支持的文件格式');
        return false;
      }

      setFileList([file]);
      
      // 自动填充文件名
      if (!form.getFieldValue('name')) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 去掉扩展名
        form.setFieldsValue({ name: fileName });
      }
      
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setFileList([]);
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
  };

  const handleSubmit = (values: any) => {
    if (fileList.length === 0) {
      message.error(t('file:validation.fileRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('categoryId', values.categoryId);

    onSubmit(formData);
  };

  const handleReset = () => {
    form.resetFields();
    setFileList([]);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: 600 }}
    >
      {/* 文件上传区域 */}
      <Form.Item
        label={t('file:form.fileName')}
        required
        style={{ marginBottom: 16 }}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t('file:list.dragUpload')}</p>
          <p className="ant-upload-hint">{t('file:list.dragUploadHint')}</p>
        </Dragger>
      </Form.Item>

      {/* 文件名称 */}
      <Form.Item
        name="name"
        label={t('file:form.fileName')}
        rules={[
          { required: true, message: t('file:validation.fileNameRequired') },
          { max: 100, message: '文件名称不能超过100个字符' },
        ]}
      >
        <Input 
          placeholder={t('file:form.fileNamePlaceholder')}
          maxLength={100}
          showCount
        />
      </Form.Item>

      {/* 文件描述 */}
      <Form.Item
        name="description"
        label={t('file:form.description')}
        rules={[
          { required: true, message: t('file:validation.descriptionRequired') },
          { max: 500, message: '文件描述不能超过500个字符' },
        ]}
      >
        <TextArea
          placeholder={t('file:form.descriptionPlaceholder')}
          rows={3}
          maxLength={500}
          showCount
        />
      </Form.Item>

      {/* 文件分类 */}
      <Form.Item
        name="categoryId"
        label={t('file:form.category')}
        rules={[
          { required: true, message: t('file:validation.categoryRequired') },
        ]}
      >
        <Select
          placeholder={t('file:form.categoryPlaceholder')}
          options={categories.map(category => ({
            value: category.id,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{category.name}</span>
                {category.required && (
                  <span style={{ color: '#ff4d4f', fontSize: '12px' }}>*必需</span>
                )}
              </div>
            )
          }))}
        />
      </Form.Item>

      {/* 操作按钮 */}
      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t('button.upload')}
          </Button>
          <Button onClick={handleReset}>
            {t('button.reset')}
          </Button>
          <Button onClick={onCancel}>
            {t('button.cancel')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}; 