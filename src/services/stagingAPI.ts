import type { 
  StagingFile, 
  StagingFilesQuery, 
  FileUploadRequest, 
  FileUploadResponse,
  ConfirmFilesRequest,
  SmartSuggestions
} from '../types/staging';
import { UploadStatus } from '../types/staging';
import type { FileCategory } from '../types';

// Mock数据生成辅助函数
const generateId = () => Math.random().toString(36).substr(2, 9);

// 灰色缩略图base64
const GRAY_THUMBNAIL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCA0MEg4MFY4MEg0MFY0MFoiIGZpbGw9IiNEOUQ5RDkiLz4KPHN2Zz4K';

// Mock分类数据（实际项目中应该从categoryAPI获取）
const mockCategories: FileCategory[] = [
  { id: '1', name: 'Application Form', description: 'Various application forms', required: true, order: 1 },
  { id: '2', name: 'Product Manual', description: 'Product instruction manual', required: true, order: 2 },
  { id: '3', name: 'Technical Documentation', description: 'Technical specifications', required: false, order: 3 },
  { id: '4', name: 'Test Report', description: 'Third-party test reports', required: true, order: 4 },
  { id: '5', name: 'Design Drawings', description: 'Product design drawings', required: false, order: 5 },
  { id: '6', name: 'Clinical Trial', description: 'Clinical trial related documents', required: false, order: 6 },
];

// Mock智能分析函数（模拟后端分析）
const generateSmartSuggestions = (fileName: string, _fileType: string): SmartSuggestions => {
  const lowerName = fileName.toLowerCase();
  
  // 简单的关键词匹配逻辑
  let suggestedCategories: FileCategory[] = [];
  let suggestedName = fileName.replace(/\.[^/.]+$/, ""); // 移除扩展名
  let suggestedDescription = '';
  let confidence = 0.7;

  if (lowerName.includes('申请') || lowerName.includes('application')) {
    suggestedCategories = [mockCategories[0]];
    suggestedDescription = '医疗器械注册申请表';
    confidence = 0.9;
  } else if (lowerName.includes('说明书') || lowerName.includes('manual') || lowerName.includes('instruction')) {
    suggestedCategories = [mockCategories[1]];
    suggestedDescription = '产品使用说明书文档';
    confidence = 0.95;
  } else if (lowerName.includes('检测') || lowerName.includes('test') || lowerName.includes('report')) {
    suggestedCategories = [mockCategories[3]];
    suggestedDescription = '第三方检测报告文档';
    confidence = 0.85;
  } else if (lowerName.includes('设计') || lowerName.includes('design') || lowerName.includes('图')) {
    suggestedCategories = [mockCategories[4]];
    suggestedDescription = '产品设计图纸文档';
    confidence = 0.8;
  } else if (lowerName.includes('临床') || lowerName.includes('clinical')) {
    suggestedCategories = [mockCategories[5]];
    suggestedDescription = '临床试验相关文档';
    confidence = 0.88;
  } else {
    suggestedCategories = [mockCategories[2]];
    suggestedDescription = '技术文档资料';
    confidence = 0.6;
  }

  // 清理文件名
  suggestedName = suggestedName
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    suggestedName,
    suggestedDescription,
    suggestedCategories,
    confidence
  };
};

