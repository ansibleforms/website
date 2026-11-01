---
layout: default
title: 环境变量
nav_order: 9
has_children: true
has_toc: false
permalink: /customization/
translated_from: e0bc1d7c5bd2df4a3f9036a2d9413a276b228156
---

# 环境变量
{: .no_toc }

使用环境变量配置 AnsibleForms
{: .fs-6 .fw-300 }

---

面向部署 AnsibleForms 的管理员：服务器读取的环境变量，按主题分组。

无论 AnsibleForms 是用 Docker Compose 运行、在 Kubernetes 上运行还是从源码运行，都通过环境变量进行调整。

---

## 值的来源

服务器从以下来源中第一个设置了该变量的来源读取每个变量，因此列表中位置靠前的值始终优先：

1. **进程环境**：docker-compose 中的 `environment:` 和 `env_file:`（项目的 `.env` 就是这样传入的），
   Kubernetes 上的 `env` 和 `envFrom`，或者启动 `node` 的 shell。
2. **`persistent/.env`**，即设置页面写入的文件（在 docker-compose 项目中为 `data/.env`，使用
   `MANAGED_ENV_PATH` 时为其他路径）。每次启动时都会读取，生产环境中也是如此，并且它永远不会覆盖已经设置的变量。
3. **`server/.env.<NODE_ENV>`**，例如 `.env.development`。仅当 `NODE_ENV` 不是 `production` 时（或设置了
   `FORCE_DOTENV=1` 时）读取，实际上就是在开发模式下 [从源码](../installation/from-source.html) 运行时。
4. **内置默认值**，显示在每组的表格中。

**设置 > 常规** 下的设置页面显示当前生效的值，并将更改保存到 `persistent/.env`。许多变量
保存后立即生效；其他变量会被保存但需要重启，页面会在保存后列出它们。在进程环境中设置的变量
无法在那里修改：页面会将其显示为 *已在环境变量中设置，因此无法在此处更改。*
少数变量，例如 `ENCRYPTION_SECRET` 和 `ACCESS_TOKEN_SECRET`，永远无法通过页面修改。

RTE 读取的变量，例如 `AF_ROLE`、`RTE_MODE`、`APP_URL` 或 `RTE_MAX_JOBS`，根本不在设置页面上：
应用不使用它们，因此请在 RTE 运行的环境中设置。应用本身读取的 `RTE_*` 变量，
即 `RTE_QUEUE_MINUTES` 和 `RTE_FILES_MAX_MB`，是例外，仍保留在页面上。`RTE_MAX_JOBS`、
`RTE_CACHE_MB`、`RTE_FILES` 和 `RTE_DRAIN_SECONDS` 这四个 RTE 变量也可以改为在每个 RTE 的运行器页面上设置，那里的值优先于
变量（参见 [RTE 的设置](../runners/runner-page.html#an-rtes-settings)）。

当 [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` 时，页面只显示值，保存会被拒绝。当
环境在清单中声明时请使用它，详见 [编辑与审计](../seed/environment-and-audit.html)。

[配置种子](../seed/) 不设置任何环境变量。它声明保存在数据库中的对象，其中的
`${ENV_VAR}` 引用会从正在运行的服务器的环境中解析。

有几个变量只从环境中读取，不在表格中：上文介绍的 `MANAGED_ENV_PATH` 和 `FORCE_DOTENV`，
以及系统代理变量 `HTTPS_PROXY` 和 `NO_PROXY`（也会读取小写形式）。出站 RTE 通过
`HTTPS_PROXY` 连接应用，入站 RTE 也通过它发送注册请求，除非应用的主机在 `NO_PROXY` 中（主机名、
`.domain` 后缀，或表示所有主机的 `*`）。

标记为 <span class="af-badge af-badge-secret">机密</span> 的变量保存密码、令牌或密钥：请不要将它们纳入版本
控制，例如放在 Kubernetes Secret 或不提交的 `.env` 文件中。

---

## 本节内容

这些变量按主题分组，每组一个页面：

| 页面 | 内容 |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## 其他变量

以下变量尚未归入任何组：

{{ other }}
{% endif %}
