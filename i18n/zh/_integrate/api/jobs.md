---
layout: default
title: 作业
parent: REST API
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# 作业
{: .no_toc }

启动表单、跟踪作业、中止、重新运行或批准作业
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

作业是表单的一次运行。用表单的名称和值启动它，然后通过其 ID 跟踪它。

---

## 启动表单

把表单名称及其值发送到 `POST /api/v2/job`：

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

请求接受以下属性：

| 属性 | 含义 |
|---|---|
| `formName` | 要启动的表单名称。必填。 |
| `extravars` | 作业的额外变量。也接受 `payload` 作为它的别名。 |
| `rawFormData` | 表单字段的值，与浏览器中保存的一致。[运行验证](../launch-validation/) 会检查这些值，并据此构建 extravars。 |
| `credentials` | 按名称传给作业的凭据。 |
| `files` | 表单文件字段的上传内容（参见 [文件上传](../launch-validation/file-uploads.html)）。 |

响应包含新作业的 ID：

```json
{ "id": 42 }
```

要以详细模式运行作业，请在 extravars 中添加 `"__verbose__": true`。这需要 `allowVerboseMode` 角色选项，
否则启动会返回 `403`。

---

## 上传文件

带有文件字段的表单需要先上传文件。将文件作为 multipart 部分 `file` 发送到 `POST /api/v2/job/upload`：

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

响应描述了已存储的上传内容：

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

在启动的 `files` 中，以文件字段的名称原样传入它：`"files": { "firmware": { ... } }`。服务器
会对照自己磁盘上的文件进行检查（参见 [文件上传](../launch-validation/file-uploads.html)）。

---

## 跟踪作业

通过 ID 读取作业：

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

作业包含其 `status`、`extravars`（也以 `payload` 提供，是同一个对象）、`subjobs` 和 `output`。
输出是带有作业页面颜色的 HTML；添加 `?text=true` 可获得纯文本，适合脚本或日志：

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

作业运行时其 `status` 为 `running`，等待批准时为 `approve`。作业以下列状态之一结束：

| 状态 | 含义 |
|---|---|
| `success` | 作业已完成，没有错误 |
| `failed` | 作业失败 |
| `warning` | 多步骤作业已完成，但途中某个设置了 `continue` 的步骤失败 |
| `aborted` | 作业已被中止 |
| `rejected` | 批准被拒绝，因此等待批准的内容没有运行 |
| `abandoned` | 跟踪该作业的进程停止了（重启、容器被替换），作业被放弃 |

被放弃时正在运行器上运行的作业，如果该运行器最终完成了它，仍可能以其实际结果结束。

---

## 查找作业

`GET /api/v2/job` 列出作业，最新的在前，格式为 `{ "count": ..., "records": [ ... ] }`。以下查询参数可以缩小范围：

| 参数 | 含义 |
|---|---|
| `records` | 最多返回多少个作业。默认为 [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE)（1000），最多为 5000，除非 `JOBS_LIST_SIZE` 更高。 |
| `user`, `user_type` | 只返回该用户的作业。省略 `user_type` 时为 `local`（其他类型为 `ldap`、`azuread`、`oidc`）。 |
| `runner` | 只返回在该运行器上运行的作业 |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

用户可以看到自己的作业，以及等待其某个角色可给予的批准的作业。管理员，或带有
`showAllJobLogs` 或 `manageAllJobs` 选项的角色，可以看到所有作业。每条记录包含作业的摘要（`id`、`form`、`status`、`start`、`end`、`user`、`runner` 等）；
要获取 extravars 和输出，请读取作业本身。

`GET /api/v2/job/approvals` 返回一个数字：有多少个作业在等待该用户可给予的批准。

---

## 关于作业的更多信息

以下端点读取某个作业的更多内容：

| 调用 | 返回内容 |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | 启动作业时的字段值，与表单中保存的一致。适用与重新运行相同的权限：您自己的作业（管理员或带有 `manageAllJobs` 的角色则为所有作业）、允许重新运行的表单，以及 `allowJobRelaunch` 角色选项。 |
| `GET /api/v2/job/{id}/events` | playbook 作业的结构化事件（从 7.3.0 起，适用于在 7.3.0 或更高版本 RTE 上运行的 playbook）：每个 play、任务、主机结果和汇总，带有其 `order`、`type`、`play`、`task`、`host`、`duration` 和 `time` |
| `GET /api/v2/job/{id}/events/{order}` | 其中一个事件及其完整的 `result`，与 **任务结果** 对话框中显示的一致；`order` 不是整数时返回 `400`，作业没有该事件时返回 `404` |
| `GET /api/v2/job/{id}/node/{nodeId}` | 工作流作业的一个节点：`{ "node", "job", "extravars", "artifacts" }`，其中 `job` 是该节点自身作业的 ID，节点未运行时为 `null`。 |

---

## 其他操作

以下端点对已有的作业执行操作：

| 调用 | 操作 |
|---|---|
| `POST /api/v2/job/{id}/abort` | 中止正在运行的作业 |
| `POST /api/v2/job/{id}/relaunch` | 重新运行作业，按原样或带修改（参见 [重新运行](../launch-validation/relaunching.html)） |
| `POST /api/v2/job/{id}/approve` | 批准等待批准的作业；您自己的作业会返回 `403`，除非其批准设置了 `allowSelf: true` 或您是管理员 |
| `POST /api/v2/job/{id}/reject` | 拒绝等待批准的作业 |
| `GET /api/v2/job/{id}/download` | 下载作业的输出 |
| `DELETE /api/v2/job/{id}` | 删除作业 |

中止、批准、拒绝和删除会返回一条消息，重新运行还会返回新作业的 ID：

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

在重新运行时添加 `?verbose=true` 可让新作业以详细模式运行，这需要 `allowVerboseMode` 角色选项。如果作业
处于不适合该操作的状态，例如中止一个已经结束的作业，会返回 `409`。