// Mock预备区文件存储
let mockStagingFiles: StagingFile[] = [
  // 就绪状态的文件 - 有智能建议
  {
    id: 'staging-demo-001',
    projectId: 'project-001', // 假设项目ID是project-001
    originalFileName: '产品说明书v2.0.pdf',
    name: '产品使用说明书 v2.0',
    description: '血压计产品详细使用说明，包含操作方法、注意事项等',
    category: mockCategories[1], // 产品说明书
    fileSize: 2048576, // 2MB
    fileType: 'application/pdf',
    uploadStatus: UploadStatus.READY,
    uploadProgress: 100,
    uploadUrl: 'mock://file1.pdf',
    thumbnailUrl: GRAY_THUMBNAIL,
    smartSuggestions: {
      suggestedName: '血压计产品使用说明书 v2.0',
      suggestedDescription: '血压计产品详细使用说明文档，包含安装、操作、维护等完整内容',
      suggestedCategories: [mockCategories[1]],
      confidence: 0.95
    },
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5分钟前
    updatedAt: new Date(Date.now() - 300000).toISOString()
  },
  
  // 就绪状态的文件 - 未编辑
  {
    id: 'staging-demo-002',
    projectId: 'project-001',
    originalFileName: 'medical_device_application_form.doc',
    name: 'medical device application form',
    description: '',
    category: null,
    fileSize: 512000, // 512KB
    fileType: 'application/msword',
    uploadStatus: UploadStatus.READY,
    uploadProgress: 100,
    uploadUrl: 'mock://file2.doc',
    thumbnailUrl: GRAY_THUMBNAIL,
    smartSuggestions: {
      suggestedName: '医疗器械注册申请表',
      suggestedDescription: '医疗器械注册申请表格文档',
      suggestedCategories: [mockCategories[0]], // 申请表
      confidence: 0.88
    },
    createdAt: new Date(Date.now() - 600000).toISOString(), // 10分钟前
    updatedAt: new Date(Date.now() - 600000).toISOString()
  },
  
  // 分析中状态
  {
    id: 'staging-demo-003',
    projectId: 'project-001',
    originalFileName: '检测报告_2024_001.pdf',
    name: '检测报告 2024 001',
    description: '',
    category: null,
    fileSize: 1536000, // 1.5MB
    fileType: 'application/pdf',
    uploadStatus: UploadStatus.ANALYZING,
    uploadProgress: 100,
    uploadUrl: 'mock://file3.pdf',
    thumbnailUrl: GRAY_THUMBNAIL,
    createdAt: new Date(Date.now() - 120000).toISOString(), // 2分钟前
    updatedAt: new Date(Date.now() - 120000).toISOString()
  },
  
  // 上传中状态
  {
    id: 'staging-demo-004',
    projectId: 'project-001',
    originalFileName: '设计图纸_CAD_final.dwg',
    name: '设计图纸 CAD final',
    description: '',
    category: null,
    fileSize: 5242880, // 5MB
    fileType: 'application/octet-stream',
    uploadStatus: UploadStatus.UPLOADING,
    uploadProgress: 65,
    uploadUrl: '',
    thumbnailUrl: GRAY_THUMBNAIL,
    createdAt: new Date(Date.now() - 30000).toISOString(), // 30秒前
    updatedAt: new Date(Date.now() - 30000).toISOString()
  },
  
  // 失败状态
  {
    id: 'staging-demo-005',
    projectId: 'project-001',
    originalFileName: 'large_file.zip',
    name: 'large file',
    description: '',
    category: null,
    fileSize: 52428800, // 50MB
    fileType: 'application/zip',
    uploadStatus: UploadStatus.FAILED,
    uploadProgress: 0,
    error: '文件大小超过50MB限制',
    uploadUrl: '',
    thumbnailUrl: GRAY_THUMBNAIL,
    createdAt: new Date(Date.now() - 180000).toISOString(), // 3分钟前
    updatedAt: new Date(Date.now() - 180000).toISOString()
  },
  
  // 就绪状态 - 已完整编辑
  {
    id: 'staging-demo-006',
    projectId: 'project-001',
    originalFileName: 'clinical_trial_report.pdf',
    name: '临床试验报告',
    description: '血压计临床试验完整报告，包含试验设计、结果分析、安全性评估等内容',
    category: mockCategories[5], // 临床试验
    fileSize: 3145728, // 3MB
    fileType: 'application/pdf',
    uploadStatus: UploadStatus.READY,
    uploadProgress: 100,
    uploadUrl: 'mock://file6.pdf',
    thumbnailUrl: GRAY_THUMBNAIL,
    smartSuggestions: {
      suggestedName: '血压计临床试验报告',
      suggestedDescription: '血压计临床试验报告文档，包含完整的试验数据和分析结果',
      suggestedCategories: [mockCategories[5]],
      confidence: 0.92
    },
    createdAt: new Date(Date.now() - 900000).toISOString(), // 15分钟前
    updatedAt: new Date(Date.now() - 60000).toISOString() // 1分钟前更新
  }
];

