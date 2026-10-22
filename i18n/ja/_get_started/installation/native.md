---
layout: default
title: ネイティブ
parent: インストール
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# ネイティブインストール
{: .no_toc }

コンテナーを使わずにサーバーへ直接、インストーラーが構成する systemd サービスとして AnsibleForms を動かします
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

コンテナーが許可されていないサーバーの管理者向けです。 [インストーラー](installer.html) が AnsibleForms に必要なものをすべて
サーバー自体にインストールし、その後のアップグレードと削除も行います。インストールされるのは AnsibleForms 7.3.0 以降です。

---

## 必要なもの

インストーラーの **エンジン** ステップで **このサーバーに直接 (コンテナーなし)** を選ぶか、 `--mode native` を指定します。必要なものは次のとおりです。

* **root** : `sudo` でインストーラーを実行します（ `curl -fsSL https://ansibleforms.com/install | sudo sh` ）
* **systemd** : サービスは systemd ユニットとして動作します
* **対応する Linux** : Ubuntu、Debian、RHEL と Rocky Linux や AlmaLinux などのリビルド版、SUSE Linux Enterprise、openSUSE
* **amd64 または arm64**
* **インターネットアクセス** : ディストリビューションのリポジトリ、GitHub、nodejs.org、Python と Ansible のパッケージインデックスへ（リリースバンドルで
  置き換えられるものについては [エアギャップ環境](#air-gapped) を参照）

これらを満たさないサーバーでは、エンジンは *このサーバーに直接 (root が必要: sudo で実行)* または
*このサーバーに直接 (この Linux では非対応)* と表示されます。どちらの役割もこの方法でインストールできます。コントローラーと [ランナー](installer.html#a-runner) です。

---

## インストールされるもの

インストーラーは、どちらの役割でも、ディストリビューションのパッケージから次のものをインストールします。

| パッケージ | 用途 |
|---|---|
| `git` | リポジトリ |
| ssh クライアント | プレイブックの接続 |
| MariaDB クライアント | アプリのバックアップ。 `app.env` は [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) と [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) に、見つかったクライアント（ `mariadb-dump` と `mariadb` 、または古い `mysqldump` と `mysql` ）を設定します |
| `ca-certificates`, `curl`, `tar`, `gzip` | ダウンロード |
| `libatomic` | Node.js がこれにリンクしており、最小構成のサーバーには含まれていません |
| `sshpass` | ssh パスワードでサインインするプレイブック。RHEL とそのリビルド版では EPEL から入手し、インストーラーは `epel-release` で EPEL の有効化を試みます。インストールできない場合でもインストールは続行し、その旨を表示します |
| MariaDB サーバー | コントローラーのみ。そのデータベースです |

続いてインストール先フォルダーに次のものを入れます。ダウンロードはすべて、公開されているチェックサムと照合します。

* **AnsibleForms** : アプリの GitHub リリースにあるリリースバンドル `ansibleforms-<version>-linux-<arch>.tar.gz` 。Node.js 向けにビルドされたアプリです。
  バンドルがないバージョンでは *コンテナーなしには AnsibleForms 7.3.0 以降が必要です。* と表示されます
* **Node.js** : バンドルが指定するメジャーバージョンの最新リリース。nodejs.org から取得します
* **Python と Ansible** : まず uv を入れ、それを使って RTE イメージと同じ Python と、Ansible および
  full RTE イメージのライブラリを含む仮想環境を用意し、その Ansible コレクションを入れます（ [RTE イメージ](../rte/images.html) を参照）。数分かかります
* **初期ファイル** : [docker-compose プロジェクト](https://github.com/ansibleforms/docker) の `data` フォルダーにあるフォーム、プレイブック、設定です。
  新規の Docker Compose インストールと同じものです。ランナーは Ansible の設定、ssh と git の設定だけを残します

コントローラーの場合は、さらに MariaDB に `AnsibleForms` スキーマを作成し、インスタンス名を付けたデータベースユーザーを作成します。このユーザーは
そのスキーマに対するすべての権限を持ち、それ以外には権限を持たず、このサーバーからのみサインインできます。

---

## フォルダー

すべてはインストール先フォルダーに置かれます。既定は `/opt/ansibleforms` （ランナーの場合は `/opt/ansibleforms-runner` ）です。

| パス | 内容 |
|---|---|
| `releases/<version>/` | 1 つのリリース。バンドル、Node.js へのリンク、Python の仮想環境、コレクション |
| `current` | 実行中のリリースへのリンク。アップグレードでもロールバックでも切り替わります |
| `runtime/` | リリース間で共有される Node.js、uv、Python |
| `data/` | コンテナーが `/app/dist/persistent` としてマウントするもの。フォーム、プレイブック、 `config.yaml` 、設定シード、証明書、ログ |
| `home/` | システムユーザーのホーム。 `data/ssh` と `data/git` にリンクされた `.ssh` と `.gitconfig` |
| `app.env`, `rte.env` | サービスの設定とシークレット。root とシステムユーザーだけが読み取れます。RTE 用のファイルにはデータベースの設定は含まれません |
| `installer-backups/` | アップグレード前や `backup` でインストーラーが作成するデータベースのバックアップ |

リリースとランタイムは root が所有するため、サービスが自分のコードを変更することはできません。 `data/` と `home/` はシステムユーザーが所有します。
データベースのファイル自体は MariaDB がフォルダーの外で管理します。

---

## サービス

コントローラーは 2 つ、ランナーは 1 つの systemd サービスを動かします。それぞれインスタンス名（既定は `ansibleforms` ）のシステムユーザーとして、
`current/server` から、それぞれの設定ファイルを使って動作します。

| サービス | 実行するもの | 設定 |
|---|---|---|
| `<name>` | アプリ。Web インターフェース、API、ワーカー。コントローラーのみ | `app.env` |
| `<name>-rte` | プレイブックを実行する RTE | `rte.env` |

コントローラーの RTE は `inbound` で、 `127.0.0.1` の専用ポート（ `8001` 、または次に空いているポート。
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1` ）で待ち受け、アプリのフォルダーからプレイブックを実行し（ `RTE_FILES=local` ）、
設定シード `data/seed.yaml` で既定のランナーとして宣言されます。

ランナーの RTE にはモード、 `APP_URL` 、 `RTE_NAME` 、 `--join` を使った場合は参加トークンが設定され、プレイブックはジョブごとに受け取ります（
[モード](../rte/modes.html) を参照）。アウトバウンドの RTE はアプリからの呼び出しを受けないため、 `127.0.0.1` でのみ待ち受けます（ `LISTEN_HOST=127.0.0.1` ）。
インバウンドの RTE は、 `data/certificates` にある自分のアドレスの自己署名証明書で HTTPS を提供し、AnsibleForms はそれをピン留めします。
参加トークンがない場合は参加を求め、管理者が **接続 > ランナー** で承認します。

サービスは起動時に開始され、障害の後は再起動します。管理とログの確認には systemd の標準ツールを使います。

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

アプリは root でなくても `443` のような 1024 未満のポートで待ち受けられます。RTE は `sudo` を使う権限を保持しています。これはこのサーバーで
`become` を使うプレイブックに必要なもので、プレイブックは RTE が動いているサーバー自体を管理できます。

---

## アップグレードとロールバック

`sudo /usr/local/bin/ansibleforms-installer upgrade` は、ほかの方法と同じようにネイティブインストールをアップグレードします（ [アップグレード](installer.html#upgrade) を参照）。
順序は次のとおりです。

1. 実行中のリリースの隣に新しいリリースを配置します。バンドル、Node.js、Python、Ansible、コレクションです。実行中の
   サービスにはまだ触れません
2. リリースに含まれる新しい初期ファイルを追加します。既存のファイルはすべて残します
3. データベース（コントローラー）を `installer-backups/` にバックアップし、 `app.env` と `rte.env` のコピーも保存します
4. サービスを停止し、 `current` を新しいリリースに向けて、サービスを再び起動します
5. アプリが新しいバージョンで応答するまで待ちます（ランナーの場合は RTE が再び待ち受けるまで）

新しいバージョンが応答しない場合、インストーラーはロールバックを提案します。 `current` が再び前のリリースを指し、
データベースはバックアップから復元され、サービスが起動します。残すのは実行中のリリースとその 1 つ前のリリースだけです。

インストーラーのレイアウトに従ったネイティブサービスで、隣に `installer.json` がないもの（たとえば削除された後）は、 `install`
と `upgrade` が見つけて引き継ぎを提案します（ [既存のインストール](installer.html#an-existing-installation) を参照）。

---

## アンインストール

`sudo /usr/local/bin/ansibleforms-installer uninstall` はサービスを停止して削除します。データの削除を選び（または `--purge` を指定し）、
確認のためにインスタンス名を入力しない限り、フォルダーとデータベースは残ります。削除を選んだ場合は、データベースとそのユーザー（コントローラー）も削除し、
フォルダーを削除し、システムユーザーも削除します。

パッケージは MariaDB も含めてインストールされたまま残ります。ほかのソフトウェアが使っている可能性があるためです。

---

## エアギャップ環境

`--bundle` を使うと、GitHub からダウンロードする代わりに、サーバーにコピーしたリリースバンドルからインストールします。アプリの
[Releases](https://github.com/ansibleforms/ansibleforms/releases) から、アーキテクチャに合ったファイル `ansibleforms-<version>-linux-amd64.tar.gz` または `-arm64` を取得します。

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` は初期ファイルについて同じことを行い、 [ansibleforms/docker](https://github.com/ansibleforms/docker)
リポジトリのローカルコピーを使います。Node.js、Python とそのパッケージ、Ansible コレクションは、インストール中に引き続きダウンロードされます。
