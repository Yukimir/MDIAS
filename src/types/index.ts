// 文件状态常量
export const FILE_STATUS = {
  SUBMITTED: 'submitted',
  PRELIMINARY: 'preliminary', 
  REVIEW: 'review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DEPRECATED: 'deprecated' // 废弃状态
} as const;

export type FileStatus = typeof FILE_STATUS[keyof typeof FILE_STATUS];

// 项目状态
export type ProjectStatus = 'active' | 'completed' | 'suspended';

// 文件类型
export type FileType = 'pdf' | 'image' | 'document';

// 器械类型
export type DeviceType = 'stethoscope' | 'bloodPressure' | 'thermometer' | 'glucose' | 'xray' | 'ultrasound';

// 审批动作
export type ReviewAction = 'approve' | 'reject';

// 项目统计信息  
export interface ProjectStatistics {
  submitted: number;
  preliminary: number;
  review: number;
  approved: number;
  rejected: number;
  deprecated: number;
}

// 项目实体
export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  type: DeviceType;
  applicant: string;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  statistics: ProjectStatistics;
  // 文件齐全性检查
  isComplete: boolean;
  missingCategories?: string[]; // 缺少的分类名称列表
}

// 文件分类
export interface FileCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  order: number;
}

// 审批记录
export interface ReviewRecord {
  id: string;
  fileId: string;
  stage: FileStatus;
  action: ReviewAction;
  comment: string;
  reviewer: string;
  reviewedAt: Date;
}

// 文件实体
export interface FileItem {
  id: string;
  projectId: string;
  name: string;
  description: string;
  categoryId: string;
  category: FileCategory;
  status: FileStatus;
  fileUrl: string;
  fileType: FileType;
  uploadedAt: Date;
  reviews: ReviewRecord[];
}

// 上传历史记录
export interface UploadHistory {
  id: string;
  projectId: string;
  projectName: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'success' | 'failed' | 'processing';
  errorMessage?: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 搜索和筛选参数
export interface ProjectSearchParams {
  keyword?: string;
  type?: DeviceType;
  status?: ProjectStatus;
  applicant?: string;
}

export interface FileSearchParams {
  keyword?: string;
  categoryId?: string;
  status?: FileStatus;
  projectId?: string;
} 