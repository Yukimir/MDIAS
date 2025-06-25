import React from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

export const FileDetailPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <Title level={2}>文件详情</Title>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>文件ID: {id}</p>
          <p>{t('message.loading')}</p>
        </div>
      </Card>
    </div>
  );
}; 