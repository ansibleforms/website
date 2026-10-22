---
layout: default
title: v7 へのアップグレード
parent: アップグレード
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# v7 へのアップグレード
{: .no_toc }

6.5 のうちに変更しておくこと、そしてバージョン 7 に移行すると変わること
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

バージョン 7 では、6.x で非推奨になったものがすべて削除されます。古いものと新しいものの両方が動く 6.5 のうちに修正してから、アップグレードしてください。

---

## アップグレードの前に（6.5 で）

### フォームは専用のファイルに置く

フォームはフォームフォルダー（ `FORMS_FOLDER_PATH` ）またはフォームリポジトリにだけ置きます。 `config.yaml` にはカテゴリ、ロール、定数を残します。

- **`forms.yaml` ファイル:** `config.yaml` に名前を変更します。6.5 では、設定ページにそのための
  **Convert forms.yaml to config.yaml** ボタンがあります。
- **ベース設定の `forms:` セクション:** バージョン 7 ではエラーになります。各フォームを専用のファイルに移してください。たとえば
  6.5 のデザイナーでフォームをファイルにドラッグします。
- **環境変数:**

  | 削除されたもの | 代わりに使うもの |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` と `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### `table` フィールド

バージョン 7 では `table` フィールドはエラーになり、そのプロパティ（ `tableFields` 、 `insertColumns` 、 `readonlyColumns` 、
`tableTitleAdd` 、 `tableTitleEdit` ）も一緒に削除されます。 `subform` を持つ `list` フィールドを使い、各列の `from` を
`__parent__` に対する式に置き換えてください（ [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform) を参照）。

### 名前が変わったプロパティ

削除された各プロパティには、そのまま置き換えられるものがあります。

| 削除されたもの | 代わりに使うもの |
|---|---|
| `disableRelaunch: true` （フォーム） | `allowRelaunch: false` |
| `noOutput: true` （フィールド） | `output: false` |
| `enableLogin` （ロールのオプション） | `allowLogin` |

### データソースとデータスキーマ

データソースのインポートとその管理ページは削除されました。それらのためだけのモジュールを持っていた
AnsibleForms Galaxy コレクションも削除されています。

- スケジュールされたインポートは停止し、データソースのテーブルは削除されます。必要なものは先に控えておいてください。
- インポートが埋めていたデータスキーマはそれ自体が独立したデータベースなので残ります。認証情報を使って
  それを照会するフォームは引き続き動作します。
- データを最新に保つには、たとえばスケジュールから、インポートを独自のプレイブックとして
  実行してください。

### API v1

`/api/v1/*` は削除されました。 `/api/v2/*` を使ってください（対話型のドキュメントは `/api/v2/docs` ）。スクリプトでよく使われる
呼び出しは次のとおりです。

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

v2 は HTTP ステータスコード（ `400` 、 `403` 、 `404` 、 `422` ）とプレーンな JSON 本文で応答し、v1 の
`{ status, message, data }` という包みは使いません。

**シングルサインオンのコールバックも同様です。** `/api/v1/` を含むリダイレクト URL は応答しなくなり、サインインはサインインしないまま
ログインページに戻ります。2 か所で `/api/v2/` に変更してください。AnsibleForms の SSO プロバイダーと、ID プロバイダー側
（Entra ID のアプリ登録のリダイレクト URI、OIDC クライアントの有効なリダイレクト URI）です。

- Entra ID: `https://<your host>/api/v2/auth/azureadoauth2/callback` 、7.3.0 以降は `/api/v2/auth/entraid/callback`
- OIDC: `https://<your host>/api/v2/auth/oidc/callback`

---

## 7 で変わること

バージョン 7 ではプレイブックの実行方法が変わり、いくつかの既定値が厳しくなります。6.5 から移行するときは、以下の各項目を確認してください。

### プレイブックは RTE で実行される

バージョン 7 では、AnsibleForms のコンテナーで `ansible-playbook` を実行しなくなりました。プレイブックはランタイム環境（RTE）、
つまり専用のコンテナーで実行され、アプリのイメージには ansible も python も含まれなくなりました。
`ghcr.io/ansibleforms/ansibleforms-rte-full:7` イメージから、アプリの隣で RTE を起動します。7.3.0 以降、アプリは RTE に接続して 1 本の WebSocket を開いたままにします（
[モード](rte/modes.html) を参照）。RTE はデータベースの設定も `ENCRYPTION_SECRET` も受け取りません。RTE の設定は次のとおりです。

| 設定 | 値 |
|---|---|
| `AF_ROLE` | `rte` 。RTE イメージではすでに設定されています。 |
| `RTE_MODE` | `inbound` 。アプリが RTE に接続します。別のネットワークにあるランナーは `outbound` を使います（ [モード](rte/modes.html) を参照）。 |
| `RTE_TOKEN` | 16 文字以上のトークン。アプリはこれで RTE のソケットにサインインし、RTE はこれがないと起動しません。 |
| `RTE_FILES` | アプリの隣に置く場合のように、RTE がアプリと同じ永続フォルダーをマウントするときは `local` 。 |

