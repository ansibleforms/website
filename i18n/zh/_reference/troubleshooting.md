---
layout: default
title: 故障排查
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# 故障排查
{: .no_toc }

错误消息和症状、其原因以及解决方法
{: .fs-6 .fw-300 }

---

下面每个问题都以您看到的消息或症状作为标题，随后是原因和解决方法。消息完全按照
AnsibleForms 写出的原文引用；`<name>` 表示因情况而异的值。其中大多数会出现在服务器
日志中，您可以在 [服务器日志](gui/administration.html#server-log) 下或通过 `docker logs` 查看。

**数据库和启动**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**配置和表单**

* [Could not load the forms](#could-not-load-the-forms)
* [基础配置中有 forms 部分](#the-base-config-has-a-forms-section)
* [仪表板上缺少某个表单](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**登录**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Azure AD 或 OIDC 身份验证失败](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [重启后或一天后被注销](#logged-out-after-a-restart-or-after-a-day)
* [单点登录后表单和作业为空（HTTP 431）](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**作业**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [作业显示状态 abandoned](#a-job-shows-the-status-abandoned)
* [RTE 无法连接](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Git 仓库和备份**

* [仓库克隆或拉取失败](#a-repository-clone-or-pull-failed)
* [表单仓库尚未克隆](#the-forms-repository-is-not-cloned-yet)
* [备份失败](#a-backup-failed)

[常见问题](faq.html) 深入介绍了两个相关的问题：
[丢失管理员密码](faq.html#recovering-a-lost-admin-password) 和
[限制 REST 辅助函数的目标](faq.html#restricting-rest-helper-destinations-allowdeny-lists)。

---

## Mysql not ready yet

AnsibleForms 无法启动，日志每 5 秒重复以下几行：

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**原因**

启动时，AnsibleForms 会等待数据库响应查询，只要数据库不响应，它就一直等待。
`<reason>` 是数据库驱动自身的消息：连接被拒绝或超时说明主机或端口有问题，
拒绝访问的消息则说明用户名或密码有问题。

**解决方法**

检查 [`DB_HOST`](customization/server.html#env_DB_HOST)、[`DB_PORT`](customization/server.html#env_DB_PORT)、
[`DB_USER`](customization/server.html#env_DB_USER) 和 [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD)。
在容器内部，`localhost` 指的是容器本身，而不是运行 MySQL 的主机。请确保 MySQL 监听
某个网络地址，并且该用户可以从 AnsibleForms 主机连接。数据库一旦响应，AnsibleForms 就会自行
继续；无需重启。

---

## Schema is not ready, skipping group and user initialization

浏览器打开的是数据库页面而不是登录页面，日志显示：

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**原因**

`AnsibleForms` schema 缺失或不完整。*空* 数据库会在启动时自动初始化，除非
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) 为 `0`。如果初始化失败，例如因为
数据库用户无权创建 schema，日志会显示 `Failed to create the schema automatically : <reason>`。已存在但
缺少表的 schema（`Table '<name>' is not present`）永远不会被自动重建，因为创建
schema 会先删除所有表。此时数据库页面会显示 *It appears that you have an unuseable schema*。

**解决方法**

在全新安装上，授予数据库用户创建 `AnsibleForms` schema 的权限并重启，或在数据库页面上点击
**新建**。对于部分存在的 schema，请恢复备份，或删除不完整的 `AnsibleForms`
schema，以便 AnsibleForms 重新创建它。日志会列出哪些表和补丁失败了。

---

## Schema creation is disabled

从数据库页面或通过 `POST /api/v2/schema` 创建 schema 时失败，显示：

```
Schema creation is disabled
```

**原因**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) 为 `0`，这会同时关闭启动时的自动
创建和该端点。在已有用户的数据库上，该端点还会拒绝未以管理员身份登录的调用方，
显示 `Schema creation requires an authenticated administrator`。

**解决方法**

用 `ALLOW_SCHEMA_CREATION=1`（这是默认值）创建一次 schema，或从备份中恢复它，然后把该
变量改回 `0`。在已初始化的数据库上，重建 schema 之前请以管理员身份登录，并记住
重建会删除并重新创建所有表。

---

## Config seed failed, refusing to start

容器启动后立即退出，其输出以下面这行结束：

```
Config seed failed, refusing to start : <reason>
```

**原因**

[`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) 中的文件无法应用：例如它不是有效的
YAML，或违反了种子的 schema；`<reason>` 说明了问题所在。AnsibleForms 宁可拒绝启动，也不会
在只有一半声明对象的情况下运行。原因也会写入标准错误，因此 `docker logs` 和 `kubectl logs` 会显示它。

**解决方法**

修正 `<reason>` 指出的问题后重新启动。种子如何应用，参见 [重新加载和启动](seed/reloading.html)；
有效的文件，参见 [示例](seed/example.html)。

---

## ENCRYPTION_SECRET is not set

每次启动都会记录以下警告：

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

或者 worker 拒绝启动，显示：

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**原因**

存储的密钥用 [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET) 加密：从 7.3.0 起，它们保存在
凭据中（包括 LDAP 目录、SSO 提供方、运行器和密钥库等的密码和令牌），与 Slack
和 Teams webhook 地址放在一起。没有它时，会使用一个在源代码中公开的密钥。从 7.3.0 起，使用新的
`ENCRYPTION_SECRET` 启动时，会在一个事务中用它重新加密所有存储的密钥：首次设置时从默认密钥重新加密，
修改时从 [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) 重新加密。如果
存储的密钥既不是用前者也不是用后者加密的，则不做任何更改，AnsibleForms 也不会启动。

**解决方法**

设置 `ENCRYPTION_SECRET`，并把它与您的其他密钥放在一起保管：备份中从不包含它。下次启动时会记录
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`。以后要更换它时，在一次启动中把新值设在
`ENCRYPTION_SECRET`，把旧值设在 `ENCRYPTION_SECRET_PREVIOUS`，然后删除 `ENCRYPTION_SECRET_PREVIOUS`。如果
worker 拒绝启动，请把 `ENCRYPTION_SECRET_PREVIOUS` 设为加密这些密钥时所用的密钥，或者把旧值改回来。

---

## Could not load the forms

仪表板不显示任何表单，并报告：

```
Could not load the forms.

Failed to get forms list

<reason>
```

**原因**

基础配置（`config.yaml`）无法读取或无效。`<reason>` 说明了是哪种情况：

| 原因 | 起因 |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | YAML 语法错误 |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | 文件为空，或只有注释 |
| `Duplicate role name(s) : <names>. Each role must appear once.` | 同一个角色定义了两次 |
| `There is no config.yaml nor could one be created from template.` | `config.yaml` 缺失，且其文件夹不可写 |
| `There is no forms directory nor could there be one created from template.` | 表单文件夹缺失且无法创建 |
| 其他任何内容 | 配置违反了 schema，例如角色没有 `groups` |

**解决方法**

修正 [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) 所指的文件，或用于配置的仓库中的
`config.yaml`。如果缺少文件，请让 [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) 和
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) 指向一个可写的持久化位置。结构
参见 [config.yaml](config/)。

---

## 基础配置中有 forms 部分

从 6.x 升级后仪表板为空，警告面板显示：

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**原因**

从 7.0.0 起，每个表单都存放在表单文件夹中自己的文件里。仍列在 `config.yaml` 中的表单会被
忽略。

**解决方法**

把每个表单移到 [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) 中自己的文件里。参见
[升级到 7.x](upgrade-7.html)。

---

## 仪表板上缺少某个表单

表单文件存在，但某个用户在仪表板上看不到该表单。

**原因**

只有当表单的某个 `roles` 是用户的角色之一时，用户才能看到该表单；管理员可以看到所有表单。每个用户都有
`default` 角色，因此 `roles: [default]` 的表单对所有人可见。用户的角色来自 `config.yaml` 中
`roles` 下列出的组和用户。没有 `categories` 的表单显示在 **Default** 下，因此在
其他类别中看不到它，但它仍列在 **所有表单** 下。最后，验证失败的表单会被跳过。此时
仪表板会显示一个 **此配置有警告或错误** 按钮，点击后会显示如下消息：

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**解决方法**

打开警告面板，修正其中列出的问题。在个人资料的 [权限](profile/permissions.html) 下检查用户的角色，
并检查表单的 `roles` 和 `categories`。参见 [角色](config/roles.html) 和 [类别](config/categories.html)。如果两个文件定义了同一个表单名称，
先加载的那个生效。

---

## Could not save the forms

在设计器中保存时失败，显示：

```
Could not save the forms.

Failed to save forms

<messages>
```

**原因**

设计器在写入任何内容之前，会按照 schema 验证每个表单。`<messages>` 的每一行都指出了
违反规则的表单和字段。7.0.0 中移除的选项会有专门的消息，例如
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`。

**解决方法**

修正消息中指出的字段。对于 7.0.0 移除的选项，请遵循 [升级到 7.x](upgrade-7.html)。
要在表单文件进入 AnsibleForms 之前验证它们，请参见常见问题中的
[VS Code 中表单文件的验证](faq.html#vs-code-validation-for-form-files)。

---

## The editor is read-only

设计器显示 **已被锁定** 及另一个用户的名称，保存时失败，显示：

```
The editor is read-only
```

**原因**

同一时间只能有一个人编辑表单。有人启动设计器时会获取锁，并一直保持到
他们停止设计器为止，即使他们没有停止设计器就关闭了浏览器也是如此。API 会拒绝其他任何人的保存，显示
`Designer is locked by <username>`。

**解决方法**

请 `<username>` 停止设计器。如果无法做到，请在设计器中使用 **强制解锁**。持有锁的人
会丢失尚未保存的更改。

---

## Abuse attempt of eval function

表达式字段显示错误，日志中有如下一行：

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**原因**

服务器端表达式在运行前会被检查。它们只能调用 `fn.` 和 `fnc.` 函数；多条语句、
多行、模板字面量、`process.env` 以及 `require` 或 `constructor` 等词都会被拒绝。消息
会说明违反了哪条规则。如果 [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) 设为
`off`，所有服务器表达式都会失败，显示
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`。

**解决方法**

把表达式改写为单个 `fn.` 调用或简单的运算，或者用 `runLocal: true` 在浏览器中运行它。参见
[表达式](expressions/) 和 [本地表达式](expressions/local.html)。

---

## Destination is not in REST_ALLOWED_HOSTS

调用 REST API 的字段保持为空，日志显示：

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**原因**

设置了 [`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS)，而 URL 的主机不在其中。
匹配 [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) 的主机会被拒绝，显示
`blocked by REST_DENIED_HOSTS entry "<entry>"`；无法解析的主机则显示 `cannot resolve <host>`。

**解决方法**

把该主机名或覆盖其地址的 CIDR 添加到 `REST_ALLOWED_HOSTS`，或者从
`REST_DENIED_HOSTS` 中删除阻止它的条目。参见 [限制 REST 辅助函数的目标](faq.html#restricting-rest-helper-destinations-allowdeny-lists)。

---

## Authentication failed: Invalid credentials

登录页面拒绝用户名和密码，显示：

```
Authentication failed: Invalid credentials
```

**原因**

登录页面对所有失败都给出相同的回答，以免泄露某个用户是否存在。AnsibleForms
先尝试本地用户，然后尝试 LDAP：有多个目录时，会按照 **访问 > LDAP** 下的顺序查找用户名，
除非用户名指定了某个目录（`corp\jane`）或其某个登录域（`jane@corp.example`）。真正的原因会写入日志。LDAP
失败记录为 `Error connecting to ldap: <reason>`，原因例如 `Wrong binding credentials` 或
`Unable to verify the certificate`；Active Directory 的代码会被转换为 `Wrong password`、`User not found`、
`Account disabled`、`Account locked` 或 `Password expired`。

**解决方法**

阅读日志中的原因。要查看每次登录失败的完整原因，请把
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) 设为 `debug`，这会记录 `Ldap authentication failed: <reason>`。
如果丢失了本地管理员密码，请参见 [找回丢失的管理员密码](faq.html#recovering-a-lost-admin-password)。

---

## LDAP check failed

在 **访问 > LDAP** 下测试 LDAP 目录时失败，显示以下之一：

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**原因**

绑定用户或其密码错误、服务器或端口无法访问，或者在使用 TLS 时无法根据 CA 证书包验证服务器的证书。
从 7.3.0 起，这些设置位于目录的 ldap 凭据中，在 **连接 > 凭据** 下。不存在的测试用户
仍算作测试成功，因为连接和绑定都成功了。

**解决方法**

在 **连接 > 凭据** 下打开目录所引用的凭据（默认目录为 `main`），修正绑定
DN 及其密码、服务器和端口（通常为 389，LDAPS 为 636）。对于 TLS 问题，请粘贴签发
LDAP 服务器证书的 CA 证书包；跳过证书检查不适用于生产环境。参见 [LDAP](authentication/ldap.html)。

---

## Azure AD 或 OIDC 身份验证失败

单点登录后返回登录页面，显示：

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**原因**

身份提供方已把用户送回，但 AnsibleForms 无法完成登录。常见原因有
`azuread login is not enabled` 或 `oidc login is not enabled`（提供方已关闭），以及 `jwt expired`，因为
来自提供方的交接只在 5 分钟内有效。来自提供方的回调期间发生的错误也会显示
在登录页面上，并写入日志。

**解决方法**

在 **访问 > SSO** 下启用提供方，并在身份提供方中注册与
AnsibleForms 所用完全一致的回调 URL：Entra ID 为 `https://<your host>/api/v2/auth/entraid/callback`（从 7.3.0 起；`azureadoauth2` 仍然可用），
OIDC 为 `https://<your host>/api/v2/auth/oidc/callback`。来自 7 之前或
6.1.5 之前、包含 `/api/v1/` 的回调 URL 必须更新：否则登录页面会重新加载，既不登录也不报错。交接过期后
请重试登录。

---

## Not authenticated, login is not enabled for this user

拥有有效密码的用户无法登录，显示：

```
Not authenticated, login is not enabled for this user.
```

**原因**

用户的某个角色把角色选项 `allowLogin` 设为了 `false`。日志显示
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`。

**解决方法**

从该角色中删除 `allowLogin: false`，或者把该用户移出该角色。参见 [角色](config/roles.html)。

---

## 重启后或一天后被注销

AnsibleForms 重启后，或使用一天后，所有用户都会被送回登录页面。

**原因**

未设置 [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) 时，每次启动都会生成一个
新的签名密钥，并记录
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
此后，重启之前的令牌
不再被接受。另外，会话在其刷新令牌过期时结束
（`Refresh token is expired`），即在
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) 之后，默认 24 小时。

**解决方法**

把 `ACCESS_TOKEN_SECRET` 设为一个固定的保密值。如果一天太短，请调高 `ACCESS_TOKEN_REFRESH_EXPIRATION`。对于
长期的 API 访问，请使用 [API 令牌](profile/api-token.html)。

---

## 单点登录后表单和作业为空（HTTP 431）

用户用 Entra ID 或 OIDC 登录时没有报错，但表单和作业页面一直为空。浏览器的网络
选项卡显示 API 调用的响应为：

```
431 Request Header Fields Too Large
```

服务器日志中没有这些调用的记录，而同一个用户使用 LDAP 或本地账户时可能一切正常。

**原因**

在 7.1.0 之前，登录令牌携带用户的所有组，而 Entra ID 组在其中出现两次，分别按对象 ID
和名称。浏览器在每个请求的 `Authorization` 头中发送该令牌，因此属于大约一百个
或更多组的用户，其请求头会远超 16 KB。Node.js 会以 431 拒绝大于 16 KB 的请求头，
请求根本到不了 AnsibleForms，这就是没有任何日志的原因。前面的反向代理可能更早就拒绝
请求：Nginx 默认每个头字段允许 8 KB
（`large_client_header_buffers 4 8k`），并改为返回 400。

**解决方法**

升级到 7.1.0 或更高版本：登录令牌不再携带组，因此其大小不再取决于用户所属组的数量，
并且当请求以 431 被拒绝时，界面会给出提示而不是显示空页面。
在能够升级之前，可以：

* 在 **访问 > SSO** 下为提供方设置 **组筛选**，即一个只保留您的
  角色所用组的正则表达式，参见 [Entra ID](authentication/entra-id.html) 或 [OIDC](authentication/oidc.html)；用户重新登录后
  即可获得更小的令牌
* 或者用环境变量 `NODE_OPTIONS=--max-http-header-size=65536` 提高 Node.js 的限制，然后
  重启 AnsibleForms

从 7.1.0 起，[`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) 设置同样的限制，默认 16384
字节，在启动时读取，用于其他较大的请求头，例如前面的单点登录网关设置的大型 cookie。
同时也要提高代理的请求头限制，参见 [请求头大小](production/reverse-proxy.html#request-header-size)。

---

## Playbook failed with status

Ansible 作业以失败结束，其输出的最后一行为：

```
[ERROR]: Playbook failed with status (<code>)
```

**原因**

`ansible-playbook` 以非零代码退出。上面几行是 Ansible 自身的错误：找不到 playbook、
主机不可达、某个任务失败，或者清单有误。playbook 会在启用了
**用于 playbook** 的仓库中查找，或在 [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) 中查找；日志行
`Running from directory : <path>` 显示了所用的文件夹。

**解决方法**

阅读最后一行上方的作业输出。如果找不到 playbook，请对照
`Running from directory` 中的文件夹检查表单的 `playbook`。参见 [Ansible 表单](forms/ansible.html)。

---

## Playbook was aborted by the main process

Ansible 作业以失败结束，显示：

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**原因**

RTE 上的 `ansible-playbook` 进程被信号终止，而且没有人中止该作业。从 7.0.0 起，
输出的大小不再导致这种情况：超过 [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER)（默认每个流 50 MB）
后，其余输出不再存储，作业显示
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`，
playbook 会一直运行到结束。现在通常的原因是内存：RTE 容器达到了其内存限制，
内核终止了 playbook，例如因为 forks 很多或 facts 很大。

**解决方法**

在 playbook 运行时检查 RTE 容器的内存（`docker stats`、`kubectl top pod`）并提高其限制，或者降低
playbook 的内存使用（更少的 `forks`，不收集不必要的 facts）。如果您只看到 `PROCESS_MAX_BUFFER` 警告并且
需要完整的输出，请在 RTE 容器的环境中调高 `PROCESS_MAX_BUFFER`；它由 RTE 读取，而不是由应用读取。
---

## Failed to launch awx template

AWX 作业以失败结束，其输出以下面这行开头：

```
failed to launch awx template <name>
```

**原因**

下一行给出了原因。`Request failed with status code 401` 表示
AWX 运行器凭据上的令牌或用户名和密码被拒绝。`could not find job template <name>` 表示没有作业模板或工作流作业模板
正好叫这个名称，或者连接所用的用户看不到它。证书错误，例如
`unable to verify the first certificate`，表示 AWX 证书不受信任。

**解决方法**

在运行器上（**连接 > 运行器**）使用 **测试连接**，成功时会返回 `Runner connection is OK`。从
7.3.0 起，令牌或用户名和密码、地址以及 **CA 证书包** 都位于运行器的凭据中，在
**连接 > 凭据** 下：请在那里更新令牌或密码；对于证书错误，请把 CA 粘贴到其 **CA 证书包** 中。
检查模板的名称和权限。输入地址时不要带 `/api/v2`：AnsibleForms 会自行添加
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX)。
参见 [AWX 表单](forms/awx.html)。

---

## 作业显示状态 abandoned

一个原本在运行的作业现在被标记为 `abandoned`，某个节点或 RTE 的日志显示以下之一：

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

已弃用的数据库模式 RTE 会记录它自己的消息：

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**原因**

作业属于运行或跟踪它的容器：playbook 属于其 RTE，其他任何作业（AWX 作业、多步骤
表单的步骤）属于启动它的应用节点。当该容器重启时，它会结束自己未完成的作业。当它消失时，例如 pod
被替换，worker 会在它两分钟没有响应后结束其作业。socket 模式的 RTE 回来时如果没有
它原先运行的某个作业，例如新容器没有其 spool，该作业会以 abandoned 结束。正在停止的 RTE 会先等待
[`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) 让其 playbook 结束。每小时，运行超过
一天的作业也会被标记为 abandoned。

从 7.3.0 起，AWX、AAP 或 Ascender 上的作业会在其运行器上继续运行：重启使其被放弃之后，节点会立即再次跟踪它
（如果它是在过去 24 小时内启动的），并以它在那里的实际结果结束。日志随后会显示 `Following <n> abandoned job(s) again on their runner`。

**解决方法**

重新运行 playbook 作业。请在没有作业运行时重启或升级 RTE 和应用节点，并给正在停止的 RTE 留出足够时间
（参见 [扩展](rte/run.html)）。重新运行之前，请检查 playbook 是否真的在受管主机上完成了，
因为它可能只运行了一部分。

---

## RTE 无法连接

RTE 运行器上（**连接 > 运行器**）的 **测试连接** 失败，显示：

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**原因**

socket 模式的 RTE 通过一条 WebSocket 与应用通信：出站时由它连接应用，入站时由应用连接它（参见
[模式](rte/modes.html)）。应用和 RTE 的日志会说明 socket 为什么没有打开：

| 消息 | 位置 | 含义 |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | RTE（入站） | 运行器 RTE 凭据中的令牌与 RTE 的 `RTE_TOKEN` 不一致 |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | 应用（入站） | 同上，从应用一侧看到 |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | 应用，以及被拒绝的 RTE（`401`） | RTE 登录所用的令牌与应用为其运行器保存的令牌不同 |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | RTE（出站） | 它已请求加入，正在等待批准 |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | RTE（入站，带 `APP_URL`） | 同上，针对入站 RTE |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | 应用，以及被拒绝的 RTE（`409`） | 配置种子声明该运行器时没有 `rte_mode`，因此处于数据库模式，而它的模式由种子决定。入站 RTE 会看到 `rte_mode: inbound` 和 `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | RTE | 自行注册的入站 RTE 需要应用连接它所用的地址 |
| `Runner '<name>': dialing <address>: <reason>` | 应用，`debug` 级别 | 应用无法打开 socket，例如因为 RTE 的证书不是为其运行器固定的那张 |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | RTE | 它以数据库模式运行，根本不打开 socket |

**解决方法**

* **令牌被拒绝**：把运行器 RTE 凭据（**连接 > 凭据**）中的令牌交给 RTE，或者反过来
* **等待批准**：在 **连接 > 运行器** 下批准它，批准前先确认那里显示的指纹与其日志中的一致
  （参见 [批准 RTE](runners/registration.html#approving-an-rte)）
* **由数据库模式的配置种子管理**：在种子中为该运行器设置 `rte_mode`，并配上一个 RTE 凭据（入站时还要有其
  地址），然后重启 RTE
* **入站但没有 `RTE_URL`**：把 `RTE_URL` 设为应用访问 RTE 所用的地址，或者去掉 `APP_URL`，在
  种子中或在 **连接 > 运行器** 下声明该运行器
* **证书不是固定的那张**：通过 HTTPS 的入站 RTE 在注册时发送其证书，应用只用那张证书
  连接它。换了新证书后，RTE 会在注册时再次发送；如果凭据的 CA 证书包是
  手动设置的，应用会保留它并记录
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **[DEPRECATED] 警告**：在 RTE 上设置 `RTE_MODE`，从其环境中删除 `DB_*`，并把其运行器设为该模式（参见
  [模式](rte/modes.html)）

---

## The form data is not valid

运行验证为 `enforce` 时，启动被拒绝，返回 `422` 和：

```
The form data is not valid
```

**原因**

服务器按照表单的规则检查了字段值，发现有缺失或无效的字段；响应在 `details` 下列出了
它们。没有 `rawFormData` 的启动也会被拒绝。尚无法检查的表单，例如向导，
会被拒绝并显示 `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`。

**解决方法**

修正 details 中指出的字段，如果表单的规则过于严格则修改规则。请先以 `log` 运行：它会记录
`Launch validation would refuse form '<name>' ...`，但不拒绝任何东西。参见
[enforce 做什么](launch-validation/log-and-enforce.html#what-enforce-does) 和
[推广上线](launch-validation/rolling-it-out.html)。

---

## 仓库克隆或拉取失败

仓库显示失败状态，其输出中包含 git 的错误，或者日志显示
`Background clone of '<name>' failed : <reason>`。

**原因**

Git 无法访问远程仓库或无法通过身份验证。对于 SSH URL（`git@host:path`），远程仓库必须接受
AnsibleForms 的公钥；对于 HTTPS，用户名和令牌必须有效。如果工作树有
更改，拉取也会被拒绝，显示
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**解决方法**

对于 SSH，从 **连接 > SSH** 的 **密钥** 选项卡复制公钥，并将其添加为部署密钥，或添加到
有权访问该仓库的用户上。AnsibleForms 在克隆时会把远程主机添加到已知主机中；对于其他主机，请使用
同一页面的 **已知主机** 选项卡。对于
HTTPS，请更新令牌。参见 [Git 仓库](gui/designer-and-git.html#git-repositories) 和
[关于仓库](faq.html#about-repositories)。

---

## 表单仓库尚未克隆

在设计器中保存表单时失败，显示：

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**原因**

启用了 **用于表单** 的仓库还没有工作树，因为克隆尚未运行或已失败。

**解决方法**

在仓库设置中克隆该仓库。如果克隆失败，请参见
[仓库克隆或拉取失败](#a-repository-clone-or-pull-failed)。

---

## 备份失败

备份失败，备份列表中没有新增任何内容。原因为以下之一：

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**原因**

转储命令 [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND) 没有安装、无法
连接，或生成了空文件。大型数据库也可能耗时超过
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS)，默认一小时。
失败的备份不会留下文件夹；日志会显示 `Backup failed, removing the incomplete folder '<folder>' : <reason>`。

**解决方法**

安装 MySQL 或 MariaDB 客户端工具，或者把 `MYSQLDUMP_COMMAND`（以及用于恢复的 `MYSQL_COMMAND`）设为
在此主机上可用、并与您的服务器版本兼容的命令。对于大型数据库，请调高 `BACKUP_COMMAND_TIMEOUT_SECONDS`。
参见 [备份](gui/administration.html#backups)。
