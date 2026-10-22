---
layout: default
title: ログ
parent: 本番環境での運用
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# ログ
{: .no_toc }

ログファイル、syslog、監査証跡、ジョブと監査エントリの保持期間
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## ログファイル

AnsibleForms は、日ごとにローテーションする二つのログを [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
（ `%PERSISTENT_FOLDER%/logs` ）に書き込み、古い日のものを圧縮して [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS)
の間保持します（既定は 30。 `0` ですべてのファイルを保持します。設定ページでの変更はすぐに反映されます）。

* `ansibleforms.<date>.log` ： [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) 以上のすべて
* `ansibleforms.errors.<date>.log` ：エラーのみ

`docker logs` や `kubectl logs` で読むコンソールには、独自のレベル
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) があります。どちらも既定は `notice` で、
本番環境にはこれが適切です。 `info` や `debug` はトラブルシューティング中にだけ使い、
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) はオフのままにしてください。レベルは
設定ページで再起動なしで変更でき、 **サーバーログ** ページでは、オプション `showLogs` を持つユーザーにログが表示されます。

---

## JSON 行

Loki、ELK、Splunk などのログコレクター向けには、 [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) を `json` に設定します。すると、
コンソールでもファイルでも、各行が `<time> <level>: <message>` ではなく一つの JSON オブジェクトになります。

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| フィールド | 内容 |
|-------|---------|
| `time` | 時刻。ISO 8601 の UTC |
| `level` | ログレベル |
| `message` | メッセージ |
| `requestId` | リクエストの処理中に書かれた行の場合、その行が属するリクエスト |
| `role` | プロセスのロール [`AF_ROLE`](scaling.html) 。設定されていない場合は `all` |
| `host` | プロセスが動作するマシンまたはコンテナーのホスト名 |

各リクエストには ID が付きます。リバースプロキシが送った `X-Request-Id` ヘッダー、または新しい ID です。これはレスポンスの
`X-Request-Id` ヘッダーで返され、リクエストの処理中に書かれたすべての行に含まれます（テキストの行では `[req <id>]` として）。
そのため、リクエストをログの中で追跡し、プロキシのログと突き合わせることができます。設定ページでの変更はすぐに反映されます。

---

## Syslog

Syslog サーバーは **設定 > 接続 > Syslog** で管理し、syslog サーバーや SIEM がログを書き込まれたとおりに受け取れるようにします。
複数のサーバーを追加でき、それぞれに独自の設定があります。

| 設定 | 動作 |
|---------|--------------|
| 有効 | 有効なサーバーだけが何かを受け取るので、削除せずにサーバーを一時停止できます。行メニューの **有効にする** と **無効にする** でも切り替えられます |
| プロトコル | `udp4` （既定）、 `udp6` 、 `tcp4` 、 `tcp6` 、 `tls4` 、 `tls6` 、 `unix` 、 `unix-connect` |
| ホストとポート | 送信先のサーバー。ポートは既定で `514` 。 `unix` のプロトコルでは代わりにソケットのパスを指定します |
| 受信内容 | サーバーログ、監査エントリ、またはその両方（新しいサーバーの既定） |
| レベル | 受け取るサーバーログの最低レベル。既定は `info` 。監査エントリは常に送信されます |
| 種類 | `BSD` （RFC 3164、既定）または `RFC 5424` |

変更は再起動なしですべてのノードに反映され、サーバーのページにはテストメッセージを送るボタンがあります。
到達できないサーバーがあってもアプリケーションが止まることはありません。エラーはコンソールに書き込まれます。

7.3.0 からは、syslog サーバーには設定の完全な権限、つまりロールオプション [`showSettings`](../config/roles.html#role-options) が必要です。
syslog サーバーはサーバーログと監査エントリを受け取るため、接続の設定へのアクセスだけでは足りません。

以前のバージョンの `LOG_SYSLOG_*` 変数は、バージョン 7 から非推奨です。 [`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) が
設定されていることを検出した最初の起動で、それらは一度だけサーバー `syslog` としてインポートされ、
以前と同じくサーバーログを受け取ります。以降は無視されます。その最初の起動の後で環境から削除し、
サーバーは設定ページで管理してください。

---

## 監査証跡

**監査ログ** ページ（ **設定 > ログ** の下）には、誰が何を変更したかが記録されます。これはログファイルでは答えにくいことです。
記録されるのは次のものです。

* API を通じて行われたすべての変更（ `POST` 、 `PUT` 、 `PATCH` 、 `DELETE` ）。401 または 403 で拒否された試行も含みます
* サインイン。試されたユーザー名も記録されます
* 夜間バックアップ、削除されたバックアップ、整理されたジョブ、構成シードの適用など、アプリケーション自体のイベント

各エントリには、時刻、実行者（ユーザー、またはアプリケーション自身のタスクの場合はアプリケーション）、クライアントの IP アドレス、
操作、その対象、そして結果（ `success` 、 `failure` 、 `denied` ）があります。ページでは実行者、操作、結果で
絞り込むことができ、ロールオプション `showSettings` を持つユーザーが開けます。

IP アドレスは AnsibleForms から見えるもので、プロキシの背後で動作している場合はプロキシのアドレスになります。
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) にプロキシの数またはアドレスを設定すると、AnsibleForms は
代わりにプロキシが `X-Forwarded-For` で報告するクライアントのアドレスを記録します。 [リバースプロキシ](reverse-proxy.html) を参照してください。

監査証跡を SIEM 向けなどにインスタンスの外に保持するには、監査エントリを受け取る syslog サーバーを追加します（
[Syslog](#syslog) を参照）。各エントリは発生したときに、サーバーのレベルにかかわらず、エントリを JSON にした `audit {...}` という
1 行として送られます。syslog 側のコピーは、下の保持期間で削除されることも、データベースのリストアで置き換えられることもありません。

---

## 保持期間

設定を持つ二つの毎日のタスクが、データベースが際限なく大きくなるのを防ぎます。

| 変数 | 既定値 | 実行時刻 | 削除するもの |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | これより古い監査エントリ |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` （すべて保持） | 2:30 | これより古い終了済みのジョブとその出力 |

どちらも `0` ですべてを保持します。設定のない毎日のタスクがさらに二つあります。3:00 には 30 日より古い保存済みのリフレッシュトークンと
期限切れのトークン失効情報が削除され、4:00 には有効期限を過ぎた [保存済みジョブ](../jobs/stored-jobs.html) が削除されます。
時刻は [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) のタイムゾーンで、ワーカーがこれらを実行します。

通常、最も速く大きくなるテーブルはジョブの出力です。 **ステータス** ページはそのサイズを報告し、
保持期間が設定されないまま 1 GB を超えると警告します。実行中のジョブと承認待ちのジョブは削除されません。
監査の要件に合ったジョブの保持期間を決め、監査証跡は少なくともそれと同じ期間保持してください。
