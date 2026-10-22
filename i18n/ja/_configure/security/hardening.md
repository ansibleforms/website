---
layout: default
title: 強化
parent: セキュリティ
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# 強化
{: .no_toc }

管理者アカウント、サインインの制限、データベース、式、ジョブのデータ、ブラウザーのポリシー、任意の機能、ロールオプション
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 管理者アカウント

ローカルの管理者アカウントは、初回起動時に [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
と [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) から作成されます。後者の既定値は `AnsibleForms!123` です。

* 公開されている既定のパスワード `AnsibleForms!123` でサインインした場合は、まずそれを変更する必要があります。変更するまで、サーバーは
  パスワードの変更以外のすべてのリクエストに `403` （コード `password_change_required` ）を返し、ブラウザーには閉じられない
  パスワード変更ページが表示されます。新しいパスワードを再び既定値にすることはできません。
* `ADMIN_PASSWORD` が読み込まれるのは、アカウントが最初に作成されるときだけです。初回起動の前に独自の値を設定してください。
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` は、起動のたびにパスワードを `ADMIN_PASSWORD` にリセットします。
  紛失したパスワードの回復にだけ使い、その後は設定を外して再起動してください。
* 最初に二つのマスターシークレットを設定してください。 [シークレットと暗号化](secrets.html) を参照してください。
* LDAP または SSO でのサインインが機能したら、ローカル管理者は緊急時専用とし、長いパスワードを保管庫に保存してください。

---

## サインインの制限とパスワード

パスワードの推測は、三つの制限で遅らせられます。失敗はデータベースで数えられるので、すべてのアプリノードが同じ試行を把握し、
どの制限も再起動なしで反映されます。

| 変数 | 既定値 | 動作 |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | ログインにこの回数失敗すると、ローカルまたは LDAP のアカウントは `LOGIN_LOCKOUT_MINUTES` の間ロックされます。 |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | `LOGIN_LOCKOUT_MINUTES` の間にこの回数ログインに失敗したアドレスは、その期間が終わるまで止められます。一つのアドレスが多くのアカウントを試す場合です。 |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | アカウントがロックされる時間と、失敗を数える期間。 |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | ログイン、サインアウト、トークンの更新、シングルサインオンのコールバックについて、アプリノードごとに一つのアドレスから受け付ける 1 分あたりのリクエスト数。 |

ロックされたアカウントや止められたアドレスには、パスワードを確認する前に、アカウントが存在するかどうかにかかわらず、 `Retry-After` ヘッダー付きの `429` が返されます。
`AUTH_RATE_LIMIT` を超えた場合も `429` が返されます。ログインに成功するとアカウントのカウントは消去され、管理者がユーザーのパスワードを
設定した場合も同様です。 `0` で制限をオフにします。 `LOGIN_LOCKOUT_MINUTES=0` では、ロックアウトとアドレスごとの制限の両方がオフになります。

`LOGIN_MAX_FAILURES_PER_IP` と `AUTH_RATE_LIMIT` はクライアントのアドレスごとに数えます。リバースプロキシの背後では、アドレスがプロキシのものではなく
クライアントのものになるよう `TRUST_PROXY` を設定してください。 [クライアントのアドレス](../production/reverse-proxy.html#client-addresses) を参照してください。

新しいユーザー向けに、管理者が、またはユーザー自身が変更するなど、アプリケーションを通じて設定するローカルのパスワードは、
少なくとも [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) 文字（既定は `8` 、
`0` で長さを確認しません）である必要があります。ユーザー名や公開されている既定のパスワードは使えません。 `ADMIN_PASSWORD` は確認されません。

---

## データベース

AnsibleForms はすべての認証情報とジョブを MySQL データベースに保持するので、そのデータベースはネットワークから切り離してください。

* docker-compose プロジェクトは MySQL をホストに公開し（ `MYSQLDB_LOCAL_PORT` 、 `3306` ）、root パスワード `AnsibleForms!123` が
  設定された状態で提供されます。そのポートマッピングを削除するか `127.0.0.1` にバインドし、パスワードを変更してください。
* `root` ではなく専用のアカウントで接続し、 [`DB_USER`](../customization/server.html#env_DB_USER) と
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD) に設定してください。必要なのは `AnsibleForms` スキーマに対する権限だけです。

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  これで、スキーマの作成（ `CREATE DATABASE` を含む）、アップグレード時のパッチ、そして同じユーザーで実行される
  [バックアップ](../production/backups.html) とリストアがまかなえます。ダンプは `--no-tablespaces` で取られるので、
  `PROCESS` のようなサーバー全体の権限は不要です。可能であれば `%` をアプリケーションのアドレスに置き換えてください。 `root` のように
  すべてのデータベースに対する権限を持つユーザーを使うと、アプリケーションの穴がデータベースサーバー全体の穴になります。
  **ステータス** ページはその **データベースユーザー** チェックで、ログは起動のたびに、これについて警告します。
* スキーマができたら、 [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) を `0` に設定してください。
  スキーマの作成では最初にすべてのテーブルが削除されます。 `0` にすると、起動時のブートストラップも `/api/v2/schema`
  エンドポイントもそれを実行できません。

---

## 式と外部への呼び出し

サーバー式はサインインしたどのユーザーに対してもサーバー上で実行されるので、サニタイザーと外部への呼び出しのフィルターが重要です。

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) ： `strict` または `paranoid` 。ユーザーがサーバーのコードを実行できてしまう `legacy` は決して使わないでください。
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) ：REST 式が到達してはならないホスト。例： `169.254.169.254,127.0.0.0/8` 。
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) ：設定すると、REST 式が到達できるのは
  これらのホストと範囲だけになります。拒否リストのほうが優先されます。

どちらのリストも AnsibleForms 自身の REST ヘルパー関数だけを対象とします。プレイブックはその外で実行され、フィルターされません。

7.3.0 からは、REST ヘルパー関数は、ほかのすべての接続と同じくエンドポイントの証明書を検証します。
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` で検証をオフにします。自己署名証明書を持つ
エンドポイントにだけ使ってください。

---

## ジョブのデータ

ジョブの extravars と出力はデータベースに保存され、そのジョブを見られる全員に表示されます。

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) ：キーが一致する extravars は
  `********` と表示されます。既定は `password|secret|token` で、パスワードフィールドは常にマスクされます。フォームで使っている名前で
  拡張してください。たとえば `password|secret|token|apikey|passphrase` です。
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) ：すべてのジョブとともに送られる `ansibleforms_user`
  オブジェクトを絞り込みます。これがないと、ユーザーのグループのメンバーシップがすべて含まれます。
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) はうるさいタスクを隠すだけです。シークレットは `no_log` で隠してください。

