---
layout: default
title: OIDC
parent: 身份验证
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

使用 Keycloak 等 OpenID Connect 提供商进行单点登录，角色来自 groups 声明
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 工作原理

启用 OIDC 提供商后，登录页面会在 **登录** 下方显示一个 OpenID 按钮。登录过程如下：

1. 按钮把浏览器发送到 `/api/v2/auth/oidc`，再由它重定向到提供商（带 PKCE 的
   授权码流程）。
2. 用户在提供商处登录，提供商重定向回 **重定向 URL**。
3. 服务器用授权码换取令牌，并读取 ID 令牌中的声明。
4. 用户名是 `preferred_username` 声明；`groups` 声明中每个通过 **组筛选** 的值
   都会成为一个组 `oidc/<value>`。

AnsibleForms 请求的作用域为 `openid profile email`；作用域不可配置。从 AnsibleForms 退出登录时，
如果提供商公布了结束会话端点，浏览器也会被发送到该端点。

{: .note }
> OIDC 已在 Keycloak 上测试过。其他提供商只要满足下面的要求即可使用。

---

## 提供商要求

提供商必须支持 OpenID Connect 发现，并为 AnsibleForms 提供一个机密客户端：

- **发现**：AnsibleForms 读取 `<issuer>/.well-known/openid-configuration`，因此 AnsibleForms 服务器
  必须能通过 HTTPS 访问颁发者。
- **一个机密客户端**，使用授权码流程，并有客户端 ID 和客户端密钥。
- **重定向 URI** `https://af.example.com/api/v2/auth/oidc/callback`，即用户访问
  AnsibleForms 的地址后接 `/api/v2/auth/oidc/callback`。当 [`BASE_URL`](../customization/server.html#env_BASE_URL)
  为 `/forms` 时，它变为 `https://af.example.com/forms/api/v2/auth/oidc/callback`。
- **ID 令牌中的 `groups` 声明**，包含一个组名列表。没有它，用户就不会获得任何 OIDC 组。
- **一个 `preferred_username` 声明**，它会成为用户名。

---

## Keycloak 示例

此示例使用 `https://keycloak.example.com` 上的 realm `example`；此时颁发者为
`https://keycloak.example.com/realms/example`。在该 realm 中：

1. 在 **Clients** 下创建一个客户端 ID 为 `ansibleforms` 的 OpenID Connect 客户端。打开 **Client authentication**，
   保留 **Standard flow**，并将 **Valid redirect URIs** 设为 `https://af.example.com/api/v2/auth/oidc/callback`。
2. 在客户端的 **Credentials** 选项卡中，复制 **Client secret**。
3. 在 **Client scopes** 选项卡中，打开 `ansibleforms-dedicated`，添加一个映射器 **By configuration > Group Membership**，
   将 **Token Claim Name** 设为 `groups`，关闭 **Full group path**，并打开 **Add to ID token**。

如果打开 **Full group path**，声明中保存的是 `/af-admins` 这样的路径，此时角色必须使用 `oidc//af-admins`。

---

## 添加提供商

在 **访问 > SSO** 下添加提供商：向导分四步询问其字段，在 **类型** 一步中选择 **Open ID**：

| 步骤 | 字段 | 含义 |
|---|---|---|
| 详情 | 名称、描述 | 提供商的唯一名称，以及可选的描述 |
| 类型 | 提供商 | **Open ID**；创建时设定，之后不可更改 |
| 凭据 | 凭据 | [连接 > 凭据](../credentials.html) 中的一个 **Open ID** 凭据，见下文 |
| 组 | 组筛选 | 正则表达式；只保留 `groups` 声明中与之匹配的值。留空则保留所有组 |

凭据中保存客户端信息，因此只有管理员才能添加或修改它：

| 字段 | 含义 |
|---|---|
| 颁发者 | 必填。颁发者 URL，例如 `https://keycloak.example.com/realms/example` |
| 客户端 ID | 提供商处的客户端 ID，例如 `ansibleforms` |
| 客户端密钥 | 客户端密钥，加密保存或从 [密钥库](../secret-stores/) 读取 |
| 重定向 URI | 与注册时一致，例如 `https://af.example.com/api/v2/auth/oidc/callback`。留空：使用应用的 URL 加回调路径 |

在 7.2.0 及更早版本中，颁发者、客户端 ID、密钥和重定向 URL 是提供商的字段。升级到 7.3.0 时，它们会被移入一个
名为 `<provider>-sso` 的凭据，参见 [凭据中的地址](../credentials/types.html#addresses-in-credentials)。
请为每个新提供商选择一个凭据：服务器仍接受 7.3.0 之前自带客户端 ID 和密钥的提供商，
在选择凭据之前，它会继续使用这些值登录。

同一时间只启用一个 OIDC 提供商，即 OpenID 按钮登录时使用的那个。在另一个提供商的行菜单中点击 **启用**，
或打开其 **已启用** 开关，会关闭同类型的其他提供商；列表的 **已启用** 列显示正在使用的是哪一个。
提供商还可以跳过登录页面，参见 [切换单点登录](./#switching-single-sign-on)。

保存提供商后立即生效。当颁发者无法访问时，服务器会记录
`Failed to initialize OIDC strategy`，在再次保存提供商或重启服务器之前，OIDC 登录都会失败。

---

## 映射到角色

在 config.yaml 中，OIDC 组写作 `oidc/<group>`，用户写作 `oidc/<preferred_username>`：

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - oidc/af-admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - oidc/jdoe
```

这些值按精确匹配进行比较，包括大小写。角色选项参见 [角色](../config/roles.html)。

---

## 限制

OIDC 用户在提供商处登录，因此有几项功能与本地账户和 LDAP 账户不同：

- 他们在 AnsibleForms 中没有密码，因此无法在其中修改密码；从 7.2.0 起，[API 令牌](../profile/api-token.html)
  由其会话生成。
- 请让 `groups` 声明保持简短：只发送对 AnsibleForms 有意义的组，例如在提供商处使用专用的
  客户端作用域或组结构，或者用 **组筛选** 对其进行筛选。从 7.1.0 起，AnsibleForms 的登录
  令牌不再携带组；在此之前，属于一百个或更多组的用户可能看不到任何表单，参见
  [单点登录后表单和作业为空](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431)。
