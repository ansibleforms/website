---
layout: default
title: 拉取更改
parent: Git 仓库
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# 拉取更改
{: .no_toc }

定时、手动和 API 拉取，以及本地更改
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 拉取更改

仓库可以按计划拉取、在启动时拉取、从页面拉取，或者通过 API 拉取；没有 webhook 端点。

| 触发方式 | 方法 |
|---|---|
| 计划 | **启用定时拉取**并设置**拉取计划**，例如 `0 * * * *` 表示每小时一次 |
| 启动 | **应用启动时拉取**会克隆仓库，如果已经克隆则拉取它 |
| 设置页面 | 行菜单中的**拉取**，或列表上方的**全部拉取** |
| 设计器 | **加载（仓库）**，它会拉取表单仓库并重新加载设计器；获取设计器锁时也会先拉取所有表单仓库 |
| API | `POST /api/v2/repository/<name>/pull` （ `showSettings` 或 `showConnectionsSettings` ）或 `POST /api/v2/forms-repos/pull/<name>` （见下文） |

### 从流水线或 webhook 拉取

AnsibleForms 没有专门的 webhook 接收端，但 CI 作业或 git 服务器的 webhook 可以调用拉取端点。

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

按照 [API 令牌](../profile/api-token.html)中的说明创建令牌，用户的角色需要拥有 `showSettings` 或
`showConnectionsSettings` 。 `/api/v2/forms-repos/pull/<name>` 则需要 `showDesigner` 和 `allowFormDesign` ，并且设计器
已开启（ [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER) ）。 `GET /api/v2/repository/<name>` 会返回
`head` 、 `status` 和 `output` ，因此流水线可以在拉取后检查实例运行的是哪个提交。

### 本地更改

拉取从不会覆盖尚未推送的工作，因此定时拉取会在运行前检查工作树。

当工作树中有未提交的更改或未推送的提交时，以及当有设计器持有设计器锁时，定时拉取会被跳过。
对含有冲突更改的工作树进行手动拉取会失败，并提示：

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

请推送这些更改，或者用行菜单中的**重置**丢弃它们，这会删除工作树并重新克隆。
