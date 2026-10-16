---
layout: default
title: Webhook
parent: Notification channels
nav_order: 4
---

# Webhook
{: .no_toc }

A JSON request to any HTTP endpoint
{: .fs-6 .fw-300 }

A webhook channel sends a JSON request to any HTTP endpoint. Its **Endpoint** step says where and how:

| Field | Meaning |
|---|---|
| Url | The address the request is sent to. |
| Method | `POST` (default) or `PUT`. |
| Bearer token | An **api** credential of [Connections > Credentials](../credentials.html) whose password is sent as `Authorization: Bearer <password>`. Empty: no token. |
| Check the TLS certificate | On by default; turn it off only for an endpoint with a self-signed certificate. |

{% raw %}
Its **Payload** step holds **Headers**, extra headers as a JSON object such as `{ "X-Source": "ansibleforms" }`, and the
**Payload**, the JSON template of the body. These placeholders are filled in:

| Placeholder | Value |
|---|---|
| `{{title}}` | The notification's title |
| `{{text}}` | Its text |
| `{{status}}` | The job status |
| `{{event}}` | The job event |
| `{{jobId}}` | The job id |
| `{{form}}` | The form name |
| `{{user}}` | The user who started the job |
| `{{link}}` | The link to the job |

A placeholder that is a whole JSON string (`"{{text}}"`) is replaced by the value as JSON; inside a longer string, its
text is escaped for JSON. An unknown placeholder is left as written. An empty payload sends this template:

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
