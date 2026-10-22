---
layout: default
title: 反向代理
parent: 生产环境运行
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# 反向代理
{: .no_toc }

在 Nginx、Traefik 或 Apache 之后发布 AnsibleForms，放在根路径或子路径下
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 何时使用

AnsibleForms 在同一个端口上提供界面、REST API 和 Swagger；在其前面放一个反向代理可以：

* 在 443 端口上提供服务，并使用现有工具（ACME、企业 CA）管理的证书
* 将 AnsibleForms 发布在子路径下，与其他应用共用一个主机名
* 让应用端口和数据库不暴露在公共网络上

代理是可选的：应用本身也可以提供 HTTPS，参见 [HTTPS](../security/https.html)。

---

## 关键设置

只有少数几项设置会影响 AnsibleForms 在代理之后的行为：

| 设置 | 在代理之后 |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | 代理转发到的端口，默认为 `8000`。docker-compose 项目将其设为 `443`。 |
| [`HTTPS`](../customization/server.html#env_HTTPS) | 当代理终止 TLS 并通过私有网络访问应用时设为 `0`；如果这一段也要加密，则设为 `1`。 |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | 子路径，例如 `/ansibleforms`。当应用有自己的主机名时，保持为 `/`。 |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | 哪些代理可以在 `X-Forwarded-For` 中报告客户端地址，通常为 `1`。参见 [客户端地址](#client-addresses)。 |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | 应用接受的最大 JSON 请求，默认为 50 MB。代理允许的大小必须至少与此相同。 |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | 表单上传字段接受的最大文件，默认为 10 GB。代理也必须允许这个大小，否则上传会在代理处失败。 |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | 应用接受的请求头总大小上限，默认为 16 KB，从 7.1.0 起。参见 [请求头大小](#request-header-size)。 |
| **公共根 URL** | 在 **系统 > 常规** 的 **服务器** 选项卡中：用户访问的地址，包括子路径。它用于生成通知邮件、通道消息和审批请求中的链接。 |

对于 Entra ID 或 OIDC，请将公共地址注册为重定向 URI；如果设置了 `BASE_URL`，还要包括其子路径。

---

## 在子路径下提供服务

`BASE_URL` 把整个应用挂载在子路径下；代理必须 **原样** 转发路径。
当 `BASE_URL=/ansibleforms` 时：

* 界面、`/api/v2/...` 和 Swagger 界面都在 `/ansibleforms/` 下提供
* 界面的 `<base href>` 会在启动时被改写，因此静态资源和 API 调用都在子路径下解析
* 对 `/` 或 `/ansibleforms`（没有末尾斜杠）的请求会被重定向到 `/ansibleforms/`

请保留前缀：Traefik 中不要使用 `StripPrefix`，Nginx 的 `proxy_pass` 中不要带 URI，因为应用需要这个前缀。

**状态** 页面会显示当前生效的基础 URL。

---

## 超时、上传和实时输出

作业页面和作业计数器通过一个长连接的服务器发送事件流
[`/api/v2/events`](../api/events.html) 获知变化，每个浏览器保持一个连接。该事件流会发送关闭代理缓冲的请求头
（`X-Accel-Buffering: no`），并每 15 秒发送一行保活数据，因此常见的 60 秒读取超时不会断开它；
即使代理仍然关闭了它，浏览器也会自行重新连接。启动后紧接着显示在表单下方的输出
则是每两秒读取一次。启动作业的请求在作业创建后立即返回，因此长时间运行的 playbook 不会一直占用
请求。

可能耗时较长的请求有：

* 在 **备份** 页面进行的 **备份和恢复**，它们会等待导出或恢复命令完成，最长为
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS)（默认 3600）
* 通过文件字段进行的 **大文件上传**，它们在一个请求中以流的方式传输整个文件
* 启用 [聊天助手](../chat/) 时的 **聊天消息**，它们会等待模型提供商应答

