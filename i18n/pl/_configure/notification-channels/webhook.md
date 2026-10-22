---
layout: default
title: Webhook
parent: Kanały powiadomień
nav_order: 4
translated_from: 99bafedd6f37d6afe3104cd7d8819c3891b518d0
---

# Webhook
{: .no_toc }

Żądanie JSON do dowolnego endpointu HTTP
{: .fs-6 .fw-300 }

Kanał webhook wysyła żądanie JSON do dowolnego endpointu HTTP. Jego krok **Endpoint** mówi dokąd i jak, a krok
**Poświadczenia** zawiera **Token bearer**:

| Pole | Znaczenie |
|---|---|
| Url | Adres, na który wysyłane jest żądanie. |
| Metoda | `POST` (domyślnie) lub `PUT`. |
| Token bearer | Poświadczenie **api** z [Połączenia > Poświadczenia](../credentials.html), którego hasło jest wysyłane jako `Authorization: Bearer <password>`. Puste: bez tokenu. |
| Sprawdzaj certyfikat TLS | Domyślnie włączone; wyłącz tylko dla endpointu z certyfikatem samopodpisanym. |

{% raw %}
Jego krok **Treść** zawiera **Nagłówki**, czyli dodatkowe nagłówki jako obiekt JSON, np. `{ "X-Source": "ansibleforms" }`, oraz
**Treść**, czyli szablon JSON ciała żądania. Wypełniane są te symbole zastępcze:

| Symbol zastępczy | Wartość |
|---|---|
| `{{title}}` | Tytuł powiadomienia |
| `{{text}}` | Jego tekst |
| `{{status}}` | Status zadania |
| `{{event}}` | Zdarzenie zadania |
| `{{jobId}}` | Id zadania |
| `{{form}}` | Nazwa formularza |
| `{{user}}` | Użytkownik, który uruchomił zadanie |
| `{{link}}` | Link do zadania |

Symbol zastępczy, który jest całym ciągiem JSON (`"{{text}}"`), jest zastępowany wartością jako JSON; wewnątrz dłuższego ciągu jego
tekst jest escapowany dla JSON. Nieznany symbol zastępczy zostaje tak, jak go zapisano. Pusta treść wysyła ten szablon:

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
