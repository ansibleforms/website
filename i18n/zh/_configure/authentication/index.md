---
layout: default
title: 身份验证
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# 身份验证
{: .no_toc }

选择用户的登录方式，以及他们的账户和组如何映射到角色
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 登录方式

AnsibleForms 支持四种登录方式，并且可以同时启用多种：

| 方式 | 适用场景 | 页面 |
|---|---|---|
| 本地账户 | 内置管理员、服务账户、小型团队，或在目录服务不可用时作为备用。 | [本地账户](local.html) |
| LDAP | 用户和组位于 Active Directory、OpenLDAP 或其他 LDAP 目录中。 | [LDAP](ldap.html) |
| Entra ID | 用户使用其 Microsoft 365 / Entra ID 账户登录（单点登录）。 | [Entra ID](entra-id.html) |
| OIDC | 通过其他 OpenID Connect 提供商（例如 Keycloak）进行单点登录。 | [OIDC](oidc.html) |

本地账户和 LDAP 在 **访问 > 用户**、**组** 和 **LDAP** 下配置；Entra ID 和 OIDC 在
**访问 > SSO** 下配置。

---

## 登录时如何选择方式

登录页面有一个用户名和密码表单，每个已启用的单点登录提供商还各有一个按钮：

- **用户名和密码** 首先与本地用户进行比对。只有当没有同名的本地用户且已启用 LDAP 时，
  才会尝试目录服务。本地用户密码错误时会直接被拒绝，不会再询问 LDAP。
- **Entra ID 和 OpenID 按钮** 在启用了相应提供商时显示在 **登录** 下方。它们会把浏览器跳转到
  提供商再跳转回来；密码不会到达 AnsibleForms。

同一时间只能启用一个 Entra ID 提供商和一个 OIDC 提供商：启用其中一个会关闭同类型的其他提供商。
用户名和密码登录失败时始终显示同样的通用消息；具体原因记录在服务器日志和审计日志中。

---

## 切换单点登录

从 7.3.0 起，**访问 > SSO** 下的每个提供商都有两个独立的开关，无需重启即可生效：

| 开关 | 作用 |
|---|---|
| **已启用** | 在登录页面显示该提供商的按钮，并接受通过它的登录。打开它会关闭同类型的其他提供商。 |
| **跳过登录页** | 在该提供商启用期间，用户不经过登录页面，直接跳转到该提供商。为一个提供商打开它会为其他提供商关闭它；对于已关闭的提供商，该开关显示为灰色。 |

用户名和密码表单始终可以通过 `/login?local` 访问，供本地管理员使用或在提供商故障时使用；
退出登录后，以及单点登录返回错误时，也会显示该表单。

`ENABLE_SSO` 和 `SSO_AUTO_LOGIN` 变量已在 7.3.0 中移除。7.3.0 首次启动时会读取它们一次，
只要它们仍被设置，每次启动都会记录一条警告，因此升级后请将它们从环境中删除：

| 7.3.0 之前的变量 | 升级时的处理 |
|---|---|
| `ENABLE_SSO=0` | 关闭所有提供商：提供商的配置保留，但登录页面上不显示按钮 |
| `SSO_AUTO_LOGIN=1` | 当恰好只启用了一个提供商且 `ENABLE_SSO` 不为 `0` 时，为该提供商打开 **跳过登录页** |

---

## 从用户到角色

每次登录都会产生一个用户，带有一个 **类型**（`local`、`ldap`、`azuread` 或 `oidc`）、一个用户名和一个组列表。
每个组都会加上其类型的前缀，因此 Entra ID 组会以 `azuread/...` 的形式保存和显示：

| 登录方式 | 用户名 | 组 |
|---|---|---|
| 本地 | 本地用户名 | `local/<group>`，用户所属的每个本地组各一个 |
| LDAP，`main` 目录 | 用户名属性的值 | `ldap/<cn>`，目录返回的每个组的 CN |
| LDAP，其他目录 | `<directory>/<username>` | `ldap/<directory>/<cn>`，参见 [多个目录](ldap.html#several-directories) |
| Entra ID | `upn` 声明；令牌中没有 `upn` 时使用 `preferred_username` | 每个组的 `azuread/<object id>` 和 `azuread/<display name>`，从 Microsoft Graph 读取 |
| OIDC | `preferred_username` 声明 | `oidc/<name>`，来自 ID 令牌的 `groups` 声明 |

随后，config.yaml 中的 [角色](../config/roles.html) 会匹配这些值：当角色的某个 `groups` 是用户所属的组之一，
或者角色的 `users` 中包含 `<type>/<username>` 时，该角色即适用。每个用户还会获得 `default` 角色。从 7.3.0 起，
角色可以用 `entraid/<group>` 或 `entraid/<upn>` 来指定 Entra ID 成员，它与保存的 `azuread/` 值匹配；在角色中使用
`azuread/` 仍然有效，但将在 8.0 中移除。个人资料和作业的 extravars 中仍然显示 `azuread/`。

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

用户的 **个人资料** 页面列出登录类型、组和角色，这是检查映射最快的方法。
`allowLogin` 角色选项可以拒绝未匹配任何角色的用户登录：在 `default` 上将其设为 `false`，并在允许登录的角色上设为
`true`。
