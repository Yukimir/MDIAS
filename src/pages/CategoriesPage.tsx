import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Button, 
  Modal, 
  message, 
  Empty, 
  Spin, 
  Space,
  Alert 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { CategoryForm } from '../components/CategoryForm';
import { CategoryListItem } from '../components/CategoryListItem';
import { categoryAPI } from '../services/api';
import { useRTL } from '../hooks/useRTL';
import type { FileCategory } from '../types';

const { Title } = Typography;

export const CategoriesPage: React.FC = () => {
  const { t } = useTranslation(['common', 'category']);
  const { iconTransform } = useRTL();
  
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FileCategory | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<FileCategory | undefined>();

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error(t('category:message.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // 初始加载
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 新建分类
  const handleCreate = () => {
    setEditingCategory(undefined);
    setModalVisible(true);
  };

  // 编辑分类
  const handleEdit = (category: FileCategory) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  // 删除分类
  const handleDelete = (category: FileCategory) => {
    setDeletingCategory(category);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    setSubmitting(true);
    try {
      await categoryAPI.deleteCategory(deletingCategory.id);
      message.success(t('category:message.deleteSuccess'));
      setDeleteModalVisible(false);
      setDeletingCategory(undefined);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      message.error(t('category:message.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  // 提交表单
  const handleSubmit = async (values: Omit<FileCategory, 'id'>) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.id, values);
        message.success(t('category:message.updateSuccess'));
      } else {
        await categoryAPI.createCategory(values);
        message.success(t('category:message.createSuccess'));
      }
      setModalVisible(false);
      setEditingCategory(undefined);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      message.error(editingCategory 
        ? t('category:message.updateError') 
        : t('category:message.createError')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 取消表单
  const handleCancel = () => {
    setModalVisible(false);
    setEditingCategory(undefined);
  };

  // 拖拽移动
  const handleMove = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedCategory = categories[dragIndex];
    const newCategories = [...categories];
    newCategories.splice(dragIndex, 1);
    newCategories.splice(hoverIndex, 0, draggedCategory);
    
    // 更新顺序
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index + 1
    }));
    
    setCategories(updatedCategories);
  }, [categories]);

  // 上移
  const handleMoveUp = useCallback(async (category: FileCategory) => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    if (currentIndex <= 0) return;

    const newCategories = [...categories];
    [newCategories[currentIndex - 1], newCategories[currentIndex]] = 
    [newCategories[currentIndex], newCategories[currentIndex - 1]];
    
    // 更新顺序
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index + 1
    }));
    
    setCategories(updatedCategories);
    message.success(t('category:message.orderUpdateSuccess'));
  }, [categories, t]);

  // 下移
  const handleMoveDown = useCallback(async (category: FileCategory) => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    if (currentIndex >= categories.length - 1) return;

    const newCategories = [...categories];
    [newCategories[currentIndex], newCategories[currentIndex + 1]] = 
    [newCategories[currentIndex + 1], newCategories[currentIndex]];
    
    // 更新顺序
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index + 1
    }));
    
    setCategories(updatedCategories);
    message.success(t('category:message.orderUpdateSuccess'));
  }, [categories, t]);

  return (
    <div>
      {/* 头部区域 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0 }}>
            {t('category:title')}
          </Title>
          <span style={{ color: '#666' }}>
            {t('category:list.total', { count: categories.length })}
          </span>
        </Space>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined style={{ transform: iconTransform }} />}
          onClick={handleCreate}
          size="large"
        >
          {t('category:list.create')}
        </Button>
      </div>

      {/* 提示信息 */}
      <Alert
        message={t('category:list.dragTip')}
        description={t('category:list.dragDescription')}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        closable
      />

      {/* 分类列表 */}
      <Spin spinning={loading}>
        {categories.length === 0 && !loading ? (
          <Empty 
            description={t('category:list.empty')} 
            style={{ margin: '60px 0' }}
          />
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div>
              {categories.map((category, index) => (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  index={index}
                  canMoveUp={index > 0}
                  canMoveDown={index < categories.length - 1}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          </DndProvider>
        )}
      </Spin>

      {/* 新建/编辑分类模态框 */}
      <Modal
        title={editingCategory ? t('category:modal.editTitle') : t('category:modal.createTitle')}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={submitting}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        title={t('category:modal.deleteTitle')}
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingCategory(undefined);
        }}
        okText={t('category:modal.deleteConfirm')}
        cancelText={t('category:modal.deleteCancel')}
        okButtonProps={{ danger: true, loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <p>
          {t('category:modal.deleteContent', { name: deletingCategory?.name })}
        </p>
      </Modal>
    </div>
  );
}; 