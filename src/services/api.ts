import type { 
  Project, 
  FileItem, 
  FileCategory, 
  PaginatedResponse, 
  ProjectSearchParams, 
  FileSearchParams,
  ApiResponse 
} from '../types';
import { mockProjects, mockFiles, mockCategories, delay } from '../mocks/data';

// API基础配置
const MOCK_DELAY = 800; // 模拟网络延迟

// 项目相关API
export const projectAPI = {
  // 获取项目列表
  async getProjects(params?: ProjectSearchParams): Promise<PaginatedResponse<Project>> {
    await delay(MOCK_DELAY);
    
    let filteredProjects = [...mockProjects];
    
    // 应用搜索过滤
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredProjects = filteredProjects.filter(
        p => p.name.toLowerCase().includes(keyword) || 
            p.code.toLowerCase().includes(keyword) ||
            p.description.toLowerCase().includes(keyword)
      );
    }
    
    if (params?.type) {
      filteredProjects = filteredProjects.filter(p => p.type === params.type);
    }
    
    if (params?.status) {
      filteredProjects = filteredProjects.filter(p => p.status === params.status);
    }
    
    if (params?.applicant) {
      filteredProjects = filteredProjects.filter(
        p => p.applicant.toLowerCase().includes(params.applicant!.toLowerCase())
      );
    }
    
    return {
      items: filteredProjects,
      pagination: {
        current: 1,
        pageSize: 10,
        total: filteredProjects.length,
        totalPages: Math.ceil(filteredProjects.length / 10)
      }
    };
  },

  // 获取单个项目详情
  async getProject(id: string): Promise<Project | null> {
    await delay(MOCK_DELAY);
    return mockProjects.find(p => p.id === id) || null;
  },

  // 创建项目
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'statistics'>): Promise<ApiResponse<Project>> {
    await delay(MOCK_DELAY);
    
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      statistics: {
        submitted: 0,
        preliminary: 0,
        review: 0,
        approved: 0,
        rejected: 0,
        deprecated: 0,
      }
    };
    
    return {
      success: true,
      data: newProject,
      message: '项目创建成功'
    };
  },

  // 更新项目
  async updateProject(id: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    await delay(MOCK_DELAY);
    
    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      return {
        success: false,
        error: '项目不存在'
      };
    }
    
    const updatedProject = {
      ...project,
      ...projectData,
      updatedAt: new Date()
    };
    
    return {
      success: true,
      data: updatedProject,
      message: '项目更新成功'
    };
  }
};

// 文件相关API
export const fileAPI = {
  // 获取文件列表
  async getFiles(params?: FileSearchParams): Promise<PaginatedResponse<FileItem>> {
    await delay(MOCK_DELAY);
    
    let filteredFiles = [...mockFiles];
    
    if (params?.projectId) {
      filteredFiles = filteredFiles.filter(f => f.projectId === params.projectId);
    }
    
    if (params?.categoryId) {
      filteredFiles = filteredFiles.filter(f => f.categoryId === params.categoryId);
    }
    
    if (params?.status) {
      filteredFiles = filteredFiles.filter(f => f.status === params.status);
    }
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredFiles = filteredFiles.filter(
        f => f.name.toLowerCase().includes(keyword) || 
            f.description.toLowerCase().includes(keyword)
      );
    }
    
    return {
      items: filteredFiles,
      pagination: {
        current: 1,
        pageSize: 20,
        total: filteredFiles.length,
        totalPages: Math.ceil(filteredFiles.length / 20)
      }
    };
  },

  // 获取项目的文件列表
  async getFilesByProject(projectId: string, params?: FileSearchParams): Promise<FileItem[]> {
    await delay(MOCK_DELAY);
    
    let filteredFiles = mockFiles.filter(f => f.projectId === projectId);
    
    if (params?.categoryId) {
      filteredFiles = filteredFiles.filter(f => f.categoryId === params.categoryId);
    }
    
    if (params?.status) {
      filteredFiles = filteredFiles.filter(f => f.status === params.status);
    }
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredFiles = filteredFiles.filter(
        f => f.name.toLowerCase().includes(keyword) || 
            f.description.toLowerCase().includes(keyword)
      );
    }
    
    return filteredFiles;
  },

  // 获取单个文件详情
  async getFile(id: string): Promise<FileItem | null> {
    await delay(MOCK_DELAY);
    return mockFiles.find(f => f.id === id) || null;
  },

  // 上传文件
  async uploadFile(formData: FormData): Promise<FileItem> {
    await delay(2000); // 模拟上传时间
    
    const projectId = formData.get('projectId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const file = formData.get('file') as File;
    
    // 创建新文件记录
    const newFile: FileItem = {
      id: `file_${Date.now()}`,
      projectId,
      name,
      description,
      categoryId,
      category: mockCategories.find(c => c.id === categoryId)!,
      status: 'submitted' as any,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'document',
      uploadedAt: new Date(),
      reviews: [],
    };
    
    // 添加到mock数据
    mockFiles.push(newFile);
    
    return newFile;
  },

  // 审批文件
  async reviewFile(fileId: string, reviewData: { action: 'approve' | 'reject'; comment?: string }): Promise<void> {
    await delay(MOCK_DELAY);
    
    const file = mockFiles.find(f => f.id === fileId);
    if (!file) {
      throw new Error('文件不存在');
    }
    
    // 更新文件状态
    file.status = reviewData.action === 'approve' ? 'approved' as any : 'rejected' as any;
    
    // 添加审批记录
    const review = {
      id: `review_${Date.now()}`,
      fileId,
      stage: file.status,
      action: reviewData.action,
      comment: reviewData.comment || '',
      reviewer: '系统管理员',
      reviewedAt: new Date(),
    };
    
    file.reviews.unshift(review);
  },

  // 废弃文件
  async deprecateFile(fileId: string): Promise<void> {
    await delay(MOCK_DELAY);
    
    const file = mockFiles.find(f => f.id === fileId);
    if (!file) {
      throw new Error('文件不存在');
    }
    
    file.status = 'deprecated' as any;
  },

  // 恢复文件
  async restoreFile(fileId: string): Promise<void> {
    await delay(MOCK_DELAY);
    
    const file = mockFiles.find(f => f.id === fileId);
    if (!file) {
      throw new Error('文件不存在');
    }
    
    // 恢复到submitted状态
    file.status = 'submitted' as any;
  },

  // 更新文件状态
  async updateFileStatus(id: string, status: string): Promise<ApiResponse<FileItem>> {
    await delay(MOCK_DELAY);
    
    const file = mockFiles.find(f => f.id === id);
    if (!file) {
      return {
        success: false,
        error: '文件不存在'
      };
    }
    
    return {
      success: true,
      data: { ...file, status: status as any },
      message: '文件状态更新成功'
    };
  },

  // 提交审批意见
  async submitReview(_fileId: string, _reviewData: any): Promise<ApiResponse> {
    await delay(MOCK_DELAY);
    
    return {
      success: true,
      message: '审批意见提交成功'
    };
  }
};

