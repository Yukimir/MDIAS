import React from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

export const CreateProjectPage: React.FC = () => {
  const { t } = useTranslation(['common', 'project']);

  return (
    <div>
      <Title level={2}>{t('project:list.create')}</Title>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>{t('message.loading')}</p>
        </div>
      </Card>
    </div>
  );
}; 