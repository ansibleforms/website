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

---

## Responses

A successful call returns the object itself, or a list with its size:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

An error returns a message, and details when there are any:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Status codes

The status code tells what went wrong:

| Code | Meaning |
|---|---|
| `200` | The call succeeded |
| `400` | The request is malformed, for example a token refresh without a refresh token, or an upload without a file |
| `401` | The token is missing, wrong or expired: log in or refresh it |
| `403` | The user's roles do not allow the call (approving your own job included, unless its approval sets `allowSelf: true` or you are an admin), or the account must do something first (see below) |
| `404` | The object does not exist |
| `409` | The request is incomplete (a launch without data), or the object is not in a state that allows the action |
| `422` | [Launch validation](../launch-validation/) refused the form's values; `details` lists why |
| `429` | Too many requests to the login and token endpoints, or too many failed logins (see [Authentication](authentication.html)) |
| `500` | The server failed; the server log has the reason |

For a job, a `409` means it is in the wrong state for the action: aborting a job that is not running (or whose abort was already asked),
relaunching a job that is still running, or approving or rejecting a job that no longer waits for an approval.

---

## A 403 with a code

Some `403` answers carry a `code`, for something the user has to do in the browser before any other call works:

```json
{ "error": "...", "code": "password_change_required" }
```

| Code | What to do |
|---|---|
| `password_change_required` | The user signed in with the public default password: change it in the profile first |
| `disclaimer_required` | The disclaimer is switched on and the user has not accepted its current version yet: accept it in the browser |

A long-lived API token (see [Authentication](authentication.html#long-lived-tokens)) is never held back by the disclaimer.
