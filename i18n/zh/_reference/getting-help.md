---
layout: default
title: 获取帮助
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# 获取帮助
{: .no_toc }

在哪里提问、报告 bug 或安全问题，以及提出改进建议
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 提问之前

大多数答案都已经写在文档里了；快速查一下往往能省去一来一回：

1. 使用每个页面顶部的搜索框搜索本站。
2. 在 [故障排查](troubleshooting.html) 中查找确切的错误消息，并浏览一下 [常见问题](faq.html)。
3. 查看服务器日志（**设置**，然后 **服务器日志**）和 **状态** 页面，它们会报告大多数配置问题。
4. 查看 [更新日志](changelog.html)：问题可能已在更新的版本中修复。

---

## 去哪里

每类请求都有各自的去处，全部在 GitHub 上：

| 您想要 | 前往 |
|---|---|
| 提问或分享想法 | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| 报告 bug | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| 建议新功能 | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| 报告安全问题 | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)，私下报告 |
| 修正或改进本文档 | 任意页面底部的 **Edit this page on GitHub**，或 [网站的 issue](https://github.com/ansibleforms/website/issues) |

---

## 报告 bug

可以复现的报告修复得最快。bug 报告模板会要求提供以下内容：

* **版本**：显示在顶栏帮助（**?**）菜单的 **关于** 下
* **部署方式**：Docker、Docker Compose、Kubernetes、安装程序（及其引擎）、原生安装或从源码安装
* **复现步骤**：您做了什么、期望发生什么，以及实际发生了什么
* **证据**：服务器日志中的相关行，问题可见时附上截图

如果是表单的问题，请附上一个能体现问题的最小表单定义。发布之前，请从日志和表单中删除密码、令牌、主机名和其他
任何隐私数据：issue 和讨论都是公开的。

---

## 报告安全问题

**切勿为此开公开 issue：** 请使用 [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)，只有维护者能看到。

[安全策略](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) 列出了受支持的版本，以及
报告之后会发生什么。
