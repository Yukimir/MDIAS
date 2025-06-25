import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Typography, Input, Select, Space, Spin, Empty } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { projectAPI } from '../services/api';
import { useRTL } from '../hooks/useRTL';
import type { Project, ProjectSearchParams } from '../types';

const { Title } = Typography;
const { Search } = Input;

export const ProjectListPage: React.FC = () => {
  const { t } = useTranslation(['common', 'project']);
  const navigate = useNavigate();
  const { iconTransform } = useRTL();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<ProjectSearchParams>({});

  // 获取项目列表
  const fetchProjects = async (params?: ProjectSearchParams) => {
    setLoading(true);
    try {
      const response = await projectAPI.getProjects(params);
      setProjects(response.items);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchProjects();
  }, []);

  // 搜索处理
  const handleSearch = (keyword: string) => {
    const newParams = { ...searchParams, keyword };
    setSearchParams(newParams);
    fetchProjects(newParams);
  };

  // 筛选处理
  const handleFilterChange = (field: keyof ProjectSearchParams, value: any) => {
    const newParams = { ...searchParams, [field]: value };
    setSearchParams(newParams);
    fetchProjects(newParams);
  };

  // 清除筛选
  const handleClearFilters = () => {
    setSearchParams({});
    fetchProjects();
  };

  return (
    <div>
      {/* 头部区域 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <Title level={2} style={{ margin: 0 }}>
          {t('project:list.title')}
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined style={{ transform: iconTransform }} />}
          onClick={() => navigate('/projects/new')}
          size="large"
        >
          {t('project:list.create')}
        </Button>
      </div>

      {/* 搜索和筛选区域 */}
      <div style={{ 
        background: '#fafafa', 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 24 
      }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 搜索框 */}
          <Search
            placeholder={t('project:list.search')}
            allowClear
            size="large"
            style={{ maxWidth: 400 }}
            onSearch={handleSearch}
            prefix={<SearchOutlined />}
          />

          {/* 筛选器 */}
          <Row gutter={16} align="middle">
            <Col>
              <span>{t('project:list.filter')}:</span>
            </Col>
            <Col>
              <Select
                placeholder={t('form.type')}
                allowClear
                style={{ width: 150 }}
                onChange={(value) => handleFilterChange('type', value)}
                value={searchParams.type}
              >
                <Select.Option value="stethoscope">
                  {t('project:form.deviceTypes.stethoscope')}
                </Select.Option>
                <Select.Option value="bloodPressure">
                  {t('project:form.deviceTypes.bloodPressure')}
                </Select.Option>
                <Select.Option value="thermometer">
                  {t('project:form.deviceTypes.thermometer')}
                </Select.Option>
                <Select.Option value="glucose">
                  {t('project:form.deviceTypes.glucose')}
                </Select.Option>
                <Select.Option value="xray">
                  {t('project:form.deviceTypes.xray')}
                </Select.Option>
                <Select.Option value="ultrasound">
                  {t('project:form.deviceTypes.ultrasound')}
                </Select.Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder={t('project:status.active')}
                allowClear
                style={{ width: 120 }}
                onChange={(value) => handleFilterChange('status', value)}
                value={searchParams.status}
              >
                <Select.Option value="active">
                  {t('project:status.active')}
                </Select.Option>
                <Select.Option value="completed">
                  {t('project:status.completed')}
                </Select.Option>
                <Select.Option value="suspended">
                  {t('project:status.suspended')}
                </Select.Option>
              </Select>
            </Col>
            <Col>
              <Button onClick={handleClearFilters}>
                {t('button.cancel')}
              </Button>
            </Col>
          </Row>
        </Space>
      </div>

      {/* 项目列表 */}
      <Spin spinning={loading}>
        {projects.length === 0 && !loading ? (
          <Empty 
            description={t('project:list.noData')} 
            style={{ margin: '60px 0' }}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {projects.map((project) => (
              <Col xs={24} sm={12} lg={8} xl={8} xxl={6} key={project.id}>
                <ProjectCard project={project} />
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
}; 