---
layout: default
title: 構成シード
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 030ff83b1d7c3920600b7e0668b05ab24b949b67
---

# 構成シード
{: .no_toc }

管理オブジェクトをファイルで宣言します
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

git から構築する管理者向けです。管理オブジェクトをファイルで宣言し、空のデータベースからインスタンスを再構築できるようにします。

---

## 対象となるもの

`CONFIG_SEED_PATH` に YAML ファイルを設定すると、AnsibleForms は起動時にそれを適用します。このファイルは、
これまでデータベースにしか存在しなかったオブジェクトを宣言します。

| セクション                 | 宣言するもの                                                    |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | ジョブの実行場所：RTE、AWX / AAP / Ascender、Semaphore、Rundeck、Jenkins |
| `secret_stores`         | シークレットストア（HashiCorp Vault など）                                |
| `credentials`           | 認証情報                                                         |
| `oauth2`                | SSO プロバイダー：Entra ID と OIDC                                    |
| `repositories`          | Git リポジトリ                                                    |
| `syslog_servers`        | サーバーログと監査エントリを受け取る syslog サーバー    |
| `notification_channels` | 通知用のメールサーバー、Slack、Teams、Telegram、Webhook |
| `labels`                | ヘッダーのロゴの横のラベル（7.3.0 から）                      |
| `ldap`                  | LDAP の設定                                              |
| `settings`              | 公開 URL と、有効なメールチャネルがない場合に使われるメール設定 |
| `chat`                  | チャットアシスタントのモデルプロバイダー                                 |
| `awx`                   | 7 から非推奨、8 で削除： `type: awx` の `runners` を使ってください    |

バージョン 7 より前に書かれたシードも引き続き動作します。 `awx` セクションの各項目は種類 `awx` のランナーとして適用され、ログには
適用のたびに警告が出ます。8 にアップグレードする前に、それらの項目を `type: awx` として `runners` の下に移してください。

シードは `config.yaml` と同じでは **ありません** 。 `config.yaml` はカテゴリ、ロール、定数を保持し、
独自の `CONFIG_PATH` を持ちます。二つは意図的に分けられています。 `config.yaml` を *保持する*
リポジトリはシードが宣言するオブジェクトの一つなので、シードをその中に置くことは
できないのです。

ユーザーとグループは対象外です。これらは LDAP または SSO から取得され、最初の管理者は `ADMIN_USERNAME` / `ADMIN_PASSWORD` から作成されます。

---

## このセクションの内容

トピックごとに専用のページがあります。

| ページ | 内容 |
|---|---|
| [例](example.html) | セクションごとに説明する、完全なシードファイル |
| [管理対象オブジェクト](managed-objects.html) | シードが一覧にしたオブジェクトをどのように所有し、シークレットをどのように外に置くか |
| [再読み込みと起動](reloading.html) | 再起動なしでのファイルの変更と、起動時に起きること |
| [Kubernetes](kubernetes.html) | ConfigMap と Secret から AnsibleForms を構築します |
| [編集と監査](environment-and-audit.html) | 設定ページのロックと、監査ログに記録されるもの |
