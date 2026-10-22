---
layout: default
title: 安全变量
parent: 环境变量
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# 安全变量
{: .no_toc }

令牌、加密、出站 REST 主机、掩码以及旧的 VAULT_* 设置
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

修改这些变量，以设置您自己的令牌和加密密钥，并限制表单可以调用和显示的内容。

---

## 示例

使用您自己的密钥，将 REST 调用限制在一个 API 和一个内部网络，并多掩码一个键。在 compose 项目的 `.env` 中：

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

请在保存第一个凭据之前设置 `ENCRYPTION_SECRET`。从 7.3.0 起，设置或修改它会在下次启动时重新加密所有已保存的
密钥；如果旧密钥是您自己设置的，则用 `ENCRYPTION_SECRET_PREVIOUS` 指定旧密钥，参见
[更改加密密钥](../security/secrets.html#changing-the-encryption-secret)。

---

## REST 调用和 jq

从 7.3.0 起，REST 辅助函数（`fn.fnRestBasic`、`fn.fnRestAdvanced`、`fn.fnRestJwt`、`fn.fnRestJwtSecure`）会像其他所有连接一样
检查所调用端点的证书；在 7.2.0 及更早版本中，它们从不检查。有三项设置适用于它们：

| 变量 | 默认值 | 作用 |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` 跳过证书检查：仅用于使用自签名证书的端点 |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | REST 调用在因超时失败之前等待应答的时长 |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | jq 过滤器在被停止之前可以运行的时长；jq 输出的上限也为 64 MB |

这三项保存后即生效，无需重启。对于证书由私有 CA 签发的端点，请保持检查开启，
改为让 Node.js 信任该 CA：在应用的环境中将 `NODE_EXTRA_CA_CERTS` 设为包含该 CA 的 PEM 文件，然后重启应用。

---

## 变量

本组的所有变量，包括其类型、默认值和描述：

{% include env_vars_table.html group="security" %}
