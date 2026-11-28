---
layout: default
title: 镜像
parent: RTE
nav_order: 1
translated_from: 42d2358e58b374791786a5f99e571e566eca4d4a
---

# RTE 镜像
{: .no_toc }

三种已发布的 RTE 镜像，以及包含您的 playbook 所用集合和库的自定义 RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## RTE 镜像

RTE 分三层发布，每一层都基于前一层构建，标签与控制器相同（参见 [镜像标签](../installation/#image-tags)）：

| 镜像 | 包含的内容 | 用途 |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js 和 AnsibleForms 服务器、git、ssh 和 sshpass。没有 python，也没有 ansible，因此它本身无法运行 playbook | 用您自己的 python 和 ansible 版本构建 RTE |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | base 层，加上 python 3.14、ansible-core 和一些常用库（`jmespath`、`netaddr`、`requests`、`paramiko`）。没有集合 | 构建只包含您的 playbook 所用集合和库的更小的 RTE |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | core 层，加上基于同一 ansible-core 的 `ansible` 包，以及 AnsibleForms 6.5 镜像中原有的内容：NetApp、AWS 和 community 集合、`pandas`、`pyvmomi`、`boto3`、mariadb 客户端、ytt 和一些操作系统工具 | **默认镜像。** 直接运行即可：来自 6.5 的 playbook 能找到它们原来使用的内容 |

与控制器镜像一样，每一层都以用户 `node`（uid 1000）运行，playbook 也以该用户运行。

从 7.6.0 起，每一层都以同一标签同时发布 `linux/amd64` 和 `linux/arm64` 版本。您基于某一层构建的 RTE，其架构取决于
构建它的机器：对于 arm64 主机，请在 arm64 机器上构建，或使用 `docker buildx build --platform linux/arm64` 构建。

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

请让镜像与控制器的版本保持一致：`:7` 跟随控制器的 `:7`。集合和角色也可以挂载而不是打包进镜像，挂载到
`/etc/ansible/collections` 和 `/etc/ansible/roles`。这样每次修改都无需重新构建，但运行的内容取决于该卷；
python 库则始终要放进镜像。将所有内容打包进镜像可以复现且启动快，因此是生产环境的做法。

---

## 在设计器中构建

从 7.9.0 起，你可以在设计器中描述运行时环境；[构建器](builder.html) 构建其镜像，推送并签名。

1. 为一个仓库设置用途 **运行时环境**（设置 > 仓库）；它保存这些定义。
2. 在设计器中打开 **运行时环境** 并点击 **新建**：在 **可视化** 标签页中填写，或在 **YAML** 标签页中编写。
3. **保存**，然后 **推送** 将其提交到仓库，再 **构建**：构建是 **作业** 页面上的一个作业，可实时查看其日志。

每个运行时环境是仓库中以其名称命名的独立文件夹，只保存其定义：

```text
rte-netapp/
  rte.yaml
```

Dockerfile、`ansible.cfg` 和 requirements 文件在每次构建时根据定义和应用的版本重新生成，
因此它们在仓库中永远不会过时。**文件** 标签页按构建器收到的样子显示它们。

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

除名称外的每个键都可以省略；**YAML** 标签页的工具栏可在对话框中设置每个部分。

| 键 | 含义 |
|---|---|
| `name` | 运行时环境的名称，也是其文件夹和镜像的名称：小写字母、数字、点、短横线和下划线 |
| `arch` | `all` 表示与已发布镜像一样，为 amd64 和 arm64 生成一个镜像，或仅 `amd64` 或 `arm64`；省略时为 `all`。与构建器主机不同的架构需要 [该主机上的 QEMU](builder.html#amd64-and-arm64) |
| `python` | 镜像运行的 python，3.11 到 3.15；省略时为 3.15 |
| `ansible_core` | 可在该 python 上运行的 ansible-core 发行版（`2.22`）或版本（`2.22.0`）；省略时为可运行的最新版本 |
| `ansible_collections` | 集合，每个都有其 `name`（namespace.name）和可选的 `version`；省略时为最新版本。每个集合自身需要的内容，即其 `requirements.txt` 和 `bindep.txt`（或其 `meta/execution-environment.yml`），会与它一起安装，与 ansible-builder 的做法相同 |
| `python_packages` | Python 包，写成 `requirements.txt` 的行 |
| `os_packages` | Debian 13（trixie）的软件包 |
| `registry` | `credential`：一个 **容器镜像仓库** 凭据，保存镜像仓库的地址和登录信息；`path`：镜像在其中的路径，省略时为其名称；`tag`：`app` 表示应用的版本（`7.9.0`），让重新构建跟随每次升级，或使用你自己的标签 |
| `sbom` | `true` 为镜像附加软件物料清单（SBOM） |
| `sign` | `credential`：一个 **签名密钥** 凭据，构建器用它通过 cosign 3 为镜像签名；用 cosign 3 的 `cosign verify --key <公钥>` 验证（cosign 2 无法读取其签名） |

每个运行时环境都基于应用版本的 `ansibleforms-rte-base` 构建，因此标签为 `app` 而镜像是为旧版本构建的运行时环境，
会在 **运行时环境** 页面上如此显示，并附带 **重新构建**。

---

## 协议约定

控制器和 RTE 必须共享的是它们的协议约定，即双方都会报告的一个编号。只要双方使用相同的协议约定，旧版本的 RTE 就能继续与较新的
控制器配合工作；当某个版本修改了它时，其发行说明会指出 RTE 必须更新。每种模式
都有自己的协议约定：

| 模式 | 协议约定 | 不匹配时 |
|---|---|---|
| 出站、入站 | 3，7.3.0 新增 | 控制器以代码 `4409` 关闭该 RTE 的套接字，并记录 *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*。出站 RTE 会记录 *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*。以其他协议约定发送的作业会被拒绝 |
| 数据库（已弃用） | 2，自 7.0.0 起 | RTE 拒绝控制器的作业 |

运行器上的 **测试连接** 会说明 RTE 使用哪个协议约定以及控制器需要哪一个（参见
[测试连接](../runners/runner-page.html#test-connection)），**状态** 页面的 **运行器** 行也会执行相同的检查。
