import React from 'react';
import { Modal, Space, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { FileItem } from '../types';

interface FilePreviewModalProps {
  file: FileItem | null;
  visible: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  visible,
  onClose,
}) => {
  const { t } = useTranslation(['common', 'file']);

  if (!file) return null;

  // 固定使用public下的PDF文件，支持GitHub Pages部署
  const pdfUrl = import.meta.env.DEV 
    ? '/SDWH-M202103428-3-En.pdf'
    : `${import.meta.env.BASE_URL}SDWH-M202103428-3-En.pdf`;

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>{file.name}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      bodyStyle={{ padding: 0, height: 'calc(100vh - 160px)' }}
      destroyOnClose
    >
      {/* PDF预览区域 */}
      <div style={{ height: '100%', position: 'relative' }}>
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title={`Preview of ${file.name}`}
        />
        
        {/* 如果PDF加载失败的提示 */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 20, 
            left: 20, 
            right: 20,
            zIndex: 1
          }}
        >
          <Alert
            message={t('file:preview.fallbackTitle')}
            description={
              <div>
                <p>{t('file:preview.fallbackDescription')}</p>
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  {t('file:preview.openInNewTab')}
                </a>
              </div>
            }
            type="info"
            closable
            style={{ display: 'none' }}
            id="pdf-fallback-alert"
          />
        </div>
      </div>
    </Modal>
  );
}; 