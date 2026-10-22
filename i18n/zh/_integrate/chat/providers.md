---
layout: default
title: 提供方
parent: 聊天助手
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# 提供方
{: .no_toc }

助手背后的语言模型，以及代理
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

在设置页面上选择提供方。这会填入基础 URL、身份验证方式和
API 版本，它们都可以继续编辑。留空的字段使用提供方的默认值。

| 提供方 | 协议 | 基础 URL（默认） | 密钥发送方式 |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | 必填：`https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`，API 版本 `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | 无 |
| **其他兼容 OpenAI 的服务**（LiteLLM、网关、vLLM、LM Studio 等） | OpenAI | 必填，通常以 `/v1` 结尾 | Bearer |

模型 ID 即提供方或代理所使用的 ID（`claude-opus-5-5`、`gpt-5`、`llama3.3`
等）。助手需要支持 **工具调用** 的模型；小型本地模型对此的支持
程度不一。

对于不需要密钥的本地服务器和代理，只填基础 URL 即可；不会发送任何授权头。

---

## API 密钥

密钥来自一个凭据，因此它像其他所有密钥一样存储和轮换：

* 在 **设置 > 连接 > 凭据** 下创建一个 **api** 类型的凭据（参见 [凭据](../credentials.html)），
  以密钥作为其密码。它也可以从 [密钥库](../secret-stores/) 读取密钥。
* 在聊天设置的 **凭据** 字段中选择它。每条消息都会重新读取密钥，因此
  修改后的密码会在下一条消息时生效。

在凭据功能出现之前保存在设置页面上的密钥，在未选择凭据时仍然有效。
[配置种子](../seed/) 直接以 `api_key` 设置密钥本身。

---

## 用于代理

模型前面的代理或网关可能需要以下设置：

- **身份验证**：密钥的发送方式：`Authorization: Bearer`、`api-key`、`x-api-key`，
  或者不发送。留空则使用提供方的默认值。
- **API 版本**：`anthropic-version` 头，对于兼容 OpenAI 的服务（Azure）则是 URL 中的 `?api-version=`。
- **用户**：每次调用时作为 `user`（兼容 OpenAI）或 `metadata.user_id`
  （Anthropic）发送。有些代理需要它。留空则不发送。
- **忽略证书错误**：不安全；请改用 `NODE_EXTRA_CA_CERTS` 信任代理的 CA。
- **附加请求头**：一个 JSON 对象，例如 `{"X-Org": "ops"}`。值为单行文本，最多 20 个；
  密钥头和内容头不能被替换。

---

## 在容器中、位于代理之后

聊天功能从 AnsibleForms 服务器容器发起普通的出站 HTTPS 连接。如果位于
企业出口代理之后，请设置 `HTTPS_PROXY` **以及** `NODE_USE_ENV_PROXY=1`；缺少后者时，
Node 内置的 HTTP 客户端会忽略 `HTTPS_PROXY`。如果提供方使用由
内部 CA 签发的证书，则需要让 Node 信任该 CA（`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`）。
设置 `NODE_USE_ENV_PROXY=1` 后，位于网络内部的模型或代理必须列在
`NO_PROXY` 中，否则调用会发往出口代理，而出口代理无法访问它。

连接测试失败时会给出主机名和原因（DNS、连接被拒绝或证书不受信任）。
