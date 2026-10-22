---
layout: default
title: 升级到 v7
parent: 升级
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# 升级到 v7
{: .no_toc }

仍在 6.5 上时需要修改什么，以及迁移到版本 7 后会有哪些变化
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

版本 7 删除了 6.x 中弃用的所有内容；请先在新旧写法都可用的 6.5 上修复它们，然后再升级。

---

## 升级之前（在 6.5 上）

### 表单存放在各自的文件中

表单只存放在表单文件夹（`FORMS_FOLDER_PATH`）或表单仓库中；`config.yaml` 保存类别、角色和常量。

- **`forms.yaml` 文件：** 将其重命名为 `config.yaml`。在 6.5 上，设置页面有一个
  **将 forms.yaml 转换为 config.yaml** 按钮可完成此操作。
- **基础配置中的 `forms:` 部分：** 版本 7 会拒绝它。请把每个表单移到单独的文件中，例如
  在 6.5 的设计器中把它拖到某个文件里。
- **环境变量：**

  | 已移除 | 替代方案 |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` 和 `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### `table` 字段

版本 7 会拒绝 `table` 字段，其属性（`tableFields`、`insertColumns`、`readonlyColumns`、
`tableTitleAdd`、`tableTitleEdit`）也随之移除：请使用带 `subform` 的 `list` 字段，并把每列的 `from` 改为基于
`__parent__` 的表达式（参见 [常见问题](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)）。

### 重命名的属性

每个已移除的属性都有直接的替代：

| 已移除 | 替代方案 |
|---|---|
| `disableRelaunch: true`（表单） | `allowRelaunch: false` |
| `noOutput: true`（字段） | `output: false` |
| `enableLogin`（角色选项） | `allowLogin` |

### 数据源和数据 schema

数据源导入及其管理页面已被移除，
AnsibleForms Galaxy collection 也已移除，它的模块只为数据源服务。

- 计划的导入会停止，数据源表会被删除：请先记下您需要的内容。
- 导入填充的数据 schema 是独立的数据库，会保留下来。通过凭据
  查询它们的表单可以继续工作。
- 要让这些数据保持更新，请用您自己的 playbook 运行导入，例如通过
  调度来运行。

### API v1

`/api/v1/*` 已被移除；请使用 `/api/v2/*`（交互式文档位于 `/api/v2/docs`）。脚本
常用的调用为：

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

v2 以 HTTP 状态码（`400`、`403`、`404`、`422`）和普通的 JSON 正文响应，而不是 v1 的
`{ status, message, data }` 封装。

**单点登录回调也是如此。** 包含 `/api/v1/` 的重定向 URL 不再响应：登录会返回
登录页面而不会登录成功。请在两处把它改为 `/api/v2/`：AnsibleForms 中的 SSO 提供方，以及
身份提供方（Entra ID 应用注册的重定向 URI、OIDC
客户端的有效重定向 URI）：

- Entra ID：`https://<your host>/api/v2/auth/azureadoauth2/callback`，从 7.3.0 起为 `/api/v2/auth/entraid/callback`
- OIDC：`https://<your host>/api/v2/auth/oidc/callback`

---

## 7 中有哪些变化

版本 7 改变了 playbook 的运行方式，并收紧了若干默认设置。从 6.5 迁移时，请逐项检查以下内容。

### playbook 在 RTE 上运行

版本 7 不再在 AnsibleForms 容器中运行 `ansible-playbook`。playbook 在运行环境（RTE）上运行，
RTE 是一个独立的容器，应用镜像中不再包含 ansible 或 python。请在应用旁启动一个 RTE，使用
`ghcr.io/ansibleforms/ansibleforms-rte-full:7` 镜像。从 7.3.0 起，应用主动连接 RTE 并保持一条 WebSocket 连接（参见
[模式](rte/modes.html)）：RTE 不获取数据库设置，也不获取 `ENCRYPTION_SECRET`。其设置为：

| 设置 | 值 |
|---|---|
| `AF_ROLE` | `rte`。RTE 镜像已经设置了它。 |
| `RTE_MODE` | `inbound`：应用连接 RTE。位于另一个网络中的运行器使用 `outbound`（参见 [模式](rte/modes.html)）。 |
| `RTE_TOKEN` | 至少 16 个字符的令牌。应用用它登录 RTE 的 socket，没有它 RTE 会拒绝启动。 |
| `RTE_FILES` | 当 RTE 与应用挂载同一个持久化文件夹时（例如运行在应用旁边）设为 `local`。 |

