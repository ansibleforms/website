---
layout: default
title: 加固
parent: 安全
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# 加固
{: .no_toc }

管理员账户、登录限制、数据库、表达式、作业数据、浏览器策略、可选功能和角色选项
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 管理员账户

本地管理员账户在首次启动时根据 [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
和 [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) 创建，后者的默认值为 `AnsibleForms!123`。

* 使用公开的默认密码 `AnsibleForms!123` 登录后必须先修改密码：在此之前，服务器对除修改密码之外的
  所有请求都返回 `403`（代码 `password_change_required`），浏览器会显示一个
  无法关闭的修改密码页面。新密码不能再是默认密码。
* `ADMIN_PASSWORD` 只在首次创建账户时读取：请在首次启动前设置您自己的值。
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` 会在每次启动时将密码重置为 `ADMIN_PASSWORD`。
  只用它来找回丢失的密码，然后取消设置并重启。
* 先设置两个主密钥：参见 [密钥与加密](secrets.html)。
* 一旦 LDAP 或 SSO 登录可用，请只将本地管理员留作紧急情况使用，并为其设置一个保存在您的密码库中的长密码。

---

## 登录限制与密码

有三项限制可以减缓密码猜测。失败次数记录在数据库中，因此每个应用节点看到的
尝试次数都相同，并且每项限制都无需重启即可生效：

| 变量 | 默认值 | 作用 |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | 登录失败达到此次数后，本地或 LDAP 账户会被锁定 `LOGIN_LOCKOUT_MINUTES`。 |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | 在 `LOGIN_LOCKOUT_MINUTES` 内登录失败达到此次数的地址会被暂停，直到该时间窗口结束：针对一个地址尝试大量账户的情况。 |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | 账户保持锁定的时长，也是统计失败次数的时间窗口。 |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | 每个应用节点上，来自同一地址对登录、退出登录、令牌刷新和单点登录回调的每分钟请求数。 |

被锁定的账户或被暂停的地址会在检查任何密码之前收到带有 `Retry-After` 头的 `429`，
无论该账户是否存在；超过 `AUTH_RATE_LIMIT` 时同样返回 `429`。成功登录会清除
该账户的计数，管理员设置该用户的密码也会清除。`0` 关闭某项限制；`LOGIN_LOCKOUT_MINUTES=0`
会同时关闭锁定和按地址的限制。

`LOGIN_MAX_FAILURES_PER_IP` 和 `AUTH_RATE_LIMIT` 按客户端地址计数：在反向代理之后，请设置 `TRUST_PROXY`，
使地址为客户端的而不是代理的，参见 [客户端地址](../production/reverse-proxy.html#client-addresses)。

通过应用设置的本地密码，无论是为新用户、由管理员设置，还是用户修改自己的密码，都必须至少有
[`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) 个字符（默认为 `8`，
`0` 表示不检查长度）。密码不能是用户名或公开的默认密码。`ADMIN_PASSWORD` 不受检查。

---

## 数据库

AnsibleForms 将所有凭据和作业保存在其 MySQL 数据库中，因此请让该数据库远离网络：

* docker-compose 项目在主机上发布 MySQL（`MYSQLDB_LOCAL_PORT`，`3306`），并自带 root
  密码 `AnsibleForms!123`。请删除该端口映射，或将其绑定到 `127.0.0.1`，并修改密码。
* 使用专用账户而不是 `root` 进行连接，在 [`DB_USER`](../customization/server.html#env_DB_USER) 和
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD) 中设置。它只需要对 `AnsibleForms` schema 的权限：

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  这涵盖了创建 schema（包括 `CREATE DATABASE`）、升级时修补 schema，以及
  以同一用户身份运行的 [备份](../production/backups.html) 和恢复：导出使用
  `--no-tablespaces`，因此不需要 `PROCESS` 之类的服务器级权限。如果可以，请将 `%` 替换为
  应用的地址。像 `root` 一样对所有数据库都有权限的用户，会把应用中的一个漏洞变成
  整个数据库服务器的漏洞：**状态** 页面会在其 **数据库用户** 检查项中对此发出警告，日志也会
  在每次启动时发出警告。
* schema 创建后，将 [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) 设为 `0`。
  创建 schema 会先删除所有表；设为 `0` 时，启动引导和 `/api/v2/schema`
  端点都无法执行它。

---

## 表达式与出站调用

服务器表达式会为任何已登录用户在服务器上运行，因此净化器和出站过滤器非常重要：

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER)：`strict` 或 `paranoid`，永远不要用 `legacy`，它允许用户运行服务器代码。
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS)：REST 表达式不能访问的主机，例如 `169.254.169.254,127.0.0.0/8`。
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS)：设置后，REST 表达式只能访问
  这些主机和范围。拒绝列表优先于它。

这两个列表只覆盖 AnsibleForms 自身的 REST 辅助函数；playbook 在它们之外运行，不受过滤。

