---
layout: default
title: 身份验证
parent: REST API
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# 身份验证
{: .no_toc }

登录、刷新令牌或使用长期令牌
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

每次调用都需要在 `Authorization` 头中携带访问令牌。令牌通过登录获得，并通过
刷新令牌保持有效。

---

## 登录

使用基本认证，以用户名和密码登录：

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

响应包含两个令牌，即访问令牌和刷新令牌：

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## 调用 API

每次调用时都把访问令牌作为 bearer 令牌发送：

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## 刷新令牌

访问令牌会过期（`ACCESS_TOKEN_EXPIRATION`，默认 30 分钟）。使用刷新令牌获取新的访问令牌，
无需密码：

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

响应包含一对新的令牌，结构与登录时相同。刷新令牌只能使用一次：请保留新的刷新令牌以备下次刷新。

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## 长期令牌

无人值守运行的脚本可以使用有效期更长的令牌。从 7.3.0 起，这需要 `allowApiTokens` 角色选项：

* 在 [个人资料 > API 令牌](../profile/api-token.html) 下创建一个。
* 或者在登录时带上 `expiryDays` 查询参数，获得有效期为指定天数的令牌：

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` 只从 URL 中读取，从不从请求体中读取。对于角色中没有 `allowApiTokens` 的用户，它会被忽略，
登录返回的令牌使用通常的有效期。`expiryDays=never` 还需要 `extendedTokenExpiration`。添加 `name`
查询参数（`?expiryDays=90&name=nightly-backup`）可以为令牌命名，该名称会显示在用户的令牌列表中。

长期令牌最多有效 [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) 天，默认
90 天：更长的 `expiryDays` 会被截断为该值，除非它是 `never`。刷新长期令牌会返回普通令牌，因此在其过期后请重新登录。

### 已登录用户的令牌

个人资料中的 **API 令牌** 视图使用以下端点，它们不需要密码，因此适用于任何账户，包括 SSO 账户：

| 调用 | 作用 |
|---|---|
| `GET /api/v2/profile/tokens` | 列出您的 API 令牌，包括其 `sid`、`name`、创建时间、过期时间和最后使用时间 |
| `POST /api/v2/profile/tokens` | 从您的会话生成一个令牌；请求体包含 `expiryDays`（数字或 `never`）以及可选的 `name` |
| `DELETE /api/v2/profile/tokens/{sid}` | 撤销您的某个令牌 |

当使用 API 令牌调用时（令牌不能生成另一个令牌）、没有 `allowApiTokens` 时，或者会话登录已超过 10 分钟时
（代码 `sign_in_again`），`POST` 会返回 `403`：请先重新登录。有效期超过最大值时返回 `400`。

---

## 令牌提前失效的情况

无论是否为长期令牌，发生以下情况之一时，令牌都会在过期前停止工作：

* **其会话注销**：使用该令牌调用 `POST /api/v2/auth/logout` 会使该次登录的令牌失效，且只影响这些令牌。
  在浏览器中注销不会使脚本的令牌失效。
* **修改密码**：用户修改了自己的密码，或管理员为其设置了密码。此前签发的所有令牌都会被拒绝。
* **用户被删除或被封锁**：删除本地用户或封锁用户会使其所有令牌失效。管理员也可以
  结束 LDAP 或 SSO 用户的会话。

被拒绝的令牌返回 `401`。请重新登录，如果密码已修改，请使用新密码。

---

## 每次运行都登录的脚本

登录和令牌端点受到防洪泛和防密码猜测的保护，因此每次运行都登录的脚本
应了解以下限制：

| 限制 | 默认值 | 后果 |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 每个地址每分钟 120 次请求 | 登录、注销、刷新、SSO 端点、`PUT /api/v2/profile`（修改密码）以及 `POST` 或 `DELETE /api/v2/profile/tokens` 返回 `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 连续 5 次登录失败 | 账户被锁定 [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES)（15）分钟，所有登录都返回 `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 来自同一地址的 30 次登录失败 | 在时间窗口结束前，来自该地址的所有登录都返回 `429` |

`429` 带有 `Retry-After` 头，其中是需要等待的秒数：请停下来等待，不要立即重试。被锁定的账户
在锁定结束前连正确的密码也会拒绝，因此一个使用错误密码的脚本会让该用户对所有人都处于锁定状态。
修改密码（`PUT /api/v2/profile`）时输错当前密码也算一次登录失败，被锁定的账户
无法修改密码。成功登录会清除该账户的计数，管理员设置密码也会清除。

为避开这些限制，请登录一次并重复使用令牌，或使用长期令牌，而不要每次调用都
登录。在反向代理后面时，请设置 [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY)，以便服务器看到
客户端的地址，否则所有客户端都会被算作同一个。
