---
layout: default
title: 密钥与加密
parent: 安全
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# 密钥与加密
{: .no_toc }

两个主密钥、它们保护什么，以及会话和令牌的有效期
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 两个主密钥

两个密钥保护着其他所有内容。请在实例保存真实数据之前设置这两个密钥，将它们保存在实例之外，
并且永远不要随意更改：

| 密钥 | 保护的内容 | 未设置时 | 丢失或更改时 |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | 数据库中保存的每个密码和令牌：凭据、LDAP 绑定密码、运行器令牌、SSO 客户端密钥、Slack 和 Teams 的 webhook 地址、聊天 API 密钥 | 使用一个默认密钥，该密钥在源代码中是公开的 | 丢失：所有保存的密钥都必须重新输入。更改：从 7.3.0 起，所有保存的密钥都会被重新加密，参见 [下文](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | 访问令牌和刷新令牌的签名，包括长期有效的 [API 令牌](../profile/api-token.html) | 每次启动时生成一个随机密钥，因此每次重启都会让所有人退出登录 | 所有会话和所有 API 令牌都会失效 |

只要它们缺失，启动时都会记录一条 `[SECURITY]` 警告。设置页面拒绝编辑它们，
API 从不返回它们，备份也会特意将它们排除在外，因此丢失的 `ENCRYPTION_SECRET` 无法从
任何地方恢复：请在您的密钥管理器中保存一份副本。加密密钥用作 32 个字符的密钥；较短或
较长的值会被填充或截断。

更改 `ACCESS_TOKEN_SECRET` 会立即使所有会话和所有 API 令牌失效。要使某个用户或某个
会话的令牌失效，请使用 [令牌](#tokens) 中介绍的撤销方式。

---

## 更改加密密钥

从 7.3.0 起，设置或更改 `ENCRYPTION_SECRET` 不再会丢失已保存的密钥。下次启动时，worker 会在任何其他操作写入密钥之前，
在一个数据库事务中用新密钥重新加密每一个已保存的密钥：

| 情况 | 需要设置的内容 |
|---|---|
| 实例在没有 `ENCRYPTION_SECRET` 的情况下运行，使用的是公开的默认密钥 | 只需设置 `ENCRYPTION_SECRET`：密钥会从默认密钥重新加密 |
| 实例使用您自己的密钥运行 | 在那一次启动中，将 `ENCRYPTION_SECRET` 设为新密钥，并将 [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) 设为旧密钥 |

当已保存的密钥是用这两者之外的密钥加密时，不会做任何更改，应用会拒绝启动，直到
`ENCRYPTION_SECRET_PREVIOUS` 指定了该密钥。启动完成重新加密后，请删除 `ENCRYPTION_SECRET_PREVIOUS`，并在
每个应用节点、worker 以及每个自行注册的数据库模式 RTE 上设置新的 `ENCRYPTION_SECRET`。这种
自行注册（`RTE_REGISTER`）在 7.3.0 中已弃用：在套接字模式下使用加入令牌（`RTE_JOIN_TOKEN`）加入的 RTE
不需要 `ENCRYPTION_SECRET`，参见 [RTE 模式](../rte/modes.html)。

---

## 令牌

登录会返回一个短期有效的访问令牌和一个有效期更长的刷新令牌，浏览器用后者获取一对新令牌：

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION)：默认为 `30m`。较短的值
  可以限制被截获令牌的使用。
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION)：默认为
  `24h`。这是空闲的浏览器保持登录的时长。
* `allowApiTokens` 角色选项允许用户申请有效期为若干天的 API 令牌，
  `extendedTokenExpiration` 还增加一种永不过期的令牌。只将它们授予需要从脚本访问 API 的角色。
  在 [个人资料页面](../profile/api-token.html) 上，令牌只能从最多 10 分钟前登录的浏览器会话中生成，
  永远不能从另一个 API 令牌生成。永不过期的令牌有效期为 50 年，下面的事件仍然可以使其失效。
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS)：默认为 `90`。API 令牌的
  最长有效期：更长的申请会被截断到这个值。

令牌是签名的 JWT，但服务器还会保存一个已撤销令牌的列表，由所有应用节点共享，因此令牌
可以在过期之前失效：

| 事件 | 失效的内容 |
|-------|-----------|
| 退出登录 | 该次登录的所有令牌：访问令牌、其刷新令牌，以及使用 API 令牌退出登录时的该 API 令牌 |
| 用户或管理员修改密码 | 该用户在修改之前签发的所有令牌，包括 API 令牌，在所有设备上 |
| 关闭用户的 **允许登录** 开关（本地、LDAP 或 SSO 用户），或删除本地用户 | 该用户的所有令牌 |
| 在 LDAP 或 SSO 用户的页面上点击 **结束会话** | 该用户的所有令牌；除非被阻止，否则他们可以再次登录 |
| 在个人资料页面或用户的 **API 令牌** 选项卡上对某个 API 令牌点击 **撤销** | 该 API 令牌，立即失效 |

脚本可以使用其 API 令牌退出登录来使该令牌失效：在 `Authorization` 头中携带该令牌调用
`POST /api/v2/auth/logout`。
