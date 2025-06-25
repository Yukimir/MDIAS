import React from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { FILE_STATUS, type FileStatus } from '../types';
import type { ProjectStatus } from '../types';

interface StatusTagProps {
  status: FileStatus | ProjectStatus;
  type?: 'file' | 'project';
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, type = 'file' }) => {
  const { t } = useTranslation('common');

  // 文件状态的颜色映射
  const fileStatusColors = {
    [FILE_STATUS.SUBMITTED]: 'blue',
    [FILE_STATUS.PRELIMINARY]: 'orange',
    [FILE_STATUS.REVIEW]: 'purple',
    [FILE_STATUS.APPROVED]: 'green',
    [FILE_STATUS.REJECTED]: 'red',
    [FILE_STATUS.DEPRECATED]: 'default',
  } as const;

  // 项目状态的颜色映射
  const projectStatusColors = {
    active: 'blue',
    completed: 'green',
    suspended: 'red',
  } as const;

  const getColor = () => {
    if (type === 'file') {
      return fileStatusColors[status as FileStatus] || 'default';
    } else {
      return projectStatusColors[status as ProjectStatus] || 'default';
    }
  };

  const getStatusText = () => {
    if (type === 'file') {
      return t(`status.${status}`);
    } else {
      return t(`project:status.${status}`, { ns: 'project' });
    }
  };

  return (
    <Tag color={getColor()}>
      {getStatusText()}
    </Tag>
  );
}; 