次に、ansible 関連のマウントをアプリのコンテナーから RTE に移します。

- `ansible.cfg` は `/etc/ansible/ansible.cfg` に、ロールは `/etc/ansible/roles` に、コレクションは
  `/etc/ansible/collections` にマウントします。
- プレイブックとリポジトリを見つけられるよう、アプリと同じ永続フォルダーを RTE にもマウントします。

その後、Docker Compose プロジェクトと同じように [設定シード](seed/) で、または **接続 → ランナー** で、RTE をランナーとして宣言します。
RTE のアドレス（たとえば `http://rte:8000` ）と同じトークンを持つ RTE の認証情報と、それを指定する種類 RTE、モード inbound の
ランナーです。

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

シードは `RTE_TOKEN` をアプリの環境から読み取ります。 [ランナー](runners.html) と [ランタイム環境](rte/) を参照してください。

{: .warning }
> **アプリと RTE は同じコントラクト** アプリはジョブの認証情報を解決し、その RTE 用に封をして RTE に渡します
> （RTE コントラクト 2、7.0.0 で新設）。別のコントラクトの RTE はアプリのジョブを拒否します。アプリと同じリリースの
> RTE イメージを実行し、両方を一緒にアップグレードしてください。以降の 7 系のリリースは、コントラクトが同じである限り
> 古い 7 系の RTE とも引き続き動作します（ [スケーリング](../rte/images.html#build-your-own-rte) を参照）。


### RTE イメージの内容

RTE は 3 つのレイヤーで提供され、それぞれ前のレイヤーの上にビルドされています。プレイブックに合ったものを選んでください。

| イメージ | 内容 |
|---|---|
| `ansibleforms-rte-full` | 既定。Ansible 14 と ansible-core 2.21、そして 6.5 のイメージにあったコレクションと python ライブラリ。 |
| `ansibleforms-rte-core` | Python 3.14、ansible-core、いくつかの一般的なライブラリ。コレクションは含みません。これをベースにしたイメージで独自に追加します。 |
| `ansibleforms-rte-base` | サーバーのみ。python も ansible も含まず、独自のバージョンで RTE をビルドするためのものです。 |

6.5（ansible 12 と ansible-core 2.19）からの移行では、プレイブックに関して次の点も変わります。

- **ansible-core 2.21:** 2.20 と 2.21 の [移植ガイド](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  を読んでください。
- **Python 3.14:** RTE のレイヤーは python 3.14 で動作します。
- **`boto` の廃止:** 古い `boto` 2 ライブラリはなくなりました。 `amazon.aws` コレクションは同梱の `boto3` を使います。

2 つの環境変数は RTE の担当になり、アプリでは読み取られなくなったので、RTE のコンテナーに設定してください。

| 変数 | 変更点 |
|---|---|
| `ANSIBLE_PATH` | RTE 上のプレイブックのフォルダー。 |
| `PROCESS_MAX_BUFFER` | 既定が 50 MB になりました。これを超えるとジョブの出力は保存されなくなります（ジョブにその旨が表示されます）が、プレイブックは停止せずに続行します。 |


### コンテナーは uid 1000 で動作する

アプリと RTE のイメージは root ではなくユーザー `node` （uid 1000）として動作し、ホームフォルダーは `/home/node` です。

- **ボリュームの所有者を一度だけ uid 1000 にします。** 永続ボリュームと ssh ボリュームには
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v` を、ホストのフォルダーには `sudo chown -R 1000:1000 <folder>` を実行します。
  Kubernetes では `fsGroup: 1000` を設定します。
- **ssh フォルダーは `/root/.ssh` ではなく `/home/node/.ssh` にマウントします。**
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) を `/root` に設定している場合は、削除するか `/home/node` に設定してください。
- RTE レイヤーをベースにした **独自の RTE イメージ** では、インストールの間だけ `USER root` に切り替え、最後に `USER node` に戻します。


### 起動時の検証が有効

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) の既定が `enforce` になりました（6.5 では `off` ）。ブラウザーからでも
`POST /api/v2/job` からでも、すべての起動がフォームのルールに照らしてチェックされ、ジョブはチェック済みの値からサーバーが組み立てた extravars と
認証情報で実行されます。

- **REST の呼び出し元は `rawFormData` を送る必要があります。** これはブラウザーが送るのと同じ、フィールドの生の値です。
  `extravars` だけの起動は、値をチェックできないため拒否されます。
- **何が拒否されるかを先に確認するには** 、 `LAUNCH_VALIDATION=log` を設定し、ログの警告を読みます。 `off` にすると
  6.5 の動作に戻ります。

詳しくは [起動時の検証](launch-validation/) を参照してください。


### プレイブックからアプリの設定が見えなくなった

プレイブックは、AnsibleForms 自身が読み取る環境変数を継承しなくなりました。 `ENCRYPTION_SECRET` 、 `DB_*` の設定、
`ACCESS_TOKEN_SECRET` 、 `RTE_TOKEN` 、 `VAULT_*` の設定、その他ドキュメントに記載されているすべての変数、そしてすべての `MYSQL_*` 変数です。
`PATH` 、プロキシ、 `ANSIBLE_*` の設定、クラウドの認証情報など、RTE のそれ以外の環境はこれまでどおり渡されます。

`lookup('env', ...)` でこれらのいずれかを読んでいたプレイブックは、別の方法で値を受け取る必要があります。extravar や
認証情報として渡すか、別の名前で RTE に設定してください。

### ランナーと管理者を管理できるのは admin ロールだけ

設定へのアクセス権を持つユーザーでも、誰が管理者になるか、認証情報がどこへ渡るかを完全には制御できなくなりました。

- **ランナー:** ランナーは実行するジョブの認証情報を受け取るため、ランナーの追加、変更、削除は admin ロールだけが行えます。
  設定へのアクセス権を持つユーザーは、引き続きランナーを表示してテストできます。
- **管理者のアカウントとグループ:** 管理者権限を与えられるのは admin ロールだけです。admin ロールがないユーザーは、admin ロールが指定する
  グループにアカウントを入れることも、管理者アカウントやそのようなグループを変更、リセット、削除することもできません。
- **ロール:** admin ロールのないデザイナーはロールを変更できません。ロールが異なる保存や復元は拒否されます。

ランナー、管理者、ロールを管理する人には admin ロールを与えてください。

### 既定のパスワードは変更が必須

公開されている既定のパスワード `AnsibleForms!123` でサインインしたユーザーは、まずパスワードを変更する必要があります。変更するまで、ほかのすべての API
呼び出しはコード `password_change_required` 付きの `403` を返し、ブラウザーにはパスワード変更ページが表示されます。

一度サインインして新しいパスワードを設定するか、初回起動の前に [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) を
設定してください。既定のパスワードでログインするスクリプトは、別のパスワードを使う必要があります。

### トークンはログアウトとパスワード変更で失効する

ログアウトするとそのセッションのトークンが失効し、パスワードを変更するとそのユーザーのすべてのセッションが終了します。パスワードを変更した後は
もう一度サインインしてください。

`?expiryDays=` で要求した API トークンの有効期間は、最大で [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) 日
（既定は 90 日）です。長期間有効な API トークンを使うスクリプトは、期限が切れる前に新しいトークンを要求する必要があります。

### Entra ID にはテナントが必要

Entra ID（Azure AD）のサインインは、自分のテナントに対する OpenID Connect だけを使うようになり、別のテナントのユーザーはサインイン
できません。テナント ID がない、または `common` 、 `organizations` 、 `consumers` を指定したプロバイダーは拒否されます。

- SSO プロバイダーに **テナント ID を設定します。** ディレクトリ（テナント）ID の GUID、またはテナントのドメインです。
- **Graph のアクセス許可を付与します。** ログインは `openid profile email User.Read GroupMember.Read.All` を要求します。アプリ
  登録に Microsoft Graph の委任されたアクセス許可 `User.Read` と `GroupMember.Read.All` を、管理者の同意付きで与えてください。
- **ロールではグループ ID を使うことをお勧めします。** グループは表示名ではなく `azuread/<object id>` （7.3.0 以降は `entraid/<object id>` ）で指定します。

設定方法は [Entra ID](authentication/entra-id.html) を参照してください。

### パスワードには最小の長さがある

アプリケーションで設定するローカルのパスワードは、少なくとも
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) 文字（既定は 8）が必要で、ユーザー名や
既定のパスワードと同じにはできません。 `PASSWORD_MIN_LENGTH=0` で長さのチェックを無効にできます。既存のパスワードは引き続き使えます。

### 再起動ポリシーを付けてコンテナーを実行する

捕捉されない例外が発生すると、プロセスを不明な状態のまま動かし続けるのではなく、レベル `crit` でログに記録してプロセスを終了するようになりました。
Docker の `--restart unless-stopped` のような再起動ポリシーを付けてコンテナーを実行してください（docker-compose プロジェクトでは設定済みです）。
Kubernetes は Pod を自動的に再起動します。

### AWX の接続とホームリンク

7 ではさらに 2 つのものがなくなりましたが、6.5 で行うことはありません。

- **AWX と AAP の接続:** `awx` テーブル、 `/api/v2/awx` 、A.A.P. ページはなくなりました。アップグレードでは、すべての AWX または
  AAP の接続が種類 `awx` のランナーとして **接続 → ランナー** に移され、 `awx:` を持つフォームは引き続き動作します。
- **`NAV_HOME_LABEL` と `NAV_HOME_ICON`:** 読み取られなくなりました。ヘッダーの最初のリンクは常に「フォーム」です。

### 7 で非推奨、8 で削除

これらは 7 ではまだ動作しますが、使うたびに警告がログに記録されます。バージョン 8 より前に代替のものへ移行してください。

| 非推奨 | 代わりに使うもの |
|---|---|
| `VAULT_*` 環境変数 | `vault` という名前のシークレットストア（ **接続 → シークレットストア** ）。7 の初回起動時に、変数をそのストアとして一度だけインポートし、以降は無視します。 |
| `LOG_SYSLOG_*` 環境変数 | Syslog サーバー（ **接続 → Syslog** ）。 `LOG_SYSLOG_HOST` が設定されている場合、7 の初回起動時にサーバー `syslog` として一度だけインポートし、これまでどおりサーバーログを送り、以降は無視します。監査エントリも送るには、両方を受け取るように設定します。 |
| 認証情報の `vault_path` （API、設定シード） | `secret_store` と `secret_ref` 。 [シークレットストア](secret-stores/) を参照してください。 |
| `config.yaml` のロール `public` | ロール `default` 。設定の読み込み時にファイル内で名前が変更されます。ytt テンプレートは手動で変更してください。フォームの `roles:` にある `public` は引き続き一致します。 |
| `POST /api/v2/config/vault/check` 、 `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check` 、 `GET /api/v2/secretstore/{id}/mounts` |
| フォームまたはステップの `hasApproval` | `approval` 。 `hasApproval` には効果がありません。 |
| フォームの `awx: <name>` | `runner: <name>` 。AWX の接続は種類 `awx` のランナーです。 |
| フォームの `type: multistep` とその `steps` | `runner` を指定するノードを持つ `type: workflow` 。 [ワークフローフォーム](forms/workflow.html) を参照してください。 |
| 設定シードの `awx:` セクション | `type: awx` を持つ `runners:` の項目 |
| `LOCK_PATH` | なし。読み取られなくなり、デザイナーのロックはデータベースに保存されます。 |
| 7.3.0 以降、データベースモードの RTE: `RTE_MODE=database` または `RTE_MODE` なしで、RTE にデータベースの `DB_*` と `ENCRYPTION_SECRET` がある | `DB_*` なしの `RTE_MODE=outbound` または `RTE_MODE=inbound` 。RTE は参加トークン（ `RTE_JOIN_TOKEN` ）で一度だけ参加するか、 **接続 → ランナー** または設定シード（ `rte_mode` ）でそのランナーをそのモードに設定します。 [モード](rte/modes.html) を参照してください。 |
| 7.3.0 以降の `RTE_REGISTER` （データベースモードのみ） | 参加トークン（ `RTE_JOIN_TOKEN` ）。RTE は、RTE の認証情報でサインインするランナーとして自分自身を追加します。 |
| 7.3.0 以降、設定シードのランナーにある `api` または `userpass` の認証情報 | ランナーの種類に合った認証情報（ `credential_type: rte` 、 `awx` 、 `aap` 、 `ascender` 、 `semaphore` 、 `rundeck` 、 `jenkins` ）。サーバーは `url` に指定します。 |
| 7.3.0 以降、独自の `token` 、または `username` と `password` を持つ設定シードのランナー | `credentials` セクションにある、ランナーの種類に合った認証情報。サーバーは `url` に指定し、ランナーは `credential:` でそれを指定します。それまでの間、シードはランナー名を付けた認証情報を 1 つ作成します。 |

`ENABLE_SSO` と `SSO_AUTO_LOGIN` は 7.3.0 以降読み取られなくなりました。7.3 の初回起動時に一度だけ引き継がれます。 `ENABLE_SSO=0` は
すべての SSO プロバイダーを無効にし、 `SSO_AUTO_LOGIN=1` は唯一有効なプロバイダーの **ログインページをスキップ** にチェックを入れます。その後は無視されます。設定されている間は
起動のたびに警告がログに記録され、各プロバイダーの **有効** と **ログインページをスキップ** は **アクセス → SSO** にあります。

---

## イメージタグ

7.0.0 で `latest` は 7 に移ります。6 に留まるには、 `latest` ではなくタグ `6` （または `6.5` ）を使います。
すべてのタグは [イメージタグ](installation/#image-tags) に記載されています。

---

## ロールバック

アップグレードの前にバックアップを取ってください（ **設定 → バックアップ** ）。6.5 は 7 にアップグレードされたデータベースでも動作しますが、
削除されたデータソースの定義を復元できるのはバックアップだけです。
