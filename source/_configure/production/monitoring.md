---
layout: default
title: Monitoring
parent: Running in production
nav_order: 5
---

# Monitoring
{: .no_toc }

Health probes for a load balancer or Kubernetes, Prometheus metrics, and the Status page
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Health probes

Two endpoints tell a load balancer, a container healthcheck or Kubernetes whether a process can take traffic.
Neither needs a login, and neither returns anything about the setup:

| Endpoint | Answers | Use it for |
|----------|---------|------------|
| `/api/v2/live` | `200` with `{"status":"live"}` as long as the process runs | A liveness probe: restart the process when it stops answering |
| `/api/v2/ready` | `200` with `{"status":"ready"}`, or `503` with `{"status":"not ready","reason":"..."}` | A readiness probe: send traffic only to ready processes |

A process is ready when all of these hold:

* it is not shutting down (`stopping`)
* the database answers (`database unreachable`)
* the schema exists (`schema not provisioned`) and is complete, with every table, column and index of this version
  (`schema not upgraded`); this last check is cached for 30 seconds, so a probe every few seconds stays cheap

Under a [`BASE_URL`](../customization/server.html#env_BASE_URL) the paths start with it, for example
`/ansibleforms/api/v2/ready`. A runtime environment (RTE) answers the same probes at `/live` and `/ready`, without the
schema completeness check; it is not ready while it drains its jobs at shutdown, so no new job is sent to it.
A process started with `AF_ROLE=worker` has no web interface: it answers only `/api/v2/version` and `/health` for its
container healthcheck. See [Scaling](scaling.html) for the roles.

---

## Prometheus metrics

Set [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) to a long random string to serve Prometheus metrics.
A process that serves the web application answers at `/api/v2/metrics`, an RTE at `/metrics`:

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Without `METRICS_TOKEN` the endpoints answer `404`, as if they did not exist, and a request without the right
`Authorization: Bearer <token>` header gets `401`. Every process reports its own figures, so scrape each one:

| Metric | What it measures |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | The process: CPU, memory, event loop lag, garbage collection |
| `af_http_requests_total{route,method,status}` | The requests served |
| `af_http_request_duration_seconds{route}` | How long they took |
| `af_jobs{status}` | Jobs running (`running`) or awaiting approval (`approve`) now |
| `af_jobs_ended_24h{status}` | Jobs that ended in the last 24 hours, by status |
| `af_nodes{role,alive}` | The processes registered on the database, by role, alive or not |
| `af_login_failures_total`, `af_login_lockouts_total` | Failed sign-ins and account lockouts |
| `af_rte_running_jobs`, `af_rte_max_jobs` | On an RTE: the playbooks it runs now, and how many it may run at once |

The job and node figures are read from the database at each scrape. When the database does not answer they are left
out, and the scrape still succeeds with the other metrics.

---

## The Status page

The **Status** page, under **Settings > System**, shows users with the `showSettings` role option how the instance is doing.
It only reads, so refreshing it never sends mail or launches a job. It has two tabs, and the number of problems shows on the **Checks** tab label.

### Checks

Each check is green (healthy), amber (needs attention) or red (a problem), with its details on expanding the row:

| Check | What it looks at |
|-------|------------------|
| Database connection | The database answers |
| Database user | Amber when the user has rights on every database, like `root`, instead of `AnsibleForms.*` only |
| Database schema | Every table, column and index of this version exists, and which patch failed when not |
| Scheduler | A worker runs the system tasks, and none of them has stopped scheduling |
| Nodes | The processes on the database, amber when they run different versions |
| Jobs | Running jobs and jobs awaiting approval, amber when a job has run for more than 24 hours |
| Backup tooling | The dump command of [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) exists, and its version |
| Last backup | Amber when there is none or the newest is more than two days old, red when it has no usable dump |
| Designer lock | Who holds the designer lock, amber when it was held for more than 8 hours |
| Repositories | Red when a repository failed or has no working tree on disk |
| Config seed | The [config seed](../seed/) file is readable and parses, and its last reload worked |
| Secret stores | Every secret store answers, amber when the token of a HashiCorp Vault expires soon |
| Runners | Every runner answers, amber when there is none or no default RTE |
| Server expressions | Amber when [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) is `legacy` |
| Secrets | Amber when `ENCRYPTION_SECRET` is the public default or `ACCESS_TOKEN_SECRET` is not set |
| LDAP | The LDAP server is reachable and its TLS certificate is valid, without signing in to it |
| Job storage | The size of the job tables, amber above 1 GB when no job retention is set |
| Writable folders | Every configured folder can be written to |
| Disk space | The disk holding the backups, amber from 85% used and red from 95% |

### Information

Facts about the instance that have no verdict, the first things a support conversation asks for: the AnsibleForms
version, the base URL, the database version and host, the configuration source, the config seed, the retention
settings, the authentication methods, the mail server, the log level and path, the uptime, the timezone, the Node.js
version and the platform.

The page reads `/api/v2/health`, which needs a signed-in user with `showSettings`. For a monitoring system, use the
probes and the metrics above instead.
