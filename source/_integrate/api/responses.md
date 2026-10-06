---
layout: default
title: Responses and errors
parent: REST API
nav_order: 3
---

# Responses and errors
{: .no_toc }

The shape of a response, and the status codes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Responses are plain JSON, and the HTTP status code tells whether a call succeeded.

## Responses

A successful call returns the object itself, or a list with its size:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

An error returns a message, and details when there are any:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

## Status codes

The status code tells what went wrong:

| Code | Meaning |
|---|---|
| `200` | The call succeeded |
| `401` | The token is missing, wrong or expired: log in or refresh it |
| `403` | The user's roles do not allow the call |
| `404` | The object does not exist |
| `409` | The request is incomplete, for example a launch without data |
| `422` | [Launch validation](../launch-validation/) refused the form's values; `details` lists why |
| `500` | The server failed; the server log has the reason |
