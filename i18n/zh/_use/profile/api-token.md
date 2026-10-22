---
layout: default
title: API 令牌
parent: 个人资料
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# API 令牌
{: .no_toc }

为脚本和 AI 代理创建令牌
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 谁可以创建

长期有效的令牌让脚本无需您的密码即可调用 API。从 7.3.0 起，它需要 `allowApiTokens` 角色选项：

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

在 7.2.0 及之前，只需要 `extendedTokenExpiration` 选项。7.3.0 之前只设置了该选项的角色会被赋予
`allowApiTokens` ，因此能保留其令牌；两者都设置时，还可以创建永不过期的令牌。参见[角色选项](../config/roles.html#role-options)。

---

## 创建令牌

**个人资料 > API 令牌**标题行上的**新令牌**会打开一个分三步的向导：

1. **详细信息**：一个名称，便于您在列表中认出该令牌，以及它的有效期。可选 30、90、180
   或 365 天，最多不超过 [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) （默认 90），也可以选择该
   最大值本身，拥有 `extendedTokenExpiration` 时还可以选择**永不过期**。请选择您的脚本所需的最短期限。
2. **确认**：本地账户或 LDAP 账户需要输入密码，该密码不会保存在令牌中。Microsoft Entra ID 或
   OIDC 账户在这里没有密码：其令牌由其会话生成，该会话必须是在最多 10 分钟之前
   登录的，因此提供商可能会先要求您重新登录。
3. **复制**：显示令牌，**仅显示一次**。用**复制**复制它，并像保管密码一样妥善保管。

在每次 API 调用的 `Authorization` 请求头中发送该令牌：

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

API 令牌不能用来创建另一个令牌。SSO 账户的令牌带有其最近一次登录时的角色：身份提供商中的
组变更，只有在您重新登录并创建新令牌后才会生效。

---

## 您的令牌

您创建的令牌会列出其名称，以及各自的创建时间、过期时间和最后使用时间；行菜单中的**撤销**可以终止某个令牌。
管理员也可以在**设置 > 用户**下您的页面中看到并撤销它们。令牌在过期时终止，或者更早终止：

- **撤销**，在列表中操作；
- **使用该令牌退出登录**（ `POST /api/v2/auth/logout` ，在 `Authorization` 请求头中带上该令牌），这会将其连同
  创建它的会话一起终止；
- **修改密码**，这会终止您账户在此之前创建的所有令牌和会话；封禁您的账户也是如此。

永不过期的令牌在这些情况下同样会终止。脚本也可以通过登录 API 及其
`expiryDays` 参数自行请求令牌（ `POST /api/v2/auth/login?expiryDays=90` ，或 `expiryDays=never` ）；更长的 `expiryDays` 会被截断
为 `API_TOKEN_MAX_DAYS` 。
