---
layout: default
title: 托管对象
parent: 配置种子
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# 托管对象
{: .no_toc }

种子如何拥有它列出的对象，以及它如何避免包含密钥
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 单行部分要么全有，要么全无

`ldap`、`settings` 和 `chat` 各自都是 **单行记录**，因此种子必须声明它们的所有字段；其他部分都是列表。

省略了某个字段的种子会拒绝启动，并指出该字段：

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

请用 `""` 或 `false` 显式声明空值。有几个字段是可选的，省略时保持不变：

| 部分 | 可选字段 |
|---|---|
| `ldap` | `description`、`credential`（用于绑定的凭据）和 `groupfilter` |
| `chat` | `auth_type`、`api_version`、`request_user`、`ignore_certs` 和 `extra_headers` |
| `settings` | 无 |

`settings` 只涵盖邮件字段和 URL；其他所有设置仍可编辑。

---

## 文件中不包含密钥

每个 `${VARIABLE}` 都会被替换为对应的环境变量（在 Kubernetes 上来自 `Secret`），因此该文件可以放在 Git 中。

未设置的变量会导致 **致命错误**，因此占位符永远不会被当作密码保存。

凭据也可以使用 [密钥库](../secret-stores)（`secret_store`、`secret_ref`）；`vault_path` 将在 8 中移除。

---

## 托管对象

来自种子的对象会被标记为 **托管**：

- 它在 **每次** 启动时都会被强制应用，因此文件始终是权威来源。
- 它是只读的：API 返回 **403**，界面会禁用编辑和删除，其页面会说明它来自配置
  种子文件且为只读。
- 只有种子可以设置或清除该标记。

手动创建的对象 **永远不会被改动**，除非种子声明了同一名称。这时该记录会被 **接管**：
声明的字段会被强制应用，它也会变为只读。接管会作为警告记录到日志和审计记录中。

应用种子是幂等的：已经匹配的记录保持不变，因此重启通常会报告 `0 updated`。

缺少工作树的已声明仓库会在每次启动时 **重新克隆**，因此首次克隆失败后
会被重试。状态页面的 *仓库* 行会显示任何没有工作树的仓库。

### 删除对象

从文件中删除一个对象会 **释放** 它：记录会保留，并重新变为可编辑。删除整个部分
也是如此。

在列表部分中添加 `prune: true`，即可 **删除** 文件不再声明的托管记录：

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` 永远不会删除手动创建的记录。

### 关闭种子

取消设置 `CONFIG_SEED_PATH` **不会** 释放任何内容：种子不再被应用，它所管理的记录仍保持托管
和只读。要再次编辑它们，请先释放它们：将 `CONFIG_SEED_PATH` 指向一个不包含它们的文件（空文件不声明
任何内容，会释放所有记录），让它在启动或重新加载时应用，然后再取消设置该变量。被释放的记录保持
原样，并变为可编辑。
