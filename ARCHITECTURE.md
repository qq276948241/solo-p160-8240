# 绘本漂流 - 项目架构说明

## 这个项目是干嘛的

一个小区二手绘本交易平台。家长可以把孩子看过的绘本挂上来卖或者免费送，也能按年龄段（0-3岁、3-6岁、6岁以上）和交易类型（免费送/付费转让）找书。核心功能就是注册登录、发布绘本、列表筛选、查看详情、收藏和留言联系卖家。

## 技术栈

- **前端**：Vue 3 + Vite + TypeScript + Tailwind CSS + Vue Router
- **后端**：Node.js + Express 4 + TypeScript
- **数据存储**：JSON 文件，没有数据库
- **图标**：lucide-vue-next

## 数据流向（重点）

以「发布一本绘本」为例，完整的请求链路：

```
用户在 BookForm.vue 选好封面图、填完表单，点"发布绘本"
  │
  ▼
BookForm.vue 的 handleSubmit() 把表单字段 + 封面文件打包成 FormData
  │  fetch('/api/books', { method: 'POST', body: formData })
  ▼
Vite 开发服务器拦截 /api 开头的请求，代理到 localhost:3001（见 vite.config.ts 的 server.proxy）
  │
  ▼
Express 后端 app.ts 收到请求，经过 cors → express.json → express.static 中间件
  │
  ▼
路由匹配到 api/routes/books.ts 的 POST '/'，先经过 coverUpload.single('cover') 这个 multer 中间件
  │  multer 做三件事：校验文件格式(jpg/png)、限制大小(≤2MB)、把文件存到 public/uploads/ 目录
  ▼
books.ts 的处理函数从 req.body 取表单字段，从 req.file 取上传后的文件名
  │  调用 bookStorage.readAll() 读出当前所有绘本
  │  往数组里 push 新绘本对象
  │  调用 bookStorage.writeAll() 把整个数组写回 books.json
  ▼
返回 { success: true, data: 新绘本对象 } 给前端
  │
  ▼
BookForm.vue emit('submit', book)，PublishPage.vue 收到事件后 router.push 跳转到详情页
```

其他操作（登录、收藏、留言）的链路完全一样，只是经过不同的路由文件和 storage 方法。

**本地开发时**，前端跑在 Vite（默认 5173+ 端口），`/api/*` 请求被 Vite proxy 转发到后端（3001 端口）。**部署后**，Vercel 的 vercel.json 配置了 `/api/*` 走 serverless function，`/uploads/*` 走后端的 express.static 静态文件服务。

## 目录结构

```
project160/
├── api/                    ← 后端全部代码
│   ├── data/               ← 四个 JSON 文件，就是"数据库"
│   │   ├── users.json          用户信息（用户名、密码、昵称、手机号）
│   │   ├── books.json          绘本信息（标题、作者、封面、价格、年龄段等）
│   │   ├── favorites.json      收藏记录（谁收藏了哪本书）
│   │   └── messages.json       留言记录（谁在哪本书下留了什么话）
│   ├── routes/             ← 四个路由文件，按业务分
│   │   ├── users.ts            注册、登录、获取用户信息、我的发布、我的收藏
│   │   ├── books.ts            绘本列表(含筛选)、绘本详情、发布绘本(含上传)、删除绘本
│   │   ├── favorites.ts        收藏、取消收藏、检查是否已收藏
│   │   └── messages.ts         获取某本书的留言、发布留言
│   ├── utils/              ← 公共工具方法
│   │   ├── storage.ts          JSON 文件读写封装、ID 生成
│   │   └── upload.ts           multer 配置、封面文件路径处理、封面删除
│   ├── app.ts              ← Express 应用入口，挂中间件、路由、静态文件服务、错误处理
│   ├── server.ts           ← 启动 HTTP 服务器，监听端口
│   └── index.ts            ← Vercel serverless 入口
│
├── shared/                 ← 前后端共享的 TypeScript 类型定义
│   └── index.ts                Book、User、Favorite、Message、ApiResponse、CreateBookRequest 等
│
├── src/                    ← 前端全部代码
│   ├── components/         ← 可复用组件
│   │   ├── BookCard.vue        绘本卡片（列表页每本书的展示卡片）
│   │   ├── BookForm.vue        发布表单（封面选择、字段填写、FormData 提交）
│   │   └── NavBar.vue          顶部导航栏（Logo、搜索框、登录/发布按钮）
│   ├── composables/        ← Vue 组合式函数
│   │   └── useAuth.ts          用户登录状态管理（currentUser、isLoggedIn、login、logout）
│   ├── pages/              ← 页面组件，每个对应一个路由
│   │   ├── HomePage.vue        首页（绘本列表 + 年龄段/类型筛选）
│   │   ├── BookDetailPage.vue  详情页（绘本信息 + 卖家联系方式 + 收藏 + 留言）
│   │   ├── PublishPage.vue     发布页（页面壳，表单逻辑在 BookForm.vue 里）
│   │   ├── LoginPage.vue       登录页
│   │   ├── RegisterPage.vue    注册页
│   │   └── MinePage.vue        个人中心（我的发布、我的收藏）
│   ├── router/
│   │   └── index.ts            路由配置，含登录守卫（需要登录的页面自动跳转登录页）
│   ├── utils/
│   │   └── request.ts          HTTP 请求封装（get / post / del，自动拼 query 和序列化 body）
│   ├── App.vue             ← 根组件（NavBar + RouterView + 底部 Footer）
│   ├── main.ts             ← Vue 应用入口
│   └── style.css           ← Tailwind 指令 + 自定义组件样式类
│
├── public/
│   └── uploads/            ← 用户上传的封面图片存这里（git 已忽略）
│
├── vite.config.ts          ← Vite 配置（@ 别名、/api 代理到 3001 端口）
├── tailwind.config.js      ← Tailwind 配置（主题色 primary、自定义动画）
├── vercel.json             ← Vercel 部署配置
└── tsconfig.json           ← TypeScript 配置
```

