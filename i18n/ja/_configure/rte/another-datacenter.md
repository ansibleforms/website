---
layout: default
title: 別のデータセンター
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# 別のデータセンターの RTE
{: .no_toc }

2 つ目のデータセンターの何もないホストから、最初のプレイブックを実行するアウトバウンドの RTE まで
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

管理者向けです。2 つ目のデータセンターの管理対象ホストに、1 つ目のデータセンターからではなく、そのデータセンターの RTE から接続したい場合に使います。

{: .note }
> **簡単な方法。** [インストーラー](../installation/installer.html#a-runner) は、以下のすべての手順を RTE のホスト上で一つのコマンドで行います。
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner` です。すぐに承認させるには `--join afj_...` を付けます。
> この手順書は同じことを Docker または Podman を使って手動で行うので、各部分を確認して調整できます。

---

## 最終的な構成

アプリ、そのワーカー、データベースは、データセンター 1 のそのままの場所に残ります。データセンター 2 には、アウトバウンドモード
（ [`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE) 。 [モード](modes.html#outbound) を参照）の RTE コンテナーを一つ実行するホストを置きます。RTE は HTTPS で
アプリに接続して WebSocket を一本開いたままにし、独自のランナーとして参加し、それを指定するフォームのプレイブックをデータセンター 2 の管理対象
ホストに対して実行します。

| 場所 | そこで動作するもの | 通信先 |
|---|---|---|
| データセンター 1 | アプリノード、ワーカー、データベース（現状のまま） | 新しいものはありません。いつもの HTTPS のアドレスで RTE のソケットを受けます |
| データセンター 2 の RTE ホスト | Docker または Podman と、RTE のコンテナー | HTTPS で `APP_URL` のアプリ、およびデータセンター 2 の管理対象ホスト |

RTE はデータベースの認証情報も `ENCRYPTION_SECRET` も持たず、自分のトークンだけを持ちます。RTE に接続してくるものはないので、開いた
ポートも、DNS 名も、証明書も不要です。アプリはプレイブックとインベントリを各ジョブとともに送るので（ `RTE_FILES=transfer` 、
既定）、RTE にそのコピーも共有ディスクも不要です。

特に記載がない限り、以下のコマンドはすべて RTE のホスト上のターミナルで、 `sudo` を使えるユーザーとして実行します。所要時間は約 20 分で、
その大半はイメージの取得待ちです。

---

## 0. 始める前に

次のものを集めてください。

| もの | 入手先 |
|---|---|
| アプリのアドレス | `APP_URL` ：利用者がブラウザーで開くアドレス。例： `https://forms.example.com` 。ベースパスがあればそれも含めます |
| アプリの証明書 | 公的な CA、プライベート CA（その証明書が必要です。手順 6）、または自己署名の証明書 |
| プロキシ | このデータセンターがデータセンター 1 に到達するのに使う `HTTPS_PROXY` （ある場合） |
| RTE の名前 | **接続 > ランナー** でのランナーの名前で、フォームは `runner:` でこれを指定します。例： `rte-dc2` 。英字、数字、 `_ . : @ -` |
| 参加トークン | 任意： [参加トークン](../runners/registration.html#join-tokens) （ `afj_...` ）があれば RTE はすぐに承認されます。ない場合は管理者が承認します（手順 8） |
| ssh キー | プレイブックが管理対象ホストへの接続に使う秘密鍵、またはそれを作成する権限 |

アプリは 7.3.0 以降である必要があります。この RTE 専用の参加トークンを作るには、管理者が API を一度呼び出します（
[参加トークン](../runners/registration.html#join-tokens) を参照）。

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. ホストの準備

RTE はコンテナーなので、ホストに必要なのはコンテナーエンジンだけです。Node.js、python、ansible はイメージに含まれています。

| 必要なもの | 理由 |
|---|---|
| **x86_64** （amd64）の Linux | RTE イメージは amd64 向けにしか公開されていません |
| 2 CPU と 4 GB 以上のメモリ | 一つの RTE は最大 [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) 個（10）のプレイブックを同時に、それぞれのフォークとともに実行します。それに合わせてサイズを決めてください |
| 20 GB の空きディスク | `-rte-full` イメージは約 3.3 GB で、さらに更新時のイメージ、アプリが送るジョブのファイル、ジョブの一時ファイルが加わります |
| Docker、または podman-compose を伴う Podman | イメージを取得して実行するため |
| NTP で合わせた時刻 | ジョブの時刻はアプリの時刻と比較されます |

**Docker** 、Ubuntu または Debian の場合（ほかのディストリビューション： [docs.docker.com/engine/install](https://docs.docker.com/engine/install/) ）：

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman** 、RHEL、Rocky、Alma Linux の場合：

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Podman では、以下のすべてのコマンドで `docker` を `podman` に、 `docker compose` を `podman-compose` に読み替えてください。

---

## 2. ネットワークとファイアウォール

RTE はすべての接続を自分で開きます。外部から RTE に届くものはありません。

| 送信元 | 宛先 | ポート | 理由 |
|---|---|---|---|
| RTE のホスト | `APP_URL` のアプリ（設定されていれば `HTTPS_PROXY` 経由） | アプリのポート。多くのプロキシの背後では `443` | ジョブ、そのファイル、その出力が流れるソケット |
| RTE のホスト | データセンター 2 の管理対象ホスト | ssh（ `22` ）、WinRM、それらの API | プレイブックはここから実行されます |
| RTE のホスト | `ghcr.io` | `443` | イメージを取得するため。独自のレジストリやファイルから取得する場合は不要です（手順 4） |

RTE のために着信ポートは開かないでください。その `PORT` （ `8000` ）が提供するのは、このホスト上のプローブ用の `/live` 、 `/ready` 、 `/metrics` だけです。

RTE は、 `APP_URL` に `/api/v2/rte/socket` を付けたアドレスに WebSocket として接続します。アプリの前にあるリバースプロキシは、そのパスで
アップグレードを通す必要があります（ [ランナーの WebSocket](../production/reverse-proxy.html#runner-websockets) を参照）。ここからアプリが応答することを確認します。

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. フォルダー

すべては `/opt/af-rte` の下に置きます。RTE はユーザー `node` （uid 1000）で動作するので、そのデータはその uid の所有にします。

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| フォルダー | コンテナー内 | 保持するもの |
|---|---|---|
| `data/` | `/app/dist/persistent` | スプール（ `rte-spool` ：アプリが保存するまでの各ジョブの出力と終了）、アプリが送ったジョブのファイル（ `rte-files` ）、プライベート CA、プレイブックがインストールする python ライブラリ |
| `data/ssh/` | `/home/node/.ssh` | プレイブックの ssh キーと `known_hosts` |
| `data/ansible/` | `/etc/ansible/...` | 組み込む代わりにマウントする、独自の `ansible.cfg` 、ロール、コレクション |

`data/` はホスト上に置いてください。再起動した RTE も、アプリが保存していなかったものを送り、ジョブのファイルのキャッシュを保持します。

**ssh キー。** データセンター 1 でプレイブックが使っているキーをコピーするか、このデータセンター用に作成して、その公開鍵を管理対象ホストに渡します。

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

次に、すべてを uid 1000 に渡し、キーは所有者だけが読めるようにします。

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. イメージ

二つのうち一つを選んでください。

### 選択肢 A：公式イメージ
{: .no_toc }

公開されているイメージは GitHub Container Registry にあり、公開されていてログインは不要です（三つのレイヤーについては [イメージ](images.html) を参照）。
データセンター 1 と同じレイヤーを使ってください。 `:7` は、アプリの `:7` と同じく最新の 7 系リリースに追従します。

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

インターネットにアクセスできないホストは、アクセスできるホストからイメージを入手します。

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

または、一度だけ独自のレジストリにプッシュし（ `docker tag` と `docker push` ）、以降の手順ではその名前を使います。

### 選択肢 B：独自のイメージ
{: .no_toc }

データセンター 2 のプレイブックが、公式イメージにないコレクションや python ライブラリ（たとえば、このデータセンターの vCenter 用の VMware のもの）を
必要とする場合は、 `ansibleforms-rte-core` の上に構築します。

```bash
sudo mkdir -p /opt/af-rte/build
sudo tee /opt/af-rte/build/Dockerfile >/dev/null <<'EOF'
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
# the collections and python libraries these playbooks use : no root needed, both belong to node
RUN ansible-galaxy collection install community.vmware -p /usr/share/ansible/collections \
 && pip install --no-cache-dir pyvmomi
EOF
docker build --pull -t af-rte-dc2 /opt/af-rte/build
```

アプリの新しいリリースのたびにリビルドしてください（ [独自の RTE のビルド](images.html#build-your-own-rte) を参照）。複数の RTE ホストがある場合は、一度ビルドして
独自のレジストリにプッシュします。オフラインの場合は、選択肢 A と同じようにビルドしたイメージを `docker save` と `docker load` で移します。

---

## 5. 設定

16 文字以上の、新しい独自の [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) を用意します。これがこの RTE のパスワードです。アプリは
それをランナーの RTE 認証情報に保持し、それで各ジョブのシークレットを封印します。

```bash
openssl rand -base64 24
```

```bash
sudo tee /opt/af-rte/rte.env >/dev/null <<'EOF'
RTE_MODE=outbound
APP_URL=https://forms.example.com
RTE_NAME=rte-dc2
RTE_TOKEN=<the new token>
# optional, the first time only : approved at once instead of waiting for an admin
RTE_JOIN_TOKEN=<afj_..., or remove this line>
PORT=8000
PYTHONPATH=/app/dist/persistent/python/lib
EOF
sudo chmod 600 /opt/af-rte/rte.env
```

| 変数 | 意味 |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound` ：RTE がアプリに接続します。これがないと、RTE は非推奨のデータベースモードで起動します |
| [`APP_URL`](../customization/server.html#env_APP_URL) | アプリのアドレス。 `http://` または `https://` で、ベースパスがあればそれも含めます |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | ランナーの名前。未設定の場合はノード ID `rte-<hostname>-<port>` で、コンテナーとともに変わります |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | 独自のトークン。16 文字以上。保管しておいてください。以降、ランナーはこれでサインインします |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | 任意：参加トークン。ランナーがまだ存在しないか承認待ちの間だけ使われます |

ネットワークに必要な場合は、次のものを追加します。

| 変数 | 使う場面 |
|---|---|
| `HTTPS_PROXY` 、 `NO_PROXY` | RTE がプロキシ経由でアプリに到達する場合： `HTTPS_PROXY=http://proxy.dc2.example.com:3128` 。 `NO_PROXY` に記載したホスト（カンマ区切り。ドメインは `.example.com` ）には直接接続します |
| `NODE_EXTRA_CA_CERTS` | アプリの証明書がプライベート CA のものである場合：CA の証明書を `/opt/af-rte/data/certificates/ca.pem` に置き、 `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` を設定します |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` は、自己署名のものも含め、アプリのどの証明書も受け入れます。信頼できる一つのネットワークの中でだけ使い、 `NODE_EXTRA_CA_CERTS` を優先してください |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` （既定）はプレイブックとインベントリを各ジョブとともに受け取ります。自分で RTE にマウントする（ `local` ）場合を除き、そのままにします |

RTE が読み込むその他の設定は [RTE の実行](run.html#settings) にあります。 `RTE_MAX_JOBS` 、 `RTE_CACHE_MB` 、 `RTE_FILES` 、
`RTE_DRAIN_SECONDS` は、後からランナーのページで設定することもでき、そちらが変数より優先されます（
[RTE の設定](../runners/runner-page.html#an-rtes-settings) を参照）。

---

## 6. 起動

compose ファイルを使うと、定義全体を設定の隣の一か所にまとめられます。 `image:` には手順 4 のイメージを指定します。

```bash
sudo tee /opt/af-rte/compose.yml >/dev/null <<'EOF'
services:
  rte:
    image: ghcr.io/ansibleforms/ansibleforms-rte-full:7   # or af-rte-dc2, the image you built
    container_name: af_rte_dc2
    restart: unless-stopped
    # the running playbooks get RTE_DRAIN_SECONDS (25) to finish when the container stops
    stop_grace_period: 40s
    env_file: rte.env
    # the probes, on this host only : nothing connects to an outbound RTE
    ports:
      - "127.0.0.1:8000:8000"
    healthcheck:
      test: ["CMD", "node", "./healthcheck.js"]
      interval: 10s
      timeout: 5s
      retries: 30
      start_period: 30s
    volumes:
      - ./data:/app/dist/persistent
      - ./data/ssh:/home/node/.ssh
      - ./data/git/.gitconfig:/home/node/.gitconfig
      - ./data/ansible/ansible.cfg:/etc/ansible/ansible.cfg
      - ./data/ansible/roles:/etc/ansible/roles
      - ./data/ansible/collections:/etc/ansible/collections
EOF
cd /opt/af-rte && docker compose up -d
```

Docker は再起動後に再び起動します（ `unless-stopped` ）。Podman にはそれを行うデーモンがないので、 `podman-restart.service` を有効にする
（ `sudo systemctl enable --now podman-restart` ）か、Quadlet ファイルでコンテナーを systemd サービスとして実行してください。SELinux が
enforcing のホストでは、各ボリュームに `:Z` を追加します（ `./data:/app/dist/persistent:Z` ）。

compose を使わない場合、同じコンテナーを一つのコマンドで起動できます。

```bash
docker run -d --name af_rte_dc2 --restart unless-stopped --stop-timeout 40 \
  --env-file /opt/af-rte/rte.env -p 127.0.0.1:8000:8000 \
  -v /opt/af-rte/data:/app/dist/persistent \
  -v /opt/af-rte/data/ssh:/home/node/.ssh \
  -v /opt/af-rte/data/git/.gitconfig:/home/node/.gitconfig \
  -v /opt/af-rte/data/ansible/ansible.cfg:/etc/ansible/ansible.cfg \
  -v /opt/af-rte/data/ansible/roles:/etc/ansible/roles \
  -v /opt/af-rte/data/ansible/collections:/etc/ansible/collections \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

---

## 7. ホストでの確認

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

ログには、RTE が起動し、アプリに接続し、接続が確立したことが表示されます。

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

参加トークンがない場合は、待機中であることを示す行がもう一つ表示されます。
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)` 。フィンガープリントを控えておいてください。

ソケットが開くまで、 `/ready` は `not connected to the app` とともに `503` を返します。ヘルスチェックが示すのは、プロセスが待ち受けていることだけです。

---

## 8. 承認

参加トークンがない場合、RTE は参加を申請しています。 **接続 > ランナー** では、リストの上にオレンジ色の通知
**1 件のランナーが承認を待っています** が表示されます。それを開き、 **フィンガープリント** が RTE のログのものと同じで、 **モード** が
アウトバウンドであることを確認してから、 **承認** します（ [RTE の承認](../runners/registration.html#approving-an-rte) を参照）。承認できるのは管理者だけです。24 時間以内に
誰も処理しなかった申請は削除され、RTE は次にアプリに接続したときに再び申請します。

参加トークンがある場合、ランナーはすぐに承認され、その説明には参加トークンの名前が入ります。どちらの場合も、アプリは RTE のトークンを
新しい RTE 認証情報 `rte-dc2-rte` に保持し、以降 RTE は自分の `RTE_TOKEN` でサインインします。 `RTE_JOIN_TOKEN` はもう
使われないので、 `rte.env` から削除してかまいません。

---

## 9. AnsibleForms での確認

1. **接続 > ランナー** に、種類 RTE のランナー `rte-dc2` が表示されます。 **列 > 接続** をオンにすると、リストに **接続済み** が表示されます
2. それを開きます。 **RTE** タブには **モード** アウトバウンドと、 **接続** のバッジ **接続済み** が表示されます。ポインターを重ねると、
   ソケットを持つアプリノード、RTE のリリース、実行中のジョブの数が表示されます
3. **接続テスト** をクリックすると、 **Runner connection is OK** と表示されます。何も呼び出さず、どのアプリノードが RTE のソケットを持っているか
   （ `runner_leases` ）を読み、RTE が接続時に使った契約を確認します
4. *データセンター 2* のような説明を付けます
5. `runner:` のないすべてのプレイブックフォームをデータセンター 2 で実行したい場合を除き、 **既定** はデータセンター 1 のランナーのままにします

**ステータス** ページには、新しい RTE がほかの RTE と並んでバージョンとともに表示されます。

---

## 10. 最初のジョブ

何も変更しないプレイブックで、経路全体を確かめます。アプリのプレイブック（データセンター 1 と同じく、そのプレイブックのフォルダーまたは
リポジトリ）に `ping-dc2.yaml` を追加します。

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

次に、デザイナーで新しいランナーを指定するフォームを追加します。

```yaml
name: Ping datacenter 2
type: ansible
playbook: ping-dc2.yaml
runner: rte-dc2
inventory: <an inventory with the hosts of datacenter 2>
roles:
  - admin
categories:
  - Default
fields: []
```

起動します。アプリはプレイブックのフォルダーとインベントリをジョブとともに送り、RTE はそれらをハッシュで保持するので、変更されていない
フォルダーが二度送られることはありません。出力は `Running on RTE rte-dc2 (outbound)` で始まり、すべてのホストで `pong` と表示され、ジョブは
成功で終わります。 [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) （既定は 512）より大きいフォルダーは
送られず、ジョブは失敗してその旨を示します。

---

## 11. フォームの送り先にする

フォームは指定した RTE で実行されるので、データセンター 2 向けのすべてのフォームに同じ行を追加します。

```yaml
runner: rte-dc2
```

既定のランナーとほかの種類のランナーについては [ランナー](../runners.html) を参照してください。

---

## 失敗したとき

RTE は `notice` 以上を `docker logs` に書き込みます。ソケットが開く前に失敗した接続（DNS 名、拒否されたポート、
証明書）は、 `info` で `RTE: dialing the app again in <n> seconds` としか表示されません。
`rte.env` に [`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) を設定して再起動すると、
`RTE: socket to wss://...: <the error>` が表示されます。

| 表示されるもの | 場所 | 対処 |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `rte.env` に `RTE_TOKEN` がないか、短すぎます |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | `rte.env` に `APP_URL` を設定します |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` は `https://` （または `http://` ）で始めます |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | `rte.env` に `RTE_MODE=outbound` がありません |
| `connected to the app` の行がなく、 `/ready` が `503` のまま | `docker logs` 、 `/ready` | 手順 2 のネットワーク：このホストからアプリに `curl` し、プロキシ（ `HTTPS_PROXY` 、 `NO_PROXY` ）とアプリの証明書（ `NODE_EXTRA_CA_CERTS` 、手順 5）を確認します。エラーを見るには `LOG_CONSOLE_LEVEL=debug` を設定します |
| `the app refused the socket (404)` 、または 401、403、409 以外のステータス | `docker logs` | リバースプロキシが `/api/v2/rte/socket` で WebSocket を通していないか、 `APP_URL` にアプリのベースパスがありません |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | 別のトークンを持つランナー `rte-dc2` が存在します。RTE にそのトークン（ランナーの認証情報のパスワード）を与えるか、ランナーを削除して RTE に参加を申請させます |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | 新しい参加トークンを作るか、 `RTE_JOIN_TOKEN` を削除して RTE を承認します（手順 8） |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | RTE が新しいトークンで再インストールされました。ランナーの認証情報のトークンを使うか、管理者に変更してもらいます |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | 拒否の後に表示されます。原因を修正したら、待たずに `docker restart af_rte_dc2` を実行します |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | 承認します（手順 8）。接続はしていますが、それまではジョブを受け取りません |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | アプリと RTE が異なる [契約](images.html#the-contract) のリリースで動作しています。RTE をアプリのリリースに更新します（「更新」を参照） |
| **未接続** 、または **接続テスト** で *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* と表示される | アプリ | どのアプリノードもそのソケットを持っていません。RTE が停止しているか、アプリに到達できません。その `docker logs` を確認します |
| ジョブが待機した後、 *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* で失敗する | ジョブの出力 | ジョブが待機している間、RTE が接続していませんでした |
| ssh キーで `Permission denied` | ジョブの出力 | `data/` のファイルは uid 1000 の所有である必要があります（手順 3） |
| 管理対象ホストで `UNREACHABLE` | ジョブの出力 | このホストからの ssh：キー、 `known_hosts` 、ホストへのファイアウォール |

アプリ側では、拒否された RTE はアプリのログに `Refused an RTE socket from <address>: <why>` として表示されます。

---

## 更新

アプリが新しいリリースに移ったら、このホストでも追従してください。同じ契約の RTE はその間も動作し続けます。リリースで
契約が変わる場合は、そのリリースノートに記載されます（ [契約](images.html#the-contract) を参照）。 `compose.yml` 、または Dockerfile の
`FROM` に `:7` を指定している場合：

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

プレイブックが実行されていないときに更新してください。停止時は実行中のプレイブックを `RTE_DRAIN_SECONDS` （25）待ち、その時点でまだ実行中のものは
放棄されたものとして終了します。停止前に出力されたものはスプールに保持され、RTE が戻ると送られます。オフラインの場合は、
`docker compose up -d` の前に新しいイメージを `docker load` します（手順 4）。

---

## ロールバック

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

ソケットが閉じ、ランナーはすぐに **未接続** と表示されます。どのアプリノードもそのソケットを持たなくなるためです（ `runner_leases` ）。ソケットを閉じずに
いなくなったホストは、アプリノードがソケットから何も受け取らなくなってから約 1 分以内に **未接続** と表示されます。
ランナーは残ります。ソケットで参加したランナーが自動的に削除されることはありません。 **接続 > ランナー** でランナーを、
**接続 > 認証情報** でその認証情報 `rte-dc2-rte` を削除してください。先に、それを指定していたフォームから `runner:` の行を削除します。そうしないと、
それらのジョブは最大 `RTE_QUEUE_MINUTES` の間 RTE を待ち、失敗します。

---

## データセンター 2 の容量の追加

データセンター 2 のほかのホストで手順 1 から 9 を繰り返し、それぞれに `rte-dc2-b` のような独自の `RTE_NAME` と `RTE_TOKEN` を与えます。それぞれが
独自のランナーとして参加し、最大 [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) 個のプレイブックを受け取ります。フォームは
`runner:` でその一つを選びます。同じ `RTE_NAME` を持つ二つの RTE は作業を分担しません。2 つ目が 1 つ目からソケットを引き継ぎます（
[複数の RTE](several.html#several-rtes) を参照）。

---

## データベースモードの RTE

7.3.0 より前は、この手順書でデータベースモードの RTE を構成していました。データベースの認証情報（ `DB_*` 、 `ENCRYPTION_SECRET` ）を保持し、
ポート `3306` でデータセンター 1 のデータベースに接続し、アプリはポート `8000` で RTE を呼び出していました。このモードは 7.3.0 から非推奨で、
8.0.0 で削除されます。新しいランナーを作らずにこうした RTE をアウトバウンドに移すには、 `RTE_MODE=outbound` 、 `APP_URL` 、 `RTE_NAME` （その
ランナーの名前）を設定し、 `RTE_TOKEN` はそのままにして、 `DB_*` 、 `ENCRYPTION_SECRET` 、 `RTE_REGISTER` を削除します。
[データベース（非推奨）](modes.html#database-deprecated) を参照してください。その後、不要になったポート `8000` とデータベースのポートを閉じます。
