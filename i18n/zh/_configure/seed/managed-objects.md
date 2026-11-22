---
layout: default
title: 托管对象
parent: 配置种子
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# 托管对象
{: .no_toc }

种子如何拥有它列出的对象，以及它如何避免包含密钥
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 单行部分要么全有，要么全无

`ldap`、`settings` 和 `chat_assistant`（7.8.0 之前为 `chat`）各自都是 **单行记录**，因此种子必须声明它们的所有字段。

省略了某个字段的种子会拒绝启动，并指出该字段：

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

请用 `""` 或 `false` 显式声明空值。有几个字段是可选的，省略时保持不变：

| 部分 | 可选字段 |
|---|---|
| `ldap` | `description`、`credential`（用于绑定的凭据）和 `groupfilter` |
| `chat_assistant` | `auth_type`、`api_version`、`request_user`、`ignore_certs`、`extra_headers`，以及自 7.8.0 起的 `credential` |
| `settings` | `mail_*` 键，自 7.6.0 起弃用（参见 [示例](example.html)） |

`settings` 只涵盖 URL 和已弃用的邮件键；其他所有设置仍可编辑。

---

## 文件中不包含密钥

每个 `${VARIABLE}` 都会被替换为对应的环境变量（在 Kubernetes 上来自 `Secret`），因此该文件可以放在 Git 中。

未设置的变量会导致 **致命错误**，因此占位符永远不会被当作密码保存。

凭据也可以使用 [密钥库](../secret-stores)（`secret_store`、`secret_ref`）；`vault_path` 将在 8 中移除。

---

## 托管对象

列表部分（`runners`、`secret_stores`、`credentials`、`databases`、`sso`、`repositories`、`syslog`、
`notifications` 和 `labels`）或单行部分中来自种子的对象会被标记为 **托管**：

- 它在 **每次** 启动时都会被强制应用，因此文件始终是权威来源。
- 它是只读的：API 返回 **403**，界面会禁用编辑和删除，其页面会说明它来自配置
  种子文件且为只读。
- 只有种子可以设置或清除该标记。

手动创建的对象 **永远不会被改动**，除非种子声明了同一名称。这时该记录会被 **接管**：
声明的字段会被强制应用，它也会变为只读。接管会作为警告记录到日志和审计记录中。

应用种子是幂等的：已经匹配的记录保持不变，因此重启通常会报告 `0 updated`。

缺少工作树的已声明仓库会在每次启动时 **重新克隆**，因此首次克隆失败后
会被重试。状态页面的 *仓库* 行会显示任何没有工作树的仓库。

自 7.8.0 起，[git 仓库](../repositories/) 也可以保存同类对象。由仓库保存的对象仍属于该仓库：种子中对应它的项
不会被应用，服务器日志会说明这一点。种子声明的仓库仍属于种子。

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

取消设置 `CONFIG_SEED_PATH` 会关闭种子：下次启动时，种子所管理的每条记录和每个字段都会被释放，就像应用了一个空种子一样。
记录保留其值并重新变为可编辑，服务器日志和审计日志会说明释放了哪些内容。

指向不存在文件的 `CONFIG_SEED_PATH` 不会释放任何内容：服务器会改为拒绝启动，因为挂载的文件
可能只是迟到了。

---

## 种子声明的设置

7.8.0 新增的部分不像托管对象那样被严格拥有，方式有两种。

| 部分 | 种子如何拥有它们 |
|---|---|
| `defaults`、`logo`、`icon`、`name`、`links`、`mcp` | 逐个字段：声明的每个字段在其页面上只读并带有提示，API 拒绝对其修改（403） |
| `users`、`groups`、`announcements`、`disclaimer`、`ssh` | 每次应用时创建或修改，从不锁定，也从不删除 |

种子不再声明的 `defaults`、`logo`、`icon`、`name`、`links` 或 `mcp` 字段会被释放，关闭种子时则全部释放。
种子中的徽标或图标不能在应用中上传或删除。当某个仓库保存同一页面时，种子保留它声明的字段，其余字段由仓库保存。

种子中的用户、组、公告、免责声明版本，以及 SSH 密钥和已知主机，在应用中仍可编辑，下一次应用会在不一致之处
重新写入种子的值。从文件中删除一项会将其保留在应用中，`prune` 也不会删除其中任何一项。