然后把 ansible 相关的挂载从应用容器移到 RTE：

- `ansible.cfg` 位于 `/etc/ansible/ansible.cfg`，您的角色位于 `/etc/ansible/roles`，您的 collection 位于
  `/etc/ansible/collections`。
- 在 RTE 上也挂载与应用相同的持久化文件夹，以便它找到 playbook 和仓库。

然后把 RTE 声明为运行器，可以像 Docker Compose 项目那样在 [配置种子](seed/) 中声明，也可以在 **连接 → 运行器** 下声明：
一个包含 RTE 地址（例如 `http://rte:8000`）和同一令牌的 RTE 凭据，以及一个引用该凭据的 RTE 类型运行器（inbound 模式）：

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

种子从应用的环境中读取 `RTE_TOKEN`。参见 [运行器](runners.html) 和 [运行环境](rte/)。

{: .warning }
> **应用和 RTE 使用相同的契约** 应用解析作业的凭据，并以只有该 RTE 能打开的密封形式交给它
> （RTE 契约 2，7.0.0 新增）。契约不同的 RTE 会拒绝应用的作业：请运行与应用同一版本的
> RTE 镜像，并同时升级二者。只要契约保持不变，后续的 7 版本仍可与较旧的 7 RTE 配合使用
> （参见 [扩展](../rte/images.html#build-your-own-rte)）。


### RTE 镜像包含什么

RTE 分为三层，每一层都构建在前一层之上。请选择适合您 playbook 的一层：

| 镜像 | 内容 |
|---|---|
| `ansibleforms-rte-full` | 默认镜像。Ansible 14 搭配 ansible-core 2.21，以及 6.5 镜像中已有的 collection 和 python 库。 |
| `ansibleforms-rte-core` | Python 3.14、ansible-core 和少量常用库，不含 collection。请在基于它构建的镜像中添加您自己的 collection。 |
| `ansibleforms-rte-base` | 只有 server，不含 python 和 ansible，用于以您自己的版本构建 RTE。 |

从 6.5（ansible 12 搭配 ansible-core 2.19）迁移时，以下内容也会对您的 playbook 产生影响：

- **ansible-core 2.21：** 请阅读 2.20 和 2.21 的
  [移植指南](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)。
- **Python 3.14：** 各层 RTE 都运行在 python 3.14 上。
- **不再有 `boto`：** 旧的 `boto` 2 库已被移除。`amazon.aws` collection 使用已包含在内的 `boto3`。

有两个环境变量现在属于 RTE，应用不再读取它们，因此请在 RTE 容器中设置：

| 变量 | 变化 |
|---|---|
| `ANSIBLE_PATH` | playbook 文件夹，位于 RTE 上。 |
| `PROCESS_MAX_BUFFER` | 现在默认为 50 MB。超过后不再存储作业输出（作业中会注明），但 playbook 会继续运行而不会被停止。 |


### 容器以 uid 1000 运行

应用和 RTE 镜像以用户 `node`（uid 1000）而不是 root 运行，其主目录为 `/home/node`：

- **把卷的所有权交给 uid 1000，执行一次即可。** 对于持久化卷和 ssh 卷，运行
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v`；对于主机文件夹，运行 `sudo chown -R 1000:1000 <folder>`。
  在 Kubernetes 上，设置 `fsGroup: 1000`。
- **把 ssh 文件夹挂载到 `/home/node/.ssh`**，而不是 `/root/.ssh`。如果您把
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) 设为了 `/root`，请删除它或改为 `/home/node`。
- **基于 RTE 层构建的您自己的 RTE 镜像** 在安装时切换到 `USER root`，最后再切换回 `USER node`。


### 运行验证默认开启

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) 现在默认为 `enforce`（6.5：`off`）。每次
启动，无论来自浏览器还是来自 `POST /api/v2/job`，都会按照表单的规则进行检查，作业使用服务器根据检查过的值构建的
extravars 和凭据运行。

- **REST 调用方必须发送 `rawFormData`**，即浏览器发送的原始字段值。只带
  `extravars` 的启动会被拒绝，因为其值无法检查。
- **要先查看哪些会被拒绝**，请设置 `LAUNCH_VALIDATION=log` 并阅读日志中的警告。`off` 会恢复
  6.5 的行为。

详情参见 [运行验证](launch-validation/)。


### playbook 不再能看到应用的设置

playbook 不再继承 AnsibleForms 自己读取的环境变量：`ENCRYPTION_SECRET`、`DB_*` 设置、
`ACCESS_TOKEN_SECRET`、`RTE_TOKEN`、`VAULT_*` 设置、其他所有已记录的变量以及所有 `MYSQL_*` 变量。
RTE 环境中的其余内容，例如 `PATH`、代理、`ANSIBLE_*` 设置和云凭据，仍像以前一样传递。

用 `lookup('env', ...)` 读取其中某个变量的 playbook 必须改用其他方式获取该值：把它作为 extravar 或
凭据传入，或者在 RTE 上以其他名称设置它。

### 只有 admin 角色才能管理运行器和管理员

拥有设置访问权限的用户不再能完全控制谁是管理员以及凭据流向何处：

- **运行器：** 只有 admin 角色才能添加、修改或删除运行器，因为运行器会收到它所运行作业的
  凭据。拥有设置访问权限的用户仍然可以查看和测试运行器。
- **管理员账户和组：** 只有 admin 角色才能授予管理员权限。没有它的用户不能把账户放入 admin 角色
  所指定的组中，也不能修改、重置或删除管理员账户或此类组。
- **角色：** 没有 admin 角色的设计人员不能修改角色。角色不同的保存或恢复会被拒绝。

请把 admin 角色授予负责管理运行器、管理员和角色的人。

### 必须修改默认密码

使用公开的默认密码 `AnsibleForms!123` 登录的用户必须先修改密码。在此之前，其他所有 API
调用都会以代码 `password_change_required` 返回 `403`，浏览器会显示修改密码页面。

请登录一次并设置新密码，或者在首次启动之前设置 [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD)。
使用默认密码登录的脚本必须改用其他密码。

### 令牌在注销和修改密码时失效

现在注销会使该会话的令牌失效，修改密码会结束该用户的所有会话，因此修改密码后
请重新登录。

用 `?expiryDays=` 请求的 API 令牌最多有效 [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) 天
（默认 90 天）。使用长期 API 令牌的脚本必须在令牌过期前申请新令牌。

### Entra ID 需要您的租户

Entra ID（Azure AD）登录现在只针对您自己的租户使用 OpenID Connect，其他租户的用户无法
登录。没有租户 ID，或租户为 `common`、`organizations` 或 `consumers` 的提供方会被拒绝。

- **在 SSO 提供方上设置租户 ID**：目录（租户）ID，即一个 GUID，或者租户的域名。
- **授予 Graph 权限：** 登录时会请求 `openid profile email User.Read GroupMember.Read.All`。请为应用
  注册授予委托的 Microsoft Graph 权限 `User.Read` 和 `GroupMember.Read.All`，并获得管理员同意。
- **在角色中优先使用组 ID：** 以 `azuread/<object id>`（从 7.3.0 起为 `entraid/<object id>`）指定组，而不是使用其显示名称。

设置方法参见 [Entra ID](authentication/entra-id.html)。

### 密码有最小长度

通过应用设置的本地密码至少需要
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) 个字符（默认 8 个），并且不能与用户名或
默认密码相同。`PASSWORD_MIN_LENGTH=0` 会关闭长度检查。现有密码仍然有效。

### 为容器设置重启策略

未捕获的异常现在会结束进程，并以 `crit` 级别记录日志，而不是让进程在未知状态下继续运行。请为
容器设置重启策略，例如 Docker 的 `--restart unless-stopped`（docker-compose 项目已设置）。
Kubernetes 会自行重启 pod。

### AWX 连接和首页链接

7 中还有两项内容被移除，在 6.5 上无需做任何事：

- **AWX 和 AAP 连接：** `awx` 表、`/api/v2/awx` 和 A.A.P. 页面已被移除。升级会把每个 AWX 或
  AAP 连接迁移到 **连接 → 运行器**，作为 `awx` 类型的运行器，带有 `awx:` 的表单可以继续工作。
- **`NAV_HOME_LABEL` 和 `NAV_HOME_ICON`：** 不再读取。页眉的第一个链接始终是表单。

### 在 7 中弃用，在 8 中移除

以下内容在 7 中仍然可用，但每次使用时都会记录一条警告。请在版本 8 之前改用替代方案：

| 已弃用 | 替代方案 |
|---|---|
| `VAULT_*` 环境变量 | 名为 `vault` 的密钥库（**连接 → 密钥库**）。7 首次启动时会把这些变量导入一次作为该密钥库，之后忽略它们。 |
| `LOG_SYSLOG_*` 环境变量 | 一个 syslog 服务器（**连接 → Syslog**）。设置了 `LOG_SYSLOG_HOST` 时，7 首次启动会把它们导入一次作为服务器 `syslog`，它像以前一样接收服务器日志，之后忽略这些变量。如果还要发送审计条目，请把它设置为同时接收两者。 |
| 凭据上的 `vault_path`（API、配置种子） | `secret_store` 和 `secret_ref`。参见 [密钥库](secret-stores/)。 |
| `config.yaml` 中的角色 `public` | 角色 `default`。加载配置时文件中的名称会被重命名；ytt 模板需要手动重命名。表单 `roles:` 中的 `public` 仍然匹配。 |
| `POST /api/v2/config/vault/check`、`GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`、`GET /api/v2/secretstore/{id}/mounts` |
| 表单或步骤上的 `hasApproval` | `approval`。`hasApproval` 不再起作用。 |
| 表单上的 `awx: <name>` | `runner: <name>`。AWX 连接是 `awx` 类型的运行器。 |
| 表单上的 `type: multistep` 及其 `steps` | `type: workflow`，其节点指定一个 `runner`。参见 [工作流表单](forms/workflow.html)。 |
| 配置种子中的 `awx:` 部分 | `type: awx` 的 `runners:` 项 |
| `LOCK_PATH` | 无需替代：不再读取，设计器锁保存在数据库中。 |
| 数据库模式的 RTE（自 7.3.0 起）：`RTE_MODE=database` 或没有 `RTE_MODE`，并在 RTE 上设置数据库的 `DB_*` 和 `ENCRYPTION_SECRET` | `RTE_MODE=outbound` 或 `RTE_MODE=inbound`，不含 `DB_*`。RTE 使用加入令牌（`RTE_JOIN_TOKEN`）加入一次，或者在 **连接 → 运行器** 下或配置种子中（`rte_mode`）把其运行器设为该模式。参见 [模式](rte/modes.html)。 |
| `RTE_REGISTER`（自 7.3.0 起，仅限数据库模式） | 加入令牌（`RTE_JOIN_TOKEN`）：RTE 会把自己添加为使用 RTE 凭据登录的运行器。 |
| 配置种子中运行器上的 `api` 或 `userpass` 凭据（自 7.3.0 起） | 与运行器种类相同的凭据（`credential_type: rte`、`awx`、`aap`、`ascender`、`semaphore`、`rundeck` 或 `jenkins`），其服务器写在 `url` 中。 |
| 配置种子中带有自己的 `token`，或 `username` 和 `password` 的运行器（自 7.3.0 起） | `credentials` 部分中与运行器种类相同的凭据，其服务器写在 `url` 中，由运行器用 `credential:` 引用。在此期间，种子会创建一个以该运行器命名的凭据。 |

自 7.3.0 起不再读取 `ENABLE_SSO` 和 `SSO_AUTO_LOGIN`。7.3 首次启动时会把它们迁移一次：`ENABLE_SSO=0` 会禁用
所有 SSO 提供方，`SSO_AUTO_LOGIN=1` 会在唯一启用的提供方上勾选 **跳过登录页**。之后它们会被忽略：只要它们仍被设置，每次启动
都会记录一条警告，每个提供方在 **访问 → SSO** 下都有 **已启用** 和 **跳过登录页**。

---

## 镜像标签

`latest` 在 7.0.0 时移到 7。要停留在 6，请使用标签 `6`（或 `6.5`）而不是 `latest`。
所有标签都列在 [镜像标签](installation/#image-tags) 中。

---

## 回滚

升级前请先进行备份（**设置 → 备份**）。6.5 可以在已升级到 7 的数据库上运行，但只有
备份才能恢复已删除的数据源定义。
