---
layout: default
title: 重新运行
parent: 运行验证
nav_order: 6
translated_from: 9f52ec39fd40e3d617d9537c5f7d356033bc9d49
---

# 重新运行
{: .no_toc }

重新运行的作业如何验证
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

作业可以通过两种方式重新运行。重新运行如何检查，取决于采用哪一种方式，以及运行验证
模式。

---

## 两种重新运行

这两种方式的区别在于调用方是否发送新的值：

* **按原样**：“重新运行”按钮、不带请求体的 `POST /api/v2/job/{id}/relaunch` ，或者不带
  `values` 的 `relaunch_job` 。
* **带修改**：同样的调用，但附带新的值，叠加在作业已保存的字段值之上：

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## 各自如何检查

运行验证模式决定了重新运行是重放还是重新检查：

| 重新运行 | `off` / `log` | `enforce` |
|---|---|---|
| **按原样** | 重放作业已保存的 extravars，包括密码 | 根据已保存的字段值进行完整检查 |
| **带修改** | 在叠加了修改的已保存值上进行完整检查 | 同样进行完整检查 |

`enforce` 下有一个例外：由管理员级调度运行的作业没有自己的字段值，因此按原样重新运行时，
会为管理员或拥有 `allowScheduledJobs` 角色选项的用户重放该调度已保存的 extravars。

经过检查的重新运行（参见[记录与强制](log-and-enforce.html)）会以调用方的名义启动一个新作业。

---

## 密码字段

已保存的字段值不包含密码，因此经过检查的重新运行对于**可见的密码字段**没有值：

* 重新运行会以 `unsupported` 被拒绝，并列出所缺的 `passwordFields` 。
* 请重新运行表单并输入密码。
* 被表单依赖关系**隐藏**的密码字段不需要填写，也不会阻止重新运行。

在 `enforce` 下，这同样适用于“重新运行”按钮。

---

## 谁可以重新运行

两种重新运行都要求：

* 表单允许重新运行（ `allowRelaunch` ，默认为 true）；
* 拥有 `allowJobRelaunch` 角色选项；
* 用户是**作业的所有者**、管理员，或拥有 `manageAllJobs` 角色选项的用户。

能看到所有作业（ `showAllJobLogs` ）并不足以重新运行其他用户的作业。审批人可以看到等待其
审批的作业，但同样不能重新运行它。
