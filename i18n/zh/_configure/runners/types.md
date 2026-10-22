---
layout: default
title: 运行器类型
parent: 运行器
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# 运行器类型
{: .no_toc }

运行器可以是哪些产品，以及它们的地址和登录方式
{: .fs-6 .fw-300 }

**类型** 步骤为每个产品提供一个选项，并各附一条提示；RTE 的提示写出了其全称 *Runtime Environment*。AAP 和
Ascender 保存为类型为 `awx` 的运行器，并带有产品标识（`aap` 或 `ascender`），配置种子也使用这种方式：

| 类型 | URI 示例 | 项目 | 认证方式 |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | 该 RTE 的 `RTE_TOKEN` |
| AAP | `https://aap.example.com/api/controller/v2` | | API 令牌，或用户名和密码 |
| Ascender | `https://ascender.example.com/api/v2` | | API 令牌，或用户名和密码 |
| AWX | `https://awx.example.com/api/v2` | | API 令牌，或用户名和密码 |
| Jenkins | `https://jenkins.example.com` | 作业所在的文件夹（可选） | 用户及该用户的 API 令牌 |
| Rundeck | `https://rundeck.example.com` | 项目名称 | 用户的 API 令牌 |
| Semaphore | `https://semaphore.example.com` | 项目 ID，即 `/project/<id>` 中的数字 | 用户的 API 令牌 |

AWX、AAP 或 Ascender 的地址包含其 API 路径：`/api/v2`，AAP 2.5 及更高版本为 `/api/controller/v2`。
RTE 是以 `AF_ROLE=rte` 启动的 AnsibleForms 镜像；如何运行 RTE 参见
[运行时环境](../rte/)。
