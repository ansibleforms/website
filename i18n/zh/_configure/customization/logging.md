---
layout: default
title: 日志
parent: 环境变量
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# 日志
{: .no_toc }

日志级别、文件、syslog 和控制台颜色
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

修改这些变量，以调整日志的详细程度、日志文件的位置，或以您自己的时区显示时间戳。

---

## 示例

在文件中记录比控制台更多的日志，并以阿姆斯特丹时间显示日志和作业的时间戳。
在 compose 项目的 `.env` 中：

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Syslog 服务器不再在这里配置：请在 **设置 > 连接 > Syslog** 下添加，参见 [日志](../production/logs.html#syslog)。
下面的 `LOG_SYSLOG_*` 变量自 7 起已弃用。首次启动时如果发现设置了 `LOG_SYSLOG_HOST`，会将它们一次性
导入为 syslog 服务器 `syslog`，用于接收服务器日志，此后便忽略这些变量。

---

## 变量

本组的所有变量，包括其类型、默认值和描述：

{% include env_vars_table.html group="logging" %}
