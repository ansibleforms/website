---
layout: default
title: 在表单中使用通道
parent: 通知通道
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# 在表单中使用通道
{: .no_toc }

在通知和审批中引用通道
{: .fs-6 .fw-300 }

表单按名称引用通道：在 `notifications` 中用于作业状态和作业事件，在 `approval` 中用于审批：

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-slack
    - ops-teams
  onStatus:
    - failed

approval:
  title: Remove host $(vm.name) ?
  roles:
    - approvers
  channels:
    - approvers-teams
```

- 聊天和 webhook 通道会收到一条简短的消息（表单、作业、发生了什么），并附带作业的链接；对于
  审批，作业的页面就是批准或拒绝它的地方。
- 列表中的 **邮件** 通道会通过该服务器（而不是默认服务器）向 `recipients`（审批的 `notifications` 地址）
  发送常规邮件。
- 不存在的名称，或已关闭的聊天或 webhook 通道，会被跳过并在日志中注明。
- 已关闭的 **邮件** 通道不会被跳过：邮件会改为通过默认邮件通道发送，日志中也会
  注明。