// 分类相关API
export const categoryAPI = {
  // 获取分类列表
  async getCategories(): Promise<FileCategory[]> {
    await delay(MOCK_DELAY);
    return [...mockCategories].sort((a, b) => a.order - b.order);
  },

  // 创建分类
  async createCategory(categoryData: Omit<FileCategory, 'id'>): Promise<ApiResponse<FileCategory>> {
    await delay(MOCK_DELAY);
    
    const newCategory: FileCategory = {
      ...categoryData,
      id: Date.now().toString()
    };
    
    return {
      success: true,
      data: newCategory,
      message: '分类创建成功'
    };
  },

  // 更新分类
  async updateCategory(id: string, categoryData: Partial<FileCategory>): Promise<ApiResponse<FileCategory>> {
    await delay(MOCK_DELAY);
    
    const category = mockCategories.find(c => c.id === id);
    if (!category) {
      return {
        success: false,
        error: '分类不存在'
      };
    }
    
    const updatedCategory = { ...category, ...categoryData };
    
    return {
      success: true,
      data: updatedCategory,
      message: '分类更新成功'
    };
  },

  // 删除分类
  async deleteCategory(_id: string): Promise<ApiResponse> {
    await delay(MOCK_DELAY);
    
    return {
      success: true,
      message: '分类删除成功'
    };
  }
};

// 上传相关API
export const uploadAPI = {
  // 上传ZIP文件 (预留为空实现)
  async uploadZip(file: File, projectId: string): Promise<ApiResponse> {
    await delay(2000); // 模拟上传时间
    
    // 这里是预留的空实现，仅返回成功状态
    console.log('ZIP文件上传功能预留为空，文件信息:', {
      name: file.name,
      size: file.size,
      projectId
    });
    
    return {
      success: true,
      message: 'ZIP文件上传成功（模拟）'
    };
  },

  // 获取上传历史
  async getUploadHistory(): Promise<any[]> {
    await delay(MOCK_DELAY);
    
    // 返回模拟的上传历史数据
    return [
      {
        id: '1',
        projectId: '1',
        projectName: '智能听诊器 STS-2024',
        fileName: 'documents.zip',
        fileSize: 1024000,
        uploadedAt: new Date('2024-12-20'),
        status: 'success'
      },
      {
        id: '2',
        projectId: '2',
        projectName: '便携式血压仪 BP-PRO',
        fileName: 'files.zip',
        fileSize: 2048000,
        uploadedAt: new Date('2024-12-18'),
        status: 'success'
      }
    ];
  }
}; 