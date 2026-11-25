---
layout: default
title: Webhook
parent: Canais de notificação
nav_order: 4
translated_from: 1a5cc40cf0c26955edbc88786cf2d916f286b30e
---

# Webhook
{: .no_toc }

Um pedido JSON para qualquer endpoint HTTP
{: .fs-6 .fw-300 }

Um canal de webhook envia um pedido JSON para qualquer endpoint HTTP. O seu passo **Endpoint** diz para onde e como, e o seu passo
**Credenciais** contém o **Token bearer**:

| Campo | Significado |
|---|---|
| Url | O endereço para onde o pedido é enviado. |
| Método | `POST` (predefinição) ou `PUT`. |
| Token bearer | Uma credencial **api** de [Ligações > Credenciais](../credentials.html) cuja palavra-passe é enviada como `Authorization: Bearer <password>`. Vazio: sem token. |
| Verificar o certificado TLS | Ligado por predefinição; desligue-o só para um endpoint com um certificado autoassinado. |

{% raw %}
O seu passo **Conteúdo** contém **Cabeçalhos**, cabeçalhos adicionais como um objeto JSON, por exemplo `{ "X-Source": "ansibleforms" }`, e o
**Conteúdo**, o template JSON do corpo. Estes marcadores são preenchidos:

| Marcador | Valor |
|---|---|
| `{{title}}` | O título da notificação |
| `{{text}}` | O seu texto |
| `{{status}}` | O estado da tarefa |
| `{{statusMessage}}` | Porque é que a tarefa [requer atenção](../jobs/statuses.html#a-job-that-needs-attention) (estado `warning`); vazio caso contrário (a partir da 7.8.0) |
| `{{event}}` | O evento da tarefa |
| `{{jobId}}` | O id da tarefa |
| `{{form}}` | O nome do formulário |
| `{{user}}` | O utilizador que iniciou a tarefa |
| `{{link}}` | A ligação para a tarefa |

Um marcador que é uma string JSON inteira (`"{{text}}"`) é substituído pelo valor como JSON; dentro de uma string mais longa, o seu
texto é escapado para JSON. Um marcador desconhecido fica como está escrito. Um conteúdo vazio envia este template:

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
