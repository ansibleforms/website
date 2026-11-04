---
layout: default
title: CyberArk
parent: 密钥库
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

通过 CyberArk CCP 读取凭据，通过其 PVWA 写入
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **实验性。** 尚未在真实的 CyberArk 环境中测试过；欢迎反馈您的发现。

CCP 是 CyberArk Application Access Manager 的 REST 接口。

---

## 密钥库字段

除了 [每个密钥库都有的字段](./#adding-a-store) 之外，CyberArk 密钥库还有以下字段：

| 字段 | 含义 |
|---|---|
| 凭据 | [连接 > 凭据](../credentials.html) 中的一个 **CyberArk** 凭据：CCP 的基础 URL，例如 `https://ccp.example.com`（会自动加上 `/AIMWebService/api/Accounts`）、其 TLS 设置、其 AppID（在 CyberArk 中为 AnsibleForms 定义的应用），以及 PEM 格式的客户端证书和密钥（仅当 AppID 要求时）。 |

---

## 密钥引用

密钥引用以 `;` 分隔的键值对来标识账户：

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- 允许的键：`Safe`、`Folder`、`Object`、`UserName`、`Address`、`Database`、`PolicyID`、
  `Reason`、`Query`、`QueryFormat`、`ConnectionTimeout`、`FailRequestOnPasswordChange`。
- `Query=` 会将引用的其余部分作为原生 CCP 查询传递，除非您另行设置，否则使用 `QueryFormat=Exact`。
- 引用中的 `AppID` 会被忽略：始终使用密钥库的 AppID。
- 账户的密码（`Content`）成为密码；`UserName`、`Address`、`Port` 和
  `Database` 分别填入用户、主机、端口和数据库名称。

---

## 写入凭据

从 7.6.0 起，凭据的用户和密码可在 **保存** 时写入 CyberArk（参见 [写入凭据](./#writing-credentials)）。
CCP 只能读取，因此 AnsibleForms 使用自己的凭据登录，通过 PVWA REST API 写入。

在存储的 **选项** 中开启 **允许写入**，然后填写：

| 字段 | 含义 |
|---|---|
| 允许写入 | 允许凭据在 **保存** 时将其用户和密码写入此存储。默认关闭。 |
| 写入的保险箱 | 可写入凭据的保险箱，以逗号分隔，例如 `Linux, DB`。开启写入时必填。 |
| PVWA 地址 | PVWA 的基础 URL，例如 `https://pvwa.example.com`。必填。 |
| PVWA 凭据 | 一个专用的 **用户和密码** 或 **API** 凭据，从不从密钥库读取，可在这些保险箱中添加账户并更改其密码。必填。 |
| 登录方式 | PVWA 凭据的登录方式：CyberArk（默认）、LDAP、RADIUS 或 Windows。 |
| 平台 ID | 所添加账户的平台，例如 `UnixSSH`。添加新账户时需要。 |

引用与读取时一样指定账户，`Safe=Linux;Object=srv01-root`，平台需要时加上 `Address=srv01.example.com`。

- 新账户会以平台、用户名和密码添加到保险箱。
- 现有账户只有在勾选 **覆盖已存在的密钥** 时才会更改：先改用户名，再改密码。
- 每次写入后都会注销 PVWA 会话。不支持 Privilege Cloud 的 OAuth 登录。

---

## 附加选项

密钥库的附加选项以 JSON 对象设置：

| 键 | 含义 |
|---|---|
| `reason` | 当引用中没有原因时，以 `Reason` 发送，用于 CyberArk 的审计。 |
| `check_ref` | **测试连接** 实际读取的引用。没有它时，测试只验证 CCP 是否应答并接受 AppID。 |
| `timeout_ms` | 请求超时，默认为 10000。 |

例如，要发送一个原因，并让 **测试连接** 读取一个探测账户：

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```
