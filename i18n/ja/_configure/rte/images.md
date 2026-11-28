---
layout: default
title: イメージ
parent: RTE
nav_order: 1
translated_from: 793f1c4efa7fb085bdd4b1551161e3b57b52ff12
---

# RTE イメージ
{: .no_toc }

公開されている三つの RTE イメージと、プレイブックが使うコレクションとライブラリを含む独自の RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## RTE イメージ

RTE は三つのレイヤーで公開されており、それぞれが前のものの上に構築され、タグはコントローラーと同じです（ [イメージのタグ](../installation/#image-tags) を参照）。

| イメージ | 中身 | 用途 |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js と AnsibleForms サーバー、git、ssh、sshpass。python も ansible もないので、単体ではプレイブックを実行しません | 独自の python と ansible のバージョンで RTE をビルドする場合 |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | base に、python 3.14、ansible-core、いくつかの一般的なライブラリ（ `jmespath` 、 `netaddr` 、 `requests` 、 `paramiko` ）を加えたもの。コレクションはありません | プレイブックが使うコレクションとライブラリだけを含む、より小さな RTE をビルドする場合 |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | core に、同じ ansible-core 上の `ansible` パッケージと、AnsibleForms 6.5 のイメージにあったもの（NetApp、AWS、community のコレクション、 `pandas` 、 `pyvmomi` 、 `boto3` 、mariadb クライアント、ytt、いくつかの OS ツール）を加えたもの | **既定。** そのまま実行します。6.5 のプレイブックは使っていたものを見つけられます |

コントローラーのイメージと同じく、すべてのレイヤーはユーザー `node` （uid 1000）で動作し、プレイブックもそのユーザーで実行されます。

7.6.0 からは、すべてのレイヤーが同じタグで `linux/amd64` と `linux/arm64` 向けに公開されます。自分でビルドする RTE は、ビルドする
マシンのアーキテクチャ向けになります。arm64 のホスト向けには、arm64 のマシンでビルドするか、 `docker buildx build --platform linux/arm64` を使います。

---

## 独自の RTE のビルド

`ansibleforms-rte-core` の上に構築し、プレイブックが使うコレクションと python ライブラリを追加します。この NetApp の例は、
[ansibleforms/rte](https://github.com/ansibleforms/rte/tree/main/examples) にある Dockerfile の一つです。

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

python の環境とコレクションのフォルダーは `node` の所有なので、これらのインストールに root は不要です。OS のパッケージをインストールする
レイヤーでは、そのために `USER root` に切り替え、最後に `USER node` に戻します。独自の python と ansible を使うには、
`ansibleforms-rte-base` の上に構築します（同じフォルダーの `Dockerfile.own-ansible` ）。

イメージはコントローラーのリリースに合わせてください。 `:7` はコントローラーの `:7` に追従します。コレクションとロールは、組み込む代わりに
`/etc/ansible/collections` と `/etc/ansible/roles` にマウントすることもできます。その場合は変更のたびにリビルドする必要はありませんが、実行されるものはそのボリュームに
依存します。python ライブラリは常にイメージに含めます。すべてを組み込むと再現性があり起動も速いので、本番環境ではこの方法を使ってください。

---

## デザイナーでビルドする

7.9.0 から、ランタイム環境をデザイナーで記述できます。[ビルダー](builder.html) がそのイメージをビルドし、プッシュして署名します。

1. リポジトリに用途 **ランタイム環境** を設定します（設定 > リポジトリ）。定義はそこに保存されます。
2. デザイナーで **ランタイム環境** を開き、**新規** をクリックします。**ビジュアル** タブで入力するか、**YAML** タブで記述します。
3. **保存** し、**プッシュ** でリポジトリにコミットして、**ビルド** します。ビルドは **ジョブ** ページのジョブになり、ログをライブで確認できます。

各ランタイム環境はリポジトリ内のその名前の専用フォルダーで、定義だけを保持します。

```text
rte-netapp/
  rte.yaml
```

Dockerfile、`ansible.cfg`、requirements ファイルは、定義とアプリのリリースからビルドのたびに書き直されるため、
リポジトリ内で古くなることはありません。**ファイル** タブには、ビルダーが受け取るとおりに表示されます。

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

名前以外のキーはすべて省略できます。**YAML** タブのツールバーで、各部分をダイアログで設定できます。

| キー | 内容 |
|---|---|
| `name` | ランタイム環境の名前で、フォルダーとイメージの名前にもなります。小文字、数字、ドット、ダッシュ、アンダースコアが使えます |
| `arch` | `all` は公開イメージと同じく amd64 と arm64 の 1 つのイメージ、または `amd64` か `arm64` のみ。省略時は `all`。ビルダーのホストと異なるアーキテクチャには [そのホストの QEMU](builder.html#amd64-and-arm64) が必要です |
| `python` | イメージで実行する python。3.11 から 3.15 まで。省略時は 3.15 |
| `ansible_core` | その python で動く ansible-core のリリース（`2.22`）またはバージョン（`2.22.0`）。省略時は動く中で最新のもの |
| `ansible_collections` | コレクション。それぞれ `name`（namespace.name）と任意の `version`。省略時は最新。各コレクション自体が必要とするもの、その `requirements.txt` と `bindep.txt`（または `meta/execution-environment.yml`）は、ansible-builder と同じく一緒にインストールされます |
| `python_packages` | Python パッケージ。`requirements.txt` の行として記述します |
| `os_packages` | Debian 13（trixie）のパッケージ |
| `registry` | `credential`：レジストリのアドレスとログインを保持する **コンテナレジストリ** の認証情報。`path`：その中のイメージのパス、省略時はその名前。`tag`：`app` はアプリのリリース（`7.9.0`）で、再ビルドが各アップグレードに追従します。または独自のタグ |
| `sbom` | `true` でソフトウェア部品表（SBOM）をイメージに添付します |
| `sign` | `credential`：ビルダーが cosign 3 でイメージに署名する **署名鍵** の認証情報。cosign 3 の `cosign verify --key <公開鍵>` で確認します（cosign 2 はその署名を読めません） |

各ランタイム環境はアプリのリリースの `ansibleforms-rte-base` からビルドされるため、タグ `app` で古いリリース向けにビルドされたイメージは、
**ランタイム環境** ページにその旨が **再ビルド** とともに表示されます。

---

## 契約

コントローラーと RTE が共有しなければならないのは契約で、両者が報告する番号です。古いリリースの RTE も、両者が同じ契約で通信する限り、
新しいコントローラーと引き続き動作します。リリースで契約が変わる場合は、そのリリースノートに RTE の更新が必要であると記載されます。各モードには
それぞれの契約があります。

| モード | 契約 | 一致しない場合 |
|---|---|---|
| アウトバウンド、インバウンド | 3。7.3.0 で追加 | コントローラーはコード `4409` で RTE のソケットを閉じ、 *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused* とログに記録します。アウトバウンドの RTE は *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds* とログに記録します。別の契約で送られたジョブは拒否されます |
| データベース（非推奨） | 2。7.0.0 から | RTE はコントローラーのジョブを拒否します |

ランナーの **接続テスト** は、RTE がどの契約で通信し、コントローラーがどの契約を必要としているかを示します（
[接続テスト](../runners/runner-page.html#test-connection) を参照）。 **ステータス** ページの **ランナー** の行でも同じ確認が行われます。
