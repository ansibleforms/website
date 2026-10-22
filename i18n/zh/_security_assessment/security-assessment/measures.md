---
layout: default
title: 安全措施
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# 安全措施
{: .no_toc }

登录、权限、机密和连接如何受到保护
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 在哪里运行

AnsibleForms 是自托管的，运行在您的基础设施上，数据保存在您运行的数据库中。

* 没有 AnsibleForms 云服务或许可证服务器，也没有遥测或更新检查。
* 界面由应用程序自身提供，不从其他站点加载任何内容。
* 应用程序只连接管理员配置的系统，这些系统列在[出站连接](#outbound-connections)中。

各个组成部分及其保存的内容：

| 组成部分 | 作用 | 保存的内容 |
|---|---|---|
| 应用程序 | 网页界面、REST API、调度器 | 本身不保存数据：一切都在数据库中 |
| MySQL 或 MariaDB | 应用程序的数据库 | 用户、组、凭据（已加密）、作业及其 extravars 和输出、审计日志 |
| 运行时环境（RTE） | 在其自己的容器中运行 playbook | 它运行的作业的文件，以及仅在作业运行期间存在的该作业的机密 |
| 持久化文件夹 | 配置、表单、playbook 和上传的文件 | 表单和 playbook 使用的文件 |

完整的介绍请参阅[工作原理](../how-it-works.html)，运行时环境请参阅 [RTE](../rte/)。

---

## 登录

每个读取或修改数据的页面和 API 调用都需要已登录的用户。少数无需登录即可访问的端点用于
登录本身、版本、实例的名称和徽标、API 文档以及首次启动时的数据库设置，
最后一项可以用 [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` 关闭：

| 方式 | 工作原理 |
|---|---|
| 本地账户 | 密码用 bcrypt 哈希，有[最小长度](../security/hardening.html#sign-in-limits-and-passwords)要求，公开的默认管理员密码必须在首次登录时修改 |
| LDAP / Active Directory | 由目录检查密码，其组映射到角色。参见 [LDAP](../authentication/ldap.html) |
| OpenID Connect、Entra ID | 通过您的身份提供商单点登录，同时也带来其自身的多因素认证。参见[认证](../authentication/) |

* 登录失败会[锁定账户](../security/hardening.html#sign-in-limits-and-passwords)，并且登录受速率限制。
* 登录会返回一个有效期 30 分钟的签名访问令牌，以及一个有效期 24 小时的刷新令牌。
* 令牌可以在过期前终止：退出登录、修改密码、用户被封禁以及 API 令牌被撤销，都会在
  所有节点上同时终止令牌，参见[令牌](../security/secrets.html#tokens)。
* AnsibleForms 本身没有多因素认证：在需要的场合请使用单点登录。

---

## 权限

用户能做什么取决于其所在组的角色，服务器会在每个请求上检查：

* 角色在 [config.yaml](../config/roles.html) 中定义：用户能看到哪些表单，以及拥有哪些选项，
  例如设计器、设置页面或其他用户的作业。
* 服务器会根据表单的规则（其字段、字段的值以及用户的访问权限）检查每次运行，包括
  通过 REST API 的运行，参见[运行验证](../launch-validation/)。
* 按照设计，管理员角色可以运行任何 playbook。其他角色只获得被授予的权限：拥有多个角色的用户，只有在
  这些角色都不拒绝某个选项时才能获得该选项，因此只要有一个限制性角色就足以收回它。

---

## 存储的机密

密码、令牌和密钥在写入数据库之前都会加密：

* 每个存储的机密，包括凭据、LDAP 绑定密码、运行器令牌、单点登录客户端密钥、webhook
  地址和 API 密钥，都用 AES-256 加密，每个值使用随机的初始化向量，并基于
  您设置的 [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets) 。
* 任何 API 调用或设置页面都不会显示存储的机密，备份也不包含主密钥。
* 机密可以留在您的 vault 中：作业需要时会读取 [HashiCorp Vault 和 CyberArk](../secret-stores/)。
* 作业的机密以 AES-256-GCM 加密封装后传给运行时环境，密钥由其令牌派生。
* 名称看起来像机密的 extravars 会在作业视图中被掩码，密码字段则始终被掩码，参见[作业数据](../security/hardening.html#job-data)。

数据库的其余部分，即作业、其 extravars 和输出，按原样存储：请用数据库自身的
静态加密和访问控制来保护它，参见[数据库](../security/hardening.html#the-database)。

---

## 审计跟踪

每项变更以及每次被拒绝的尝试都会被记录：

* 每次通过界面或 API 进行的创建、修改和删除，都会写入审计日志，包括用户、其
  地址、操作、对象和结果。拒绝和登录也会被记录，包括失败的登录。
* 看起来像机密的值在写入之前会被隐去。
* 日志默认保留 365 天，并可通过 UDP、TCP 或 TLS 复制到 syslog。

---

## 在浏览器中

界面受到保护，可防止向页面注入代码：

* [Content-Security-Policy](../security/hardening.html#the-content-security-policy) 只允许应用程序自己的脚本和框架。
* 每个响应都带有防护性的响应头：nosniff、框架保护，以及通过 HTTPS 时的 HSTS。
* 表单、帮助文本和聊天回答中的 HTML 会经过清理，作业输出会被转义。

---

## 在服务器上

处理用户输入的代码避免了经典的注入问题：

* 数据库查询以参数形式传递值，从不把值作为文本拼接到查询中。
* 命令（包括 git）通过参数列表运行，从不经过 shell，因此 shell 字符不起任何作用。
* 服务器表达式要经过[表达式清理器](../security/hardening.html#expressions-and-outbound-calls)，其 REST 调用要经过主机过滤器。
* [MCP 服务器](../mcp/)、[聊天助手](../chat/)和指标端点在您开启之前都处于关闭状态。

---

## 连接

进出 AnsibleForms 的流量可以端到端加密：

* 应用程序可以自己提供 [HTTPS](../security/https.html)，也可以位于您的反向代理之后。
* 运行时环境通过 WebSocket 与应用程序通信，使用 HTTPS 地址时为 `wss://` ，应用程序
  还会固定入站运行时环境的证书，参见 [RTE 模式](../rte/modes.html)。
* LDAP、单点登录、运行器、git、密钥库以及表达式的 REST 调用都会检查其所连接
  服务器的证书，除非管理员为使用自签名证书的服务器关闭了该检查。

### 出站连接

AnsibleForms 只连接管理员配置的对象：

| 连接 | 时机 |
|---|---|
| LDAP、OpenID Connect、Entra ID（Microsoft 登录和 Graph） | 设置了该登录方式时 |
| AWX / AAP / Ascender、Semaphore、Rundeck、Jenkins | 表单在该运行器上运行时 |
| Git 服务器 | 设置了仓库时 |
| 邮件服务器、Slack、Teams、Telegram、webhook | 设置了通知通道时 |
| HashiCorp Vault、CyberArk | 设置了密钥库时 |
| 模型提供商（Anthropic、OpenAI 等） | 仅在开启[聊天助手](../chat/)时，该功能默认关闭 |
| 表单中指定的主机和 API | 表单的表达式或 playbook 调用它们时 |
| Syslog 服务器 | 设置了审计或日志转发时 |

---

## 容器

镜像在构建时尽可能以最少的权限运行：

* 应用程序和运行时环境以非特权用户 `node` 运行，而不是 root。
* 它们基于通过摘要固定的精简 Debian 镜像构建，参见[安全开发](development.html#code-analysis-and-dependencies)。
* 应用程序只监听一个端口：8000。

关于保护新实例的步骤，请按照[加固](../security/hardening.html)操作。
