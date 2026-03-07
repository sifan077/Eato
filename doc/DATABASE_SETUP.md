# 数据库和存储配置说明

## 已完成的工作

### 1. 数据库 Schema (supabase-schema.sql)

已创建 `meal_logs` 表，包含以下字段：

- `id`: UUID 主键
- `user_id`: 用户 ID（关联 auth.users）
- `photo_paths`: 照片路径数组（必填，支持多图）
- `content`: 简短描述（可选）
- `meal_type`: 餐次类型（必填，6种类型）
- `eaten_at`: 进餐时间（默认当前时间，北京时间）
- `location`: 地点（可选）
- `tags`: 标签数组（可选）
- `price`: 价格（可选，默认 0，用于记录消费）
- `created_at`: 创建时间
- `updated_at`: 更新时间

**餐次类型：**

- `breakfast`: 早餐 🌅 (5:00-9:59)
- `lunch`: 午餐 🍜 (10:00-14:59)
- `dinner`: 晚餐 🍽️ (15:00-22:59)
- `snack`: 今日总结 📊 (全天)

### 2. RLS 策略

已启用行级安全（RLS），确保用户只能访问自己的数据：

- SELECT: 只能查看自己的记录
- INSERT: 只能插入自己的记录
- UPDATE: 只能更新自己的记录
- DELETE: 只能删除自己的记录

### 3. 索引优化

已创建以下索引以提升查询性能：

- `idx_meal_logs_user_id`: 用户 ID
- `idx_meal_logs_eaten_at`: 进餐时间
- `idx_meal_logs_meal_type`: 餐次类型
- `idx_meal_logs_tags`: 标签（GIN 索引）

### 4. 类型定义 (src/lib/types.ts)

已定义 TypeScript 类型：

- `MealLog`: 饮食记录类型（支持多图）
- `MealType`: 餐次类型（6种）
- `MealLogInput`: 创建记录输入
- `MealLogUpdate`: 更新记录输入

### 5. 常量定义 (src/lib/constants.ts)

已定义业务常量：

- `MEAL_TYPES`: 餐次类型数组（6种）
- `TAG_SUGGESTIONS`: 标签建议
- `STORAGE_BUCKET`: Storage bucket 名称
- `MEAL_TIME_RANGES`: 餐次时间范围

### 6. 工具函数

#### 日期工具 (src/utils/date.ts)

- `getStartOfDay()`: 获取一天开始时间（北京时间）
- `getEndOfDay()`: 获取一天结束时间（北京时间）
- `detectMealType()`: 根据北京时间自动判断餐次
- `formatDateDisplay()`: 格式化日期显示
- `formatTimeDisplay()`: 格式化时间显示
- `isSameDay()`: 判断是否同一天
- `getDaysBetween()`: 计算日期差

#### Storage 工具 (src/utils/supabase/storage.ts)

- `generatePhotoPath()`: 生成照片路径
- `getPhotoPublicUrl()`: 获取照片公共 URL
- `getFileExtension()`: 获取文件扩展名
- `isValidImageFile()`: 验证图片文件类型
- `isValidFileSize()`: 验证文件大小

### 7. Server Actions (src/app/actions.ts)

已实现饮食记录的 CRUD 操作：

- `getTodayMealLogs()`: 获取今日记录
- `getMealLogsByDate()`: 按日期范围获取记录
- `getMealLogById()`: 根据 ID 获取单条记录
- `createMealLog()`: 创建新记录（支持多图上传）
- `updateMealLog()`: 更新记录
- `deleteMealLog()`: 删除记录（包括多张照片）
- `searchMealLogs()`: 关键词搜索
- `searchMealLogsByTags()`: 标签搜索

## 需要在 Supabase Dashboard 手动完成的操作

### 1. 执行数据库 Schema

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → SQL Editor
3. 复制 `supabase-schema.sql` 的内容
4. 点击 "Run" 执行

### 2. 创建 Storage Bucket

1. 进入 Storage 页面
2. 点击 "New bucket"
3. 配置：
   - Name: `meal-photos`
   - Public: ❌（私有，确保安全）
   - File size limit: 10MB
   - Allowed MIME types: `image/*`
4. 点击 "Create bucket"

**安全说明：**

- 将 bucket 设置为私有（Public: ❌）可以防止未授权访问和盗刷
- 图片通过签名 URL 访问，每次请求都会验证用户权限
- 签名 URL 有效期为 24 小时，过期后需要重新生成
- 支持多图上传，每张图片独立存储

### 3. 配置 Storage Policies

在 Storage → Policies 页面，为 `meal-photos` bucket 创建以下策略：

#### 策略 1: 允许用户上传照片

- Name: `Users can upload own photos`
- Operation: INSERT
- Target: bucket_id = 'meal-photos'
- Using expression:

```sql
(auth.uid()::text = (storage.foldername(name))[1])
```

#### 策略 2: 允许用户查看自己的照片

- Name: `Users can view own photos`
- Operation: SELECT
- Target: bucket_id = 'meal-photos'
- Using expression:

```sql
(auth.uid()::text = (storage.foldername(name))[1])
```

#### 策略 3: 允许用户删除自己的照片

- Name: `Users can delete own photos`
- Operation: DELETE
- Target: bucket_id = 'meal-photos'
- Using expression:

```sql
(auth.uid()::text = (storage.foldername(name))[1])
```

**安全机制说明：**

1. **RLS 策略**：确保用户只能访问自己文件夹下的照片
2. **签名 URL**：每次访问图片都需要服务端生成带签名的临时 URL
3. **有效期限制**：签名 URL 有效期 24 小时，防止长期滥用
4. **路径隔离**：每个用户的照片存储在独立的文件夹中（`{user_id}/`）
5. **权限验证**：所有操作都通过 Supabase Auth 验证用户身份
6. **多图支持**：每条记录可以包含多张照片，每张独立管理

## 验证配置

完成上述步骤后，可以验证配置是否正确：

1. 检查数据库表是否创建成功：

   ```sql
   SELECT * FROM meal_logs LIMIT 1;
   ```

2. 检查 RLS 策略是否生效：

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'meal_logs';
   ```

3. 检查 Storage bucket 是否创建成功：
   - 在 Dashboard 的 Storage 页面查看 bucket 列表

4. 检查 Storage policies 是否生效：
   - 在 Storage → Policies 页面查看策略列表

## 已实现的功能

1. ✅ 用户认证（邮箱登录/登出）
2. ✅ 今日记录页面
3. ✅ 快速记录表单
4. ✅ 文件上传（支持多图）
5. ✅ 图片自动压缩
6. ✅ 多图上传和展示
7. ✅ 餐次选择（6种类型）
8. ✅ 北京时间支持
9. ✅ 安全的图片访问（签名 URL）
10. ✅ 编辑页面（`/edit/[id]`）
11. ✅ 价格记录功能（可选，默认 0）

## 下一步计划

数据库和存储配置完成后，可以继续实现：

1. 导航栏（页面间导航）
2. `/calendar` 页面：按日期浏览历史
3. `/search` 页面：关键词搜索
4. `/stats` 页面：统计功能
5. 注册功能（用户注册）
