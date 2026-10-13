---
layout: default
title: Reverse proxy
parent: Running in production
nav_order: 1
---

# Reverse proxy
{: .no_toc }

Publish AnsibleForms behind Nginx, Traefik or Apache, at the root or under a subpath
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## When to use one

AnsibleForms serves the interface, REST API and Swagger on one port; a reverse proxy in front of it lets you:

* serve it on port 443 with a certificate managed by your existing tooling (ACME, a corporate CA)
* share one host name with other applications, by publishing AnsibleForms under a subpath
* keep the application port and the database off the public network

A proxy is optional: the application can serve HTTPS itself, see [HTTPS](../security/https.html).

---

## The settings that matter

Only a few settings affect how AnsibleForms behaves behind a proxy:

| Setting | Behind a proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | The port the proxy forwards to, `8000` by default. The docker-compose project sets it to `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` when the proxy terminates TLS and reaches the application over a private network, `1` to encrypt that hop as well. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | The subpath, for example `/ansibleforms`. Leave it at `/` when the application has a host name of its own. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Which proxies may report the client address in `X-Forwarded-For`, usually `1`. See [Client addresses](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | Largest JSON request the application accepts, 50 MB by default. The proxy must allow at least this. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | Largest file a form upload field accepts, 10 GB by default. The proxy must allow it too, or uploads fail there. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | Largest set of request headers the application accepts, 16 KB by default, from 7.0.4. See [Request header size](#request-header-size). |
| **Public root URL** | Under **System > General**, on the **Server** tab: the address users reach, subpath included. It builds the links in notification mails, channel messages and approval requests. |

For Entra ID or OIDC, register the public address as redirect URI, with the `BASE_URL` subpath if set.

---

## Serving under a subpath

`BASE_URL` mounts the whole application under the subpath; the proxy must forward the path **unchanged**.
With `BASE_URL=/ansibleforms`:

* the interface, `/api/v2/...` and the Swagger interface are all served under `/ansibleforms/`
* the `<base href>` of the interface is rewritten at startup, so assets and API calls resolve under the subpath
* a request for `/` or for `/ansibleforms` (no trailing slash) is redirected to `/ansibleforms/`

Keep the prefix: no `StripPrefix` in Traefik, no URI on `proxy_pass` in Nginx, as the application expects it.

The **Status** page shows the base URL in force.

---

## Timeouts, uploads and live output

The jobs page and the job counters hear of changes through one long-lived stream of server-sent events,
[`/api/v2/events`](../api/events.html), held open per browser. The stream sends headers that turn proxy buffering off
(`X-Accel-Buffering: no`) and a keep-alive line every 15 seconds, so the usual 60 second read timeout keeps it open;
when a proxy closes it anyway, the browser reconnects on its own. The output under a form, right after a launch, is
read every two seconds instead. A job launch returns as soon as the job is created, so a long playbook does not hold
a request open.

The requests that can take long are:

* **backup and restore** from the **Backups** page, which wait for the dump or restore command to finish, up to
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (3600 by default)
* **large uploads** through a file field, which stream the whole file in one request
* **chat messages**, when the [chat assistant](../chat/) is enabled, which wait for the model provider to answer

Proxies often time out after 60 seconds and cap request bodies (Nginx accepts 1 MB by default). Raise both for
the AnsibleForms routes, as in the examples below.

---

## Request header size

Every request carries the sign-in token in its `Authorization` header, next to cookies and the headers the proxy adds.
Both the proxy and the application cap the size of the request headers, and refuse a request above the cap before
AnsibleForms sees it, so nothing reaches the server log. The defaults:

| Component | Limit | Default | Refused with |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), all headers together | 16384 bytes | 431 |
| Nginx | `large_client_header_buffers`, per header field | `4 8k`: 8 KB per field | 400 |
| Traefik | `http.maxHeaderBytes` of the entry point, all headers together | 1 MB | 431 |
| HAProxy | `tune.bufsize` in the `global` section, the whole request line and headers (less `tune.maxrewrite`, 1 KB) | 16384 bytes | 400 |
| Apache | `LimitRequestFieldSize`, per header field | 8190 bytes | 400 |

Up to 7.0.3 the sign-in token carried every group of a single sign-on user, and could outgrow these limits, see
[Empty forms and jobs after a single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
From 7.0.4 the token stays small, and the defaults are enough. When something else makes the headers large, such as
cookies of other applications on the same domain or a single sign-on gateway in front, raise the limits together:

* AnsibleForms: `MAX_HTTP_HEADER_SIZE=65536`, or before 7.0.4 `NODE_OPTIONS=--max-http-header-size=65536`; both are
  read at start, so restart the application after a change
* Nginx: `large_client_header_buffers 4 32k;` in the `http` or `server` block
* HAProxy: `tune.bufsize 65536` in the `global` section; it is a buffer per connection, so it also raises the memory
  HAProxy uses
* Apache: `LimitRequestFieldSize 32768` in the server config or the virtual host

---

## Client addresses

Behind a proxy every connection comes from the proxy. Without [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY),
the audit trail records the proxy's address for every action, and the per-address
[sign-in limits](../security/hardening.html#sign-in-limits-and-passwords) count all clients as one address.
`TRUST_PROXY` says which proxies the application may believe when they report the client in `X-Forwarded-For`:

| Value | Client address |
|-------|----------------|
| `0` (default) | The address of the connection. `X-Forwarded-For` is ignored; empty, `false`, `off` and `no` mean the same. |
| A number, e.g. `1` | Trusts that many proxies in front of the application: `1` for a single reverse proxy, `2` for a load balancer in front of an ingress. |
| A list, e.g. `10.0.0.5,172.16.0.0/12` | Trusts the proxies at these addresses and CIDR ranges. The presets `loopback`, `linklocal` and `uniquelocal` are accepted too. |
| `true` | Trusts every hop: the left-most address of `X-Forwarded-For` is used. |

The application walks `X-Forwarded-For` from the right, skips the trusted proxies, and takes the first address that is
not one of them. Use the exact number of proxies, or their addresses:

* `X-Forwarded-For` is a plain request header that any client can send. A number that is too high, or `true`, lets a
  client choose the address the audit trail records. `true` is only safe when the application can be reached through
  the proxy alone, and the server logs a `[SECURITY]` warning at start when it is set.
* The proxy must add the address it received the connection from, as the examples below do
  (`$proxy_add_x_forwarded_for` in Nginx; Traefik and Apache `mod_proxy` add it by default).
* An invalid value is refused on the settings page; set in the environment, it is logged as an error at start and
  no proxy is trusted. A change saved on the settings page applies without a restart.

---

## Examples

Each example publishes AnsibleForms at `https://forms.example.com/ansibleforms/`, with TLS terminated by the proxy and
the application running with `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` and `TRUST_PROXY=1`:

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` names no URI, so Nginx forwards the path as it came in, prefix included:

```nginx
server {
    listen 443 ssl;
    server_name forms.example.com;

    ssl_certificate     /etc/nginx/certs/forms.example.com.crt;
    ssl_certificate_key /etc/nginx/certs/forms.example.com.key;

    location /ansibleforms/ {
        proxy_pass         http://10.0.0.20:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        client_max_body_size    10g;    # UPLOAD_MAX_GB
        proxy_request_buffering off;    # stream uploads instead of spooling them first
        proxy_read_timeout      3600s;  # BACKUP_COMMAND_TIMEOUT_SECONDS
        proxy_send_timeout      3600s;
    }
}
```

Without a subpath, use `location /` and leave `BASE_URL` unset.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Labels on the `app` service of the docker-compose project, with Traefik on the same Docker network. The service
publishes no port of its own, Traefik reaches it on the network:

```yaml
  app:
    image: ghcr.io/ansibleforms/ansibleforms:7
    environment:
      - HTTPS=0
      - PORT=8000
      - BASE_URL=/ansibleforms
      - TRUST_PROXY=1                 # Traefik is the one proxy in front
    labels:
      - traefik.enable=true
      - traefik.http.routers.ansibleforms.rule=Host(`forms.example.com`) && PathPrefix(`/ansibleforms`)
      - traefik.http.routers.ansibleforms.entrypoints=websecure
      - traefik.http.routers.ansibleforms.tls=true
      - traefik.http.routers.ansibleforms.tls.certresolver=letsencrypt
      - traefik.http.services.ansibleforms.loadbalancer.server.port=8000
```

There is no `StripPrefix` middleware on purpose. Traefik sets the `X-Forwarded-*` headers itself and does not cap
the body size, but check the `respondingTimeouts` of the entry point when backups or uploads take longer than its
read timeout. Without a subpath, keep only the `Host(...)` part of the rule.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Needs `mod_proxy`, `mod_proxy_http`, `mod_headers` and `mod_ssl`. Both sides of `ProxyPass` carry the prefix:

```apache
<VirtualHost *:443>
    ServerName forms.example.com

    SSLEngine on
    SSLCertificateFile    /etc/pki/tls/certs/forms.example.com.crt
    SSLCertificateKeyFile /etc/pki/tls/private/forms.example.com.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    ProxyPass        /ansibleforms/ http://10.0.0.20:8000/ansibleforms/ timeout=3600
    ProxyPassReverse /ansibleforms/ http://10.0.0.20:8000/ansibleforms/

    # no body cap here : UPLOAD_MAX_GB and API_BODY_LIMIT_MB apply in the application
    LimitRequestBody 0
</VirtualHost>
```

Without a subpath, proxy `/` to `http://10.0.0.20:8000/` and leave `BASE_URL` unset.

</div>
</div>

To keep the hop between proxy and application encrypted, run the application with `HTTPS=1`, point the proxy at
`https://`, and give the application a certificate the proxy trusts, see [HTTPS](../security/https.html).
