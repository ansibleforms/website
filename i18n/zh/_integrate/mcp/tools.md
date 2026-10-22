---
layout: default
title: 工具
parent: MCP 服务器
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# 工具
{: .no_toc }

代理用来填写、批准和重新运行表单的工具
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

MCP 服务器最多提供 15 个工具。其中 6 个提供给每个用户；其余的取决于用户的角色选项，因此没有某个选项的用户
根本不会看到对应的工具：

| 工具 | 作用 | 提供条件 |
|---|---|---|
| `list_forms` | 用户可以使用的表单：名称、描述、类别，以及 `enableForChat`（聊天助手是否提供该表单）。 | 始终 |
| `get_form` | 一个表单的完整定义。每个字段还带有 `dynamic`（由表达式或查询求值）和 `dependsOn`（它读取的字段）。 | 始终 |
| `resolve_field` | 根据目前已填写的值对表单求值。见下文。 | 始终 |
| `launch_job` | 用给定的值启动表单，与浏览器提交完全相同。返回作业 ID。 | 始终 |
| `relaunch_job` | 修改部分字段后再次启动作业。见下文。 | 始终 |
| `get_job` | 作业的状态和输出（`tail` 把输出限制为最后几行）。 | 始终 |
| `plan_job` | 以该用户身份在稍后运行一次表单：即表单上 **稍后运行（一次性）** 所做的事。 | `allowPlannedJobs` |
| `create_schedule` | 创建一个调度，周期性的（`cron`）或一次性的（`run_at`），与 **调度** 页面上相同。 | `allowScheduledJobs` |
| `list_schedules` | 用户可以看到的调度：有 `allowScheduledJobs` 时为全部调度，否则为其计划的运行。 | `allowPlannedJobs` 或 `allowScheduledJobs` |
| `get_schedule` | 一个调度，带有其额外变量（看起来像密钥的会被遮盖）以及其上次运行的输出。 | `allowPlannedJobs` 或 `allowScheduledJobs` |
| `delete_schedule` | 取消一次计划的运行，或删除用户可以看到的调度。 | `allowPlannedJobs` 或 `allowScheduledJobs` |
| `list_stored_jobs` | 用户可以看到的 [保存的作业](../jobs/stored-jobs.html)，不含其值。 | `allowStoredJobs` |
| `get_stored_job` | 一个保存的作业及其值，按 `id` 查找，或在用户自己的作业中按 `form` 和 `name` 查找。 | `allowStoredJobs` |
| `store_job` | 以某个名称保存表单的值，与表单上的 **保存** 相同。 | `allowStoredJobs` |
| `delete_stored_job` | 删除用户可以看到的保存的作业。 | `allowStoredJobs` |

`launch_job`、`relaunch_job` 和 `plan_job` 接受 `verbose: true` 以详细模式运行作业，这需要
`allowVerboseMode` 角色选项。设置 [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) 后，启动、计划或
修改类的工具（`launch_job`、`relaunch_job`、`plan_job`、`create_schedule`、`delete_schedule`、`store_job` 和 `delete_stored_job`）
不会提供。

没有用于运行任意表达式、查询、playbook 或 extravars 的工具。表达式
和查询只会按表单定义的方式运行。

[聊天助手](../chat) 也使用这些工具，只是用 **运行** 按钮代替了 `launch_job`。

---

## 填写表单

用表单名称和目前已有的值调用 `resolve_field`，每得到一个回答后再调用一次。它按
依赖顺序处理各字段，并为每个字段报告：

- `status`：`resolved`、`waiting`（带有 `waitingFor`）、`hidden` 或 `error`（字段回退到其默认值）；
- `value`、`default`，对于选择类字段还有 `options`（最多 `maxOptions` 个，默认 200）；
- `needsInput`：没有值的必填字段，或仍为 `__auto__` 的选择；
- `validationErrors`：该值违反的规则，格式为 `[{type, description}]`，带有浏览器的提示消息。

对于整个表单，`missing` 和 `invalid` 列出仍需修正的内容；在 `complete` 为 true 之前，`launch_job` 会拒绝它。

验证使用的是浏览器自己的代码，与 [运行验证](../launch-validation) 共享。隐藏字段不会
被验证，空的可选字段是有效的。

---

## 调度和计划的运行

