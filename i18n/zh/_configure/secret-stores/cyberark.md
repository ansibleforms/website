---
layout: default
title: CyberArk
parent: 密钥库
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

从 CyberArk Central Credential Provider（CCP）读取凭据
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
