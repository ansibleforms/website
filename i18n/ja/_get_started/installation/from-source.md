---
layout: default
title: ソースから
parent: インストール
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# ソースから
{: .no_toc }

AnsibleForms をソースからビルドし、Node.js で実行します
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## コードの構成

リポジトリには 2 つの Node.js アプリケーションが含まれており、ビルドでそれらを 1 つにまとめます。

* **client** : Web インターフェース。Vue 3 で書かれ、Vite で静的ファイルにビルドされます
* **server** : API。Express で書かれています。ジョブをランナーに渡し、データベースに接続し、ビルドしたクライアントを配信します。
  `AF_ROLE=rte` で起動すると、同じサーバーがプレイブックを実行する RTE（ランタイム環境）になります

ビルドするのはクライアントだけです。その出力は [Docker イメージ](https://github.com/ansibleforms/ansibleforms/blob/main/docker/controller/Dockerfile) と同じく、サーバーの `views` フォルダーに入ります。

---

## 前提条件

ソースからビルドして実行するには、Linux の確かなスキルと Node.js についてある程度の知識が必要です。すべてのコンポーネントを自分でインストールします。
コンテナーを使わず、ビルドもせずに AnsibleForms を動かしたい場合は、インストーラーの [ネイティブインストール](native.html) がこれをすべて代わりに行います。

* **Node.js 26** （ `.nvmrc` のバージョン。最低でも 24）と npm
* **Git** 。コードの取得とリポジトリの同期に使います
* **OpenSSH クライアント** （SSH 経由の git 用）と **sshpass** （SSH パスワードで接続するプレイブック用）
* **MariaDB クライアント** （ `mariadb` 、 `mariadb-dump` ）。バックアップと復元に使います。MySQL サーバーの場合も必要です
* **MySQL 8 以上または MariaDB** 。サーバーから到達できること
* **Ansible** 。プレイブックを実行する RTE プロセス用です（パス上に `ansible-playbook` ）。アプリのプロセス自体には
  Ansible も Python も不要で、テンプレートフォーム（AWX、AAP、Ascender、その他のランナー）だけなら RTE はまったく不要です

ディストリビューションに合わせてインストールします。

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 は NodeSource のリポジトリから、その他のツールは Ubuntu 自体から入手します。

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 は NodeSource のリポジトリから、その他のツールは Debian 自体から入手します。

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js は NodeSource から、 `sshpass` は EPEL から入手します（RHEL 自体では、Red Hat のドキュメントに従って EPEL を有効にします）。

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

`node --version` （26）と `ansible-playbook --version` を確認します。データベースとそのユーザーについては [MySQL をインストールする](docker.html#install-mysql) を参照してください。

---

## コードを取得する

アプリケーションを実行するユーザーが所有する任意のフォルダーに、リポジトリをクローンします。例では `/srv/apps/ansibleforms` を使います。

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## ビルドする

リポジトリのフォルダーから 3 つのステップでビルドします。まずクライアントをビルドします。

```bash
cd client
npm ci
npm run build
```

次にサーバーの依存関係をインストールします。

```bash
cd ../server
npm ci --omit=dev
```

最後に、ビルドしたクライアントをサーバーの `views` フォルダーにコピーします。

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## 設定する

サーバーは環境変数から設定を読み取ります。本番環境では、設定ページが書き込むファイル `server/persistent/.env` からも
読み取ります。

リポジトリのルートにあるサンプルファイルから始め、少なくとも MySQL の接続設定（ `DB_HOST` 、 `DB_PORT` 、 `DB_USER` 、
`DB_PASSWORD` ）を設定します。

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

すべての変数は [環境変数](../customization) で説明しています。それ以外のものは既定で `server/persistent` に保存されます。
`config.yaml` 、 `forms` フォルダー、自己署名証明書は初回起動時にここに作成され、ログもここに置かれます。
プレイブックは `server/persistent/playbooks` に置くか、それを読み取る RTE の環境で `ANSIBLE_PATH` を別の場所に向けてください。

---

## 実行する

AnsibleForms を本番モードで実行するか、コード自体を開発する場合は開発モードで実行します。

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">本番</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">開発</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

`server` フォルダーからサーバーを本番モードで起動します。

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

コマンドラインから起動したアプリケーションは、ログオフすると停止します。 [PM2](https://pm2.keymetrics.io/) を使うと、
バックグラウンドで動かし続け、クラッシュ後に再起動し、起動時にも自動で開始できます。

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

プレイブックは RTE で実行されます。同じサーバーを `AF_ROLE=rte` で、専用のポートでもう一度起動します。アプリは RTE に接続して
1 本の WebSocket を開いたままにし（ `RTE_MODE=inbound` 、 [モード](../rte/modes.html) を参照）、RTE は同じフォルダーからプレイブックを実行します
（ `RTE_FILES=local` ）。RTE も `persistent/.env` を読み取りますが、データベースの設定は一切使いません。アプリと RTE が共有する 16 文字以上のトークンと、
RTE を宣言する設定シードを `persistent/.env` に追加します。

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

[設定シード](../seed/) は、RTE のアドレスとトークンを持つ RTE の認証情報と、それでサインインする既定のランナー `rte` を
宣言します。

```yaml
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://127.0.0.1:8010
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

シードを使わない場合は、 **接続 > 認証情報** （そのアドレスとトークンを持つ RTE の認証情報）と
**接続 > ランナー** （種類 RTE、 **モード** は **インバウンド** ）で追加します。その後、 `127.0.0.1` だけで RTE を起動します。

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

RTE の設定は [RTE を実行する](../rte/run.html) ページで説明しています。PM2 に両方のプロセスが表示されることを確認します。

```bash
pm2 status
```

どちらも `online` です。

```text
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| id | name             | mode | version | pid  | uptime | restarts | status | cpu | mem     | user | watching |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| 0  | ansibleforms     | fork | 7.0.0   | 3104 | 8s     | 0        | online | 0%  | 120.1mb | root | disabled |
| 1  | ansibleforms-rte | fork | 7.0.0   | 3187 | 5s     | 0        | online | 0%  | 80.4mb  | root | disabled |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="development" markdown="1" hidden>

コード自体を開発するには、リポジトリのルートからライブリロード付きですべてを起動します。サーバーはポート 3001、RTE はポート 8010、
クライアントは `https://localhost:8443` です。このモードでは、サーバーと RTE は代わりに `server/.env.development` を読み取ります。

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

RTE（ `npm run dev:rte` ）にはパス上の `ansible-playbook` が必要で、非推奨のデータベースモードのランナーとして自分自身を追加します。これは
開発専用です。 `npm run dev:local` は RTE なしでクライアントとサーバーを起動します。実行すべきテストとチェックは [コントリビューションガイド](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) に記載されています。

</div>
</div>

---

## 初回実行

ブラウザーでサーバーを開きます（サンプルの `.env` では `https://your_ip:8443` ）。空のデータベースでは、初回起動時に
スキーマが作成されます。

既定の管理者の認証情報は次のとおりです。

* ユーザー名 : `admin`
* パスワード : `AnsibleForms!123`
