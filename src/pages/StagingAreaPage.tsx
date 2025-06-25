import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Space, 
  Upload, 
  Checkbox, 
  Input, 
  Select,
  Modal,
  message,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  Card,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  InboxOutlined,
  CheckOutlined,
  ClearOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../hooks/useRTL';
import { StagingFileCard } from '../components/StagingFileCard';
import { stagingAPI } from '../services/stagingAPI';
import { categoryAPI } from '../services/api';
import type { StagingFile, UploadStatus } from '../types/staging';
import type { FileCategory } from '../types';

const { Title, Text } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

export const StagingAreaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'file']);
  const { isRTL, iconTransform } = useRTL();

  // 状态管理
  const [files, setFiles] = useState<StagingFile[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  
  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<UploadStatus[]>([]);

  // 获取预备区文件
  const fetchFiles = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await stagingAPI.getFiles({
        projectId: id,
        keyword: searchKeyword,
        status: statusFilter.length > 0 ? statusFilter : undefined,
      });
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch staging files:', error);
      message.error(t('file:message.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [id, searchKeyword, statusFilter, t]);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchFiles();
    fetchCategories();
  }, [fetchFiles, fetchCategories]);

  // 手动刷新文件状态
  const handleRefresh = () => {
    fetchFiles();
  };

  // 文件上传处理
  const handleFileUpload = async (fileList: FileList) => {
    if (!id) return;

    setUploading(true);
    try {
      const filesArray = Array.from(fileList);
      const response = await stagingAPI.uploadFiles({
        projectId: id,
        files: filesArray
      });

      if (response.failedFiles.length > 0) {
        response.failedFiles.forEach(failed => {
          message.error(t('file:message.uploadFailed', { fileName: failed.fileName, error: failed.error }));
        });
      }

      if (response.stagingFiles.length > 0) {
        message.success(t('file:message.uploadSuccess', { count: response.stagingFiles.length }));
        await fetchFiles();
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
      message.error(t('file:message.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (fileId: string, selected: boolean) => {
    setSelectedFiles(prev => 
      selected 
        ? [...prev, fileId]
        : prev.filter(id => id !== fileId)
    );
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const readyFiles = files.filter(f => f.uploadStatus === 'ready').map(f => f.id);
      setSelectedFiles(readyFiles);
    } else {
      setSelectedFiles([]);
    }
  };

  // 更新文件信息
  const handleFileUpdate = async (fileId: string, updates: any) => {
    try {
      await stagingAPI.updateFile(fileId, updates);
      await fetchFiles();
      message.success(t('file:message.updateSuccess'));
    } catch (error) {
      console.error('Failed to update file:', error);
      message.error(t('file:message.updateFailed'));
    }
  };

  // 删除文件
  const handleFileDelete = async (fileId: string) => {
    Modal.confirm({
      title: t('file:modal.deleteTitle'),
      content: t('file:modal.deleteContent'),
      onOk: async () => {
        try {
          await stagingAPI.deleteFile(fileId);
          await fetchFiles();
          setSelectedFiles(prev => prev.filter(id => id !== fileId));
          message.success(t('file:message.deleteSuccess'));
        } catch (error) {
          console.error('Failed to delete file:', error);
          message.error(t('file:message.deleteFailed'));
        }
      },
    });
  };

  // 应用智能建议
  const handleApplySuggestion = async (fileId: string, type: 'name' | 'description' | 'category') => {
    try {
      await stagingAPI.applySuggestion(fileId, type);
      await fetchFiles();
      message.success(t('file:message.applySuggestionSuccess'));
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      message.error(t('file:message.applySuggestionFailed'));
    }
  };

  // 确认文件到正式列表
  const handleConfirmFiles = async () => {
    if (selectedFiles.length === 0) {
      message.warning(t('file:message.selectFilesFirst'));
      return;
    }

    setConfirming(true);
    try {
      await stagingAPI.confirmFiles({
        projectId: id!,
        stagingFileIds: selectedFiles
      });
      
      message.success(t('file:message.confirmSuccess', { count: selectedFiles.length }));
      setSelectedFiles([]);
      await fetchFiles();
    } catch (error) {
      console.error('Failed to confirm files:', error);
      message.error(error instanceof Error ? error.message : t('file:message.confirmFailed'));
    } finally {
      setConfirming(false);
    }
  };

  // 清空预备区
  const handleClearAll = () => {
    Modal.confirm({
      title: t('file:modal.clearTitle'),
      content: t('file:modal.clearContent'),
      onOk: async () => {
        try {
          await stagingAPI.clearProject(id!);
          await fetchFiles();
          setSelectedFiles([]);
          message.success(t('file:message.clearSuccess'));
        } catch (error) {
          console.error('Failed to clear staging area:', error);
          message.error(t('file:message.clearFailed'));
        }
      },
    });
  };

  // 统计信息
  const stats = {
    total: files.length,
    uploading: files.filter(f => f.uploadStatus === 'uploading').length,
    analyzing: files.filter(f => f.uploadStatus === 'analyzing').length,
    ready: files.filter(f => f.uploadStatus === 'ready').length,
    failed: files.filter(f => f.uploadStatus === 'failed').length,
  };

  const readyFiles = files.filter(f => f.uploadStatus === 'ready');
  const allReadySelected = readyFiles.length > 0 && selectedFiles.length === readyFiles.length;
  const someReadySelected = selectedFiles.length > 0 && selectedFiles.length < readyFiles.length;

  return (
    <div>
      {/* 页面头部 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: 24,
        flexDirection: isRTL ? 'row-reverse' : 'row'
      }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined style={{ transform: iconTransform }} />}
          onClick={() => navigate(-1)}
          style={{ marginInlineEnd: 16 }}
        >
          {t('button.back')}
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          {t('file:staging.title')}
        </Title>
      </div>

      {/* 统计信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title={t('file:staging.stats.total')}
              value={stats.total}
              prefix={<InboxOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('file:staging.stats.uploading')}
              value={stats.uploading}
              valueStyle={{ color: '#1677ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('file:staging.stats.analyzing')}
              value={stats.analyzing}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('file:staging.stats.ready')}
              value={stats.ready}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 操作区域 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <Space>
          <Search
            placeholder={t('file:staging.searchPlaceholder')}
            allowClear
            style={{ width: 200 }}
            onSearch={setSearchKeyword}
          />
          <Select
            placeholder={t('file:staging.statusFilter')}
            allowClear
            style={{ width: 120 }}
            mode="multiple"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'uploading', label: t('file:staging.status.uploading') },
              { value: 'analyzing', label: t('file:staging.status.analyzing') },
              { value: 'ready', label: t('file:staging.status.ready') },
              { value: 'failed', label: t('file:staging.status.failed') },
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {t('button.refresh')}
          </Button>
        </Space>
        
        <Space>
          {readyFiles.length > 0 && (
            <>
              <Checkbox
                indeterminate={someReadySelected}
                checked={allReadySelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                {t('file:staging.selectAll', { selected: selectedFiles.length, total: readyFiles.length })}
              </Checkbox>
              
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleConfirmFiles}
                loading={confirming}
                disabled={selectedFiles.length === 0}
              >
                {t('file:staging.confirmSelected', { count: selectedFiles.length })}
              </Button>
            </>
          )}
          
          <Button
            danger
            icon={<ClearOutlined />}
            onClick={handleClearAll}
            disabled={files.length === 0}
          >
            {t('file:staging.clearAll')}
          </Button>
        </Space>
      </div>

      {/* 文件上传区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Dragger
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          beforeUpload={() => false} // 阻止自动上传
          onChange={(info) => {
            if (info.fileList.length > 0) {
              const files = info.fileList.map(file => file.originFileObj!).filter(Boolean);
              if (files.length > 0) {
                const fileList = new DataTransfer();
                files.forEach(file => fileList.items.add(file));
                handleFileUpload(fileList.files);
              }
            }
          }}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {t('file:staging.uploadText')}
          </p>
          <p className="ant-upload-hint">
            {t('file:staging.uploadHint')}
          </p>
        </Dragger>
      </Card>

      {/* 文件列表 */}
      <Spin spinning={loading}>
        {files.length === 0 ? (
          <Empty 
            description={t('file:staging.empty')} 
            style={{ margin: '60px 0' }}
          />
        ) : (
          <>
            {stats.failed > 0 && (
              <Alert
                message={t('file:staging.uploadAlert.title')}
                description={t('file:staging.uploadAlert.description', { count: stats.failed })}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                closable
              />
            )}
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
              justifyItems: 'center'
            }}>
              {files.map((file) => (
                <StagingFileCard
                  key={file.id}
                  file={file}
                  categories={categories}
                  selected={selectedFiles.includes(file.id)}
                  onSelect={handleFileSelect}
                  onUpdate={handleFileUpdate}
                  onDelete={handleFileDelete}
                  onApplySuggestion={handleApplySuggestion}
                />
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Text type="secondary">
                {t('file:staging.totalFiles', { count: files.length })}
              </Text>
            </div>
          </>
        )}
      </Spin>
    </div>
  );
}; 