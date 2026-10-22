---
layout: default
title: Kubernetes
parent: 安装
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

使用 Helm chart 安装 AnsibleForms 及其 MySQL 数据库
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Helm chart 会部署 AnsibleForms、MySQL 以及运行 playbook 的 RTE（参见 [values 参考](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)）。
[安装程序](installer.html) 也能根据几个问题安装该 chart，并能升级不是由它安装的 release。同一个
chart 还可以单独安装一个运行器，供运行在别处的 AnsibleForms 使用（参见 [Kubernetes 上的运行器](#a-runner-on-kubernetes)）。

---

## 前提条件

开始之前，您需要：

* **Kubernetes 集群**：并已配置 `kubectl` 可以访问它
* **Helm 3**：用于安装和升级 chart
* **存储**：用于动态供给的 StorageClass，或预先创建的 PersistentVolume
* **Ingress 控制器**：仅在您希望通过 ingress 暴露 AnsibleForms 时需要

---

## 1. 获取 chart 的 values

从 chart 仓库或 OCI registry 把 chart 的默认 values 导出到您自己的文件中：

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Chart 仓库</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">OCI registry</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

无需添加仓库：chart 从 GitHub Container Registry 拉取。

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. 配置存储

AnsibleForms 和 MySQL 都把数据存储在持久卷上。请分别设置它们的 StorageClass 和大小：

```yaml
storages:
  server:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
  mysql:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
```

`className` 为空时使用集群的默认 StorageClass。访问模式默认为 `ReadWriteMany`，许多存储
类并不提供该模式；单副本时使用 `ReadWriteOnce` 即可。关于预先创建的 PersistentVolume，参见 chart 的
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms)。

---

## 3. 设置凭据

