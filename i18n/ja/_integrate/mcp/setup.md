---
layout: default
title: セットアップ
parent: MCP サーバー
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# セットアップ
{: .no_toc }

サーバーを有効にし、クライアントを認証します
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 有効にする

[`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) を `1` に設定するか、 **設定 > 接続 > MCP** で有効にします
（ [MCP ページ](#the-mcp-page) を参照）。設定ページで変更すると、再起動なしですぐに反映されます。オフの間は、
エンドポイントは `404` を返します。エンドポイントは次のとおりです。

```
POST <your url>/api/v2/mcp
```

プレーンな JSON レスポンスを返すステートレスな Streamable HTTP を使うため、 `GET` と `DELETE` は 405 を返します。

---

## エージェントにできることを制限する

さらに 2 つのスイッチで、すべてのクライアントに対して MCP サーバーの機能を絞れます。 `ENABLE_MCP` と同じく、再起動なしで反映されます。

| 変数 | `1` の場合 |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | 起動、計画、変更を行うツール（ `launch_job` 、 `relaunch_job` 、 `plan_job` 、 `create_schedule` 、 `delete_schedule` 、 `store_job` 、 `delete_stored_job` ）をまったく提供せず、拒否します。エージェントはフォームの一覧表示、読み取り、入力、スケジュールと保存済みジョブの読み取り、ジョブの追跡はできますが、何も起動も変更もできません。エージェントを安全に試す方法です。 |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | エージェントに見えるのは `enableForChat: true` を設定したフォームだけで、 [チャットアシスタント](../chat/) と同じ一覧です。それ以外のフォームとそのジョブは、見つからないものとして応答します。 |

どちらも既定ではオフです。エージェントにはユーザーのロールが許可するすべてのフォームが見え、それらを起動できます。

---

## MCP ページ

**設定 > 接続 > MCP** には、MCP サーバーの設定が 2 つのタブにまとめられています。

- **一般** には 3 つのスイッチ `ENABLE_MCP` 、 `MCP_READ_ONLY` 、 `MCP_CHAT_FORMS_ONLY` があり、 **保存** で保存します。ほかの 2 つは
  MCP サーバーがオンの間だけ変更できます。
- **クライアントの構成** には、コピー用のボタン付きの **エンドポイント** と、 **Claude Code**
  （ `.mcp.json` 、または `claude mcp add` コマンド）、 **Cursor** （ `~/.cursor/mcp.json` ）、 **VS Code** （ `.vscode/mcp.json` 。サーバーの初回起動時に
  トークンを尋ねます）、 **Codex** （ `~/.codex/config.toml` 。トークンは環境変数
  `ANSIBLEFORMS_TOKEN` に入れます）用のすぐに使える構成が表示されます。それぞれにコピーボタンがあります。 `<your-token>` は、
  **トークンを作成** リンクで作成した自分のトークンに置き換えてください。

エンドポイントは、アプリの URL（ **設定 > URL** ）が設定されていればそこから、なければブラウザーのアドレスから組み立てられます。

---

## 認証

すべてのリクエストに AnsibleForms のアクセストークンが必要です。

```
Authorization: Bearer <token>
```

通常の方法（ `POST /api/v2/auth/login` 、または OIDC / Entra ID のフロー）で取得し、
`POST /api/v2/token` で更新します。 **ログイン用のツールは意図的に用意していません。** ツールの引数として渡したパスワードは、
言語モデルのコンテキストとチャット履歴に残ってしまうためです。

ユーザーのロールでも、 `allowMcp` [ロールのオプション](../config/roles.html) で MCP サーバーが許可されている必要があります。ユーザーのどのロールにも
これが設定されていない場合は、既定でオンの `allowChat` に従います。許可されていないユーザーは、すべてのリクエストで `403` を受け取ります。

- **チャットのバックエンド** は自分でユーザーをログインさせ、リフレッシュトークンを保持し、すべての MCP 呼び出しでアクセス
  トークンを渡します。
- **IDE のクライアント** には、一度設定すれば済むだけの長さで有効なトークンが必要です。 `allowApiTokens` オプションを持つ
  ロールがあれば、 [プロフィール > API トークン](../profile/api-token.html) で作成するか、ログイン URL に
  `?expiryDays=<n>` を付けてログインし、その日数だけ有効なトークンを取得します。

そのようなトークンでコーディングエージェントを接続するには、次のようにします。

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

トークンをヘッダーにしてサーバーを追加します。

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

トークンを環境変数から読み取るようにして、サーバーを `~/.codex/config.toml` に追加します。

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

その後、Codex を起動する前に変数を設定します。

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
