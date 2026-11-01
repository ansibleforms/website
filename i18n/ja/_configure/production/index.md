---
layout: default
title: 本番環境での運用
nav_order: 13
has_children: true
has_toc: false
permalink: /production/
translated_from: 9f501893a2c4476707ac2f11f25e67998200e9e7
---

# 本番環境での運用
{: .no_toc }

利用者が頼りにするインスタンスを公開し、バックアップし、監視します
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 本番稼働の前に

既定値を使えばインスタンスをすぐに動かせますが、その中には最初に試すためだけのものもいくつかあります。AnsibleForms は
`ENCRYPTION_SECRET` または `ACCESS_TOKEN_SECRET` が設定されていないと起動時に `[SECURITY]` の警告をログに記録し、
**ステータス** ページではバックアップ、保持期間の設定、式のサニタイザーについて報告します。

---

## 本番環境のチェックリスト

利用者がインスタンスを頼りにする前に一度、そしてメジャーアップグレードの後にもう一度、次の項目を確認してください。

| 項目 | やること | 詳細 |
|------|------------|---------|
| 管理者パスワード | ローカル管理者アカウントのパスワードを変更します | [強化](../security/hardening.html#the-admin-account) |
| 暗号化シークレット | 認証情報を保存する前に [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) を設定します | [シークレットと暗号化](../security/secrets.html#the-two-master-secrets) |
| トークンシークレット | 再起動してもセッションが維持されるよう、 [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) を設定します | [シークレットと暗号化](../security/secrets.html#the-two-master-secrets) |
| HTTPS | サンプルの証明書ではなく、独自の証明書で TLS を終端します | [HTTPS](../security/https.html) |
| リバースプロキシ | インスタンスをプロキシの背後で公開します。必要に応じて [`BASE_URL`](../customization/server.html#env_BASE_URL) の下に置きます | [リバースプロキシ](reverse-proxy.html) |
| スキーマのエンドポイント | スキーマができたら [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) を `0` に設定します | [強化](../security/hardening.html#the-database) |
| 外部への呼び出し | [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) で REST 式を制限します | [強化](../security/hardening.html#expressions-and-outbound-calls) |
| 任意の機能 | 使わないなら MCP とチャットアシスタントはオフのままにします | [強化](../security/hardening.html#optional-features) |
| バックアップ | 夜間バックアップが動作することを確認し、ホストの外にコピーします | [バックアップ](backups.html) |
| 保持期間 | ジョブと監査エントリを保持する期間を決めます | [ログ](logs.html#retention) |

---

## このセクションの内容

トピックごとに専用のページがあります。インスタンスの保護については [セキュリティ](../security/) で扱います。

| ページ | 内容 |
|---|---|
| [リバースプロキシ](reverse-proxy.html) | Nginx、Traefik、Apache の背後で、ルートまたはサブパスの下に AnsibleForms を公開します |
| [バックアップ](backups.html) | 夜間バックアップ、その内容、リストア、ほかに保持すべきもの |
| [ログ](logs.html) | ログファイル、syslog、監査証跡、ジョブと監査エントリの保持期間 |
| [スケーリング](scaling.html) | ワーカーを伴う複数のアプリノード。RTE には専用のセクション [ランタイム環境](../rte/) があります |
| [監視](monitoring.html) | ヘルスプローブ、Prometheus メトリクス、ステータスページ |
