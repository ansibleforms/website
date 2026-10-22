---
layout: default
title: モード
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# RTE とアプリの通信方法
{: .no_toc }

アウトバウンド、インバウンド、データベース：誰が接続を開き、何がそこを流れるか
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

管理者向けです。7.3.0 からは、RTE は一本の WebSocket でアプリと通信し、データベースの認証情報は持ちません。両者の間のネットワークに
合ったモードを選んでください。誰が誰に接続を開いてよいか、どのプロキシやファイアウォールを通るかで決まります。

---

## 三つのモード

RTE の [`RTE_MODE`](../customization/server.html#env_RTE_MODE) は、RTE がアプリに到達する方法を示します。そのランナーにも同じ **モード** があります。

| モード | 接続を開く側 | RTE が保持するもの | 用途 |
|---|---|---|---|
| `outbound` | RTE が [`APP_URL`](../customization/server.html#env_APP_URL) のアプリに接続し、WebSocket を一本開いたままにします | 自分の `RTE_TOKEN` 。データベースの認証情報はなし | DMZ、NAT、または着信接続を許可しないゾーン。外部から RTE に届くものは何もありません |
| `inbound` | アプリがランナーのアドレスの RTE に接続し、WebSocket を一本開いたままにします | 自分の `RTE_TOKEN` 。データベースの認証情報はなし | 中央側がすべての接続を開くネットワーク、compose プロジェクト、Pod |
| `database` （非推奨） | アプリが HTTP で RTE の API を呼び出し、RTE はアプリのデータベースを自分で読み書きします | データベースの認証情報（ `DB_*` ）と `ENCRYPTION_SECRET` | 7.0 から 7.2 の動作。8.0.0 で削除されます |

`RTE_MODE` のない RTE は 7.x の間ずっとデータベースモードで動作し、起動時に `[DEPRECATED] This RTE runs in database mode` の警告を
ログに記録します。7.3.0 より前に追加したランナーのモードは **データベース (非推奨)** です。移行するときは、その RTE が動作するモードに設定してください。

---

## アウトバウンド

RTE が接続を開くので、着信接続をまったく受け付けないネットワークからでも動作します。

* **ソケット** ：RTE は、 `APP_URL` に `/api/v2/rte/socket` を付けたアドレスに、 `wss://` （ `http://` のアドレスでは `ws://` ）で、
  自分の `RTE_TOKEN` とランナーの名前 [`RTE_NAME`](../customization/server.html#env_RTE_NAME) を付けて接続します。ソケットが切れると再接続します
* **初回** ：参加を申請し、そのランナーは **接続 > ランナー** で、接続はしているもののジョブのない状態で管理者の承認を待ちます
  （ [参加の申請](../runners/registration.html#asking-to-join) を参照）。参加トークン
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) があればすぐに承認されます。以降は自分のトークンでサインインします
* **ネットワーク** ：RTE のゾーンからアプリへ、アプリのポートでのみ通信します。 `HTTPS_PROXY` の指定があればプロキシを経由します。アプリの前にある
  リバースプロキシは、そのパスで WebSocket を通す必要があります（ [ランナーの WebSocket](../production/reverse-proxy.html#runner-websockets) を参照）
* **証明書** ：アプリの証明書が検証されます。プライベート CA は `NODE_EXTRA_CA_CERTS` で指定するか、信頼できる一つのネットワークの中でだけ
  [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) で検証をオフにします
* **ランナー** ：アドレスは不要なので、RTE 認証情報はトークンだけを保持します
* **準備完了** ：アプリへのソケットが開くまで、 `/ready` は `503` を返します

ロードバランサーの背後に複数のアプリノードがある場合、RTE が到達したノードがそのソケットを持ちます。どのノードでもジョブを起動でき、
ソケットを持つノードが RTE にジョブを送ります。ジョブが別のノードで起動された場合は 2 秒以内に送ります。

---

## インバウンド

RTE は自分の `PORT` で待ち受け、アプリはランナーのアドレスに `/rte/v1/socket` を付け、RTE のトークンを使って接続します。
複数のアプリノードがある場合、各インバウンドランナーのソケットを持つのは一度に一つのノードです。そのノードが停止すると、別のノードが引き継いで接続し直します。

アプリが RTE に接続するには、先にその RTE のランナーが必要です。種類は RTE、モードは **インバウンド** で、RTE のアドレスとその
`RTE_TOKEN` を持つ RTE 認証情報を使います。ランナーは次の二つの方法のいずれかで用意されます。

| 方法 | 設定するもの |
|---|---|
| RTE が参加を申請する | `APP_URL` と [`RTE_URL`](../customization/server.html#env_RTE_URL) （アプリが接続するアドレス）。RTE は `POST /api/v2/rte/register` を一度だけ呼び出し、そのランナーは管理者の承認を待ちます。承認されるとアプリが接続します（ [参加の申請](../runners/registration.html#asking-to-join) を参照）。 `RTE_JOIN_TOKEN` があればすぐに承認されます。 `APP_URL` があって `RTE_URL` がないインバウンドの RTE は起動を拒否します |
| 自分でランナーを追加する | `APP_URL` は不要です。 [RTE の実行](run.html#start-it) にあるように、 **接続 > ランナー** または [構成シード](../seed/) でランナーを追加します |

Docker Compose プロジェクト、Helm チャート、インストーラーのコントローラーは、この方法で、シードで宣言したインバウンドの独自の RTE を実行します。

**HTTPS の場合。** [`HTTPS=1`](../customization/server.html#env_HTTPS) では、RTE は [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) と
[`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) のキーと証明書（既定では `certificates` フォルダーの `key.pem` と `cert.pem` ）を使い、
TLS でソケットを提供します。 `https://` の `RTE_URL` を持つ RTE は参加を申請するときにその証明書を送り、アプリはそれを固定します。
同じ証明書を提示した場合にだけ RTE に接続するので、自己署名証明書でも CA なしで動作します。
RTE は起動時に証明書のフィンガープリント（DER バイトの SHA-256 の先頭 16 進数 8 桁を `abcd-ef12` の形式で）をログに記録し、
承認ダイアログにはアプリが受け取ったものが表示されます。承認する前に一致していることを確認してください。
[インストーラー](../installation/installer.html#a-runner) は、自分のアドレスの証明書を使って、この方法でインバウンドのランナーを構成します。

---

## データベース（非推奨）

7.0 から 7.2 の RTE です。アプリが HTTP でその API を呼び出し、RTE はデータベースでジョブを受け取り、そこに出力を書き込み、
[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) で自分のランナーの行を最新に保ちます。手順の違いは [データベースモード](./#database-mode-deprecated)
で説明しています。7.x では起動のたびに警告を出しつつ引き続き動作し、8.0.0 で削除されます。

こうした RTE をソケットモードに移すには、ランナーとトークンはそのままにします。

1. [構成シード](../seed/) のランナーの場合：まずシードでそのランナーに `rte_mode: outbound` または `rte_mode: inbound` を設定します（インバウンドの場合は、
   認証情報の `url` にアプリが接続するアドレスを指定します）。シードで管理されたランナーは RTE が自分で移すことはできません
2. RTE で、 `APP_URL` とともに `RTE_MODE=outbound` を、または `RTE_MODE=inbound` （一度だけの登録の呼び出しを行うなら `APP_URL` と `RTE_URL` も）を設定し、
   [`RTE_NAME`](../customization/server.html#env_RTE_NAME) を **接続 > ランナー** でのランナーの名前に設定します。 `RTE_TOKEN` はそのままにします
3. 環境から `DB_*` と `ENCRYPTION_SECRET` 、そしてデータベースモードだけが読み込む `RTE_REGISTER` を削除し、再起動します

アップグレードした RTE がランナーの名前とランナー自身のトークンでサインインすると、アプリは承認なしにすぐにそのランナーを RTE のモードに移し、
*Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token* とログに記録します。ランナーはもはや RTE が登録した行ではないので、古いコンテナーが応答しなくなってもワーカーが削除することはありません。
データベースモードのままの構成シードのランナーは、代わりに *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE* として拒否されます。これに参加トークンは使わないでください。参加
トークンは、すでに承認されたランナーでは拒否されます。 `APP_URL` のないインバウンドの RTE は呼び出しを行いません。代わりに **接続 > ランナー** でランナーの **モード** を
**インバウンド** に設定すると、アプリが接続します。 [インストーラー](../installation/installer.html#a-72-runner) は、
この方法で 7.2 のランナーをアップグレードします。

---

## ソケットを流れるもの

どちらのソケットモードでも、アプリは RTE がかつてデータベースで読み込んでいたものすべてを付けて各ジョブを送り、戻ってきたもの、
つまり出力、イベント、ジョブログ、終了を、ちょうど一度だけ保存します。終了の通知もアプリが送ります。

**スプール。** 出力のバッチ、イベントのバッチ、ログ、開始、終了はそれぞれ番号が付けられ、送信前にジョブのスプールファイル
（ [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) ）に書き込まれ、アプリが保存したと応答するまで保持されます。
同じアプリノードまたは別のノードに再接続した後、RTE は確認応答されていないものを再送し、アプリはすでに保存したものを
飛ばします。何も失われず、二重に保存されることもありません。再起動した RTE が届けていなかったものを送れるよう、スプールはボリューム上に置いてください。
RTE の再起動時に実行中だったプレイブックは続行できず、そのジョブは放棄されたものとして終了します。

**容量。** RTE は最大 [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) 個、またはその [ランナーのページ](../runners/runner-page.html#an-rtes-settings) で
設定した数のプレイブックを同時に実行し、実行中の数を 20 秒ごとにアプリに伝えます。満杯の RTE へのジョブは、
[複数の RTE](several.html#several-jobs-on-one-rte) で説明しているように待機します。

**ジョブのファイル。** [`RTE_FILES`](../customization/server.html#env_RTE_FILES) 、またはランナーのページの **ジョブファイル** 設定は、
RTE がプレイブックとインベントリをどこから取得するかを示します。

| `RTE_FILES` | ファイルの取得元 |
|---|---|
| `transfer` （既定） | アプリがプレイブックのフォルダーとインベントリをジョブとともに送ります。それぞれパックされ、内容のハッシュで名前が付けられます。RTE はそれらをパックしたまま [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) の下に、最近使ったものから [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) （既定は 1024 MB）まで保持し、持っていないハッシュだけを要求します。変更されていないフォルダーが二度送られることはありません。RTE に共有ディスクもリポジトリへのアクセスも不要です |
| `local` | データベースモードの RTE と同じく、RTE は自分のフォルダーから実行します。プレイブック（ [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) ）とリポジトリ（ [`REPO_PATH`](../customization/paths.html#env_REPO_PATH) ）をマウントしてください |

`transfer` では、各ジョブはファイルを専用のプライベートなフォルダーに展開し、ジョブが終わると削除されます。どのジョブもほかのジョブが書いたものを見ることはなく、
インベントリや extravars のファイルが RTE のディスクに展開されたまま残ることもありません。RTE は一つの `RTE_CACHE_PATH` を共有できます。それぞれが
自分のジョブを専用のフォルダーに保持し、停止した RTE（ジョブの途中で強制終了された、または別のホスト名で再作成された）のフォルダーは、10 分後にほかの RTE が削除します。
[`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) （既定は 512。アプリが読み込み、再起動なしで反映されます）より大きいフォルダーは
送られません。ジョブは失敗し、代わりに RTE にフォルダーをマウントするよう示します。ssh フォルダーは決して送られません。RTE は自分の
秘密鍵と `known_hosts` を `/home/node/.ssh` に保持します。

**ホストとタスク。** 7.3.0 からは、どのモードの RTE も、プレイブックの構造化されたイベントをテキスト出力と並べて記録します。各プレイ、タスク、
ホストの結果、そしてリキャップで、 `af_events` コールバックプラグインが書き込みます。ジョブページでは **ホストとタスク** に表示されます（
[ジョブの追跡](../jobs/following.html#hosts-and-tasks) を参照）。

---

## ネットワーク

アプリ、RTE、管理対象のホストの間で開くべきもの（モード別）：

| モード | 送信元 | 宛先 | ポート |
|---|---|---|---|
| アウトバウンド | RTE | `APP_URL` のアプリ | アプリのポート（多くのプロキシの背後では `443` ） |
| インバウンド | アプリノード | ランナーのアドレスの RTE | RTE の `PORT` （ `8000` ） |
| データベース（非推奨） | RTE、およびアプリノードとワーカー | データベース、および RTE | `3306` と RTE の `PORT` |
| すべてのモード | RTE | 管理対象のホスト | ssh（ `22` ）、WinRM、それらの API |

ソケットモードでは、RTE がデータベースに接続することはありません。その API が応答するのはソケットとプローブ（ `/live` 、 `/ready` 、 `/metrics` ）だけです。
