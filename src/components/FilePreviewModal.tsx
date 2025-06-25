import React, { useState } from 'react';
import { Modal, Space, Button, Spin, Alert, Pagination } from 'antd';
import { FileTextOutlined, ZoomInOutlined, ZoomOutOutlined, RotateRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Document, Page, pdfjs } from 'react-pdf';
import type { FileItem } from '../types';

// 设置PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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
  
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  if (!file) return null;

  // 固定使用public下的PDF文件
  const pdfUrl = '/SDWH-M202103428-3-En.pdf';

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError(t('file:preview.loadError'));
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setScale(1.0);
    setRotation(0);
    setPageNumber(1);
  };

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
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 工具栏 */}
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fafafa'
        }}>
          <Space>
            <Button 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              size="small"
            >
              {t('file:preview.zoomOut')}
            </Button>
            <span style={{ minWidth: 60, textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </span>
            <Button 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
              size="small"
            >
              {t('file:preview.zoomIn')}
            </Button>
            <Button 
              icon={<RotateRightOutlined />} 
              onClick={handleRotate}
              size="small"
            >
              {t('file:preview.rotate')}
            </Button>
            <Button onClick={resetView} size="small">
              {t('file:preview.reset')}
            </Button>
          </Space>
          
          {numPages > 0 && (
            <Pagination
              current={pageNumber}
              total={numPages}
              pageSize={1}
              size="small"
              showSizeChanger={false}
              showQuickJumper
              onChange={handlePageChange}
              showTotal={(total, range) => 
                `${range[0]} / ${total} ${t('file:preview.pages')}`
              }
            />
          )}
        </div>

        {/* PDF内容区域 */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 16,
          background: '#f5f5f5'
        }}>
          {error ? (
            <Alert
              message={t('file:preview.error')}
              description={error}
              type="error"
              showIcon
              action={
                <Button size="small" onClick={() => window.open(pdfUrl, '_blank')}>
                  {t('file:preview.openInNewTab')}
                </Button>
              }
            />
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '400px' 
                }}>
                  <Spin size="large" tip={t('file:preview.loading')} />
                </div>
              }
            >
              {numPages > 0 && (
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  loading={<Spin tip={t('file:preview.pageLoading')} />}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              )}
            </Document>
          )}
        </div>
      </div>
    </Modal>
  );
}; 