从 7.3.0 起，REST 辅助函数会像其他所有连接一样检查端点的证书。
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` 会关闭检查：仅用于
使用自签名证书的端点。

---

## 作业数据

作业的 extravars 和输出保存在数据库中，并向所有能看到该作业的人显示：

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX)：键匹配的 extravars
  显示为 `********`。默认值为 `password|secret|token`；密码字段总是会被掩码。请用
  您的表单所用的名称扩展它，例如 `password|secret|token|apikey|passphrase`。
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS)：精简随每个作业发送的
  `ansibleforms_user` 对象，否则它会包含用户的全部组成员关系。
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) 只用于隐藏冗杂的任务；隐藏密钥请使用 `no_log`。

---

## Content-Security-Policy

界面在提供时带有 Content-Security-Policy 头，它限制页面在浏览器中可以加载和运行的内容：

* 脚本只能来自应用本身，因此注入页面的脚本不会运行。
* 其他任何网站都不能在框架中显示该界面。
* 它允许应用所需的内容：在浏览器中计算的本地表单表达式（`'unsafe-eval'`）、内联
  样式、来自任意 URL 的图片（表单和类别图片），以及代码编辑器的 worker。

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) 默认为 `1`，并应
保持不变。设为 `0` 时，策略以 `Content-Security-Policy-Report-Only` 发送：浏览器控制台会列出它本会
阻止的内容，但不会阻止任何内容。仅在暂时无法配合该策略工作的部署中使用 `0`，例如会注入自己脚本的
反向代理。在设置页面上的修改无需重启即可生效。

---

## 设置页面与设计器

管理员可以从浏览器修改大部分配置。当配置保存在其他地方时，请收紧这一点：

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`：只读设置，用于 [托管环境](../seed/environment-and-audit.html)。
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0`：当表单在 git 中维护时，移除内置的
  设计器。

---

## 可选功能

这些功能默认关闭。只在使用时才打开它们；在设置页面上的修改无需重启即可生效：

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP)：在 `/api/v2/mcp` 上提供 [MCP 服务器](../mcp/)，
  使 MCP 客户端可以使用用户的令牌启动表单。
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT)：[聊天助手](../chat/)。表单定义
  以及正在填写的值会被发送到配置的模型提供商。

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) 的作用方向正好相反：它默认为 `enforce`，
因此服务器会拒绝值违反表单规则的启动，包括通过 REST API 的启动。
请保持该设置：`log` 只记录本会被拒绝的内容，`off` 什么都不检查，参见 [启动验证](../launch-validation/)。

---

## 角色选项

[config.yaml](../config/roles.html) 中的一些角色选项所赋予的权限比其名称所暗示的更多。请谨慎授予：

| 选项 | 为什么重要 |
|--------|----------------|
| `allowScheduledJobs` | 拥有它的用户可以看到并修改所有调度，而调度会以管理员权限运行任意表单。请将其视为管理员级别。 |
| `allowBackupOps` | 包括 **恢复**，它会替换整个数据库。 |
| `showSettings` | 打开管理页面。没有管理员角色时，它不能修改管理员角色所引用的账户和组，参见 [用户和组](../users-and-groups.html#accounts-that-grant-admin)。 |
| `showLogs` | 显示服务器日志，其中可能包含主机名、用户名和错误详情。 |
| `showConnectionsSettings` | 打开连接页面：凭据、运行器、通知通道等。添加、修改和删除运行器及密钥库仍然只有管理员可以做，连接和登录所用的凭据也是如此。对于仓库，添加或删除它以及修改其地址、分支或 `use_for_*` 标志仍然只有管理员可以做。 |
| `showAllJobLogs` | 显示所有用户的作业，而不仅是用户自己的。 |
| `manageAllJobs` | 中止、删除和重新运行所有用户的作业。 |
| `allowApiTokens` | 允许用户创建有效期最长为 [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS)（默认 90）的 API 令牌。使用令牌退出登录或撤销令牌会使其失效，修改密码会使该用户的所有令牌失效，参见 [令牌](secrets.html#tokens)。 |
| `extendedTokenExpiration` | 与 `allowApiTokens` 一起使用时，还允许用户创建永不过期的 API 令牌。 |
| `allowFileUploads` | 允许用户通过表单的文件字段上传文件。除非某个角色将其关闭，否则对所有用户都是打开的。 |
| `allowChat`、`allowMcp` | 在聊天助手和 MCP 服务器打开时，允许用户使用它们。除非某个角色将其关闭，否则 `allowChat` 对所有用户都是打开的；除非某个角色设置了 `allowMcp`，否则它跟随 `allowChat`。 |

没有 `admin` 角色的用户不会获得上述任何管理员级别的选项，除非某个角色授予了它们。当 `admin` 角色
没有设置任何选项时，其用户会获得 `showSettings`、`showDesigner`、`showLogs`、`showAuditLog`、`allowBackupOps`、
`allowJobRelaunch`、`showAllJobLogs`、`manageAllJobs` 和 `allowScheduledJobs`。`allowApiTokens` 和
`extendedTokenExpiration` 即使对 `admin` 角色也保持关闭：请在需要它们的角色上设置。

当用户的多个角色设置了同一选项时，`false` 优先。`default` 角色的选项只补充用户自己的角色
都没有设置的选项；它们永远不会推翻这些角色的设置。