// 模拟上传延迟
const simulateUpload = (file: StagingFile): Promise<void> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      file.uploadProgress = Math.min(progress, 100);
      
      if (progress >= 100) {
        clearInterval(interval);
        file.uploadStatus = UploadStatus.COMPLETED;
        
        // 模拟后端分析
        setTimeout(() => {
          file.uploadStatus = UploadStatus.ANALYZING;
          
          // 模拟分析完成
          setTimeout(() => {
            file.smartSuggestions = generateSmartSuggestions(file.originalFileName, file.fileType);
            file.uploadStatus = UploadStatus.READY;
            resolve();
          }, 2000); // 2秒分析时间
        }, 500);
      }
    }, 200); // 每200ms更新一次进度
  });
};

export const stagingAPI = {
  // 获取预备区文件列表
  async getFiles(query: StagingFilesQuery): Promise<StagingFile[]> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 模拟动态状态变化
    const now = Date.now();
    const analyzingFile = mockStagingFiles.find(f => f.id === 'staging-demo-003');
    if (analyzingFile && analyzingFile.uploadStatus === UploadStatus.ANALYZING) {
      const createdTime = new Date(analyzingFile.createdAt).getTime();
      // 如果分析中文件已经超过5秒，自动完成分析
      if (now - createdTime > 5000) {
        analyzingFile.uploadStatus = UploadStatus.READY;
        analyzingFile.smartSuggestions = generateSmartSuggestions(analyzingFile.originalFileName, analyzingFile.fileType);
        analyzingFile.updatedAt = new Date().toISOString();
      }
    }
    
    // 模拟上传进度
    const uploadingFile = mockStagingFiles.find(f => f.id === 'staging-demo-004');
    if (uploadingFile && uploadingFile.uploadStatus === UploadStatus.UPLOADING) {
      const createdTime = new Date(uploadingFile.createdAt).getTime();
      const elapsed = now - createdTime;
      const progress = Math.min(65 + (elapsed / 1000) * 5, 100); // 每秒增加5%
      uploadingFile.uploadProgress = Math.floor(progress);
      
      if (progress >= 100) {
        uploadingFile.uploadStatus = UploadStatus.ANALYZING;
        uploadingFile.updatedAt = new Date().toISOString();
      }
    }
    
    // 为所有项目返回demo数据（用于演示）
    let filteredFiles = mockStagingFiles.map(file => ({
      ...file,
      projectId: query.projectId // 将projectId设置为当前查询的项目ID
    }));
    
    // 状态筛选
    if (query.status && query.status.length > 0) {
      filteredFiles = filteredFiles.filter(file => query.status!.includes(file.uploadStatus));
    }
    
    // 分类筛选
    if (query.category && query.category.length > 0) {
      filteredFiles = filteredFiles.filter(file => 
        file.category && query.category!.includes(file.category.id)
      );
    }
    
    // 关键词搜索
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filteredFiles = filteredFiles.filter(file =>
        file.name.toLowerCase().includes(keyword) ||
        file.description.toLowerCase().includes(keyword) ||
        file.originalFileName.toLowerCase().includes(keyword)
      );
    }
    
    // 分页
    if (query.limit && query.offset !== undefined) {
      filteredFiles = filteredFiles.slice(query.offset, query.offset + query.limit);
    }
    
    return filteredFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // 上传文件到预备区
  async uploadFiles(request: FileUploadRequest): Promise<FileUploadResponse> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stagingFiles: StagingFile[] = [];
    const failedFiles: { fileName: string; error: string }[] = [];
    
    for (const file of request.files) {
      // 文件验证
      if (file.size > 50 * 1024 * 1024) { // 50MB限制
        failedFiles.push({
          fileName: file.name,
          error: '文件大小超过50MB限制'
        });
        continue;
      }
      
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        failedFiles.push({
          fileName: file.name,
          error: '不支持的文件类型'
        });
        continue;
      }
      
      // 创建预备区文件对象
      const stagingFile: StagingFile = {
        id: generateId(),
        projectId: request.projectId,
        originalFileName: file.name,
        name: file.name.replace(/\.[^/.]+$/, ""), // 默认移除扩展名
        description: '',
        category: null,
        fileSize: file.size,
        fileType: file.type,
        uploadStatus: UploadStatus.UPLOADING,
        uploadProgress: 0,
        uploadUrl: URL.createObjectURL(file), // Mock URL
        thumbnailUrl: GRAY_THUMBNAIL, // 灰色缩略图
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      stagingFiles.push(stagingFile);
      mockStagingFiles.push(stagingFile);
      
      // 开始模拟上传
      simulateUpload(stagingFile);
    }
    
    return { stagingFiles, failedFiles };
  },

  // 更新预备区文件信息
  async updateFile(fileId: string, updates: Partial<Pick<StagingFile, 'name' | 'description' | 'category'>>): Promise<void> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const fileIndex = mockStagingFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      throw new Error('文件不存在');
    }
    
    mockStagingFiles[fileIndex] = {
      ...mockStagingFiles[fileIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
  },

  // 批量更新文件信息
  async batchUpdateFiles(fileIds: string[], updates: Partial<Pick<StagingFile, 'name' | 'description' | 'category'>>): Promise<void> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const fileId of fileIds) {
      const fileIndex = mockStagingFiles.findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
        mockStagingFiles[fileIndex] = {
          ...mockStagingFiles[fileIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    }
  },

  // 删除预备区文件
  async deleteFile(fileId: string): Promise<void> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    mockStagingFiles = mockStagingFiles.filter(f => f.id !== fileId);
  },

  // 批量删除预备区文件
  async deleteFiles(fileIds: string[]): Promise<void> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    mockStagingFiles = mockStagingFiles.filter(f => !fileIds.includes(f.id));
  },

  // 确认文件，转移到正式文件列表
  async confirmFiles(request: ConfirmFilesRequest): Promise<void> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const filesToConfirm = mockStagingFiles.filter(f => 
      f.projectId === request.projectId && 
      request.stagingFileIds.includes(f.id) &&
      f.uploadStatus === UploadStatus.READY
    );
    
    if (filesToConfirm.length === 0) {
      throw new Error('没有可确认的文件');
    }
    
    // 验证必填信息
    for (const file of filesToConfirm) {
      if (!file.name.trim()) {
        throw new Error(`文件"${file.originalFileName}"缺少文件名`);
      }
      if (!file.category) {
        throw new Error(`文件"${file.originalFileName}"缺少分类信息`);
      }
      if (!file.description.trim()) {
        throw new Error(`文件"${file.originalFileName}"缺少描述信息`);
      }
    }
    
    // 模拟转移到正式文件列表（实际项目中会调用fileAPI.createFile）
    console.log('确认文件并转移到正式列表:', filesToConfirm);
    
    // 从预备区移除已确认的文件
    mockStagingFiles = mockStagingFiles.filter(f => !request.stagingFileIds.includes(f.id));
  },

  // 应用智能建议
  async applySuggestion(fileId: string, suggestionType: 'name' | 'description' | 'category'): Promise<void> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const fileIndex = mockStagingFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1 || !mockStagingFiles[fileIndex].smartSuggestions) {
      throw new Error('文件不存在或没有智能建议');
    }
    
    const file = mockStagingFiles[fileIndex];
    const suggestions = file.smartSuggestions!;
    
    switch (suggestionType) {
      case 'name':
        file.name = suggestions.suggestedName;
        break;
      case 'description':
        file.description = suggestions.suggestedDescription;
        break;
      case 'category':
        file.category = suggestions.suggestedCategories[0] || null;
        break;
    }
    
    file.updatedAt = new Date().toISOString();
  },

  // 获取单个文件详情
  async getFile(fileId: string): Promise<StagingFile | null> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockStagingFiles.find(f => f.id === fileId) || null;
  },

  // 清空项目的预备区
  async clearProject(projectId: string): Promise<void> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    mockStagingFiles = mockStagingFiles.filter(f => f.projectId !== projectId);
  },

  // 获取项目预备区统计信息
  async getProjectStats(projectId: string): Promise<{
    total: number;
    pending: number;
    uploading: number;
    analyzing: number;
    ready: number;
    failed: number;
  }> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const projectFiles = mockStagingFiles.filter(f => f.projectId === projectId);
    
    return {
      total: projectFiles.length,
      pending: projectFiles.filter(f => f.uploadStatus === UploadStatus.PENDING).length,
      uploading: projectFiles.filter(f => f.uploadStatus === UploadStatus.UPLOADING).length,
      analyzing: projectFiles.filter(f => f.uploadStatus === UploadStatus.ANALYZING).length,
      ready: projectFiles.filter(f => f.uploadStatus === UploadStatus.READY).length,
      failed: projectFiles.filter(f => f.uploadStatus === UploadStatus.FAILED).length,
    };
  }
}; 