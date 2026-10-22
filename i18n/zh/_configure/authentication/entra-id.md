---
layout: default
title: Entra ID
parent: 身份验证
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

使用 Microsoft Entra ID（Azure AD）进行单点登录，角色来自用户所属的 Entra ID 组
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 工作原理

启用 Entra ID 提供商后，登录页面会在 **登录** 下方显示一个 Entra ID 按钮。登录过程如下：

1. 按钮把浏览器发送到 `/api/v2/auth/entraid`，再由它重定向到 Microsoft。
2. 用户在 Microsoft 登录，Microsoft 携带授权码重定向回 **重定向 URL**。服务器
   用该授权码向 Microsoft 换取 ID 令牌和用于 Microsoft Graph 的访问令牌。
3. 服务器从 Microsoft Graph（`/v1.0/me/transitiveMemberOf`）读取用户所属的组，因此嵌套组也会计算在内。
4. 这些组按其显示名称用 **组筛选** 进行筛选，保留下来的每个组都保存两次，
   分别为 `azuread/<object id>` 和 `azuread/<display name>`。

用户名是令牌的 `upn` 声明，例如 `jdoe@example.com`；令牌中没有 `upn` 时使用 `preferred_username` 声明。
对于工作账户，两者的值相同。

---

## 注册应用

AnsibleForms 需要在 Entra 管理中心的 **App registrations > New registration** 下进行应用注册：

1. 为其命名，在支持的账户类型中选择 **Accounts in this organizational directory only**，并添加一个
   类型为 **Web** 的重定向 URI：`https://af.example.com/api/v2/auth/entraid/callback`。
2. 在 **Certificates & secrets** 下创建一个客户端密钥并复制其值；该值只显示一次。
3. 在 **API permissions** 下添加 Microsoft Graph 的 **delegated** 权限 `User.Read` 和 `GroupMember.Read.All`，
   并为其授予管理员同意。
4. 在 **Overview** 页面记下 **Application (client) ID** 和 **Directory (tenant) ID**。