---

## Content-Security-Policy

インターフェースは Content-Security-Policy ヘッダー付きで提供され、ブラウザーでページが読み込んで実行できるものを制限します。

* スクリプトはアプリケーション自身からのものだけなので、ページに注入されたスクリプトは実行されません。
* ほかのサイトがインターフェースをフレームで表示することはできません。
* アプリケーションに必要なものは許可されます。ブラウザーで評価されるフォームのローカル式（ `'unsafe-eval'` ）、インライン
  スタイル、任意の URL の画像（フォームとカテゴリの画像）、コードエディターのワーカーです。

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) の既定は `1` で、そのままにしておくべきです。
`0` にすると、ポリシーは `Content-Security-Policy-Report-Only` として送られます。ブラウザーのコンソールにはブロックされるはずのものが表示され、
何もブロックされません。独自のスクリプトを注入するリバースプロキシなど、まだポリシーとともに動作できない構成にだけ `0` を使ってください。
設定ページでの変更は再起動なしで反映されます。

---

## 設定ページとデザイナー

管理者は、ブラウザーから設定の多くを変更できます。設定がほかの場所で管理されている場合は、これを絞り込んでください。

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` ： [管理された環境](../seed/environment-and-audit.html) 向けに、設定を読み取り専用にします。
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` ：フォームを git で管理している場合に、組み込みのデザイナーを
  取り除きます。

