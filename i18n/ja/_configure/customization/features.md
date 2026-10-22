---
layout: default
title: 機能
parent: 環境変数
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# 機能
{: .no_toc }

デザイナー、MCP、チャット、起動時の検証、ジョブリスト、メトリクス、AWX API、クエリのログ
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

アプリケーションの任意の機能をオン／オフにするには、これらを変更します。

---

## 例

AI エージェント向けに MCP サーバーを提供し、起動のたびにフォームの検証ルールを強制します。compose プロジェクトの `.env` では次のようにします。

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` と `ENABLE_CHAT` は再起動なしで反映されます。リクエストのたびに読み込まれるので、設定ページで
切り替えられます。オフの間は、そのエンドポイント（ `/api/v2/mcp` または `/api/v2/chat` ）は `404` を返します。

まずはしばらく `LAUNCH_VALIDATION=log` で運用してください。 `enforce` で拒否されるものを、拒否せずにログに記録します。 [MCP](../mcp/)
と [ログと強制](../launch-validation/log-and-enforce.html) を参照してください。

---

## 変数

このグループのすべての変数と、その型、既定値、説明：

{% include env_vars_table.html group="features" %}
