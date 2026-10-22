---
layout: default
title: Docker
parent: アップグレード
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

docker-compose を使わない単独のコンテナーをアップグレードします
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

単独のインストールは、コンテナーを置き換えることでアップグレードします。新しいイメージを pull し、古いコンテナーを削除して、
同じ `run` コマンドで新しいコンテナーを起動します。バージョン 7 以降、コンテナーは 2 つあります。AnsibleForms と、プレイブックを実行する
RTE で、常に同じリリースです。ファイルはマウントした `/app/dist/persistent` フォルダーに、データは
MySQL に保存されているため、どちらもそのまま残ります。

---

## アップグレードの前に

問題が起きたときに元に戻せるよう、アップグレードの準備をします。

* **設定 → バックアップ** で **バックアップを取ります** 。新しいリリースは初回起動時にデータベースのスキーマをアップグレードします。
* 現在のバージョンと新しいバージョンの間のリリースについて **[変更履歴](../changelog) を読みます** 。
* **新しいメジャーバージョンに移行しますか?** 先に [v7 へのアップグレード](../upgrade-7.html) に従ってください。
* **6.5 から移行しますか?** 7 のイメージは root ではなく uid 1000 で動作します。マウントするフォルダーの所有者を一度だけこのユーザーにしてください。
  たとえば `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh` です。
* **7.2 から移行しますか?** RTE は専用のファイルを使い、アプリが RTE に接続するようになります。まず [7.2 から 7.3 へ](#from-72-to-73) を参照してください。

---

## 7.2 から 7.3 へ

7.2.0 までは、RTE はデータベースの設定を含むアプリの環境ファイルを読み取り、 `RTE_URL` から自分自身をランナーとして追加していました。これが
データベースモードで、7.3.0 で非推奨になり、8.0.0 で削除されます。7.3.0 以降、アプリは RTE に接続して 1 本の WebSocket を開いたままにし
（ `RTE_MODE=inbound` 、 [モード](../rte/modes.html) を参照）、RTE はデータベースの設定を持ちません。ステップ 2 の前に一度だけ、次を行います。

1. [インストール](../installation/docker.html#prepare-the-folders) と同じように `/srv/apps/ansibleforms/rte.env` を作成し、
   `RTE_MODE=inbound` 、同じ `RTE_TOKEN` 、 `RTE_FILES=local` 、 `PORT=8000` 、 `HTTPS=0` を設定します。 `DB_*` 、 `ENCRYPTION_SECRET` 、 `RTE_URL` は入れません
2. そのモードでランナーを宣言します。インストールの [設定シード](../seed/) 、つまり RTE の認証情報
   （ `url: http://rte:8000` 、 `password: ${RTE_TOKEN}` ）とランナー `rte` （ `rte_mode: inbound` ）を持つ `persistent/seed.yaml` を追加し、
   アプリの環境ファイルに `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` を追加します。またはシードを使わずに、
   **接続 → ランナー** でランナーを開き、 **モード** を **インバウンド** に設定して、 `http://rte:8000` とトークンを持つ RTE の認証情報を選びます

シードを使う場合、シードはアプリの環境ファイルから `RTE_TOKEN` を読み取るため、アプリの環境ファイルにも同じトークンの `RTE_TOKEN` を入れます。

---

## 1. 新しいイメージを pull する

実行しているタグの最新の AnsibleForms と RTE のイメージをダウンロードします。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. コンテナーを置き換える

古いコンテナーを削除し、 [インストール](../installation/docker.html) の `run` コマンドで新しいコンテナーを起動します。アプリは
環境ファイルから、AnsibleForms のデータベースユーザー（root ではない）を使ったデータベースの接続設定を読み取ります。RTE はデータベースの設定を含まない
専用の `rte.env` を読み取り、アプリは両方のコンテナーが共有するネットワーク経由で RTE に接続します。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

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

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

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

</div>
</div>

6.5 から移行する場合は、まだ RTE のコンテナーがないため、 `stop` と `rm` のコマンドはアプリだけを対象にします。共有ネットワークは
`docker network create ansibleforms` （または `podman network create ansibleforms` ）で一度だけ作成します。
[インストール](../installation/docker.html#prepare-the-folders) と同じように、データベースの接続設定、 `ENCRYPTION_SECRET` 、16 文字以上の `RTE_TOKEN` 、
`CONFIG_SEED_PATH` をアプリの環境ファイルに入れ、 `rte.env` と設定シードを作成します。6.5 のインストールで別のフォルダーをマウントしていた場合は、
そのフォルダーを使ってください。シードによって RTE が **接続 → ランナー** に既定のランナー `rte` として追加されます。
[v7 へのアップグレード](../upgrade-7.html#playbooks-run-on-an-rte) を参照してください。

---

## 3. アップグレードを確認する

起動中の AnsibleForms のログを追います。新しいリリースの初回起動ではデータベースのスキーマがアップグレードされます。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

RTE は専用のログを書き込み、 `docker logs rte` で確認できます。AnsibleForms では、 **ヘルプ → バージョン情報** で実行中のバージョンを確認でき、 **設定 → ステータス** でデータベース、
スキーマ、AnsibleForms が依存するその他のシステムの状態を確認できます。

---

## ロールバック

以前に実行していたリリース（アップグレード前に **ヘルプ → バージョン情報** に表示されていたバージョン）に戻すには、 `7` の代わりにその正確なタグを
AnsibleForms と RTE の両方のイメージに指定して、ステップ 2 をもう一度実行します。そのリリースがアップグレード済みの
データベースで起動しない場合は、 **設定 → バックアップ** で取ったバックアップを復元します。
