---
layout: default
title: 从源码安装
parent: 升级
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# 从源码安装
{: .no_toc }

升级从源码构建的安装
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

从源码构建的安装通过检出新版本、重新构建并重启
应用来升级。您的设置、表单、playbook、证书和日志存储在 `server/persistent` 中，Git 和
构建都不会修改它。

---

## 升级之前

做好升级准备，以便出现问题时可以回退：

* 在 **设置 → 备份** 下 **进行备份**。新版本会在首次启动时升级数据库 schema。
* **阅读 [更新日志](../changelog)** 中从您的版本到新版本之间的各个版本。
* **要迁移到新的主版本？** 请先遵循 [升级到 v7](../upgrade-7.html)。
* 在更新日志中 **检查新版本所需的 Node.js 版本**。

---

## 1. 获取新版本

获取版本标签并检出您想要的版本。版本标签带有版本号，`git tag` 会列出
它们；`main` 分支可能包含尚未发布的更改：

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. 重新构建

按照与安装时相同的三个步骤重新构建。首先重新构建 client：

```bash
cd client
npm ci
npm run build
```

然后更新 server 的依赖：

```bash
cd ../server
npm ci --omit=dev
```

最后再次把重新构建的 client 复制到 server 的 `views` 文件夹中：

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

把仓库根目录的 `.env.example` 与您的 `persistent/.env` 进行比较，以加入该版本新增的设置。

---

## 3. 重启

重启应用及其 RTE 以加载新代码。数据库 schema 会在首次启动时升级：

```bash
pm2 restart ansibleforms ansibleforms-rte
```

如果从 7.2 升级，RTE 原先以数据库模式运行，带有数据库设置和 `RTE_URL`，该模式在 7.3.0 中弃用，并在 8.0.0 中移除。
请以入站模式重新启动它，并在种子中或 **连接 → 运行器** 下用一个 RTE 凭据声明其运行器，具体参见
[安装](../installation/from-source.html#run)：先执行 `pm2 delete ansibleforms-rte`，再执行其 `pm2 start` 命令。

如果您不使用 PM2 运行应用，请停止 `npm run start` 并再次启动它。

---

## 4. 检查升级

在应用启动时跟踪其日志：

```bash
pm2 logs ansibleforms
```

在 AnsibleForms 中，**帮助 → 关于** 显示正在运行的版本，**设置 → 状态** 显示
数据库、schema 以及 AnsibleForms 所依赖的其他系统的健康状况。

---

## 回滚

要回到之前运行的版本，即升级前 **帮助 → 关于** 显示的版本，请用
`git checkout <version>` 检出其标签，然后按步骤 2 和 3 重新构建并重启。如果该版本无法在升级后的数据库上启动，请恢复您在
**设置 → 备份** 下创建的备份。
