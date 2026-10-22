---
layout: default
title: プロバイダー
parent: チャットアシスタント
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# プロバイダー
{: .no_toc }

アシスタントの背後にある言語モデルとプロキシ
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

設定ページでプロバイダーを選びます。これにより、ベース URL、認証、API バージョンが入力されます。
いずれも後から編集できます。空のフィールドにはプロバイダーの既定値が使われます。

| プロバイダー | プロトコル | ベース URL（既定） | キーの送信方法 |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | 必須: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key` 、API バージョン `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | なし |
| **その他の OpenAI 互換** （LiteLLM、ゲートウェイ、vLLM、LM Studio など） | OpenAI | 必須。通常は `/v1` で終わります | Bearer |

モデル ID は、プロバイダーやプロキシが使っているもの（ `claude-opus-5-5` 、 `gpt-5` 、 `llama3.3` など）です。
アシスタントには **ツール呼び出し** に対応したモデルが必要です。小さなローカルモデルでは対応状況がまちまちです。

キーが不要なローカルサーバーやプロキシでは、ベース URL だけで十分です。その場合、認証ヘッダーは送られません。

---

## API キー

キーは認証情報から取得されるため、ほかのシークレットと同じように保存し、ローテーションできます。

* **設定 > 接続 > 認証情報** で、キーをパスワードとする種類 **api** の認証情報を作成します（ [認証情報](../credentials.html) を参照）。
  キーを [シークレットストア](../secret-stores/) から読み取ることもできます。
* チャット設定の **資格情報** フィールドでそれを選びます。キーはメッセージごとに読み取られるため、
  パスワードを変更すると次のメッセージから反映されます。

認証情報の機能ができる前に設定ページで保存したキーは、認証情報を選んでいない間は引き続き使えます。
[設定シード](../seed/) では、キー自体を `api_key` として設定します。

---

## プロキシの場合

モデルの前段にあるプロキシやゲートウェイでは、次の設定が必要になることがあります。

- **認証** : キーの送信方法。 `Authorization: Bearer` 、 `api-key` 、 `x-api-key` 、
  またはなし。空の場合はプロバイダーの既定値を使います。
- **API バージョン** : `anthropic-version` ヘッダー、または OpenAI 互換（Azure）の場合は URL の `?api-version=` です。
- **ユーザー** : すべての呼び出しで `user` （OpenAI 互換）または `metadata.user_id`
  （Anthropic）として送られます。これを必要とするプロキシもあります。空の場合は何も送りません。
- **証明書エラーを無視** : 安全ではありません。代わりに `NODE_EXTRA_CA_CERTS` でプロキシの CA を信頼させてください。
- **追加ヘッダー** : JSON オブジェクト。例 `{"X-Org": "ops"}` 。値は 1 行のテキストで、最大 20 個です。
  キーとコンテンツのヘッダーは置き換えられません。

---

## コンテナー内でプロキシの背後にある場合

チャットは、AnsibleForms サーバーのコンテナーからの通常のアウトバウンド HTTPS を使います。社内の
送信プロキシの背後では、 `HTTPS_PROXY` **と** `NODE_USE_ENV_PROXY=1` を設定してください。2 つ目がないと、
Node の組み込み HTTP クライアントは `HTTPS_PROXY` を無視します。社内 CA の証明書を使うプロバイダーでは、
Node にその CA を信頼させる必要があります（ `NODE_EXTRA_CA_CERTS=/path/to/ca.pem` ）。
`NODE_USE_ENV_PROXY=1` を使う場合、ネットワーク内にあるモデルやプロキシは `NO_PROXY` に
記載する必要があります。記載しないと、呼び出しは到達できない送信プロキシに向かってしまいます。

接続テストに失敗すると、ホストとその理由（DNS、接続の拒否、信頼されていない証明書）が表示されます。