## 关键文件的核心逻辑

### api/utils/storage.ts — JSON 文件读写

这个文件封装了所有和 JSON 文件打交道的逻辑。核心就是两个内部函数：

- `readJSON(filename)` — 读 `api/data/xxx.json`，文件不存在就返回空数组，JSON 解析出错也返回空数组（不会崩）
- `writeJSON(filename, data)` — 把数据序列化成格式化 JSON（2 空格缩进）写回文件

对外暴露四个 storage 对象（userStorage、bookStorage、favoriteStorage、messageStorage），每个都有 `readAll()` 和 `writeAll()` 两个方法。还有一个 `generateId(prefix)` 用来生成 `book_1719567890123_a3f2k1` 这种 ID。

**注意**：目前的读写方式是「全量读 → 改内存数组 → 全量写」，对于这个小项目够用了。但如果以后并发量大，可能会出现两个人同时发布绘本、后写的那个人覆盖掉先写的数据。要解决的话可以加文件锁或者换数据库。

### api/utils/upload.ts — 文件上传处理

用 multer 库处理文件上传，做了三重限制：
- `fileFilter` — 只允许 jpg/jpeg/png 格式
- `limits.fileSize` — 最大 2MB
- `diskStorage` — 文件存到 `public/uploads/`，文件名用 `cover_时间戳_随机串.ext` 避免冲突

还暴露了 `deleteCoverFile(coverUrl)` 方法，删除绘本时用来同步清理封面文件。

### src/composables/useAuth.ts — 登录状态管理

用 Vue 的 `ref` 维护 `currentUser` 对象，同时 `watch` 它的变化自动同步到 `localStorage`。这样刷新页面后登录状态不会丢。整个应用里所有需要判断「有没有登录」「当前用户是谁」的地方都从这里取。

### shared/index.ts — 前后端共享类型

前后端都 import 这个文件。Book、User 这些是数据模型，`ApiResponse<T>` 是接口返回的统一格式，`CreateBookRequest` 是发布绘本时 FormData 传过来的字段类型（`isFree` 和 `price` 是 `boolean | string` 因为 FormData 传过来全是 string）。

## 本地怎么跑起来

```bash
# 1. 装依赖
npm install

# 2. 同时启动前端和后端（前端 Vite + 后端 nodemon 热重启）
npm run dev
# 前端默认跑在 http://localhost:5173（端口被占会自动+1）
# 后端跑在 http://localhost:3001

# 3. 只跑类型检查
npm run check

# 4. 打包构建
npm run build
```

测试账号：`parent1` / `123456`、`parent2` / `123456`、`parent3` / `123456`

## 新加功能要动哪些地方

假设要加一个「绘本分类标签」功能：

| 步骤 | 改哪个文件 | 改什么 |
|------|-----------|--------|
| 1 | shared/index.ts | Book 类型上加新字段，如果需要新请求类型也在这里加 |
| 2 | api/data/books.json | 给现有数据补上新字段的值 |
| 3 | api/routes/books.ts | 对应的 GET/POST 路由里处理新字段的读写 |
| 4 | api/utils/storage.ts | 一般不用动，除非要加新的 JSON 文件 |
| 5 | src/components/BookForm.vue | 发布表单加上新字段的输入控件 |
| 6 | src/components/BookCard.vue | 列表卡片上展示新字段 |
| 7 | src/pages/BookDetailPage.vue | 详情页展示新字段 |
| 8 | src/pages/HomePage.vue | 如果新字段要作为筛选条件，在首页筛选栏加 |

基本上就是 **shared 类型 → 后端路由 → 前端组件** 这条线顺着改，前后端类型定义共享所以不会对不上。
