<div align="center">
  <h1>Agent Job Interview</h1>
  <p><strong>Agent 岗位面试题库 + Agent 实战训练路线，一套仓库，一个 GitHub Pages。</strong></p>
  <p>
    <a href="https://harzva.github.io/Agent-Job-Interview/">统一入口</a>
    ·
    <a href="https://harzva.github.io/Agent-Job-Interview/interview/">面试题库</a>
    ·
    <a href="https://harzva.github.io/Agent-Job-Interview/practice/">实战训练</a>
  </p>
  <p>
    <img alt="GitHub Pages" src="https://img.shields.io/badge/GitHub%20Pages-online-0b7a75?style=flat-square">
    <img alt="Interview questions" src="https://img.shields.io/badge/interview-758%20questions-b23a2b?style=flat-square">
    <img alt="Practice questions" src="https://img.shields.io/badge/practice-647%20questions-315f91?style=flat-square">
    <img alt="Topics" src="https://img.shields.io/badge/topics-14-171717?style=flat-square">
  </p>
</div>

## 为什么合并

原来两个仓库分别解决两个相邻问题：

| 原仓库 | 来源版本 | 解决的问题 | 合并后的入口 |
| --- | --- | --- | --- |
| `agent-job-interview-roadmap` | `8cf6d28` | Agent 岗位、公司专项、面试题库、GitHub 项目案例 | [`/interview/`](https://harzva.github.io/Agent-Job-Interview/interview/) |
| `kimi-agent-practice-roadmap` | `4c4c4d1` | 14 个 Agent 实战主题、随机抽题、练习进度 | [`/practice/`](https://harzva.github.io/Agent-Job-Interview/practice/) |

合并后更适合作为一条完整学习路径：先用 `interview` 建立岗位画像和面试地图，再用 `practice` 做每日训练和项目复盘。

## 在线入口

| 页面 | 地址 | 用途 |
| --- | --- | --- |
| 统一首页 | <https://harzva.github.io/Agent-Job-Interview/> | 选择学习模块 |
| 面试题库 | <https://harzva.github.io/Agent-Job-Interview/interview/> | 公司专项、通用题库、学习计划 |
| 实战训练 | <https://harzva.github.io/Agent-Job-Interview/practice/> | 14 个实践维度、647 道训练题、随机抽卡 |

## 学习路径

```mermaid
flowchart LR
    A["岗位画像"] --> B["公司专项题库"]
    B --> C["能力模型"]
    C --> D["GitHub 项目案例"]
    D --> E["Agent 实战训练"]
    E --> F["随机抽题复盘"]
```

## 项目结构

```text
.
├─ docs/                  # GitHub Pages 发布目录
│  ├─ index.html          # 统一首页
│  ├─ interview/          # 面试题库静态站
│  └─ practice/           # 实战训练静态站
├─ apps/
│  ├─ interview/          # 面试题库 React + Vite 源码
│  └─ practice/           # 实战训练 React + Vite 源码
└─ README.md
```

## 本地开发

两个子应用仍然可以独立开发。

```powershell
cd apps/interview
npm install
node .\node_modules\typescript\bin\tsc -b
node .\node_modules\vite\bin\vite.js build
```

```powershell
cd apps/practice
npm install
node .\node_modules\typescript\bin\tsc -b
node .\node_modules\vite\bin\vite.js build
```

构建后把各自的 `dist/` 同步到：

- `docs/interview/`
- `docs/practice/`

## 发布说明

GitHub Pages 使用 `main` 分支的 `/docs` 目录。两个子应用都使用相对资源路径，适配项目页子路径部署。

> `practice` 模块的数据请求必须保持为 `./topics.json`；改成 `/topics.json` 会在 GitHub Pages 子路径下加载失败。

## 维护策略

- 新内容优先进入对应子应用源码，再同步静态产物到 `docs/`。
- 原独立仓库保留为历史入口或跳转入口，统一维护以 `Harzva/Agent-Job-Interview` 为主。
- 题库与训练内容用于学习和模拟，不代表任何公司官方面试题。
