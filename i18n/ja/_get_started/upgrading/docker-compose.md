---
layout: default
title: Docker Compose
parent: アップグレード
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

docker-compose プロジェクトで作成したインストールをアップグレードします
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

docker-compose プロジェクトは 3 つのコンテナーを実行します。MySQL（ `mysqldb` ）、AnsibleForms（ `app` ）、そしてプレイブックを実行する
RTE（ `rte` ）です。AnsibleForms と RTE はイメージタグ `7` を使い、これは常に最新の 7.x リリースを指します。
アップグレードではイメージを再び pull し、イメージが変わったコンテナーを作り直します。永続化が必要なものはすべて
`data` フォルダーに保存されており、そのまま残ります。

---

## アップグレードの前に

問題が起きたときに元に戻せるよう、アップグレードの準備をします。

* **設定 → バックアップ** で **バックアップを取ります** 。新しいリリースは初回起動時にデータベースのスキーマをアップグレードします。
* 現在のバージョンと新しいバージョンの間のリリースについて **[変更履歴](../changelog) を読みます** 。
* **新しいメジャーバージョンに移行しますか?** 先に [v7 へのアップグレード](../upgrade-7.html) に従ってください。
* **6.5 から移行しますか?** `v6` ブランチにある 6.x のプロジェクトには `rte` コンテナーがありません。 `.env` の設定と `data` フォルダーは残したまま、
  プロジェクトのコピーを `main` ブランチに更新し、 `docker-compose.yml` に `rte` サービスが入るようにします。
  その compose ファイルは `CONFIG_SEED_PATH` を設定しますが、6.x の `data` フォルダーには `seed.yaml` がありません。リポジトリから `data/seed.yaml` を
  コピーし、リポジトリの `.env` と同じように `RTE_TOKEN` （16 文字以上）を `.env` に追加してください。これらがないと
  アプリは起動しません。7 のイメージは root ではなく uid 1000 で動作します。MySQL のファイルは MySQL に任せたまま、
  `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +` で `data` フォルダーの所有者を一度だけこのユーザーにします。
  `data/ssh` フォルダーは `/root/.ssh` ではなく `/home/node/.ssh` にマウントされるようになりました。
* **7.2 から移行しますか?** `docker-compose.yml` と `data/seed.yaml` を一緒に更新します。まず [7.2 から 7.3 へ](#from-72-to-73) を参照してください。

---

## 7.2 から 7.3 へ

7.2.0 までは、 `rte` サービスがデータベースの設定を受け取り、 `data/seed.yaml` で宣言されたそのランナーはデータベースモードで動作していました。
このモードは 7.3.0 で非推奨になり、8.0.0 で削除されます。7.3.0 以降、アプリは `http://rte:8000` の RTE に接続して 1 本の WebSocket を開いたままにし
（ `RTE_MODE=inbound` 、 [モード](../rte/modes.html) を参照）、RTE はデータベースの設定を持ちません。 `.env` は残したまま、両方のファイルをリポジトリの
`main` ブランチから取得してください。

| ファイル | 変更点 |
|---|---|
| `docker-compose.yml` | `rte` サービスは `.env` を読み取らなくなります。 `RTE_MODE=inbound` 、 `RTE_TOKEN` 、 `RTE_FILES=local` を受け取り、 `DB_*` は受け取りません |
| `data/seed.yaml` | `url: http://rte:8000` と `password: ${RTE_TOKEN}` を持つ RTE の認証情報 `rte` と、 `rte_mode: inbound` と `credential: rte` を持つランナー `rte` |

両方を変更してください。新しい compose ファイルだけだと、シードはランナー `rte` をデータベースモードのまま維持します。アプリは RTE を 7.2 の RTE として呼び出しますが、
新しい RTE はそれに応答しないため、プレイブックは実行されません。自分で変更したシードにも、同じ認証情報と `rte_mode` が必要です。

シードが作成したランナーは、 `CONFIG_SEED_PATH` を削除した後も管理対象のままで、 **接続 → ランナー** では読み取り専用です。宣言しなくなったランナーを
解放できるのは、適用されたシードだけです。そのため、 `CONFIG_SEED_PATH` を削除してランナーを手動で変更するのではなく、シードを残してそこで `rte_mode` を設定してください。

[インストーラー](../installation/installer.html#upgrade) はこれを自動で行います。アップグレードで `docker-compose.yml` を置き換え、 `data/seed.yaml` も
リポジトリが配布したもので変更されていなければ置き換えます。手動で変更したものは残し、新しいものをその隣に保存します。

---

## 1. 新しいイメージを pull する

`docker-compose.yml` にあるタグの最新イメージをダウンロードします。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. コンテナーを作り直す

プロジェクトをもう一度起動します。イメージが変わったコンテナーが作り直されます。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. アップグレードを確認する

起動中の AnsibleForms のログを追います。新しいリリースの初回起動ではデータベースのスキーマがアップグレードされ、AnsibleForms が正常になると
RTE が起動します。

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

AnsibleForms では、 **ヘルプ → バージョン情報** で実行中のバージョンを確認でき、 **設定 → ステータス** でデータベース、スキーマ、
AnsibleForms が依存するその他のシステムの状態を確認できます。

---

## ロールバック

以前に実行していたリリース（アップグレード前に **ヘルプ → バージョン情報** に表示されていたバージョン）に戻すには、
`docker-compose.yml` で AnsibleForms と RTE の両方のイメージについて、 `7` の代わりにその正確なタグを固定し、ステップ 2 をもう一度実行します。そのリリースが
アップグレード済みのデータベースで起動しない場合は、 **設定 → バックアップ** で取ったバックアップを復元します。再び更新を受け取るには、タグを
`7` に戻してください。

**動画**: [AnsibleForms のアップグレード方法](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
