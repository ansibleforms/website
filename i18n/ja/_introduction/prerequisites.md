---
layout: default
title: 前提条件
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# 前提条件
{: .no_toc }

AnsibleForms をインストールする前に必要なもの
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 実行環境

AnsibleForms は、コンテナーとして、サーバー自体の systemd サービスとして、または自分でビルドする場合は Node.js アプリケーションとして動作します。

| インストール方法 | 必要なもの |
|---|---|
| [インストーラー](installation/installer.html) | amd64 または arm64 の Linux、 `curl` または `wget` と `sha256sum` 、そしてインストール先のエンジンに必要なもの（下記） |
| [ネイティブ](installation/native.html) | root、systemd、対応する Linux（Ubuntu、Debian、RHEL とそのリビルド版、SUSE）。残りはインストーラーがインストールします |
| [Docker](installation/docker.html) | Docker または Podman と、自前の MySQL サーバー |
| [Docker Compose](installation/docker-compose.html) | Docker Compose または podman-compose。MySQL もプロジェクトが起動します |
| [Kubernetes](installation/kubernetes.html) | クラスター、Helm 3、StorageClass（または事前に作成した PersistentVolume） |
| [ソースから](installation/from-source.html) | Node.js 26（最低でも 24）と npm、Git、そしてプレイブックを実行する RTE プロセス用の Ansible |

アプリのイメージ `ghcr.io/ansibleforms/ansibleforms` には、Node.js とサーバーが呼び出すツール（git、ssh、mariadb クライアント、
ytt）が含まれていますが、Python と Ansible は含まれていません。プレイブックは RTE（ランタイム環境）で実行されます。これは
`ghcr.io/ansibleforms/ansibleforms-rte-full` 、または `ansibleforms-rte-core` をベースに自分でビルドしたイメージから起動する 2 つ目のコンテナーです（ [スケーリング](rte/) を参照）。
AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins のテンプレートを起動するだけのフォームには RTE は不要です。

---

## データベース

AnsibleForms は、ジョブ、ユーザー、認証情報、接続を MySQL 8 以降または MariaDB に保存します。

初回起動時に、 `AnsibleForms` スキーマを自分で作成します。root ではなく専用のデータベースユーザーを用意し、そのスキーマに対する権限だけを
与えてください。

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

必要なのはこれだけです。この権限でスキーマを作成・更新し、バックアップを取り、ワーカーが複数ある場合は停止したワーカーのセッションを終了します。
ユーザーがすべてのデータベースに権限を持っている場合は、 **ステータス** ページとログに警告が出ます。アプリノードとワーカーはこの
ユーザーで接続します。ソケットモード（アウトバウンドまたはインバウンド、 [モード](rte/modes.html) を参照）の RTE はデータベースの認証情報を持ちません。接続するのは、
7.3.0 以降非推奨のデータベースモードの RTE だけです。スキーマを自分で作成するには、 [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) を `0` に設定します。
Docker Compose プロジェクトと Helm チャート（ `mysql:8.4` を使用）は、データベースを起動してくれます。

---

## サイジング

測定に基づく要件はありません。負荷は主に、同時に実行されるジョブの数と、ジョブが書き出す出力の量で決まります。
Helm チャートの既定のリソースは、小規模なチームにとって妥当な出発点です。

| コンポーネント | 要求 | 上限 | ボリューム |
|---|---|---|---|
| AnsibleForms | 1 CPU、メモリ 1 GiB | 4 CPU、メモリ 4 GiB | 10 GiB |
| MySQL | 0.5 CPU、メモリ 512 MiB | 2 CPU、メモリ 2 GiB | 10 GiB |

アプリのコンテナーはプレイブックを実行しません。各プレイブックは、RTE 上でフォークを伴う `ansible-playbook` プロセスとして動きます。各 RTE の CPU と
メモリは、同時に実行するプレイブック（最大 [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) 、既定は `10` ）に合わせて見積もり、さらに多く実行するには
RTE を増やします。AWX、AAP、Ascender、その他のテンプレートランナーで実行されるジョブは、AnsibleForms にはほとんど負荷をかけません。

