---
layout: default
title: フォームでのチャネルの使用
parent: 通知チャネル
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# フォームでのチャネルの使用
{: .no_toc }

通知と承認でのチャネルの指定
{: .fs-6 .fw-300 }

フォームはチャネルを名前で指定します。ジョブのステータスとジョブのイベントには `notifications` で、承認には `approval` で指定します。

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

- チャットと Webhook のチャネルには、ジョブへのリンク付きの短いメッセージ（フォーム、ジョブ、起きたこと）が送られます。
  承認の場合は、ジョブのページで承認または却下します。
- リストにある **メール** チャネルは、既定のサーバーではなくそのサーバーを使って、 `recipients` （承認の場合は `notifications` のアドレス）に
  通常のメールを送ります。
- 存在しない名前や、オフになっているチャットまたは Webhook のチャネルはスキップされ、ログに記録されます。
- オフになっている **メール** チャネルはスキップされません。代わりに既定のメールチャネルからメールが送られ、
  その旨がログに記録されます。
