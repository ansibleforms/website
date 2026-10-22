---
layout: default
title: RTE の実行
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# RTE の実行
{: .no_toc }

各モードの設定と、RTE の起動方法
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 設定

RTE に必要なものはモードによって異なります（ [モード](modes.html) を参照）。すべての RTE が次のものを読み込みます。

| 変数 | 意味 |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | 7.3.0 から： `outbound` （アプリに接続する）、 `inbound` （アプリが接続してくる）、 `database` （非推奨。7.x の間の既定） |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | アプリと RTE の間のトークン。16 文字以上。これがないと RTE は起動を拒否します |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | 同時に実行するプレイブックの数。既定は `10` （ `0` で無制限）。満杯の RTE へのジョブは、プレイブックが終わるまで待機します |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | 停止時に実行中のプレイブックを待つ時間。既定は `25` 。その時点でまだ実行中のものは放棄されたものとして終了します |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | RTE ではなく、アプリノードとワーカーが読み込みます。満杯または停止中の RTE をジョブが待つ時間。既定は `60` |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) 、 `PROCESS_MAX_BUFFER` | プレイブックのフォルダーと出力の上限。RTE が読み込むので、RTE の環境で設定してください |
| `LISTEN_HOST` | 7.3.0 から：リスナーがバインドするアドレス。既定ではすべてのインターフェース。外部から何も接続してこない場合（アウトバウンドの RTE）は `127.0.0.1` |

ソケットモード（ `outbound` または `inbound` ）の RTE は、さらに次のものを読み込み、 `DB_*` と `ENCRYPTION_SECRET` は読み込みません。

| 変数 | 意味 |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | 利用者が開くアプリのアドレス。例： `https://forms.example.com` 。アウトバウンド：接続先のアドレス。インバウンド：一度だけの登録の呼び出し先のアドレス |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` （既定）：アプリの証明書が有効である必要があります。 `0` は何でも受け入れます。信頼できる一つのネットワークの中でだけ使います |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | ランナーの名前で、フォームは `runner:` でこれを指定します。未設定の場合はノード ID `rte-<hostname>-<port>` で、コンテナーとともに変わります。本番環境では設定してください |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | 任意。初回のみ：API で作成する参加トークン。管理者を待たずにすぐにランナーを承認します（ [参加トークン](../runners/registration.html#join-tokens) を参照） |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | インバウンドで参加を申請する場合：アプリが接続するアドレス。例： `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` （既定）：アプリがプレイブックとインベントリをジョブとともに送ります。 `local` ：マウントした自分のフォルダーから実行します |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | 各ジョブの出力、イベント、終了が、アプリが保存するまで待機する場所。既定は `<persistent>/rte-spool` 。ボリューム上に置いてください |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | `transfer` の場合：アプリが送ったフォルダーを保持する場所。既定は `<persistent>/rte-files` |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | `transfer` の場合：それらのフォルダーが使える容量。既定は `1024` 。最も長く使われていないものから削除され、 `0` では何も保持しません |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | RTE ではなくアプリが読み込みます： `transfer` で送る最大のフォルダー。既定は `512` |

ソケットモードの RTE では、 `RTE_MAX_JOBS` 、 `RTE_DRAIN_SECONDS` 、 `RTE_FILES` 、 `RTE_CACHE_MB` をランナーのページの
RTE タブでも設定できます。そこでの値が変数より優先され、変数は空のままのフィールドを埋めるだけになります（
[RTE の設定](../runners/runner-page.html#an-rtes-settings) を参照）。範囲外の値は上限または下限に合わせられ、RTE は起動時に
その旨を伝えます。

データベースモード（非推奨）の RTE は、代わりにデータベースの設定を読み込み、自分自身を登録します。

| 変数 | 意味 |
|---|---|
| `DB_HOST` 、 `DB_PORT` 、 `DB_USER` 、 `DB_PASSWORD` | アプリと同じ値。RTE はデータベースからジョブを読み込み、そこに出力を書き込みます |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | アプリが RTE を呼び出すアドレス。例： `http://rte:8000` 。ランナーはホスト名（ `rte` ）にちなんで名前が付くので、フォームでは `runner: rte` を使えます |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | 7.3.0 でデータベースモードとともに非推奨になりました。ソケットモードの RTE は代わりに参加トークンで参加します。 `1` （既定）：RTE は起動時に **接続 > ランナー** に自分自身を追加し、最初のものが既定のランナーになります。 `0` ：そこで、または [構成シード](../seed/) で自分で追加します |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | アプリと同じ値。自分自身を登録する場合にだけ必要です（ランナーのトークンは暗号化して保存されます）。 `RTE_REGISTER=0` では省きます |

