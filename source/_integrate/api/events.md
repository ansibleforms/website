---
layout: default
title: Live events
parent: REST API
nav_order: 4
---

# Live events
{: .no_toc }

Hear when jobs and settings change, instead of polling
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

The server tells its clients what changes, as it changes. A script can listen too, rather than read a job every few seconds.

---

## The stream

`GET /api/v2/events` is a stream of [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
that stays open. Any signed-in user may open it, with the usual bearer token:

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

When something changes, it sends a `changed` event with the name of what changed:

```text
event: changed
data: {"name":"jobs"}
```

---

## Event names

An event carries a name only, never data, so it reveals nothing the user may not see. These names are sent:

| Name | What changed |
|---|---|
| `jobs` | A job: launched, its status or output, deleted |
| `appearance` | The settings the header shows: the theme, the name, an announcement, an environment variable |
| `designer` | A lock of the designer, taken or released |

On hearing a name, re-read what you show through the normal API (for example `GET /api/v2/job/42`), with your own
permissions. A busy name is sent at most once a second.

---

## Keeping it open

The stream is built to survive proxies and load balancers, and a client reconnects on its own:

* On connecting, the server sends a `hello` event, and asks the client to wait 3 seconds before it reconnects.
* Every 15 seconds it sends a comment line (`: ping`), so an idle connection is not closed. Ignore lines that start with `:`.
* Events from every app node reach every stream, whichever node the client is connected to.
* After a reconnect, re-read what you show: an event sent while the stream was down is not sent again.

---

## Health and metrics

The liveness and readiness probes (`/api/v2/live`, `/api/v2/ready`) and the Prometheus metrics (`/api/v2/metrics`) are
meant for monitoring tools rather than scripts that act as a user. See [Monitoring](../production/monitoring.html).
