import React from 'react';
import { Card, Tag, Button, Space, Typography, Tooltip, Avatar } from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  CheckOutlined, 
  CloseOutlined,
  DeleteOutlined,
  UndoOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../hooks/useRTL';
import { FILE_STATUS, type FileItem } from '../types';

const { Text, Paragraph } = Typography;

interface FileListItemProps {
  file: FileItem;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onApprove?: (file: FileItem) => void;
  onReject?: (file: FileItem) => void;
  onDeprecate: (file: FileItem) => void;
  onRestore: (file: FileItem) => void;
}

export const FileListItem: React.FC<FileListItemProps> = ({
  file,
  onPreview,
  onDownload,
  onApprove,
  onReject,
  onDeprecate,
  onRestore,
}) => {
  const { t } = useTranslation(['common', 'file']);
  const { iconTransform, isRTL } = useRTL();

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />;
      case 'image':
        return <FileImageOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
      default:
        return <FileTextOutlined style={{ color: '#1677ff', fontSize: '20px' }} />;
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case FILE_STATUS.SUBMITTED:
        return 'blue';
      case FILE_STATUS.PRELIMINARY:
        return 'orange';
      case FILE_STATUS.REVIEW:
        return 'purple';
      case FILE_STATUS.APPROVED:
        return 'green';
      case FILE_STATUS.REJECTED:
        return 'red';
      case FILE_STATUS.DEPRECATED:
        return 'default';
      default:
        return 'default';
    }
  };

  // 检查是否为废弃状态
  const isDeprecated = file.status === FILE_STATUS.DEPRECATED;
  
  // 废弃文件的样式
  const deprecatedStyle = isDeprecated ? {
    opacity: 0.5,
    filter: 'grayscale(60%)',
    border: '1px dashed #d9d9d9'
  } : {};

  // 检查是否需要审批（只有复审状态的文件需要审批）
  const needsReview = file.status === FILE_STATUS.REVIEW;

  return (
    <Card
      size="small"
      style={{ 
        marginBottom: 12,
        ...deprecatedStyle
      }}
      bodyStyle={{ padding: 16 }}
    >
      {/* 废弃提示 */}
      {isDeprecated && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: isRTL ? 'auto' : 8,
          left: isRTL ? 8 : 'auto',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '12px',
          zIndex: 1
        }}>
          {t('file:info.deprecated')}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 12,
        flexDirection: isRTL ? 'row-reverse' : 'row'
      }}>
        {/* 文件图标 */}
        <div style={{ flexShrink: 0 }}>
          <Avatar
            size={48}
            icon={getFileIcon(file.fileType)}
            style={{ 
              backgroundColor: 'transparent',
              border: '1px solid #f0f0f0'
            }}
          />
        </div>

        {/* 文件信息 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            marginBottom: 4,
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}>
            <Text 
              strong 
              style={{ 
                fontSize: '16px',
                textDecoration: isDeprecated ? 'line-through' : 'none'
              }}
            >
              {file.name}
            </Text>
            <Tag color={getStatusColor(file.status)}>
              {t(`file:status.${file.status}`)}
            </Tag>
          </div>

          <div style={{ marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {t('file:form.category')}: {file.category.name}
            </Text>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '12px', 
                marginLeft: isRTL ? 0 : 16,
                marginRight: isRTL ? 16 : 0
              }}
            >
              {t('file:info.uploadedAt')}: {new Date(file.uploadedAt).toLocaleString()}
            </Text>
          </div>

          <Paragraph 
            style={{ 
              margin: 0, 
              color: isDeprecated ? '#999' : '#666',
              textAlign: isRTL ? 'right' : 'left'
            }}
            ellipsis={{ rows: 1, expandable: false }}
          >
            {file.description}
          </Paragraph>
        </div>

        {/* 操作按钮 */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {/* 第一行：预览和下载按钮 */}
            <Space size="small">
              <Tooltip title={t('file:actions.preview')}>
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined style={{ transform: iconTransform }} />}
                  onClick={() => onPreview(file)}
                  disabled={isDeprecated}
                />
              </Tooltip>

              <Tooltip title={t('file:actions.download')}>
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined style={{ transform: iconTransform }} />}
                  onClick={() => onDownload(file)}
                />
              </Tooltip>

              {/* 废弃/恢复按钮 */}
              {!isDeprecated ? (
                <Tooltip title={t('file:actions.deprecate')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined style={{ transform: iconTransform }} />}
                    onClick={() => onDeprecate(file)}
                    style={{ color: '#ff7875' }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title={t('file:actions.restore')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<UndoOutlined style={{ transform: iconTransform }} />}
                    onClick={() => onRestore(file)}
                    style={{ color: '#1677ff' }}
                  />
                </Tooltip>
              )}
            </Space>

            {/* 第二行：审批按钮 - 只有复审状态的文件显示 */}
            {needsReview && !isDeprecated && (onApprove || onReject) && (
              <Space size="small">
                {onApprove && (
                  <Tooltip title={t('file:actions.approve')}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckOutlined />}
                      onClick={() => onApprove(file)}
                      style={{ 
                        backgroundColor: '#52c41a', 
                        borderColor: '#52c41a',
                        fontSize: '16px',
                        height: '40px',
                        minWidth: '48px'
                      }}
                    />
                  </Tooltip>
                )}
                
                {onReject && (
                  <Tooltip title={t('file:actions.reject')}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CloseOutlined />}
                      onClick={() => onReject(file)}
                      style={{ 
                        backgroundColor: '#ff4d4f', 
                        borderColor: '#ff4d4f',
                        fontSize: '16px',
                        height: '40px',
                        minWidth: '48px'
                      }}
                    />
                  </Tooltip>
                )}
              </Space>
            )}
          </div>
        </div>
      </div>

      {/* 最近审批记录 */}
      {file.reviews.length > 0 && (
        <div style={{ 
          marginTop: 12, 
          paddingTop: 12, 
          borderTop: '1px solid #f0f0f0' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {t('file:info.reviewer')}: {file.reviews[0].reviewer}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {t('file:info.reviewedAt')}: {new Date(file.reviews[0].reviewedAt).toLocaleString()}
            </Text>
          </div>
          {file.reviews[0].comment && (
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '12px', 
                fontStyle: 'italic',
                display: 'block',
                marginTop: 4,
                textAlign: isRTL ? 'right' : 'left'
              }}
            >
              "{file.reviews[0].comment}"
            </Text>
          )}
        </div>
      )}
    </Card>
  );
}; 