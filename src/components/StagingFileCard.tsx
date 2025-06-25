import React, { useState } from 'react';
import { 
  Card, 
  Image, 
  Input, 
  Select, 
  Button, 
  Progress, 
  Checkbox, 
  Tooltip, 
  Space, 
  Typography,
  message
} from 'antd';
import { 
  DeleteOutlined, 
  EditOutlined, 
  CheckOutlined,
  CloseOutlined,
  BulbOutlined,
  FileTextOutlined,
  SyncOutlined,
  LoadingOutlined
} from '@ant-design/icons';

import { useRTL } from '../hooks/useRTL';
import type { StagingFile, UploadStatus } from '../types/staging';
import type { FileCategory } from '../types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface StagingFileCardProps {
  file: StagingFile;
  categories: FileCategory[];
  selected: boolean;
  onSelect: (fileId: string, selected: boolean) => void;
  onUpdate: (fileId: string, updates: { name?: string; description?: string; category?: FileCategory | null }) => void;
  onDelete: (fileId: string) => void;
  onApplySuggestion: (fileId: string, type: 'name' | 'description' | 'category') => void;
}

export const StagingFileCard: React.FC<StagingFileCardProps> = ({
  file,
  categories,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onApplySuggestion,
}) => {
  const { isRTL, iconTransform } = useRTL();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: file.name,
    description: file.description,
    category: file.category
  });

  // 获取状态颜色
  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'uploading': return '#1677ff';
      case 'analyzing': return '#faad14';
      case 'ready': return '#52c41a';
      case 'failed': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  // 获取状态文本
  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case 'uploading': return '上传中';
      case 'analyzing': return '分析中';
      case 'ready': return '就绪';
      case 'failed': return '失败';
      default: return '未知';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'uploading': return <LoadingOutlined spin />;
      case 'analyzing': return <SyncOutlined spin />;
      case 'ready': return <CheckOutlined />;
      case 'failed': return <CloseOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  // 处理保存编辑
  const handleSave = () => {
    if (!editData.name.trim()) {
      message.error('文件名不能为空');
      return;
    }
    
    onUpdate(file.id, editData);
    setEditing(false);
  };

  // 处理取消编辑
  const handleCancel = () => {
    setEditData({
      name: file.name,
      description: file.description,
      category: file.category
    });
    setEditing(false);
  };

  // 应用智能建议
  const handleApplySuggestion = (type: 'name' | 'description' | 'category') => {
    if (!file.smartSuggestions) return;
    
    const suggestion = file.smartSuggestions;
    switch (type) {
      case 'name':
        setEditData(prev => ({ ...prev, name: suggestion.suggestedName }));
        break;
      case 'description':
        setEditData(prev => ({ ...prev, description: suggestion.suggestedDescription }));
        break;
      case 'category':
        setEditData(prev => ({ ...prev, category: suggestion.suggestedCategories[0] || null }));
        break;
    }
    
    onApplySuggestion(file.id, type);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isReady = file.uploadStatus === 'ready';
  const showProgress = file.uploadStatus === 'uploading';
  const showSuggestions = file.smartSuggestions && file.uploadStatus === 'ready';

  return (
    <Card
      size="small"
      style={{ 
        width: 300,
        height: 400,
        position: 'relative',
        opacity: file.uploadStatus === 'failed' ? 0.6 : 1
      }}
      bodyStyle={{ padding: 12 }}
      cover={
        <div style={{ 
          height: 120, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          position: 'relative'
        }}>
          <Image
            src={file.thumbnailUrl}
            alt={file.name}
            style={{ maxHeight: 100, maxWidth: '100%' }}
            preview={false}
          />
          
          {/* 状态标识 */}
          <div style={{
            position: 'absolute',
            top: 8,
            right: isRTL ? 'auto' : 8,
            left: isRTL ? 8 : 'auto',
            background: getStatusColor(file.uploadStatus),
            color: 'white',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {getStatusIcon(file.uploadStatus)}
            <span>{getStatusText(file.uploadStatus)}</span>
          </div>

          {/* 选择框 */}
          {isReady && (
            <div style={{
              position: 'absolute',
              top: 8,
              left: isRTL ? 'auto' : 8,
              right: isRTL ? 8 : 'auto',
            }}>
              <Checkbox
                checked={selected}
                onChange={(e) => onSelect(file.id, e.target.checked)}
              />
            </div>
          )}
        </div>
      }
    >
      {/* 文件基本信息 */}
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: '12px', display: 'block' }}>
          {file.originalFileName}
        </Text>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          {formatFileSize(file.fileSize)}
        </Text>
      </div>

      {/* 上传进度 */}
      {showProgress && (
        <div style={{ marginBottom: 8 }}>
          <Progress percent={file.uploadProgress} size="small" />
        </div>
      )}

      {/* 错误信息 */}
      {file.error && (
        <div style={{ marginBottom: 8 }}>
          <Text type="danger" style={{ fontSize: '11px' }}>
            {file.error}
          </Text>
        </div>
      )}

      {/* 编辑区域 */}
      {isReady && (
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ marginBottom: 8 }}>
              {/* 文件名编辑 */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Text style={{ fontSize: '11px' }}>文件名</Text>
                  {showSuggestions && (
                    <Tooltip title="应用智能建议">
                      <Button
                        type="text"
                        size="small"
                        icon={<BulbOutlined />}
                        onClick={() => handleApplySuggestion('name')}
                        style={{ padding: 0, height: 16, width: 16 }}
                      />
                    </Tooltip>
                  )}
                </div>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  size="small"
                  maxLength={100}
                />
              </div>

              {/* 分类选择 */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Text style={{ fontSize: '11px' }}>分类</Text>
                  {showSuggestions && (
                    <Tooltip title="应用智能建议">
                      <Button
                        type="text"
                        size="small"
                        icon={<BulbOutlined />}
                        onClick={() => handleApplySuggestion('category')}
                        style={{ padding: 0, height: 16, width: 16 }}
                      />
                    </Tooltip>
                  )}
                </div>
                <Select
                  value={editData.category?.id}
                  onChange={(value) => {
                    const category = categories.find(c => c.id === value) || null;
                    setEditData(prev => ({ ...prev, category }));
                  }}
                  size="small"
                  style={{ width: '100%' }}
                  placeholder="请选择分类"
                  allowClear
                >
                  {categories.map(category => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* 描述编辑 */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Text style={{ fontSize: '11px' }}>描述</Text>
                  {showSuggestions && (
                    <Tooltip title="应用智能建议">
                      <Button
                        type="text"
                        size="small"
                        icon={<BulbOutlined />}
                        onClick={() => handleApplySuggestion('description')}
                        style={{ padding: 0, height: 16, width: 16 }}
                      />
                    </Tooltip>
                  )}
                </div>
                <TextArea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  size="small"
                  rows={2}
                  maxLength={200}
                  showCount
                />
              </div>

              {/* 编辑按钮 */}
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={handleSave}
                >
                  保存
                </Button>
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                >
                  取消
                </Button>
              </Space>
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}>
              {/* 显示信息 */}
              <div style={{ marginBottom: 4 }}>
                <Text strong style={{ fontSize: '12px', display: 'block' }}>
                  {file.name || '未命名'}
                </Text>
                {file.category && (
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {file.category.name}
                  </Text>
                )}
              </div>
              
              {file.description && (
                <Paragraph 
                  style={{ 
                    fontSize: '11px', 
                    margin: 0,
                    color: '#666'
                  }}
                  ellipsis={{ rows: 2 }}
                >
                  {file.description}
                </Paragraph>
              )}


            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      {isReady && (
        <div style={{ 
          position: 'absolute', 
          bottom: 8, 
          right: isRTL ? 'auto' : 8,
          left: isRTL ? 8 : 'auto',
          display: 'flex',
          gap: 4
        }}>
          {!editing && (
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ transform: iconTransform }} />}
                onClick={() => setEditing(true)}
              />
            </Tooltip>
          )}
          
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ transform: iconTransform }} />}
              onClick={() => onDelete(file.id)}
            />
          </Tooltip>
        </div>
      )}
    </Card>
  );
}; 