# Eato - 智能饮食记录应用

一个专注于饮食记录的 Web 应用，支持拍照记录每日饮食，帮助你养成健康的饮食习惯。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v0.0.1-blue.svg)](https://github.com/sifan077/Eato/releases/tag/v0.0.1)

## ✨ 功能特点

### 核心功能

- 📸 **拍照记录** - 拍照上传美食照片，记录每一餐
- 🗜️ **图片优化** - 自动压缩和优化，节省存储空间
- 📝 **快速记录** - 简短描述，快速完成记录
- 🍽️ **餐次分类** - 6 种餐次类型，自动判断餐次
- 📅 **今日记录** - 查看今日所有饮食记录
- ✏️ **编辑完善** - 补充位置、标签、价格等详细信息
- 📆 **日历浏览** - 按日期查看历史记录
- 🔍 **智能搜索** - 关键词搜索，快速找到记录

### 统计分析

- 📊 **统计分析** - 查看饮食记录统计
- 💰 **花费统计** - 追踪饮食开销，支持今日、本周、本月和日均统计
- 🔥 **连续记录** - 记录连续打卡天数
- 🏷️ **热门标签** - 统计最常用的标签

### 用户体验

- 🌓 **暗色模式** - 支持系统级暗色模式切换
- 📱 **响应式设计** - 完美适配手机和桌面端
- 🎨 **现代化 UI** - 毛玻璃效果、渐变、流畅动画
- ⚡ **快速响应** - 优化的性能，流畅的体验

### 安全特性

- 🔒 **用户认证** - 基于 Supabase Auth
- 🛡️ **RLS 策略** - 用户只能访问自己的数据
- 🔐 **私有存储** - 照片存储在私有 bucket
- 🔑 **签名 URL** - 安全的图片访问机制
- 🚫 **防盗刷** - 签名 URL 24 小时有效期

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm（推荐）
- Supabase 账号

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
```

获取方式：

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → Settings → API
3. 复制 Project URL 和 anon/public key

### 配置数据库

详细步骤请参考 [doc/DATABASE_SETUP.md](./doc/DATABASE_SETUP.md)

简要步骤：

1. 在 Supabase Dashboard 的 SQL Editor 中执行 `supabase-schema.sql`
2. 创建名为 `meal-photos` 的 Storage bucket（私有）
3. 配置 Storage RLS 策略

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📦 技术栈

- **框架**: Next.js 16.1.1 (App Router)
- **UI 库**: React 19.2.3
- **后端服务**: Supabase (Database + Auth + Storage)
- **样式**: Tailwind CSS 4 + Typography
- **语言**: TypeScript 5
- **包管理器**: pnpm

## 🎨 设计理念

- 📱 **手机端快速记录**：拍照 → 简短描述 → 选择餐次 → 完成（3 步）
- 💻 **电脑端完善详情**：补充地点、标签等详细信息
- 🔄 **数据完整**：手机快速记录，电脑补充信息
- 📊 **可回顾**：方便查看历史记录和统计

## 📁 项目结构

```
/
├── src/
│   ├── app/                      # Next.js App Router 目录
│   │   ├── layout.tsx           # 根布局组件
│   │   ├── page.tsx             # 首页（重定向到 /today）
│   │   ├── globals.css          # 全局样式
│   │   ├── actions.ts           # Server Actions
│   │   ├── login/               # 登录页面
│   │   ├── today/               # 今日记录页面
│   │   ├── edit/                # 编辑记录页面
│   │   ├── calendar/            # 日历浏览页面
│   │   ├── search/              # 搜索页面
│   │   ├── stats/               # 统计页面
│   │   └── profile/             # 个人信息页面
│   ├── components/              # React 组件
│   │   ├── QuickRecordForm.tsx  # 快速记录表单
│   │   ├── MealCard.tsx         # 记录卡片
│   │   ├── EditForm.tsx         # 编辑表单
│   │   ├── Calendar.tsx         # 日历组件
│   │   ├── StatsCard.tsx        # 统计卡片
│   │   ├── Navbar.tsx           # 导航栏
│   │   ├── ThemeToggle.tsx      # 主题切换
│   │   └── ...
│   ├── lib/                     # 工具库
│   │   ├── constants.ts         # 常量定义
│   │   └── types.ts             # TypeScript 类型定义
│   └── utils/
│       ├── supabase/            # Supabase 工具
│       └── date.ts              # 日期工具
├── public/                      # 静态资源目录
├── doc/                         # 文档目录
├── supabase-schema.sql          # 数据库表结构
├── vercel.json                  # Vercel 配置
├── next.config.ts               # Next.js 配置
├── tailwind.config.ts           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
└── .env.example                 # 环境变量示例
```

## 🛠️ 开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 检查代码格式
pnpm format:check
```

## 📊 餐次类型

| 值          | 标签     | Emoji | 时间范围（北京时间） |
| ----------- | -------- | ----- | -------------------- |
| `breakfast` | 早餐     | 🌅    | 5:00 - 9:59          |
| `lunch`     | 午餐     | 🍜    | 10:00 - 14:59        |
| `dinner`    | 晚餐     | 🍽️    | 15:00 - 22:59        |
| `snack`     | 今日总结 | 📊    | 全天                 |

## 🔐 安全说明

### 数据安全

- 所有数据存储在 Supabase
- 启用行级安全（RLS）
- 用户只能访问自己的数据
- 照片存储在私有 bucket

### 访问控制

- 签名 URL 机制
- 24 小时有效期
- 防止未授权访问
- 防止盗刷

## 🚢 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

**Vercel 配置：**

- 禁用缓存和缓冲
- 强制动态路由

### 其他平台

支持任何支持 Next.js 的平台：

- Netlify
- Railway
- Render
- 自建服务器

## 📝 版本历史

### v0.0.1 (2026-01-03)

**初始 MVP 版本**

- ✅ 用户认证和个人信息管理
- ✅ 饮食记录（拍照、描述、餐次）
- ✅ 今日记录页面
- ✅ 编辑记录详情
- ✅ 日历浏览
- ✅ 搜索功能
- ✅ 统计分析（记录统计、花费统计）
- ✅ 暗色模式
- ✅ 响应式设计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📧 联系方式

如有问题，请提交 Issue。

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [iFlow CLI](https://github.com/iflow-ai/iflow-cli)
