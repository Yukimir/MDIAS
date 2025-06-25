# M.D.I.A.S. - Medical Device Intelligent Approval System

医疗器械智能审批系统是一个现代化的React应用程序，用于管理医疗器械审批流程。

## 特性

- 🏥 **项目管理** - 完整的医疗器械项目生命周期管理
- 📁 **文件分类** - 灵活的文件分类系统，支持必须/可选分类
- 🔄 **四阶段审批** - 提交 → 预审 → 复审 → 许可的完整流程
- 🤖 **智能上传** - 带有文件预备区的智能上传功能
- 🌍 **多语言支持** - 中文、英文、阿拉伯语（支持RTL）
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 📋 **文件预览** - 内置PDF预览功能

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design
- **路由**: React Router
- **国际化**: react-i18next
- **状态管理**: Zustand
- **拖拽功能**: react-dnd
- **HTTP客户端**: Axios

## 本地开发

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装和运行

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd SFDA/medical-device-approval

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## GitHub Pages 部署

本项目配置了自动部署到GitHub Pages的GitHub Actions工作流。

### 部署配置

1. **仓库设置**: 确保仓库名为 `SFDA`
2. **GitHub Pages**: 在仓库设置中启用GitHub Pages，源选择"GitHub Actions"
3. **自动部署**: 推送到main分支时自动触发部署

### 部署流程

工作流文件位于 `.github/workflows/deploy.yml`，包含以下步骤：

1. 检出代码
2. 设置Node.js环境
3. 安装依赖
4. 构建项目
5. 部署到GitHub Pages

### 访问地址

部署成功后，可通过以下地址访问：
```
https://<username>.github.io/SFDA/
```

## 项目结构

```
medical-device-approval/
├── public/                 # 静态资源
│   └── SDWH-M202103428-3-En.pdf  # 示例PDF文件
├── src/
│   ├── components/         # React组件
│   ├── hooks/             # 自定义Hooks
│   ├── layouts/           # 布局组件
│   ├── locales/           # 国际化翻译文件
│   ├── mocks/             # Mock数据
│   ├── pages/             # 页面组件
│   ├── services/          # API服务
│   ├── stores/            # 状态管理
│   ├── types/             # TypeScript类型定义
│   └── utils/             # 工具函数
├── .github/workflows/     # GitHub Actions工作流
├── package.json
├── vite.config.ts         # Vite配置
└── README.md
```

## 核心功能模块

### 1. 项目管理
- 项目列表展示
- 项目详情查看
- 文件齐全性检查
- 项目状态管理

### 2. 文件管理
- 文件上传和分类
- 文件状态跟踪（提交、预审、复审、批准、驳回、废弃）
- 文件预览功能
- 智能上传预备区

### 3. 审批流程
- 四阶段审批工作流
- 审批意见记录
- 通过/驳回操作
- 审批历史追踪

### 4. 分类管理
- 动态分类配置
- 必须/可选分类设置
- 拖拽排序

## 开发指南

### 添加新页面

1. 在 `src/pages/` 中创建页面组件
2. 在 `src/utils/router.tsx` 中添加路由配置
3. 更新导航菜单（如需要）

### 添加新语言

1. 在 `src/locales/` 中创建语言文件夹
2. 添加翻译文件
3. 在 `src/utils/i18n.ts` 中注册新语言

### 自定义主题

修改 `src/index.css` 中的CSS变量来自定义主题。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进项目。
