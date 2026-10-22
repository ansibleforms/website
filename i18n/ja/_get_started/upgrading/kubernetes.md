---
layout: default
title: Kubernetes
parent: アップグレード
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Helm チャートで作成したインストールをアップグレードします
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

チャートの各バージョンは 1 つの AnsibleForms リリースをデプロイします。アップグレードでは、既存の values を使って新しいチャートのバージョンをインストールします。
永続ボリューム上のデータはそのまま残ります。何も変更しないアップグレードでは、Pod には手が加えられません。

---

## アップグレードの前に

問題が起きたときに元に戻せるよう、アップグレードの準備をします。

* **設定 → バックアップ** で **バックアップを取ります** 。新しいリリースは初回起動時にデータベースのスキーマをアップグレードします。
* 現在のバージョンと新しいバージョンの間のリリースについて **[変更履歴](../changelog) を読みます** 。
* **新しいメジャーバージョンに移行しますか?** 先に [v7 へのアップグレード](../upgrade-7.html) に従ってください。
* values の変更点について **チャートの [変更履歴](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) を読みます** 。
* **生成された認証情報を使っている場合** （ `secrets.generate` ）は、 `<release>-secrets` Secret をバックアップしてください。 `ENCRYPTION_SECRET` は復元できません。
* **7.2 から移行しますか?** サーバー Pod 内の RTE のモードが変わります。 [7.2 から 7.3 へ](#from-72-to-73) を参照してください。

---

## 7.2 から 7.3 へ

チャート 7.3.0 では、アプリの隣にある RTE を、7.3.0 で非推奨になり 8.0.0 で削除されるデータベースモードから移行します。アプリは
`127.0.0.1` の RTE に接続して 1 本の WebSocket を開いたままにします（ `RTE_MODE=inbound` 、 [モード](../rte/modes.html) を参照）。

* RTE のコンテナーは `DB_HOST` 、 `DB_USER` 、 `DB_PASSWORD` 、 `ENCRYPTION_SECRET` 、 `RTE_URL` を受け取らなくなり、ジョブのファイルを
  共有ボリュームから取得します（ `RTE_FILES=local` ）
* チャートの設定シードは、トークンとアドレスを持つ RTE の認証情報と、それでサインインする `rte_mode: inbound` のランナーを
  宣言します。チャートのシードを使っていれば、何もする必要はありません
* `containers.rte.seedRunner: false` を指定している場合や独自の設定シード（ `CONFIG_SEED_PATH` ）を使っている場合、RTE は自分自身をランナーとして追加しなくなります。
  シードまたは **接続 → ランナー** で自分で宣言してください。 `http://127.0.0.1:<port>` とトークンを持つ RTE の認証情報と、
  それを指定する `rte_mode: inbound` の種類 RTE のランナーです。方法はアップグレード後に Helm が表示するノートに記載されています

7.3.0 以降、チャートは `runner.enabled` でランナーだけをインストールすることもできます（
[Kubernetes 上のランナー](../installation/kubernetes.html#a-runner-on-kubernetes) を参照）。

---

## 1. 新しいチャートのバージョンを探す

チャートリポジトリを更新し、利用できるチャートのバージョンを一覧表示します。

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. リリースをアップグレードする

インストール時と同じ `helm upgrade` コマンドを、自分の values ファイルと新しいチャートのバージョンを指定して実行します。

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

OCI レジストリを使う場合は、チャートとして `oci://ghcr.io/ansibleforms/charts/ansibleforms` を指定します。

---

## 3. アップグレードを確認する

新しい Pod を待ってから、Web サーバーとデータベース接続の両方を確認するチャートのテストを実行します。

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

AnsibleForms では、 **ヘルプ → バージョン情報** で実行中のバージョンを確認でき、 **設定 → ステータス** でデータベース、スキーマ、
AnsibleForms が依存するその他のシステムの状態を確認できます。

---

## ロールバック

Helm はリリースの履歴を保持しています。前のリビジョンに戻すには次のようにします。

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

アップグレード済みのデータベースで起動しない場合は、バックアップを復元します（チャートの [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) を参照）。
