---
layout: default
title: イメージ
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# RTE イメージ
{: .no_toc }

公開されている三つの RTE イメージと、プレイブックが使うコレクションとライブラリを含む独自の RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## RTE イメージ

RTE は三つのレイヤーで公開されており、それぞれが前のものの上に構築され、タグはアプリと同じです（ [イメージのタグ](../installation/#image-tags) を参照）。

| イメージ | 中身 | 用途 |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js と AnsibleForms サーバー、git、ssh、sshpass。python も ansible もないので、単体ではプレイブックを実行しません | 独自の python と ansible のバージョンで RTE をビルドする場合 |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | base に、python 3.14、ansible-core、いくつかの一般的なライブラリ（ `jmespath` 、 `netaddr` 、 `requests` 、 `paramiko` ）を加えたもの。コレクションはありません | プレイブックが使うコレクションとライブラリだけを含む、より小さな RTE をビルドする場合 |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | core に、同じ ansible-core 上の `ansible` パッケージと、AnsibleForms 6.5 のイメージにあったもの（NetApp、AWS、community のコレクション、 `pandas` 、 `pyvmomi` 、 `boto3` 、mariadb クライアント、ytt、いくつかの OS ツール）を加えたもの | **既定。** そのまま実行します。6.5 のプレイブックは使っていたものを見つけられます |

アプリのイメージと同じく、すべてのレイヤーはユーザー `node` （uid 1000）で動作し、プレイブックもそのユーザーで実行されます。

---

## 独自の RTE のビルド

`ansibleforms-rte-core` の上に構築し、プレイブックが使うコレクションと python ライブラリを追加します。この NetApp の例は、
[examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte) にある Dockerfile の一つです。

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

python の環境とコレクションのフォルダーは `node` の所有なので、これらのインストールに root は不要です。OS のパッケージをインストールする
レイヤーでは、そのために `USER root` に切り替え、最後に `USER node` に戻します。独自の python と ansible を使うには、
`ansibleforms-rte-base` の上に構築します（同じフォルダーの `Dockerfile.own-ansible` ）。

イメージはアプリのリリースに合わせてください。 `:7` はアプリの `:7` に追従します。コレクションとロールは、組み込む代わりに
`/etc/ansible/collections` と `/etc/ansible/roles` にマウントすることもできます。その場合は変更のたびにリビルドする必要はありませんが、実行されるものはそのボリュームに
依存します。python ライブラリは常にイメージに含めます。すべてを組み込むと再現性があり起動も速いので、本番環境ではこの方法を使ってください。

---

## 契約

アプリと RTE が共有しなければならないのは契約で、両者が報告する番号です。古いリリースの RTE も、両者が同じ契約で通信する限り、
新しいアプリと引き続き動作します。リリースで契約が変わる場合は、そのリリースノートに RTE の更新が必要であると記載されます。各モードには
それぞれの契約があります。

| モード | 契約 | 一致しない場合 |
|---|---|---|
| アウトバウンド、インバウンド | 3。7.3.0 で追加 | アプリはコード `4409` で RTE のソケットを閉じ、 *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused* とログに記録します。アウトバウンドの RTE は *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds* とログに記録します。別の契約で送られたジョブは拒否されます |
| データベース（非推奨） | 2。7.0.0 から | RTE はアプリのジョブを拒否します |

ランナーの **接続テスト** は、RTE がどの契約で通信し、アプリがどの契約を必要としているかを示します（
[接続テスト](../runners/runner-page.html#test-connection) を参照）。 **ステータス** ページの **ランナー** の行でも同じ確認が行われます。
