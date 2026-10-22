---
layout: default
title: Docker Compose
parent: インストール
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

docker-compose または podman-compose で AnsibleForms、その RTE、MySQL をまとめてインストールします
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

[docker-compose プロジェクト](https://github.com/ansibleforms/docker) は 3 つのコンテナーを実行します。MySQL、AnsibleForms アプリ、そしてプレイブックを実行する RTE
（ランタイム環境）です。設定、サンプルフォーム、プレイブックもこのプロジェクトに含まれているため、ほかに必要なのは
Docker または Podman とその compose ツールだけです。

[インストーラー](installer.html) は 1 つのコマンドでこのプロジェクトをダウンロードし、設定とシークレットを埋めて起動します。このページでは
手動で構築する方法を説明します。

---

## 前提条件

始める前に、次のものが必要です。

* **Linux マシン** : どのディストリビューションでもよく、CPU とメモリは控えめで構いません
* **GitHub へのアクセス** : GitHub から docker-compose プロジェクトをダウンロードまたはクローンするため
* **Docker または Podman** : コンテナーエンジン。インストール方法は後述します
* **compose ツール** : Docker Compose または podman-compose。いくつかの設定ファイルから 3 つのコンテナーを起動します

**動画**: [AnsibleForms のインストール方法](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## インストール先を決める

プロジェクト用のフォルダーを作成します。例では `/srv/apps` を使います。

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## docker-compose プロジェクトをクローンする

Git をインストールします。

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y git
```

</div>
</div>

次に、docker-compose プロジェクトをそのフォルダーにクローンします。

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## 適切な権限を設定する

アプリと RTE はユーザー `node` （uid 1000）として動作するため、 `data` フォルダーの所有者をこのユーザーにします。

```bash
sudo chown -R 1000:1000 ./data
```

コンテナーが root で動いていた 6 から移行する場合は、7 を起動する前に同じ `chown` を一度実行してください。MySQL は起動時に自分のフォルダーの所有権を取り戻します。

---

## コンテナーエンジンをインストールする

Docker または Podman を、それぞれの compose ツールと一緒にインストールします。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Docker のリポジトリから Docker Engine と Compose プラグインをインストールします
（ [Docker のインストールマニュアル](https://docs.docker.com/engine/install) を参照）。

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
# Docker's own dnf repository (Rocky / Alma : use .../linux/centos/docker-ce.repo)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
</div>

次に、コンテナー内で名前解決できるようにし、Docker をサービスとして起動します。

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman にはサービスが必要ありません。podman-compose と一緒にインストールします。

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y podman
# podman-compose comes from EPEL (on RHEL, enable EPEL as Red Hat documents it)
sudo dnf install -y epel-release
sudo dnf install -y podman-compose
```

</div>
</div>

</div>
</div>

---

## カスタマイズする

`.env` と `docker-compose.yml` の変数を確認し、すべてのパスワードを変更します。対象は `MYSQLDB_ROOT_PASSWORD` 、
`MYSQLDB_PASSWORD` 、 `ADMIN_PASSWORD` 、 `RTE_TOKEN` です。 [環境変数の詳細](../customization)

アプリは `ansibleforms` （ `MYSQLDB_USER` ）として MySQL に接続します。このユーザーは `AnsibleForms` スキーマに対するすべての権限を持ち、
それ以外には権限を持ちません。root は MySQL 自体のためだけに使います。MySQL はこのユーザーを初回起動時にのみ作成します。これまで root で接続していた
インストールでは、プロジェクトの [README](https://github.com/ansibleforms/docker#database) にあるとおり、一度だけ作成してください。

RTE はホストに公開されません。7.3.0 以降、アプリは `RTE_TOKEN` を使って `http://rte:8000` の RTE に接続し、1 本の WebSocket を開いたままにします
（ `RTE_MODE=inbound` 、 [モード](../rte/modes.html) を参照）。RTE はデータベースの設定も `.env` も受け取らず、受け取るのはトークンと
`docker-compose.yml` にある自分用のいくつかの設定だけです。設定シード `data/seed.yaml` は、トークンとそのアドレスを持つ RTE の認証情報と、
それでサインインするモード inbound の既定のランナー `rte` を宣言しています。RTE は同じ `data` フォルダーからプレイブックを実行します
（ `RTE_FILES=local` ）。プレイブックにさらにコレクションや Python ライブラリが必要な場合は、独自の RTE をビルドし、
`rte` サービスがそれを使うように設定してください（ [独自の RTE をビルドする](../rte/images.html#build-your-own-rte) を参照）。

---

## docker-compose プロジェクトを起動する

3 つのコンテナーをバックグラウンドで起動します。アプリは MySQL が正常になるまで待ち、それから RTE に接続します。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
# with the older standalone tool : sudo docker-compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose up -d
# podman is service-less : you can run it as any user, with or without sudo
```

</div>
</div>

---

## アプリケーションをテストする

コンテナーが起動したら、ブラウザーで AnsibleForms を開きます。

* `https://your_ip` を開きます（ポート 443。.env ファイルの `WEBAPP_LOCAL_PORT` を参照）
* `.env` ファイルの `ADMIN_PASSWORD` を使って `admin` でログインします。既定の `AnsibleForms!123` のままであれば、新しいパスワードを設定してください
* **接続 > ランナー** で、RTE が既定のランナー `rte` として一覧にあり、そのページで
  **接続** が **接続済み** になっていることを確認します
* 次のステップ:
  * data/forms/ フォルダーに YAML ファイルを追加するか、組み込みのデザイナーを使ってフォームを作成します
  * data/playbooks/ フォルダーにプレイブックを追加します
  * LDAP 接続を追加します
  * ユーザーとグループを追加します
  * テンプレートフォーム用のランナーを追加します: AWX、AAP または Ascender、Semaphore、Rundeck、Jenkins
  * ほかの MySQL サーバーや REST API などの外部接続用、または Ansible プレイブックに渡すための認証情報を追加します
  * Git リポジトリを接続し、フォームやプレイブックをリポジトリと同期するかどうかを選びます

---

## ファイル構成

docker-compose プロジェクトのフォルダー構成は次のとおりです。

```bash
.
├── docker-compose.yml # the mysqldb, app and rte containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade, mounted in the app and the rte
    ├── ansible # mounted in the rte only
    │   ├── ansible.cfg # ansible settings
    │   ├── roles # roles you install
    │   └── collections # collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions and jq definitions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks, with sample maintenance playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── seed.yaml # the config seed: registers the rte as the default runner
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```
