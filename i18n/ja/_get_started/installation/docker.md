---
layout: default
title: Docker
parent: インストール
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Docker または Podman で AnsibleForms のアプリと RTE のイメージを実行し、自前の MySQL サーバーと組み合わせます
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

AnsibleForms は Docker または Podman で 2 つのコンテナーとして実行できます。アプリと、プレイブックを実行する RTE で、どちらも MySQL データベースに接続します。

---

## 前提条件

始める前に、次のものが必要です。

* **Docker または Podman** : どちらかがインストールされ、動作していること
* **MySQL** : インストールされ、動作していること

---

## MySQL をインストールする

コンテナーから到達できる Linux サーバーに MySQL 8 以上、または MariaDB をインストールします。

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu には MySQL 8 が含まれています。

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian には MySQL の代わりに MariaDB が含まれており、AnsibleForms はこれにも対応しています。

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 以降とそのリビルド版には、AppStream に MySQL 8 が含まれています。

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms はネットワーク経由で、 `DB_USER` と `DB_PASSWORD` を使ってデータベースに接続します。root ではなく専用のユーザーを用意し、
`AnsibleForms` スキーマに対する権限だけを与えてください。

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

AnsibleForms に必要なのはこれだけです。この権限でスキーマを作成・更新し、バックアップを取ります。ユーザーがすべてのデータベースに権限を持っている場合は、
**ステータス** ページとログに警告が出ます。Ubuntu と Debian ではサーバーが localhost でしか待ち受けないため、設定で `bind-address` を指定して
コンテナーから到達できるようにしてください。

---

## フォルダーを準備する

AnsibleForms 7 は 2 つのコンテナーで動作します。アプリと、プレイブックを実行する RTE（ランタイム環境）です。どちらも
`config.yaml` 、フォーム、プレイブック、ログ、証明書を置くフォルダーと、SSH キー用のフォルダーをマウントします。イメージはユーザー `node` （uid 1000）として動作するため、
両方のフォルダーの所有者をこのユーザーにします。

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

アプリの設定は環境ファイルに書きます。データベースの接続先、認証情報を保存する前に設定する
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) 、アプリと
RTE が共有するトークン（ [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) 、16 文字以上）、そして RTE を宣言する設定シードです。

```bash
sudo tee /srv/apps/ansibleforms/ansibleforms.env > /dev/null <<'END'
DB_HOST=192.168.0.1
DB_PORT=3306
DB_USER=ansibleforms
DB_PASSWORD=<password>
ENCRYPTION_SECRET=<a long random string>
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml
END
sudo chmod 600 /srv/apps/ansibleforms/ansibleforms.env
```

RTE にはデータベースの設定を含まない専用のファイルを用意します。7.3.0 以降はアプリが RTE に接続して 1 本の WebSocket を開いたままにし
（ `RTE_MODE=inbound` 、 [モード](../rte/modes.html) を参照）、RTE は同じフォルダーからプレイブックを実行します（ `RTE_FILES=local` ）。

```bash
sudo tee /srv/apps/ansibleforms/rte.env > /dev/null <<'END'
RTE_MODE=inbound
RTE_TOKEN=<the same token>
RTE_FILES=local
PORT=8000
HTTPS=0
END
sudo chmod 600 /srv/apps/ansibleforms/rte.env
```

[設定シード](../seed/) は、RTE のアドレスとトークンを持つ RTE の認証情報と、それでサインインする既定のランナー `rte` を
宣言します。

```bash
sudo tee /srv/apps/ansibleforms/persistent/seed.yaml > /dev/null <<'END'
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
END
sudo chown 1000:1000 /srv/apps/ansibleforms/persistent/seed.yaml
```

---

## コンテナーを起動する

GitHub Container Registry で公開されているイメージを実行します（ [イメージタグ](./#image-tags) を参照）。アプリには
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) 、RTE には
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) を使います。

シードによって RTE が **接続 > ランナー** に既定のランナー `rte` として追加されるため、プレイブックのフォームは追加の設定なしでこの RTE で
実行されます。アプリは初回起動時にスキーマを作成し、両方が動き出すと RTE に接続します（サンプルの `config.yaml` は
[docker-compose プロジェクト](https://github.com/ansibleforms/docker/blob/main/data/config.yaml) にあります）。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker network create ansibleforms

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

起動すると、両方のコンテナーが一覧に表示されます。

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman は同じオプションを受け付け、サービスを必要としません。

```bash
podman network create ansibleforms

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

起動すると、両方のコンテナーが一覧に表示されます。

```bash
podman ps
```

</div>
</div>

アプリはポート `8000` で待ち受けます。 `HTTPS=1` を設定しない限り HTTP です。RTE はホストに公開されず、ネットワーク内でアプリだけが
RTE に接続します。 `--stop-timeout 30` は、停止時に RTE が実行中のプレイブックを終わらせる時間を与えます（RTE の設定と独自の RTE のビルドについては
[RTE を実行する](../rte/run.html) を参照）。

---

## アプリケーションをテストする

コンテナーが起動したら、ブラウザーで AnsibleForms を開きます。

* `http://your_ip:8000` を開きます（ `HTTPS=1` を設定した場合は HTTPS）
* `admin` / `AnsibleForms!123` （または `ADMIN_PASSWORD` で設定したパスワード）でログインし、新しいパスワードを設定します
* **接続 > ランナー** で、RTE が既定のランナー `rte` として一覧にあり、そのページで
  **接続** が **接続済み** になっていることを確認します
* 次のステップ:
  * `forms` フォルダーに YAML ファイルを追加するか、組み込みのデザイナーを使ってフォームを作成します
  * マウントした永続フォルダーの `playbooks` フォルダーにプレイブックを追加します
  * LDAP 接続を追加します
  * ユーザーとグループを追加します
  * テンプレートフォーム用のランナーを追加します: AWX、AAP または Ascender、Semaphore、Rundeck、Jenkins
  * ほかの MySQL サーバーや REST API などの外部接続用、または Ansible プレイブックに渡すための認証情報を追加します
