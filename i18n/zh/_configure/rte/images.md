---
layout: default
title: 镜像
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# RTE 镜像
{: .no_toc }

三种已发布的 RTE 镜像，以及包含您的 playbook 所用集合和库的自定义 RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## RTE 镜像

RTE 分三层发布，每一层都基于前一层构建，标签与应用相同（参见 [镜像标签](../installation/#image-tags)）：

| 镜像 | 包含的内容 | 用途 |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js 和 AnsibleForms 服务器、git、ssh 和 sshpass。没有 python，也没有 ansible，因此它本身无法运行 playbook | 用您自己的 python 和 ansible 版本构建 RTE |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | base 层，加上 python 3.14、ansible-core 和一些常用库（`jmespath`、`netaddr`、`requests`、`paramiko`）。没有集合 | 构建只包含您的 playbook 所用集合和库的更小的 RTE |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | core 层，加上基于同一 ansible-core 的 `ansible` 包，以及 AnsibleForms 6.5 镜像中原有的内容：NetApp、AWS 和 community 集合、`pandas`、`pyvmomi`、`boto3`、mariadb 客户端、ytt 和一些操作系统工具 | **默认镜像。** 直接运行即可：来自 6.5 的 playbook 能找到它们原来使用的内容 |

与应用镜像一样，每一层都以用户 `node`（uid 1000）运行，playbook 也以该用户运行。

---

## 构建您自己的 RTE

基于 `ansibleforms-rte-core` 构建，并添加您的 playbook 所用的集合和 python 库。这个 NetApp 示例是
[examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte) 中的 Dockerfile 之一：

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

python 环境和集合文件夹归 `node` 所有，因此这些安装不需要 root。安装操作系统
软件包的层需要为此切换到 `USER root`，并在最后切换回 `USER node`。要使用您自己的 python 和 ansible，请基于
`ansibleforms-rte-base` 构建（同一文件夹中的 `Dockerfile.own-ansible`）。

请让镜像与应用的版本保持一致：`:7` 跟随应用的 `:7`。集合和角色也可以挂载而不是打包进镜像，挂载到
`/etc/ansible/collections` 和 `/etc/ansible/roles`。这样每次修改都无需重新构建，但运行的内容取决于该卷；
python 库则始终要放进镜像。将所有内容打包进镜像可以复现且启动快，因此是生产环境的做法。

---

## 协议约定

应用和 RTE 必须共享的是它们的协议约定，即双方都会报告的一个编号。只要双方使用相同的协议约定，旧版本的 RTE 就能继续与较新的
应用配合工作；当某个版本修改了它时，其发行说明会指出 RTE 必须更新。每种模式
都有自己的协议约定：

| 模式 | 协议约定 | 不匹配时 |
|---|---|---|
| 出站、入站 | 3，7.3.0 新增 | 应用以代码 `4409` 关闭该 RTE 的套接字，并记录 *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*。出站 RTE 会记录 *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*。以其他协议约定发送的作业会被拒绝 |
| 数据库（已弃用） | 2，自 7.0.0 起 | RTE 拒绝应用的作业 |

运行器上的 **测试连接** 会说明 RTE 使用哪个协议约定以及应用需要哪一个（参见
[测试连接](../runners/runner-page.html#test-connection)），**状态** 页面的 **运行器** 行也会执行相同的检查。