AnsibleForms 需要一个管理员账户、一个数据库密码和一个 `ENCRYPTION_SECRET`，后者是加密 AnsibleForms 中所存凭据的
密钥。以后要更换该密钥时，在一次启动中把 [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
设为旧密钥：所有已存储的密钥随后都会用新密钥重新加密。可以通过以下三种方式之一提供它们：

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">在 values 文件中</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">由 chart 生成</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">已有的 Secret</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

在 `my_values.yaml` 中设置它们。chart 会把它们存储在名为 `<release>-secrets` 的 Secret 中：

```yaml
applications:
  server:
    env:
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: a-strong-password
      ENCRYPTION_SECRET: a-random-string-of-32-characters
  mysql:
    password: a-strong-database-password
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="generate" markdown="1" hidden>

让 chart 在首次安装时生成您没有提供的值。之后每次
升级都会保留相同的值：

```bash
--set secrets.generate=true
```

这在 Argo CD 或 Flux 中不起作用，因为它们渲染 chart 时无法访问集群。生成的 Secret
在 `helm uninstall` 后仍会保留；请备份它，因为 `ENCRYPTION_SECRET` 无法找回。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

让 chart 指向您自己管理的 Secret，例如通过 External Secrets、Sealed Secrets 或 SOPS 管理。这样 chart
就不会创建任何 Secret：

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

该 Secret 必须包含 `DB_USER`、`DB_PASSWORD`、`ENCRYPTION_SECRET`、`ADMIN_USERNAME` 和 `ADMIN_PASSWORD`。

</div>
</div>

---

## 4. 选择 RTE 镜像

AnsibleForms 7 自身不运行任何 playbook：由 RTE（运行环境）来运行。chart 把它作为 server pod 中的第二个容器运行，
使用同一个卷，并将它注册为默认运行器 `rte`，因此 playbook 表单无需任何设置即可工作。从 7.3.0 起，
应用通过 `127.0.0.1` 连接它并保持一条 WebSocket 连接（`RTE_MODE=inbound`，参见 [模式](../rte/modes.html)）：RTE 不获取
数据库设置，也不获取加密密钥。chart 的配置种子声明一个包含该令牌和地址的 RTE 凭据，以及
使用该凭据登录的运行器（inbound 模式）。

默认镜像 `ghcr.io/ansibleforms/ansibleforms-rte-full` 包含 ansible 及其 collection，以及 6.5 镜像中已有的 Python 库。
需要更多或更少的内容时，请基于三层 RTE 镜像之一（`ansibleforms-rte-base`、`-rte-core` 或 `-rte-full`，参见
[RTE 镜像](../rte/images.html)）构建您自己的镜像，并让 chart 指向它：

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

应用与 RTE 之间的令牌，以及签署会话的密钥，会在首次安装时生成到
`<release>-keys` Secret 中，并在每次升级时保留。如果使用您自己的配置种子，请把该凭据和运行器加进去：Helm 在安装后打印的说明会告诉您如何操作
（参见 chart 的 [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms)）。

---

## 5. 安装 chart

使用您的 values 把 chart 安装到单独的 namespace 中：

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

使用 OCI registry 时，chart 请写为 `oci://ghcr.io/ansibleforms/charts/ansibleforms`。在任何无人值守运行的场景中，
请用 `--version` 固定 chart 版本，以免新版本被自动安装。

---

## 6. 检查安装

chart 包含一个测试，会同时检查 Web 服务器和数据库连接：

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

当 AnsibleForms 有响应且其数据库接受连接时，测试以 `OK` 结束。

---

## 7. 打开 AnsibleForms

如何访问 AnsibleForms 取决于 server 的暴露方式：

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">端口转发</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

使用默认的 `ClusterIP` service 且没有 ingress 时，集群外部无法访问任何内容。转发一个本地端口
来查看：

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

然后打开 `http://127.0.0.1:8080/`。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

设置 `services.server.type: LoadBalancer`（可选择在 `services.server.loadbalancer.ip` 中指定固定地址），
然后等待 service 获得地址：

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

启用 ingress，并设置路由到您的 ingress 控制器的主机名：

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

chart 的 [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) 介绍了 ingress 后面的 TLS，包括 server 上启用 HTTPS 时
所需的后端设置。

</div>
</div>

---

## 8. 登录

以管理员用户登录，默认为 `admin`。从 Secret 中读取密码：

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

使用 `secrets.existingSecret` 时，请改为从您自己的 Secret 中读取。

---

## Kubernetes 上的运行器

设置 `runner.enabled` 后，chart 只安装一个 RTE：一个为安装在别处（另一个 namespace、另一个
集群或虚拟机上）的 AnsibleForms 服务的运行器。它主动连接应用并保持一条 WebSocket 连接（`RTE_MODE=outbound`，参见 [模式](../rte/modes.html)），因此
不需要数据库、加密密钥或入站端口。它不渲染应用、MySQL、Service 和 Ingress：

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| 值 | 作用 |
|---|---|
| `runner.enabled` | 只安装运行器：没有应用、MySQL、Service 和 Ingress |
| `runner.appUrl` | 用户打开应用时的地址，如有 `BASE_URL` 也要包含。必填 |
| `runner.name` | 它加入时使用的运行器名称（`RTE_NAME`）。为空时使用 release 名称 |
| `runner.joinToken` | 在应用中生成的 [加入令牌](../runners/registration.html#join-tokens)，首次启动时读取，用于立即批准运行器 |
| `runner.appTlsVerify` | `false` 表示接受应用的自签名证书（`APP_TLS_VERIFY=0`），仅限在可信网络内使用 |

没有加入令牌时，运行器会请求加入，并等待管理员在 **连接 > 运行器** 下批准。获批后，它
使用自己的 `RTE_TOKEN` 登录，该令牌保存在 `<release>-keys` Secret 中：请让该 Secret 与 release 一起保留。
当您选择运行器角色和 Kubernetes 时，[安装程序](installer.html#kubernetes) 也会安装这种 runner 模式。

---

## 后续步骤

chart 的 [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) 介绍了其余的配置：

* **您自己的数据库**：设置 `mysql.enabled: false`，并让 AnsibleForms 指向已有的 MySQL 服务器
* **来自 ConfigMap 的表单**：通过 ConfigMap 提供 `config.yaml` 和表单文件
* **ingress 后面的 HTTPS**、资源、节点调度和私有 registry
* **RTE**：其令牌、您自己的 RTE 镜像，或完全不使用 RTE

要迁移到更新的版本，请参见 [在 Kubernetes 上升级](../upgrading/kubernetes.html)。
