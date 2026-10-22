---
layout: default
title: 服务器与数据库
parent: 环境变量
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# 服务器与数据库
{: .no_toc }

Web 服务器、MySQL 连接、管理员账户，以及每个进程运行的内容（AF_ROLE 和 RTE_* 变量）
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

当应用运行在反向代理之后、使用其他端口，或连接 compose 项目之外的数据库时，修改这些变量。

---

## 示例

位于终止 TLS 的反向代理之后，路径为 `/ansibleforms`，使用外部 MySQL。在 `docker-compose.yml` 中：

```yaml
    environment:
      - BASE_URL=/ansibleforms        # the proxy forwards /ansibleforms/ unchanged
      - HTTPS=0                       # the proxy terminates TLS
      - PORT=8000
      - DB_HOST=mysql.example.com
      - DB_PORT=3306
      - DB_USER=ansibleforms
      - DB_PASSWORD=change-me
```

这些行替换 compose 文件中该处已有的 `DB_*` 和 `PORT` 行，它们优先于 `.env` 中的同名变量。请删除
`mysqldb` 服务以及等待它的 `depends_on`，并在 `ports` 中映射 8000 端口。代理端的配置见
[反向代理](../production/reverse-proxy.html) 页面。

---

## 变量

本组的所有变量，包括其类型、默认值和描述：

{% include env_vars_table.html group="server" %}
