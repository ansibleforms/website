---
layout: default
title: 认证
parent: Git 仓库
nav_order: 2
translated_from: 4d7f58fd454c4caacd674b861ad5a43672910b1c
---

# 认证
{: .no_toc }

使用令牌的 HTTPS、使用生成密钥的 SSH，以及自定义 git 命令
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 认证

AnsibleForms 的认证方式取决于 **URI** 的形式。

### 使用令牌的 HTTPS

对于私有的 HTTPS 远程仓库，请选择一个带有个人访问令牌或密码的**凭据**，用户名可选。从 7.6.0 起，以**令牌**登录的 Git
凭据没有用户名：git 会随之发送用户名 `oauth2`，GitHub、GitLab 和 Azure DevOps 都接受。

从 7.3.0 起，git 通过 `GIT_ASKPASS` 登录：用户名和令牌会传给每个与服务器通信的 git 命令，从不写入
URL，因此不会保存在克隆的 `.git/config` 中，修改后的令牌会在下一次拉取或推送时生效。令牌需要
读权限才能拉取，需要写权限才能推送。公开的远程仓库不需要凭据。

在 7.2.0 及之前，两者都会插入到 URL 中，形如 `https://<user>:<token>@git.example.com/team/forms.git` 。当时创建的克隆会保留
该 URL，直到下一次拉取或推送，届时其远程地址会被设回仓库自己的 **URI**。

### 使用生成密钥的 SSH

对于 SSH 远程仓库，AnsibleForms 使用自己的密钥对进行认证，该密钥对在首次启动时生成。

1. 打开**设置 > 连接 > SSH**，在其**密钥**选项卡上复制**公钥**。
2. 在 git 服务器上添加它，作为该仓库的部署密钥（如果需要推送，请赋予写权限），或者添加给一个有访问权限的用户。
3. 用 SSH **URI** 添加仓库，例如 `git@git.example.com:team/forms.git` ，并且不选择凭据。

密钥对位于 [`HOME_PATH`](../customization/paths.html#env_HOME_PATH) 下的 `.ssh/id_rsa` 中，因此请把该文件夹放在
持久化存储上，否则重新创建容器时密钥会改变。

对于使用 `user@host:path` 形式 URI 的克隆，AnsibleForms 会先对该主机运行 `ssh-keyscan` ，并把其密钥添加到
已知主机中。对于其他远程仓库，请在首次克隆之前，在**设置 > 连接 > SSH** 的**已知主机**选项卡上
添加该主机。

### 自定义 git 命令

克隆、拉取和推送命令可以通过三个设置替换，例如用于添加 git 选项。

| 设置 | 默认值 | AnsibleForms 追加的内容 |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>` 、 `--verbose` 、URI 和名称 |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

从 7.3.0 起，这些命令不经过 shell 运行：引号可以正常使用，但 `;` 、 `|` 、 `&&` 或 `>` 之类的 shell 运算符会被拒绝。