---

## 任意の機能

これらの機能は既定でオフです。使う場合にだけオンにしてください。設定ページでの変更は再起動なしで反映されます。

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) ： `/api/v2/mcp` で [MCP サーバー](../mcp/) を提供し、
  MCP クライアントがユーザーのトークンでフォームを起動できるようにします。
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) ： [チャットアシスタント](../chat/) 。フォームの定義と
  入力中の値が、設定したモデルプロバイダーに送られます。

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) は逆に、既定で `enforce` です。そのため、REST API を通じた起動も含め、
値がフォームのルールに反する起動をサーバーは拒否します。
そのままにしてください。 `log` は拒否されるはずのものをログに記録するだけで、 `off` は何も確認しません。 [起動時の検証](../launch-validation/) を参照してください。

---

## ロールオプション

[config.yaml](../config/roles.html) のロールオプションには、名前から想像される以上の権限を与えるものがあります。慎重に付与してください。

| オプション | 重要な理由 |
|--------|----------------|
| `allowScheduledJobs` | これを持つユーザーはすべてのスケジュールを表示、変更でき、スケジュールはどのフォームでも管理者権限で実行されます。管理者レベルとして扱ってください。 |
| `allowBackupOps` | データベース全体を置き換える **リストア** を含みます。 |
| `showSettings` | 管理ページを開きます。admin ロールがない場合、admin ロールが指定するアカウントとグループは変更できません。 [ユーザーとグループ](../users-and-groups.html#accounts-that-grant-admin) を参照してください。 |
| `showLogs` | ホスト名、ユーザー名、エラーの詳細を含むことがあるサーバーログを表示します。 |
| `showConnectionsSettings` | 接続のページ（認証情報、ランナー、通知チャネルなど）を開きます。ランナーとシークレットストアの追加、変更、削除は管理者のものであり、接続とサインインの認証情報も同様です。リポジトリについては、追加、削除、アドレス、ブランチ、 `use_for_*` フラグの変更は管理者のものです。 |
| `showAllJobLogs` | ユーザー自身のジョブだけでなく、すべてのユーザーのジョブを表示します。 |
| `manageAllJobs` | すべてのユーザーのジョブを中止、削除、再実行します。 |
| `allowApiTokens` | 最大 [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) （既定は 90）有効な API トークンを作成できるようにします。トークンでサインアウトするか失効させると終了し、パスワードを変更するとそのユーザーのすべてのトークンが終了します。 [トークン](secrets.html#tokens) を参照してください。 |
| `extendedTokenExpiration` | `allowApiTokens` とともに、期限切れにならない API トークンも作成できるようにします。 |
| `allowFileUploads` | フォームのファイルフィールドからファイルをアップロードできるようにします。ロールでオフにしない限り、すべてのユーザーでオンです。 |
| `allowChat` 、 `allowMcp` | オンになっている場合に、チャットアシスタントと MCP サーバーを使えるようにします。 `allowChat` はロールでオフにしない限りすべてのユーザーでオンで、 `allowMcp` はロールで設定しない限り `allowChat` に従います。 |

`admin` ロールのないユーザーは、ロールで与えられない限り、上記の管理者レベルのオプションを何も得ません。 `admin` ロールが
オプションを設定していない場合、そのユーザーには `showSettings` 、 `showDesigner` 、 `showLogs` 、 `showAuditLog` 、 `allowBackupOps` 、
`allowJobRelaunch` 、 `showAllJobLogs` 、 `manageAllJobs` 、 `allowScheduledJobs` が付与されます。 `allowApiTokens` と
`extendedTokenExpiration` は `admin` ロールでもオフのままです。必要なロールで設定してください。

ユーザーの複数のロールが同じオプションを設定している場合は、 `false` が優先されます。 `default` ロールのオプションは、ユーザー自身の
ロールがどれも設定していないオプションを補うだけで、それらを覆すことはありません。