重定向 URI 是用户访问 AnsibleForms 的地址，后接 `/api/v2/auth/entraid/callback`。
当 [`BASE_URL`](../customization/server.html#env_BASE_URL) 为 `/forms` 时，它变为
`https://af.example.com/forms/api/v2/auth/entraid/callback`。它必须与提供商凭据中的 **重定向 URI**
完全一致。

在 7.2.0 及更早版本中，路径为 `/api/v2/auth/azureadoauth2/callback`。从 7.3.0 起它仍然有效，因此现有的注册
无需修改；**重定向 URI** 为空的凭据会使用新路径，此时请将新路径添加到注册中。

AnsibleForms 从 Graph 读取组，不使用令牌中的 groups 声明，因此无需在注册中配置
组声明。

---

## 添加提供商

在 **访问 > SSO** 下添加提供商：向导分四步询问其字段，在 **类型** 一步中选择 **Microsoft Entra ID**：

| 步骤 | 字段 | 含义 |
|---|---|---|
| 详情 | 名称、描述 | 提供商的唯一名称，以及可选的描述 |
| 类型 | 提供商 | **Microsoft Entra ID**；创建时设定，之后不可更改 |
| 凭据 | 凭据 | [连接 > 凭据](../credentials.html) 中的一个 **Microsoft Entra ID** 凭据，见下文 |
| 组 | 组筛选 | 正则表达式；只保留显示名称与之匹配的组。留空则保留所有组 |

凭据中保存应用注册的信息，因此只有管理员才能添加或修改它：

| 字段 | 含义 |
|---|---|
| 租户 ID | 必填。Directory (tenant) ID（一个 GUID），或租户的某个域名。只有该租户的用户才能登录 |
| 客户端 ID | Application (client) ID |
| 客户端密钥 | 客户端密钥的值，加密保存或从 [密钥库](../secret-stores/) 读取 |
| 重定向 URI | 与注册时一致，例如 `https://af.example.com/api/v2/auth/entraid/callback`。留空：使用应用的 URL 加回调路径 |

租户 ID 为空的凭据在保存时会被拒绝。多租户端点 `common`、`organizations`
和 `consumers` 会在保存引用该凭据的提供商时被拒绝，因为它们会允许任何
Microsoft 租户的用户登录。登录时，服务器还会检查令牌是否来自配置的租户。之前保存的、没有租户 ID 的提供商
不会让任何人登录：在填写租户 ID 之前，服务器会记录
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`。

在 7.2.0 及更早版本中，租户、客户端 ID、密钥和重定向 URL 是提供商的字段。升级到 7.3.0 时，它们会被移入一个
名为 `<provider>-sso` 的凭据，参见 [凭据中的地址](../credentials/types.html#addresses-in-credentials)。
请为每个新提供商选择一个凭据：服务器仍接受 7.3.0 之前自带客户端 ID 和密钥的提供商，
在选择凭据之前，它会继续使用这些值登录。

同一时间只启用一个 Entra ID 提供商，即 Entra ID 按钮登录时使用的那个。在另一个提供商的行菜单中点击 **启用**，
或打开其 **已启用** 开关，会关闭同类型的其他提供商；列表的 **已启用** 列显示正在使用的是哪一个。提供商
还可以跳过登录页面，参见 [切换单点登录](./#switching-single-sign-on)。保存后立即生效，无需重启。

---

## 映射到角色

在 config.yaml 中，Entra ID 组写作 `entraid/<object id>` 或 `entraid/<display name>`，用户写作 `entraid/<upn>`。
对象 ID 在租户中是唯一的，因此更安全；显示名称则更易读：

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

在 7.2.0 及更早版本中，前缀为 `azuread/`。从 7.3.0 起，在角色中它仍然匹配相同的成员，并将在 8.0 中移除；
角色编辑器会写入 `entraid/`。只有角色接受 `entraid/`：用户的组以 `azuread/<object id>` 和
`azuread/<display name>` 保存，个人资料页面和 `ansibleforms_user` extravar 也如此显示。诸如 `^AF-` 的 **组筛选** 只保留您的角色所用的组；参见 [角色](../config/roles.html)。从 7.1.0 起，
登录令牌不再携带组，因此其大小不再随组的数量增长。对于属于很多组的用户，筛选仍然
有意义：每次登录时与角色比对的组更少，并且用户的
[目录记录](../users-and-groups/directory.html) 只列出起作用的组。在 7.1.0 之前，
属于一百个或更多组的用户需要它才能看到任何表单，参见
[单点登录后表单和作业为空](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431)。

---

## Microsoft Graph 端点

默认情况下，服务器在 `https://login.microsoftonline.com` 让用户登录，并在 `https://graph.microsoft.com` 调用 Microsoft Graph：

| 变量 | 改变的内容 |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | 登录颁发机构，用于国家云，例如 `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | 读取组所用的 Graph 端点，例如 `https://graph.microsoft.us` |

两者都接受不带末尾斜杠的基础 URI，均为 7.3.0 新增。未设置它们时，仍会读取 `AZURE_AUTHORITY_URI` 和 `AZURE_GRAPH_URI`，
并在日志中记录一条警告；这两个变量将在 8.0 中移除。服务器必须能够访问 Graph：无法读取组时登录会失败。

---

## 限制

Entra ID 用户通过 Microsoft 登录，因此有几项功能与本地账户和 LDAP 账户不同：

- 他们在 AnsibleForms 中没有密码，因此无法在其中修改密码；[API 令牌](../profile/api-token.html) 由其会话生成。
- 在 Entra ID 中显示名称不是唯一的：同名的两个组会映射到同一个角色。在角色中按对象 ID
  指定该组，即 `entraid/<object id>`，就只会匹配这个组。
