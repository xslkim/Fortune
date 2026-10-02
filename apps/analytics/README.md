# 访问统计服务（Web）

本地轻量后台：采集 Web 端页面/题目访问，用 Token 登录查看汇总。

## 运行

```bash
# 仓库根目录
ANALYTICS_TOKEN=your-secret npm run analytics

# 浏览器打开
# http://localhost:8472/
```

默认口令：`dev-token-change-me`（仅开发用）。数据文件：`apps/analytics/data/analytics.sqlite`。

环境变量：

| 变量 | 默认 | 含义 |
|---|---|---|
| `ANALYTICS_PORT` | `8472` | 监听端口 |
| `ANALYTICS_TOKEN` | `dev-token-change-me` | 管理后台 Bearer Token |
| `ANALYTICS_DATA` | `apps/analytics/data` | SQLite 目录 |

## Web 端埋点

Web 应用默认向 `http://localhost:8472` 上报。可在 [`apps/web/index.html`](../web/index.html) 覆盖：

```html
<script>window.__GEO_ANALYTICS_URL__ = 'http://127.0.0.1:8472';</script>
```

设为空字符串可关闭上报。上报失败静默忽略，不影响学习流程。

事件类型：

- `session_start`：打开应用
- `page_view`：切换 tab / 打开家长周报（`page`：lessons/quizzes/wrong/lab/netgame/explore/beauty/report）
- `quiz_view`：打开某题（`quizId` + 可选 `from`）

访客 ID 存在浏览器 `localStorage`（`gt_visitor_id`），匿名、无登录。

## API

- `POST /api/v1/events` — 采集（无需 Token）
- `GET /api/v1/stats/overview|pages|quizzes|recent` — 统计（`Authorization: Bearer <token>`）
- `GET /api/v1/health`

## 测试

```bash
npm test -w apps/analytics
```
