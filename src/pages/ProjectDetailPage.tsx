import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Card, 
  Descriptions, 
  Tabs, 
  Modal, 
  message, 
  Empty, 
  Spin, 
  Space,
  Input,
  Select,
  Alert,
  Statistic,
  Row,
  Col,
  Switch
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { FileListItem } from '../components/FileListItem';
import { StatusTag } from '../components/StatusTag';
import { ReviewForm } from '../components/ReviewForm';
import { FilePreviewModal } from '../components/FilePreviewModal';
import { projectAPI, fileAPI, categoryAPI } from '../services/api';
import { useRTL } from '../hooks/useRTL';
import { FILE_STATUS, type Project, type FileItem, type FileCategory } from '../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'project', 'file']);
  const { iconTransform } = useRTL();

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);


  const [deprecateModalVisible, setDeprecateModalVisible] = useState(false);
  const [deprecatingFile, setDeprecatingFile] = useState<FileItem | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewingFile, setReviewingFile] = useState<FileItem | null>(null);
  const [reviewing, setReviewing] = useState(false);
  
  // 预览模态框状态
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewingFile, setPreviewingFile] = useState<FileItem | null>(null);
  
  // 筛选和搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(true); // 默认只显示待审批文件

  // 获取项目详情
  const fetchProject = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await projectAPI.getProject(id);
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      message.error('获取项目详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 获取项目文件
  const fetchFiles = useCallback(async () => {
    if (!id) return;
    
    setFilesLoading(true);
    try {
      const data = await fileAPI.getFilesByProject(id, {
        keyword: searchKeyword,
        status: filterStatus as any,
        categoryId: filterCategory,
      });
      
      // 如果只显示我的任务，筛选出复审状态的文件
      const filteredData = showOnlyMyTasks 
        ? data.filter(file => file.status === FILE_STATUS.REVIEW)
        : data;
      
      setFiles(filteredData);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      message.error('获取文件列表失败');
    } finally {
      setFilesLoading(false);
    }
  }, [id, searchKeyword, filterStatus, filterCategory, showOnlyMyTasks]);

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
    fetchProject();
    fetchCategories();
  }, [fetchProject, fetchCategories]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);



  // 文件预览
  const handleFilePreview = (file: FileItem) => {
    setPreviewingFile(file);
    setPreviewModalVisible(true);
  };

  // 文件下载
  const handleFileDownload = (_file: FileItem) => {
    // 这里可以实现文件下载功能
    message.success(t('file:message.downloadSuccess'));
  };

  // 直接通过文件
  const handleApproveFile = async (file: FileItem) => {
    try {
      await fileAPI.reviewFile(file.id, { action: 'approve', comment: '审批通过' });
      message.success(t('file:message.approveSuccess'));
      await fetchFiles();
      await fetchProject();
    } catch (error) {
      console.error('Failed to approve file:', error);
      message.error('审批失败');
    }
  };

  // 打开否决模态框
  const handleRejectFile = (file: FileItem) => {
    setReviewingFile(file);
    setReviewModalVisible(true);
  };

  // 提交审批
  const handleSubmitReview = async (action: 'approve' | 'reject', comment: string) => {
    if (!reviewingFile) return;

    setReviewing(true);
    try {
      await fileAPI.reviewFile(reviewingFile.id, { action, comment });
      message.success(action === 'approve' ? t('file:message.approveSuccess') : t('file:message.rejectSuccess'));
      setReviewModalVisible(false);
      setReviewingFile(null);
      await fetchFiles();
      await fetchProject();
    } catch (error) {
      console.error('Failed to review file:', error);
      message.error('审批失败');
    } finally {
      setReviewing(false);
    }
  };

  // 文件废弃
  const handleFileDeprecate = (file: FileItem) => {
    setDeprecatingFile(file);
    setDeprecateModalVisible(true);
  };

  // 确认废弃文件
  const handleConfirmDeprecate = async () => {
    if (!deprecatingFile) return;

    try {
      await fileAPI.deprecateFile(deprecatingFile.id);
      message.success(t('file:message.deprecateSuccess'));
      setDeprecateModalVisible(false);
      setDeprecatingFile(null);
      await fetchFiles();
      await fetchProject();
    } catch (error) {
      console.error('Failed to deprecate file:', error);
      message.error('废弃文件失败');
    }
  };

  // 文件恢复
  const handleFileRestore = (file: FileItem) => {
    Modal.confirm({
      title: t('file:modal.restoreTitle'),
      content: t('file:modal.restoreContent', { name: file.name }),
      onOk: async () => {
        try {
          await fileAPI.restoreFile(file.id);
          message.success(t('file:message.restoreSuccess'));
          await fetchFiles();
          await fetchProject();
        } catch (error) {
          console.error('Failed to restore file:', error);
          message.error('恢复文件失败');
        }
      },
    });
  };

  // 获取统计数据
  const getStatistics = () => {
    if (!project) return { 
      submitted: 0, 
      preliminary: 0,
      review: 0,
      approved: 0, 
      rejected: 0, 
      deprecated: 0 
    };
    return project.statistics;
  };

  const statistics = getStatistics();

  if (loading) {
    return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />;
  }

  if (!project) {
    return <Empty description="项目不存在" />;
  }

  return (
    <div>
      {/* 头部区域 */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined style={{ transform: iconTransform }} />}
            onClick={() => navigate('/projects')}
          >
            {t('button.back')}
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {project.name}
          </Title>
          <StatusTag status={project.status} type="project" />
        </Space>
      </div>

      {/* 项目概览 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('project:form.code')}>
                <Text code>{project.code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('project:form.type')}>
                {t(`project:form.deviceTypes.${project.type}`)}
              </Descriptions.Item>
              <Descriptions.Item label={t('project:form.applicant')}>
                {project.applicant}
              </Descriptions.Item>
              <Descriptions.Item label={t('project:form.createdAt')}>
                {new Date(project.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title={t('file:status.submitted')}
                  value={statistics.submitted}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={t('file:status.processing')}
                                     value={(statistics.preliminary || 0) + (statistics.review || 0)}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={t('file:status.approved')}
                  value={statistics.approved}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={t('file:status.deprecated')}
                  value={statistics.deprecated}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        
        {project.description && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Text type="secondary">{project.description}</Text>
          </div>
        )}
      </Card>

      {/* 文件管理标签页 */}
      <Card>
        <Tabs defaultActiveKey="files">
          <TabPane tab={t('file:list.title')} key="files">
            {/* 文件操作区域 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16 
            }}>
              <Space>
                <Switch
                  checked={showOnlyMyTasks}
                  onChange={setShowOnlyMyTasks}
                  checkedChildren={t('file:filter.pending')}
                  unCheckedChildren={t('file:filter.all')}
                />
                <Search
                  placeholder={t('file:list.searchPlaceholder')}
                  allowClear
                  style={{ width: 200 }}
                  onSearch={setSearchKeyword}
                />
                {!showOnlyMyTasks && (
                  <>
                    <Select
                      placeholder={t('file:filter.status')}
                      allowClear
                      style={{ width: 120 }}
                      value={filterStatus}
                      onChange={setFilterStatus}
                      options={[
                        { value: FILE_STATUS.SUBMITTED, label: t('file:status.submitted') },
                        { value: FILE_STATUS.PRELIMINARY, label: t('file:status.preliminary') },
                        { value: FILE_STATUS.REVIEW, label: t('file:status.review') },
                        { value: FILE_STATUS.APPROVED, label: t('file:status.approved') },
                        { value: FILE_STATUS.REJECTED, label: t('file:status.rejected') },
                        { value: FILE_STATUS.DEPRECATED, label: t('file:status.deprecated') },
                      ]}
                    />
                    <Select
                      placeholder={t('file:filter.category')}
                      allowClear
                      style={{ width: 140 }}
                      value={filterCategory}
                      onChange={setFilterCategory}
                      options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    />
                  </>
                )}
              </Space>
              
              <Button 
                type="primary" 
                icon={<PlusOutlined style={{ transform: iconTransform }} />}
                onClick={() => navigate(`/projects/${id}/staging`)}
              >
                {t('file:upload.intelligent')}
              </Button>
            </div>

            {/* 文件列表 */}
            <Spin spinning={filesLoading}>
              {files.length === 0 ? (
                <Empty 
                  description={t('file:list.empty')} 
                  style={{ margin: '60px 0' }}
                />
              ) : (
                <div>
                  {files.map((file) => (
                    <FileListItem
                      key={file.id}
                      file={file}
                      onPreview={handleFilePreview}
                      onDownload={handleFileDownload}
                      onApprove={handleApproveFile}
                      onReject={handleRejectFile}
                      onDeprecate={handleFileDeprecate}
                      onRestore={handleFileRestore}
                    />
                  ))}
                  
                  <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 16 }}>
                    {t('file:list.total', { count: files.length })}
                  </Text>
                </div>
              )}
            </Spin>
          </TabPane>
        </Tabs>
      </Card>



      {/* 否决模态框 */}
      <Modal
        title={t('file:modal.rejectTitle')}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setReviewingFile(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {reviewingFile && (
          <ReviewForm
            file={reviewingFile}
            onSubmit={handleSubmitReview}
            onCancel={() => {
              setReviewModalVisible(false);
              setReviewingFile(null);
            }}
            loading={reviewing}
            hideActionSelection={true}
            defaultAction="reject"
          />
        )}
      </Modal>

      {/* 废弃文件确认模态框 */}
      <Modal
        title={t('file:modal.deprecateTitle')}
        open={deprecateModalVisible}
        onOk={handleConfirmDeprecate}
        onCancel={() => {
          setDeprecateModalVisible(false);
          setDeprecatingFile(null);
        }}
        okText={t('file:actions.deprecate')}
        cancelText={t('button.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>
          {t('file:modal.deprecateContent', { name: deprecatingFile?.name })}
        </p>
      </Modal>

      {/* 文件预览模态框 */}
      <FilePreviewModal
        file={previewingFile}
        visible={previewModalVisible}
        onClose={() => {
          setPreviewModalVisible(false);
          setPreviewingFile(null);
        }}
      />
    </div>
  );
}; 