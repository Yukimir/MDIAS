import type { FileCategory } from './index';

// 上传状态枚举 - 使用常量对象以兼容严格的TypeScript配置
export const UploadStatus = {
  PENDING: 'pending',       // 待上传
  UPLOADING: 'uploading',   // 上传中
  COMPLETED: 'completed',   // 上传完成
  ANALYZING: 'analyzing',   // 后端分析中
  READY: 'ready',          // 已分析完成，可编辑
  FAILED: 'failed',        // 上传失败
  CANCELLED: 'cancelled'    // 已取消
} as const;

export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

// 智能建议接口
export interface SmartSuggestions {
  suggestedName: string;
  suggestedDescription: string;
  suggestedCategories: FileCategory[];
  confidence: number; // 建议置信度 (0-1)
}

// 预备区文件接口
export interface StagingFile {
  id: string;                    // 预备区文件ID
  projectId: string;             // 所属项目ID
  originalFileName: string;      // 原始文件名
  name: string;                  // 编辑后的文件名
  description: string;           // 文件描述
  category: FileCategory | null; // 选择的分类
  fileSize: number;              // 文件大小（字节）
  fileType: string;              // 文件MIME类型
  uploadStatus: UploadStatus;    // 上传状态
  uploadProgress: number;        // 上传进度 (0-100)
  error?: string;               // 错误信息
  smartSuggestions?: SmartSuggestions; // 智能建议（后端分析后提供）
  uploadUrl?: string;           // 上传后的文件URL
  thumbnailUrl?: string;        // 缩略图URL
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
}

// 预备区状态管理接口
export interface StagingAreaState {
  files: StagingFile[];         // 预备区文件列表
  selectedFiles: string[];      // 选中的文件ID
  isUploading: boolean;         // 是否正在上传
  uploadQueue: string[];        // 上传队列
  filters: {                    // 筛选条件
    status: UploadStatus[];
    category: string[];
    keyword: string;
  };
  settings: {                   // 设置
    autoApplySuggestions: boolean; // 自动应用智能建议
    concurrentUploads: number;     // 并发上传数量
  };
}

// 批量编辑选项
export interface BatchEditOptions {
  nameOperation: 'replace' | 'prefix' | 'suffix' | 'pattern';
  nameValue: string;
  categoryId?: string;
  descriptionOperation: 'replace' | 'prefix' | 'suffix';
  descriptionValue: string;
  applyToSelected: boolean;
}

// 文件上传请求
export interface FileUploadRequest {
  projectId: string;
  files: File[];
}

// 文件上传响应
export interface FileUploadResponse {
  stagingFiles: StagingFile[];
  failedFiles: {
    fileName: string;
    error: string;
  }[];
}

// 确认提交请求
export interface ConfirmFilesRequest {
  projectId: string;
  stagingFileIds: string[];
}

// API筛选参数
export interface StagingFilesQuery {
  projectId: string;
  status?: UploadStatus[];
  category?: string[];
  keyword?: string;
  limit?: number;
  offset?: number;
} 