`plan_job` 接受与 `launch_job` 相同的 `form`、`values` 和 `expectedPayloadHash`，以及运行的 `name` 和 `run_at`，后者是
带有时区偏移或 `Z` 的 ISO 8601 时间（`2026-10-15T22:00:00+02:00`）；不带时区的时间会被拒绝。值会立即解析
并验证，并在运行触发时再次检查，与浏览器中的 [计划的运行](../jobs/schedules.html#planned-runs) 相同。
响应会给出 UTC 时间和应用时钟下的运行时间。

`create_schedule` 接受 `form`、`name`、`cron`（五个字段，例如 `0 22 * * 1-5`）或 `run_at` 二者之一，以及作业获得的
`extraVars`。这样的调度以 `Schedule Service` 身份运行，不经过表单的验证；要以该用户身份运行一次表单，
请使用 `plan_job`。调度名称是唯一的。

---

## 保存的作业

保存的作业是以某个名称保存的表单值；这些工具操作的是与浏览器中相同的保存的作业。

`list_stored_jobs` 列出用户自己的保存的作业，对于拥有 `showSettings` 的用户则列出所有人的，包括其名称、描述、
表单、创建时间和过期时间。标记为 `usable` 的作业（用户自己的、属于其可启动表单的）可以作为 `storedJob`
（`{ "id": 7 }`，或在该表单中用户自己的作业里用 `{ "name": "..." }`）传给 `resolve_field`、`launch_job` 或 `plan_job`：其
值作为起点，`values` 覆盖在其上。密码字段不会被保存，因此请在 `values` 中提供它们。
从保存的作业执行 `launch_job` 和 `plan_job` 时，需要 `resolve_field` 为其返回的 `expectedPayloadHash`，并且
`resolve_field` 会拒绝同时带有 `storedJob` 和 `subform` 的请求。

`store_job` 接受 `form`、在该表单的用户保存的作业中唯一的 `name`、`values`，以及可选的
`description` 和 `expires_at`（带有时区偏移或 `Z` 的 ISO 8601）。其响应会说明哪些密码字段被略去了。

---

## 传递值

传入 `field` 可以只解析该字段及其依赖的内容。对于列表行或向导步骤，传入 `subform`（以及
可选的 `parent`，即父表单的值）。

按浏览器中保存的形式发送值。选择类字段也接受部分记录或其 `valueColumn` 值
（`"vol1"`），为 `multiple` 时接受数组。计算字段会忽略发送的值，除非它们是 `editable`。

---

## 批准确切的 payload

表单完整后，`resolve_field` 还会返回 `launch_job` 将要提交的内容：

- `modeledExtravars`：应用 `model`、`valueColumn` 和 `output` 之后的 extravars，
  密码字段已遮盖；
- `credentials`：作业将使用的 AnsibleForms 凭据（名称，而不是密钥）；
- `payloadHash`：表单名称、真实 extravars 和凭据的 SHA-256 哈希。

把 `modeledExtravars` 展示给操作人员，并把他们批准的 `payloadHash` 作为
`expectedPayloadHash` 传给 `launch_job`。启动时会再次解析表单，如果 payload 不同就会
拒绝，例如因为某个查询现在的结果不同了。
`ansibleforms_user`、`__jobid__` 和 `__verbose__` 在启动时添加，不计入哈希。

`launch_job` 只检查 payload。对表单的修改如果没有改变 payload，就不会导致启动被拒绝。
`resolve_field` 的每个响应还带有 `formFingerprint`，即表单定义的 SHA-256 哈希：如果要在
表单有任何修改后拒绝启动，请在调用 `launch_job` 之前自行比较它，聊天助手的
**运行** 按钮就是这样做的。

---

## 带修改的重新运行

`relaunch_job` 接受作业 `id` 和 `values`：只包含要修改的字段，为原始值。
`values` 覆盖在作业最初启动时的值之上，结果的解析和验证
与 `launch_job` 完全相同，包括列表行，然后由您作为一个
新作业启动（`ansibleforms_user` 是您，而不是原提交者）。原作业的
文件上传会被复用。

不带 `values` 时，它是一次 **按原样** 的重新运行：其存储的 extravars 在
服务器上重放，包括密码（预览中会遮盖它们）。但如果表单的
运行验证为 `enforce`，重新运行会经过与带修改的重新运行相同的检查。

**密码从不与字段值一起存储**，因此当表单显示密码字段时（无论在顶层还是在列表行中），
经过检查的重新运行会被拒绝（`unsupported`，带有 `passwordFields`）。被其依赖关系隐藏的密码字段
不会阻止重新运行。参见 [运行验证](../launch-validation)。

请先带 `preview: true` 调用它：它返回 `modeledExtravars`（密码已遮盖）、
`credentials` 和 `payloadHash`，但不启动。与用户确认后，再带
`expectedPayloadHash` 调用一次。适用与浏览器中重新运行相同的权限：
表单必须允许重新运行，并且您的角色需要 `allowJobRelaunch` 选项。没有
存储表单数据的作业（在重新运行功能出现之前启动的）和向导表单不能
带修改重新运行。

REST API 通过 `POST /api/v2/job/{id}/relaunch` 提供同样的功能，请求体为
`{ "values": { ... } }`；不带请求体时，它按原样重放作业。

---

## 错误

被拒绝的调用是一个工具错误，其结构化内容带有 `code` 和详细信息：

| 代码 | 何时出现 |
|---|---|
| `form_incomplete` | 对不完整的表单执行 `launch_job` 或 `relaunch_job`，带有 `missing`、`invalid`、`waiting`、`validationErrors` 和 `rowErrors` |
| `payload_mismatch` | payload 与 `expectedPayloadHash` 不同，带有两个哈希 |
| `access_denied` | 用户的角色不授予该表单、作业、调度或保存的作业，或不授予详细模式，或服务器为只读 |
| `not_found` | 没有这样的表单、子表单或作业 |
| `unsupported` | 向导表单、单独的子表单、文件字段，或者需要显示的密码字段的 `relaunch_job` |
| `no_form_data` | 对没有存储表单值的作业（例如由调度启动的作业）执行带修改的 `relaunch_job`；请改为不带修改地重新运行它 |
| `invalid_request` | 服务器认为格式错误而拒绝的请求 |
| `internal_error` | 其他任何情况 |
