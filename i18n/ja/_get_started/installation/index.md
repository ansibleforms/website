---
layout: default
title: インストール
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# インストール
{: .no_toc }

AnsibleForms のインストール方法を選びます
{: .fs-6 .fw-300 }

---

新しいインスタンスを構築する管理者向けです。インストール方法を選び、そのページの手順に従ってください。

---

## このセクションの内容

AnsibleForms はいくつかのインストール方法に対応しており、それぞれ個別のページで説明しています。

| ページ | 内容 |
|---|---|
| [インストーラー](installer.html) | 1 つのコマンドでコントローラーまたはランナーを Docker、Podman、Kubernetes、またはネイティブにインストールし、その後のアップグレードとバックアップも行います |
| [ネイティブ](native.html) | コンテナーを使わないインストーラーのインストール。サーバーに Node.js、MariaDB、Ansible を入れ、AnsibleForms を systemd サービスとして動かします |
| [Docker](docker.html) | MySQL をインストールし、必要な環境変数を指定してビルド済みの Docker イメージを実行します |
| [Docker Compose](docker-compose.html) | [docker-compose プロジェクト](https://github.com/ansibleforms/docker) をダウンロードし、docker-compose で MySQL と AnsibleForms の両方を起動します |
| [ソースから](from-source.html) | すべての依存関係を手動でインストールし、コードをビルドして起動します |
| [Kubernetes](kubernetes.html) | Helm チャートをインストールし、Kubernetes で AnsibleForms とその MySQL データベースを起動します |

{: .note }
> **推奨** 7.3.0 以降のインストーラーは、動作するインスタンスを最も早く用意できる方法です。いくつかの質問に答えるだけで、
> Docker または Podman 上に Docker Compose プロジェクトを、あるいはほかの方法のいずれかを構成します。Docker イメージにはすべての依存関係が含まれています。

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

既存のインストールを新しいリリースに移行するには、 [アップグレード](../upgrading/) を参照してください。

どの方法でも、アプリの隣で 1 つの RTE が動きます。RTE はプレイブックを実行するコンテナー（またはサービス）です。別のホストや別の
データセンターにもう 1 つ追加するには、 [インストーラー](installer.html#a-runner) でランナーをインストールします。ランナーは 1 本の WebSocket で AnsibleForms に接続し（アウトバウンド、
[モード](../rte/modes.html) を参照）、データベースの認証情報は持ちません。 [ランタイム環境](../rte/) と、そのランブック
[別のデータセンターにある RTE](../rte/another-datacenter.html) も参照してください。

---

## イメージタグ

イメージは GitHub Container Registry に `ghcr.io/ansibleforms/ansibleforms` として公開されています。このレジストリは
プロジェクトが所有しており、匿名の pull にレート制限はありません。7.0.0 以降のすべてのリリースはここでのみ公開され、6.x の
リリースもここにあります。

バージョン 7 以降、プレイブックは RTE で実行されます。RTE はアプリとは別に 3 つのレイヤーで公開されています（ [RTE イメージ](../rte/images.html) を参照）。

| イメージ | 内容 |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | Web アプリケーションと API。python と ansible は含みません |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | python と ansible を含まない RTE。独自のイメージのベースです |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | ベースに python、ansible-core、いくつかのライブラリを加えたもの。コレクションを追加するならこれです |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | core に `ansible` パッケージ、そのコレクションとライブラリを加えたもの。既定の RTE です |

4 つのイメージは同じ実行でビルドされ、同じタグが付くため、RTE のタグは常にアプリのタグと一致します。

以前の Docker Hub リポジトリ `ansibleguy/ansibleforms` は更新されなくなりました。既存の
リリースは残っていますが、どちらの系列の新しいバージョンも公開されません。そこから pull している場合は、同じタグのまま
`ghcr.io/ansibleforms/ansibleforms` に切り替えると、引き続き更新を受け取れます。

各イメージで次のタグを使用できます。RTE イメージは 7.0.0 から始まっているため、6.x のタグはありません。

| タグ | 指す先 |
|---|---|
| `latest` | 最新のメジャーバージョンの最新リリース |
| `7`, `6` | そのメジャーバージョンの最新リリース |
| `7.0`, `6.5` | そのマイナーバージョンの最新リリース |
| `7.0.0`, `6.5.5` | そのリリースそのもの |
| `latest-rc` | 最新のリリース候補。それより新しいリリースがあればそのリリース。各候補には個別のタグもあります |

`latest` は前にしか進みません。古いメジャーバージョンのパッチ（たとえば 7.0.0 の後にリリースされた
6.5.x）は `6` と `6.5` を進めますが、 `latest` は動かしません。

メジャーバージョンに留まるには、 `latest` ではなくその番号（ `6` ）を使います。
