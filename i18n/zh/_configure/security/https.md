---
layout: default
title: HTTPS
parent: 安全
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

由应用本身提供 HTTPS，并替换示例证书
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## TLS 在哪里终止

TLS 可以在以下三个位置之一终止，只有第一种涉及本页的设置：

* **在 AnsibleForms 中**，使用 `HTTPS=1`：在 [`PORT`](../customization/server.html#env_PORT) 上使用下面的文件提供 HTTPS，docker-compose 就是这样在 443 上提供的。
* **在反向代理中**，其后的应用使用 `HTTPS=0`：参见 [反向代理](../production/reverse-proxy.html)。
* **在 Kubernetes ingress 中**：参见 [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) 的 Ingress 选项卡以及 chart 的 README。

您可以将第一种与另外两种结合使用，让代理与应用之间的这一段也加密。

---

## 设置

有三个变量控制应用中的 HTTPS：

| 变量 | 默认值 | 含义 |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` 提供 HTTPS，`0` 提供普通 HTTP |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | 私钥，PEM 格式 |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | 服务器证书，PEM 格式 |

在容器镜像中，持久化文件夹为 `/app/dist/persistent`，因此默认文件为
`/app/dist/persistent/certificates/key.pem` 和 `cert.pem`。在 docker-compose 项目中，对应主机上的
`data/certificates/`。

---

## 示例证书

当 `HTTPS=1` 且启动时缺少任一文件时，AnsibleForms 会记录 `httpsKey or httpsCert not found, copying from
templates`，并从镜像中将示例密钥和证书复制到配置的路径。如果复制失败，
应用会停止。

该证书是为 `CN=ansibleforms` 签发的自签名证书，并且 **在每个安装中都相同**：其私钥
随公开镜像一起发布。用于初步试用没有问题，但浏览器会对其发出警告，并且任何人都可以解密
受其保护的流量。在实例保存真实凭据之前，请替换它。

---

## 替换证书

使用由您的 CA 或 ACME 客户端为用户输入的主机名签发的 PEM 格式证书。
证书文件可以包含完整的证书链：先是服务器证书，然后是中间证书。

1. 将文件复制到持久化文件夹，或应用可以读取的任何位置：

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. 如果文件位于其他位置，请将 `HTTPS_KEY` 和 `HTTPS_CERT` 设为它们 **在容器内** 的路径。

3. 重启应用，它会在启动时读取这两个文件。

如果需要快速生成一个您自己的自签名证书（用于测试实例，或代理之后的那一段），可以用 `openssl` 创建：

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## 无需重启即可续期

在设置页面上修改 `HTTPS_KEY` 或 `HTTPS_CERT`，会在正在运行的服务器中重新加载密钥和证书。
新连接会获得新证书，已打开的连接保留旧证书。如果无法读取新文件，或它们不能构成有效的
一对，当前证书会保持不变，并记录一条警告。

只有当设置页面可以写入环境（[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
为 `1`）且该变量未在真实环境中设置时，这种方式才有效。当续期在相同路径下替换文件时，
请重启应用。