データベースモードで `RTE_URL` がない場合、RTE は自分の IP アドレスとポートを `rte-<hostname>-<port>` という名前で登録しますが、これはコンテナーを
再作成すると変わります。本番環境では `RTE_URL` を設定してください。RTE が自分で登録したランナーは、RTE の最後のハートビートから 10 分後に
ワーカーが削除します。

---

## 起動

RTE はプレイブックを実行するので、プレイブックが使う秘密鍵と `known_hosts` を含む ssh フォルダーと、スプールとアプリが送るファイルのための
永続フォルダーが必要です。モードを選んでください。

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">アウトバウンド</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">インバウンド</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">データベース (非推奨)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

アプリに到達できる任意のホストで、独自のトークンとランナーに付ける名前を指定して RTE を起動します。

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

RTE はアプリに接続して参加を申請します。 **接続 > ランナー** にはランナー `rte-dmz` が承認待ちとして表示され、そのログには
トークンのフィンガープリントが表示されます。確認画面に同じフィンガープリントが表示されていることを確かめてから **承認** します（
[RTE の承認](../runners/registration.html#approving-an-rte) を参照）。以降は自分の `RTE_TOKEN` でサインインしてジョブを受け取ります。
無人で起動するには `-e RTE_JOIN_TOKEN=<a join token, afj_...>` を追加すると、すぐに承認されます。このホストに到達する必要のあるものは
何もないので、ポートは公開しません。その `PORT` で待ち受けるのは、プローブ用の `/live` 、 `/ready` 、 `/metrics` だけです。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

アプリが到達できる場所で RTE を起動します。この例ではアプリの隣で動作し、そのフォルダーからプレイブックを実行します（ `RTE_FILES=local` ）。

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

次に、アプリにランナーを与えます。 [構成シード](../seed/) で、RTE 認証情報と、それを使ってサインインするインバウンドのランナーを宣言します。

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

または、同じ二つを手動で追加します。認証情報は **接続 > 認証情報** で種類 RTE として、ランナーは
**接続 > ランナー** で種類 RTE、モード **インバウンド** として、その認証情報を指定します。代わりに RTE に参加を申請させるには、
`APP_URL` と `RTE_URL` を指定して起動し、 **接続 > ランナー** で承認します（ [インバウンド](modes.html#inbound) を参照）。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

7.3.0 から非推奨で、8.0.0 で削除されます。RTE は自分のディスクからプレイブックを実行するので、アプリの永続ボリューム
（プレイブック、リポジトリ、アップロード）と ssh フォルダーもマウントします。同じネットワーク上でアプリに `ansibleforms` として到達できる
Docker の例：

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

インバウンドの RTE は公開ネットワークに置かないでください。そのソケットは、トークンを持つどの呼び出し元にも応答します。 `docker stop` はコンテナーを強制終了するまで
10 秒しか待たないので、RTE にはより長い停止タイムアウト（ `--stop-timeout` 、compose では `stop_grace_period` ）を与えるか、
`RTE_DRAIN_SECONDS` を下げてください。Kubernetes は既定で 30 秒待ちます。

[インストーラー](../installation/installer.html) は、専用のサーバー上で Docker、Podman、または
[コンテナーを使わずに](../installation/native.html) アウトバウンドまたはインバウンドの RTE を構成し、承認に使うフィンガープリントを表示します。別のデータセンターで
RTE を手動で実行するには、 [別のデータセンター](another-datacenter.html) に従ってください。
