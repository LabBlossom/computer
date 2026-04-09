# 社区活动地图（GitHub Pages 可用）

这是一个**纯静态**网站（无需后端），实现：

- 首页：**中国地图可点省份**（ECharts）+ 省份按钮
- 省页：背景图 +（可选）省内地图 + **城市按钮可点**
- 城市页：背景图 + 活动推荐（社区名/地点/计划人数/已报名人数）
- 活动详情：未登录可看详情，但**不能报名**（右上角登录/注册）

## 运行方式（本地）

因为是纯静态文件，你可以用任意静态服务器打开：

- 直接双击 `index.html` 也能跑（浏览器可能对模块加载有限制）
- 推荐用 VSCode/Live Server 或任意 http server

## 部署到 GitHub Pages

1. 新建一个仓库，把这些文件全部提交上去
2. 进入 GitHub 仓库 Settings → Pages
3. Source 选择 `Deploy from a branch`，Branch 选择 `main` + `/root`
4. 保存后等待生成 Pages 地址

## 如何替换图片

图片都在 `assets/` 下，默认使用占位图。你可以：

- 用你自己的图片**替换同名文件**（最简单）
- 或者在 `src/data.js` 里改 `heroImage / coverImage` 的路径

## 如何改省/市/活动数据

编辑 `src/data.js` 的 `DB`：

- `provinces[]`：省（`id`、`name`、`cities[]`）
- `cities[]`：市（`id`、`name`、`activities[]`）
- `activities[]`：活动（标题、社区名、地点、计划/已报名、时间、详情、封面图）

## 省内地图（可选）

首页用的是 ECharts 的 `china.js`，可以直接点省份。

省页会尝试按需加载省级地图脚本（从 jsDelivr），映射在：

- `src/app.js` → `ECHARTS_PROVINCE_MAP_JS`

如果加载失败，会自动降级为右侧城市按钮列表（功能不受影响）。