ジョブの出力は、既定ではデータベースに無期限に保存されます。利用の多いインスタンスでは [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
を設定し、データベースが際限なく大きくならないようにしてください。

---

## ネットワーク

アプリと各 RTE はそれぞれ専用のポートで待ち受け、フォームと設定が使うシステムへのアウトバウンド接続を開きます。

### インバウンド
{: .no_toc }

サーバーはポート `8000` （ [`PORT`](customization/server.html#env_PORT) ）で、HTTP で、または
[`HTTPS`](customization/server.html#env_HTTPS) を `1` に設定した場合は HTTPS で待ち受けます。Docker Compose プロジェクトはポート 443 で公開し、
Helm チャートはサービスまたは Ingress で公開します。RTE も専用の `PORT` で待ち受けますが、呼び出すのはアプリだけなので、
公開ネットワークからは切り離してください。アウトバウンドの RTE はインバウンドのポートをまったく必要としません。アプリのポートでアプリに接続します。

### アウトバウンド
{: .no_toc }

AnsibleForms から、使用するシステムへの接続を開放します。

| 接続先 | 用途 |
|---|---|
| MySQL / MariaDB | AnsibleForms のデータベース（ `DB_HOST` 、 `DB_PORT` 、既定は `3306` ） |
| RTE | インバウンドの RTE に、そのランナーのアドレスで 1 本の WebSocket を使って接続します。またはデータベースモードの RTE を [`RTE_URL`](customization/server.html#env_RTE_URL) で呼び出し、その RTE が自分で MySQL に接続します。アウトバウンドの RTE は逆にアプリに接続します（ [モード](rte/modes.html) を参照） |
| AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins | [ランナー](runners.html) 上のテンプレートとジョブを、その HTTP(S) API で起動・追跡します |
| 管理対象ホスト | プレイブックが RTE から、たとえば SSH や WinRM で接続します |
| LDAP、Entra ID、OIDC | ディレクトリやシングルサインオンのアカウントでのログイン |
| Git サーバー | HTTPS または SSH でのリポジトリのクローンと pull |
| REST API とデータベース | フォームの式とクエリのデータソース |
| HashiCorp Vault、CyberArk | [シークレットストア](secret-stores/) からの認証情報の読み取り |
| メールサーバー、Slack、Teams、Telegram、Webhook | [通知チャネル](notification-channels.html) によるジョブの通知と承認依頼 |
| モデルプロバイダー | [チャットアシスタント](chat/) 。有効にした場合のみ |

式の REST 関数が呼び出せるホストを制限するには、
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) と
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) を参照してください。

---

## ブラウザー

Web アプリケーションは最新のブラウザー向けに作られています。Chrome または Edge 111、Firefox 114、Safari 16.4 以降です。
それより古いブラウザーには対応していません。

---

## スケーリング

既定では、1 つの AnsibleForms コンテナーが Web アプリとバックグラウンド処理をまとめて実行し、その隣で 1 つの RTE が動きます。

より多くのユーザーに対応するには、ロードバランサーの背後で複数のアプリノード（ `AF_ROLE=app` ）を、ワーカー（ `AF_ROLE=worker` ）と並べて動かします。ワーカーは
スケジュール、バックアップ、その他のバックグラウンド処理を実行します。同時に動くワーカーは 1 つだけで、2 つ目は引き継ぎに備えて待機します。これらは
データベース、永続フォルダー、 `ACCESS_TOKEN_SECRET` 、 `ENCRYPTION_SECRET` を共有します。 [スケーリング](production/scaling.html) を参照してください。より多くのプレイブックを同時に実行するには、
RTE を増やします。 [複数の RTE](rte/several.html) を参照してください。
