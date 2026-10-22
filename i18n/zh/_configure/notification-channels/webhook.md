---
layout: default
title: Webhook
parent: 通知通道
nav_order: 4
translated_from: 99bafedd6f37d6afe3104cd7d8819c3891b518d0
---

# Webhook
{: .no_toc }

发往任意 HTTP 端点的 JSON 请求
{: .fs-6 .fw-300 }

Webhook 通道向任意 HTTP 端点发送 JSON 请求。其 **端点** 步骤说明发往哪里以及如何发送，其
**凭据** 步骤保存 **Bearer 令牌**：

| 字段 | 含义 |
|---|---|
| URL | 请求的发送地址。 |
| 方法 | `POST`（默认）或 `PUT`。 |
| Bearer 令牌 | [连接 > 凭据](../credentials.html) 中的一个 **api** 凭据，其密码以 `Authorization: Bearer <password>` 发送。留空：不发送令牌。 |
| 校验 TLS 证书 | 默认开启；仅对使用自签名证书的端点关闭。 |

{% raw %}
其 **内容** 步骤保存 **请求头**（以 JSON 对象表示的额外请求头，例如 `{ "X-Source": "ansibleforms" }`）和
**内容**（请求体的 JSON 模板）。以下占位符会被填入：

| 占位符 | 值 |
|---|---|
| `{{title}}` | 通知的标题 |
| `{{text}}` | 通知的正文 |
| `{{status}}` | 作业状态 |
| `{{event}}` | 作业事件 |
| `{{jobId}}` | 作业 ID |
| `{{form}}` | 表单名称 |
| `{{user}}` | 启动作业的用户 |
| `{{link}}` | 作业的链接 |

占据整个 JSON 字符串的占位符（`"{{text}}"`）会被替换为 JSON 形式的值；位于较长字符串内部时，其
文本会按 JSON 进行转义。未知的占位符保持原样。内容为空时发送以下模板：

```json
{
  "title": "{{title}}",
  "text": "{{text}}",
  "status": "{{status}}",
  "event": "{{event}}",
  "job": { "id": "{{jobId}}", "form": "{{form}}", "user": "{{user}}" },
  "link": "{{link}}"
}
```
{% endraw %}
