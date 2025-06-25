import React from 'react';
import { Card, Typography, Space, Row, Col, Button, Tooltip } from 'antd';
import { EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { StatusTag } from './StatusTag';
import { useRTL } from '../hooks/useRTL';
import type { Project } from '../types';

const { Title, Text, Paragraph } = Typography;

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { t } = useTranslation(['common', 'project']);
  const navigate = useNavigate();
  const { iconTransform } = useRTL();

  const handleView = () => {
    navigate(`/projects/${project.id}`);
  };

  // 渲染文件齐全性提示
  const renderCompletenessIndicator = () => {
    if (project.isComplete) {
      return null;
    }

    const missingText = project.missingCategories?.length 
      ? t('project:list.missingCategories', { 
          categories: project.missingCategories.join(', ') 
        })
      : t('project:list.missingFiles');

    return (
      <Tooltip title={missingText}>
        <ExclamationCircleOutlined 
          style={{ 
            color: '#faad14', 
            fontSize: '16px',
            marginLeft: '8px',
            cursor: 'pointer'
          }} 
        />
      </Tooltip>
    );
  };

  return (
    <Card
      hoverable
      actions={[
        <Button 
          type="text" 
          icon={<EyeOutlined style={{ transform: iconTransform }} />}
          onClick={handleView}
        >
          {t('button.preview')}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 项目标题和状态 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>
              {project.name}
            </Title>
            {renderCompletenessIndicator()}
          </div>
          <StatusTag status={project.status} type="project" />
        </div>

        {/* 项目编号和类型 */}
        <Space direction="vertical" size="small">
          <Text type="secondary">
            {t('form.code')}: {project.code}
          </Text>
          <Text type="secondary">
            {t('form.type')}: {t(`project:form.deviceTypes.${project.type}`, { ns: 'project' })}
          </Text>
          <Text type="secondary">
            {t('form.applicant')}: {project.applicant}
          </Text>
        </Space>

        {/* 项目描述 */}
        <Paragraph 
          ellipsis={{ rows: 2, expandable: false }}
          style={{ margin: 0 }}
        >
          {project.description}
        </Paragraph>

        {/* 统计信息 */}
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                {project.statistics.submitted}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t('status.submitted')}
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
                {project.statistics.preliminary}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t('status.preliminary')}
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
                {project.statistics.review}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t('status.review')}
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                {project.statistics.approved}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t('status.approved')}
              </div>
            </div>
          </Col>
        </Row>

        {/* 更新时间 */}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {t('project:list.updateTime', { 
            time: project.updatedAt.toLocaleDateString(), 
            ns: 'project' 
          })}
        </Text>
      </Space>
    </Card>
  );
}; 