import React, { useRef } from 'react';
import { Card, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  HolderOutlined 
} from '@ant-design/icons';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../hooks/useRTL';
import type { FileCategory } from '../types';

const { Text, Paragraph } = Typography;

interface CategoryListItemProps {
  category: FileCategory;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: (category: FileCategory) => void;
  onDelete: (category: FileCategory) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onMoveUp: (category: FileCategory) => void;
  onMoveDown: (category: FileCategory) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const CategoryListItem: React.FC<CategoryListItemProps> = ({
  category,
  index,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onMove,
  onMoveUp,
  onMoveDown,
}) => {
  const { t } = useTranslation(['common', 'category']);
  const { iconTransform, isRTL } = useRTL();
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: unknown }>({
    accept: 'category',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'category',
    item: () => {
      return { id: category.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  preview(drop(ref));

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      <Card
        size="small"
        style={{ marginBottom: 8 }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          {/* 拖拽手柄 */}
          <div
            ref={drag as any}
            style={{ 
              cursor: 'move',
              color: '#666',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <HolderOutlined />
          </div>

          {/* 顺序号 */}
          <div
            style={{
              minWidth: 32,
              height: 32,
              borderRadius: '50%',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#666',
            }}
          >
            {category.order}
          </div>

          {/* 分类信息 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              marginBottom: 4,
              flexDirection: isRTL ? 'row-reverse' : 'row'
            }}>
              <Text strong style={{ fontSize: '16px' }}>
                {category.name}
              </Text>
              <Tag color={category.required ? 'red' : 'default'}>
                {category.required 
                  ? t('category:form.requiredOptions.true') 
                  : t('category:form.requiredOptions.false')
                }
              </Tag>
            </div>
            <Paragraph 
              style={{ 
                margin: 0, 
                color: '#666',
                textAlign: isRTL ? 'right' : 'left'
              }}
              ellipsis={{ rows: 1, expandable: false }}
            >
              {category.description}
            </Paragraph>
          </div>

          {/* 操作按钮 */}
          <Space size="small">
            {/* 上下移动按钮 */}
            <Tooltip title={t('category:actions.moveUp')}>
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined style={{ transform: iconTransform }} />}
                onClick={() => onMoveUp(category)}
                disabled={!canMoveUp}
              />
            </Tooltip>
            <Tooltip title={t('category:actions.moveDown')}>
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined style={{ transform: iconTransform }} />}
                onClick={() => onMoveDown(category)}
                disabled={!canMoveDown}
              />
            </Tooltip>

            {/* 编辑按钮 */}
            <Tooltip title={t('category:actions.edit')}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ transform: iconTransform }} />}
                onClick={() => onEdit(category)}
              />
            </Tooltip>

            {/* 删除按钮 */}
            <Tooltip title={t('category:actions.delete')}>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined style={{ transform: iconTransform }} />}
                onClick={() => onDelete(category)}
              />
            </Tooltip>
          </Space>
        </div>
      </Card>
    </div>
  );
}; 