代理通常在 60 秒后超时，并限制请求体大小（Nginx 默认接受 1 MB）。请为
AnsibleForms 的路由同时提高这两项限制，如下面的示例所示。

---

## 运行器 WebSocket

从 7.3.0 起，[出站运行器](../rte/modes.html#outbound) 会主动连接应用，并在
`<BASE_URL>/api/v2/rte/socket` 上保持一个打开的 WebSocket。代理必须转发协议升级，否则运行器永远无法连接，会不断重试：

| 代理 | WebSocket 需要的配置 |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` 以及 `Upgrade` 和 `Connection` 请求头，Nginx 默认不转发它们 |
| Traefik | 无需配置：WebSocket 会原样通过 |
| Apache | 在 `ProxyPass` 行上使用 `upgrade=websocket`（2.4.47 及更高版本），更早的版本使用 `mod_proxy_wstunnel` |

两端每 20 秒发送一次 ping，因此常见的 60 秒读取超时不会断开空闲的套接字。

---

## 请求头大小

每个请求都在其 `Authorization` 请求头中携带登录令牌，此外还有 cookie 和代理添加的请求头。
代理和应用都会限制请求头的大小，并在 AnsibleForms 看到请求之前拒绝超过上限的请求，
因此服务器日志中不会有任何记录。默认值如下：

| 组件 | 限制 | 默认值 | 拒绝时返回 |
|-----------|-------|---------|--------------|
| AnsibleForms（Node.js） | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE)，所有请求头合计 | 16384 字节 | 431 |
| Nginx | `large_client_header_buffers`，每个请求头字段 | `4 8k`：每个字段 8 KB | 400 |
| Traefik | 入口点的 `http.maxHeaderBytes`，所有请求头合计 | 1 MB | 431 |
| HAProxy | `global` 部分中的 `tune.bufsize`，整个请求头块，减去 `tune.maxrewrite` 预留（1024 字节） | 16384 字节：15360 字节的请求头 | 400 |
| Apache | `LimitRequestFieldSize`，每个请求头字段 | 8190 字节 | 400 |

在 7.0.3 及更早版本中，登录令牌携带单点登录用户的所有组，可能会超出这些限制，参见
[单点登录后表单和作业为空](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431)。
从 7.1.0 起，令牌保持精简，默认值就足够了。当其他因素使请求头变大时，例如
同一域名下其他应用的 cookie，或前面的单点登录网关，请同时提高这些限制：

* AnsibleForms：`MAX_HTTP_HEADER_SIZE=65536`，7.1.0 之前为 `NODE_OPTIONS=--max-http-header-size=65536`；两者都在
  启动时读取，因此修改后请重启应用
* Nginx：在 `http` 或 `server` 块中设置 `large_client_header_buffers 4 32k;`
* HAProxy：在 `global` 部分中设置 `tune.bufsize 65536`；每个流都会获得该大小的缓冲区，因此 HAProxy 建议
  按相同倍数降低全局 `maxconn`，并且 HTTP/2 至少需要默认的 16384
* Apache：在服务器配置或虚拟主机中设置 `LimitRequestFieldSize 32768`

---

## 客户端地址

在代理之后，每个连接都来自代理。没有 [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) 时，
审计记录会为每个操作记录代理的地址，按地址计算的
[登录限制](../security/hardening.html#sign-in-limits-and-passwords) 也会把所有客户端算作同一个地址。
`TRUST_PROXY` 说明当代理在 `X-Forwarded-For` 中报告客户端时，应用可以相信哪些代理：

| 值 | 客户端地址 |
|-------|----------------|
| `0`（默认） | 连接的地址。忽略 `X-Forwarded-For`；空值、`false`、`off` 和 `no` 含义相同。 |
| 一个数字，例如 `1` | 信任应用前面这么多层代理：单个反向代理为 `1`，ingress 前面还有负载均衡器时为 `2`。 |
| 一个列表，例如 `10.0.0.5,172.16.0.0/12` | 信任位于这些地址和 CIDR 范围内的代理。也接受预设值 `loopback`、`linklocal` 和 `uniquelocal`。 |
| `true` | 信任每一跳：使用 `X-Forwarded-For` 最左边的地址。 |

应用从右往左遍历 `X-Forwarded-For`，跳过受信任的代理，取第一个不属于它们的
地址。请使用准确的代理数量或它们的地址：

* `X-Forwarded-For` 是任何客户端都可以发送的普通请求头。数字过大或使用 `true`，会让
  客户端自行选择审计记录中的地址。只有当应用只能通过代理访问时 `true` 才是安全的，
  设置它时服务器会在启动时记录一条 `[SECURITY]` 警告。
* 代理必须添加它接收连接的来源地址，如下面的示例所示
  （Nginx 中为 `$proxy_add_x_forwarded_for`；Traefik 和 Apache `mod_proxy` 默认会添加）。
* 无效的值在设置页面上会被拒绝；如果在环境中设置，启动时会记录一条错误，并且
  不信任任何代理。在设置页面上保存的修改无需重启即可生效。

---

## 示例

每个示例都将 AnsibleForms 发布在 `https://forms.example.com/ansibleforms/`，由代理终止 TLS，
应用以 `HTTPS=0`、`PORT=8000`、`BASE_URL=/ansibleforms` 和 `TRUST_PROXY=1` 运行：

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` 中没有 URI，因此 Nginx 会按原样转发路径，包括前缀。`map` 块放在
`http` 上下文中（`conf.d/` 下的文件会被包含在那里），用于转发运行器的 WebSocket 升级：

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

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

        proxy_http_version 1.1;                         # the Runners' WebSocket
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection $connection_upgrade;

        client_max_body_size    10g;    # UPLOAD_MAX_GB
        proxy_request_buffering off;    # stream uploads instead of spooling them first
        proxy_read_timeout      3600s;  # BACKUP_COMMAND_TIMEOUT_SECONDS
        proxy_send_timeout      3600s;
    }
}
```

不使用子路径时，请使用 `location /`，并且不设置 `BASE_URL`。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

docker-compose 项目中 `app` 服务上的标签，Traefik 位于同一个 Docker 网络中。该服务
不发布自己的端口，Traefik 通过网络访问它：

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

这里特意没有使用 `StripPrefix` 中间件。Traefik 会自行设置 `X-Forwarded-*` 请求头，也不限制
请求体大小，但当备份或上传耗时超过入口点的读取超时时，请检查其 `respondingTimeouts`。
不使用子路径时，规则中只保留 `Host(...)` 部分。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

需要 `mod_proxy`、`mod_proxy_http`、`mod_headers`、`mod_ssl`，并且运行器的 `upgrade=websocket` 需要 Apache 2.4.47 或更高版本。
`ProxyPass` 的两侧都带有前缀：

```apache
<VirtualHost *:443>
    ServerName forms.example.com

    SSLEngine on
    SSLCertificateFile    /etc/pki/tls/certs/forms.example.com.crt
    SSLCertificateKeyFile /etc/pki/tls/private/forms.example.com.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    ProxyPass        /ansibleforms/ http://10.0.0.20:8000/ansibleforms/ timeout=3600 upgrade=websocket
    ProxyPassReverse /ansibleforms/ http://10.0.0.20:8000/ansibleforms/

    # no body cap here : UPLOAD_MAX_GB and API_BODY_LIMIT_MB apply in the application
    LimitRequestBody 0
</VirtualHost>
```

不使用子路径时，请将 `/` 代理到 `http://10.0.0.20:8000/`，并且不设置 `BASE_URL`。

</div>
</div>

要让代理与应用之间的这一段也保持加密，请以 `HTTPS=1` 运行应用，将代理指向
`https://`，并为应用配置一个代理信任的证书，参见 [HTTPS](../security/https.html)。
