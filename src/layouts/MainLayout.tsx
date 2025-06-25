import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  TagsOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useRTL } from '../hooks/useRTL';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../utils/i18n';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, iconTransform } = useRTL();

  // 菜单项配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/projects',
      icon: <ProjectOutlined style={{ transform: iconTransform }} />,
      label: t('nav.projects'),
    },
    {
      key: '/categories',
      icon: <TagsOutlined style={{ transform: iconTransform }} />,
      label: t('nav.categories'),
    },
  ];

  // 语言切换菜单
  const languageMenuItems: MenuProps['items'] = SUPPORTED_LANGUAGES.map((lang) => ({
    key: lang.code,
    label: (
      <Space>
        <span>{lang.flag}</span>
        <span>{lang.name}</span>
      </Space>
    ),
    onClick: () => changeLanguage(lang.code),
  }));

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // 获取当前选中的菜单项
  const selectedKeys = [location.pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: '#fff',
          borderInlineEnd: '1px solid #f0f0f0',
        }}
      >
        {/* Logo区域 */}
        <div 
          style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              {t('title')}
            </Title>
          )}
        </div>

        {/* 导航菜单 */}
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderInlineEnd: 'none',
            marginTop: 16,
          }}
        />
      </Sider>

      {/* 主内容区域 */}
      <Layout>
        {/* 顶部头部 */}
        <Header 
          style={{ 
            background: '#fff', 
            padding: 0, 
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* 左侧折叠按钮 */}
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ transform: iconTransform }} />
              ) : (
                <MenuFoldOutlined style={{ transform: iconTransform }} />
              )
            }
            onClick={toggleCollapsed}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          {/* 右侧语言切换 */}
          <div style={{ paddingInlineEnd: 24 }}>
            <Dropdown
              menu={{ items: languageMenuItems }}
              placement={isRTL ? 'bottomLeft' : 'bottomRight'}
            >
              <Button type="text" icon={<GlobalOutlined />}>
                <span style={{ marginInlineStart: 8 }}>
                  {SUPPORTED_LANGUAGES.find(l => 
                    l.code === document.documentElement.lang
                  )?.flag}
                </span>
              </Button>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}; 