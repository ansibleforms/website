---
layout: default
title: Webhook
parent: Canals de notificació
nav_order: 4
translated_from: 99bafedd6f37d6afe3104cd7d8819c3891b518d0
---

# Webhook
{: .no_toc }

Una petició JSON a qualsevol endpoint HTTP
{: .fs-6 .fw-300 }

Un canal webhook envia una petició JSON a qualsevol endpoint HTTP. El seu pas **Endpoint** indica on i com, i el seu pas
**Credencials** conté el **Token bearer**:

| Camp | Significat |
|---|---|
| Url | L'adreça a la qual s'envia la petició. |
| Mètode | `POST` (predeterminat) o `PUT`. |
| Token bearer | Una credencial **api** de [Connexions > Credencials](../credentials.html) la contrasenya de la qual s'envia com a `Authorization: Bearer <password>`. Buit: sense token. |
| Comprova el certificat TLS | Activat per defecte; desactiva'l només per a un endpoint amb un certificat autosignat. |

{% raw %}
El seu pas **Contingut** conté les **Capçaleres**, capçaleres addicionals com un objecte JSON, per exemple `{ "X-Source": "ansibleforms" }`, i el
**Contingut**, la plantilla JSON del cos. S'emplenen aquests marcadors:

| Marcador | Valor |
|---|---|
| `{{title}}` | El títol de la notificació |
| `{{text}}` | El seu text |
| `{{status}}` | L'estat de la tasca |
| `{{event}}` | L'esdeveniment de la tasca |
| `{{jobId}}` | L'id de la tasca |
| `{{form}}` | El nom del formulari |
| `{{user}}` | L'usuari que ha iniciat la tasca |
| `{{link}}` | L'enllaç a la tasca |

Un marcador que ocupa tota una cadena JSON (`"{{text}}"`) se substitueix pel valor com a JSON; dins d'una cadena més llarga, el seu
text s'escapa per a JSON. Un marcador desconegut es deixa tal com està escrit. Un contingut buit envia aquesta plantilla:

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
