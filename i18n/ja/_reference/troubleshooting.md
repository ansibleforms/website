---
layout: default
title: トラブルシューティング
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# トラブルシューティング
{: .no_toc }

エラーメッセージと症状、その原因と解決方法
{: .fs-6 .fw-300 }

---

以下の各問題は、表示されるメッセージまたは症状を見出しにし、その原因と解決方法を続けています。メッセージは
AnsibleForms が出力するとおりに引用しています。 `<name>` はケースごとに異なる値を表します。ほとんどのメッセージはサーバー
ログに出力され、 [サーバーログ](gui/administration.html#server-log) または `docker logs` で確認できます。

**データベースと起動**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**設定とフォーム**

* [Could not load the forms](#could-not-load-the-forms)
* [ベース設定に forms セクションがある](#the-base-config-has-a-forms-section)
* [フォームがダッシュボードに表示されない](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**ログイン**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Azure AD または OIDC の認証に失敗する](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [再起動後または 1 日後にログアウトされる](#logged-out-after-a-restart-or-after-a-day)
* [シングルサインオン後にフォームとジョブが空になる（HTTP 431）](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**ジョブ**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [ジョブのステータスが abandoned になる](#a-job-shows-the-status-abandoned)
* [RTE が接続しない](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Git リポジトリとバックアップ**

* [リポジトリのクローンまたは pull に失敗する](#a-repository-clone-or-pull-failed)
* [フォームリポジトリがまだクローンされていない](#the-forms-repository-is-not-cloned-yet)
* [バックアップに失敗する](#a-backup-failed)

関連する 2 つの問題については、 [FAQ](faq.html) で詳しく説明しています。
[管理者パスワードを紛失した場合](faq.html#recovering-a-lost-admin-password) と
[REST ヘルパーの接続先の制限](faq.html#restricting-rest-helper-destinations-allowdeny-lists) です。

---

## Mysql not ready yet

AnsibleForms が起動せず、ログに次の行が 5 秒ごとに繰り返し出力されます。

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**原因**

起動時、AnsibleForms はデータベースがクエリに応答するまで待ち、応答しない限り待ち続けます。
`<reason>` はデータベースドライバー自身のメッセージです。接続の拒否やタイムアウトはホストやポートを、
アクセス拒否のメッセージはユーザー名やパスワードを示しています。

**解決方法**

[`DB_HOST`](customization/server.html#env_DB_HOST) 、 [`DB_PORT`](customization/server.html#env_DB_PORT) 、
[`DB_USER`](customization/server.html#env_DB_USER) 、 [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD) を確認します。
コンテナーの中では、 `localhost` は MySQL を動かしているホストではなく、コンテナー自身です。MySQL がネットワークアドレスで
待ち受けていること、そしてユーザーが AnsibleForms のホストから接続できることを確認してください。データベースが応答すると、
AnsibleForms は自動的に処理を続けます。再起動は必要ありません。

---

## Schema is not ready, skipping group and user initialization

ブラウザーでログインページではなくデータベースのページが開き、ログに次のように表示されます。

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**原因**

`AnsibleForms` スキーマがないか、不完全です。 *空の* データベースは、
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) が `0` でない限り、起動時に自動的に準備されます。たとえば
データベースユーザーにスキーマを作成する権限がないなどの理由でこれに失敗すると、ログに `Failed to create the schema automatically : <reason>` と出力されます。
存在するもののテーブルが欠けているスキーマ（ `Table '<name>' is not present` ）が自動的に作り直されることはありません。スキーマを
作成するとまずすべてのテーブルが削除されるためです。その場合、データベースのページには *It appears that you have an unuseable schema* と表示されます。

**解決方法**

新規インストールでは、データベースユーザーに `AnsibleForms` スキーマを作成する権限を与えて再起動するか、データベースのページで
**作成** を押します。スキーマが一部だけ存在する場合は、バックアップを復元するか、不完全な `AnsibleForms`
スキーマを削除して AnsibleForms が作り直せるようにします。失敗したテーブルとパッチはログに一覧表示されます。

---

## Schema creation is disabled

データベースのページから、または `POST /api/v2/schema` でスキーマを作成しようとすると、次のエラーで失敗します。

```
Schema creation is disabled
```

**原因**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) が `0` で、起動時の自動作成とエンドポイントの両方が
無効になっています。すでにユーザーがいるデータベースでは、管理者としてログインしていない呼び出し元もエンドポイントが
`Schema creation requires an authenticated administrator` で拒否します。

**解決方法**

一度だけ `ALLOW_SCHEMA_CREATION=1` （これが既定です）でスキーマを作成するか、バックアップから復元し、その後
変数を `0` に戻します。準備済みのデータベースでは、スキーマを作り直す前に管理者としてログインしてください。また、
すべてのテーブルが削除されて作り直されることに注意してください。

---

## Config seed failed, refusing to start

コンテナーが起動直後に終了し、その出力の最後が次のようになります。

```
Config seed failed, refusing to start : <reason>
```

**原因**

[`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) のファイルを適用できませんでした。たとえば有効な
YAML でない、シードのスキーマに違反している、などです。何が問題だったかは `<reason>` に示されます。AnsibleForms は、宣言されたオブジェクトの半分だけで
動くよりも、起動を拒否します。理由は標準エラーにも出力されるため、 `docker logs` や `kubectl logs` で確認できます。

**解決方法**

`<reason>` が示すものを修正して、もう一度起動します。シードの適用方法は [再読み込みと起動](seed/reloading.html) を、
有効なファイルについては [例](seed/example.html) を参照してください。

---

## ENCRYPTION_SECRET is not set

起動のたびに次の警告がログに出力されます。

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

または、ワーカーが次のメッセージで起動を拒否します。

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**原因**

保存されたシークレットは [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET) で暗号化されます。7.3.0 以降、シークレットは
認証情報（LDAP ディレクトリ、SSO プロバイダー、ランナー、シークレットストアなどのパスワードやトークン）に、Slack と
Teams の Webhook のアドレスと並んで保存されています。これが設定されていないと、ソースコードで公開されている鍵が使われます。7.3.0 以降、新しい
`ENCRYPTION_SECRET` で起動すると、保存されているすべてのシークレットが 1 つのトランザクションでその鍵で再暗号化されます。初めて設定したときは既定の鍵から、
変更したときは [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) から再暗号化します。
保存されたシークレットがどちらの鍵でも暗号化されていなかった場合は、何も変更されず、AnsibleForms は起動しません。

**解決方法**

`ENCRYPTION_SECRET` を設定し、ほかのシークレットと一緒に保管してください。バックアップには決して含まれません。次の起動では
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET` がログに出力されます。後で変更するには、1 回の起動の間だけ
`ENCRYPTION_SECRET` に新しい値を、 `ENCRYPTION_SECRET_PREVIOUS` に古い値を設定し、その後 `ENCRYPTION_SECRET_PREVIOUS` を削除します。
ワーカーが起動を拒否する場合は、 `ENCRYPTION_SECRET_PREVIOUS` にシークレットを暗号化した鍵を設定するか、古い値に戻してください。

---

## Could not load the forms

ダッシュボードにフォームが表示されず、次のように報告されます。

```
Could not load the forms.

Failed to get forms list

<reason>
```

**原因**

ベース設定（ `config.yaml` ）を読み取れないか、有効ではありません。どちらかは `<reason>` でわかります。

| 理由 | 原因 |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | YAML の構文エラー |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | 空のファイル、またはコメントだけのファイル |
| `Duplicate role name(s) : <names>. Each role must appear once.` | 同じロールが 2 回定義されている |
| `There is no config.yaml nor could one be created from template.` | `config.yaml` がなく、そのフォルダーに書き込めない |
| `There is no forms directory nor could there be one created from template.` | フォームフォルダーがなく、作成もできない |
| その他の行 | 設定がスキーマに違反している。たとえば `groups` のないロール |

**解決方法**

[`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) が指すファイル、または設定に使っているリポジトリの
`config.yaml` を修正します。ファイルがない場合は、 [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) と
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) が書き込み可能な永続的な場所を指すようにします。構造については
[config.yaml](config/) を参照してください。

---

## ベース設定に forms セクションがある

6.x からアップグレードした後、ダッシュボードが空になり、警告パネルに次のように表示されます。

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**原因**

7.0.0 以降、フォームはそれぞれフォームフォルダー内の専用のファイルに置かれます。まだ `config.yaml` に記載されているフォームは
無視されます。

**解決方法**

各フォームを [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) 内の専用のファイルに移します。
[7.x へのアップグレード](upgrade-7.html) を参照してください。

---

## フォームがダッシュボードに表示されない

フォームのファイルは存在するのに、ユーザーのダッシュボードにそのフォームが表示されません。

**原因**

ユーザーにフォームが表示されるのは、フォームの `roles` のいずれかがユーザーのロールのいずれかと一致する場合だけです。管理者にはすべてのフォームが表示されます。すべてのユーザーは
`default` ロールを持つため、 `roles: [default]` のフォームは全員に表示されます。ユーザーのロールは、 `config.yaml` の `roles` に
記載されたグループとユーザーから決まります。 `categories` のないフォームは **Default** に表示されるため、ほかのカテゴリには
表示されませんが、 **すべてのフォーム** には表示されます。最後に、検証に失敗したフォームはスキップされます。その場合
ダッシュボードには **この設定の警告またはエラー** ボタンが表示され、次のようなメッセージが開きます。

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**解決方法**

警告パネルを開き、そこに列挙されたものを修正します。プロフィールの [権限](profile/permissions.html) でユーザーのロールを確認し、
フォームの `roles` と `categories` も確認します。 [ロール](config/roles.html) と [カテゴリ](config/categories.html) を参照してください。2 つのファイルで同じフォーム名を定義している場合は、
最初に読み込まれたものが優先されます。

---

## Could not save the forms

デザイナーでの保存が、次のエラーで失敗します。

```
Could not save the forms.

Failed to save forms

<messages>
```

**原因**

デザイナーは、何かを書き込む前にすべてのフォームをスキーマに照らして検証します。 `<messages>` の各行は、ルールに違反している
フォームとフィールドを示します。7.0.0 で削除されたオプションには専用のメッセージがあります。たとえば
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform` です。

**解決方法**

メッセージが示すフィールドを修正します。7.0.0 で削除されたオプションについては、 [7.x へのアップグレード](upgrade-7.html) に従ってください。
フォームファイルを AnsibleForms に渡す前に検証するには、FAQ の
[フォームファイルの VS Code での検証](faq.html#vs-code-validation-for-form-files) を参照してください。

---

## The editor is read-only

デザイナーに別のユーザーの名前とともに **ロック中** と表示され、保存が次のエラーで失敗します。

```
The editor is read-only
```

**原因**

フォームを編集できるのは一度に 1 人だけです。ロックは誰かがデザイナーを開始したときに取得され、その人が停止するまで残ります。
停止せずにブラウザーを閉じた場合も同様です。ほかの人による保存は、API が
`Designer is locked by <username>` で拒否します。

**解決方法**

`<username>` にデザイナーを停止するよう依頼します。それができない場合は、デザイナーの **解除** を使います。ロックを持っていた人は、
保存していない変更を失います。

---

## Abuse attempt of eval function

式のフィールドにエラーが表示され、ログに次のような行があります。

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**原因**

サーバー側の式は、実行の前にチェックされます。呼び出せるのは `fn.` と `fnc.` の関数だけで、複数の文、
複数行、テンプレートリテラル、 `process.env` 、 `require` や `constructor` などの語は拒否されます。どのルールに違反したかは
メッセージに示されます。 [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) を
`off` にすると、すべてのサーバー側の式が
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal` で失敗します。

**解決方法**

式を 1 つの `fn.` 呼び出しか単純な演算に書き直すか、 `runLocal: true` でブラウザーで実行します。
[式](expressions/) と [ローカルの式](expressions/local.html) を参照してください。

---

## Destination is not in REST_ALLOWED_HOSTS

REST API を呼び出すフィールドが空のままになり、ログに次のように表示されます。

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**原因**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) が設定されており、URL のホストがそこに含まれていません。
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) に一致するホストは
`blocked by REST_DENIED_HOSTS entry "<entry>"` で、名前解決できないホストは `cannot resolve <host>` で拒否されます。

**解決方法**

ホスト名、またはそのアドレスを含む CIDR を `REST_ALLOWED_HOSTS` に追加するか、それをブロックしているエントリを
`REST_DENIED_HOSTS` から削除します。 [REST ヘルパーの接続先の制限](faq.html#restricting-rest-helper-destinations-allowdeny-lists) を参照してください。

---

## Authentication failed: Invalid credentials

ログインページが、ユーザー名とパスワードを次のメッセージで拒否します。

```
Authentication failed: Invalid credentials
```

**原因**

ユーザーが存在するかどうかを明かさないよう、ログインページはどの失敗にも同じ応答を返します。AnsibleForms は
まずローカルユーザーを、次に LDAP を試します。ディレクトリが複数ある場合、ユーザー名は **アクセス > LDAP** の順序で検索されます。
ただし、ディレクトリ（ `corp\jane` ）やそのサインインドメインのいずれか（ `jane@corp.example` ）を指定した場合は別です。本当の理由はログに出力されます。LDAP の
失敗は `Error connecting to ldap: <reason>` としてログに出力され、理由には `Wrong binding credentials` や
`Unable to verify the certificate` などがあります。Active Directory のコードは `Wrong password` 、 `User not found` 、
`Account disabled` 、 `Account locked` 、 `Password expired` に変換されます。

**解決方法**

ログで理由を確認します。失敗したすべてのログインの完全な理由を得るには、
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) を `debug` に設定すると、 `Ldap authentication failed: <reason>` がログに出力されます。
ローカルの管理者パスワードを紛失した場合は、 [管理者パスワードを紛失した場合](faq.html#recovering-a-lost-admin-password) を参照してください。

---

## LDAP check failed

**アクセス > LDAP** で LDAP ディレクトリをテストすると、次のいずれかで失敗します。

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**原因**

バインドユーザーまたはそのパスワードが間違っている、サーバーやポートに到達できない、あるいは TLS で、サーバーの証明書を
CA バンドルで検証できません。7.3.0 以降、これらは **接続 > 認証情報** にあるディレクトリの ldap 認証情報に設定されています。存在しないテストユーザーでも、
接続とバインドが成功していればテストは成功とみなされます。

**解決方法**

**接続 > 認証情報** で、ディレクトリが指定している認証情報（既定のディレクトリは `main` ）を開き、バインド
DN とそのパスワード、サーバー、ポート（通常は 389、LDAPS では 636）を修正します。TLS の問題では、LDAP サーバーの証明書に署名した
CA バンドルを貼り付けます。証明書のチェックを省略するのは本番環境向けではありません。 [LDAP](authentication/ldap.html) を参照してください。

---

## Azure AD または OIDC の認証に失敗する

シングルサインオンのログインが、次のメッセージとともにログインページに戻ります。

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**原因**

ID プロバイダーはユーザーを戻しましたが、AnsibleForms がログインを完了できませんでした。よくある理由は
`azuread login is not enabled` または `oidc login is not enabled` （プロバイダーがオフになっている）と、 `jwt expired` です。後者は、
プロバイダーからの引き渡しが 5 分間しか有効でないためです。プロバイダーからのコールバック中に発生したエラーも、
ログインページに表示され、ログに出力されます。

**解決方法**

**アクセス > SSO** でプロバイダーを有効にし、AnsibleForms が使うとおりのコールバック URL を ID プロバイダーに登録します。
Entra ID では `https://<your host>/api/v2/auth/entraid/callback` （7.3.0 以降。 `azureadoauth2` も引き続き使えます）、
OIDC では `https://<your host>/api/v2/auth/oidc/callback` です。7 より前、または 6.1.5 より前の
`/api/v1/` を含むコールバック URL は更新する必要があります。更新しないと、ログインページがサインインもエラーもなしに再読み込みされます。引き渡しの期限が
切れた場合は、ログインをやり直してください。

---

## Not authenticated, login is not enabled for this user

有効なパスワードを持つユーザーがログインできず、次のメッセージが表示されます。

```
Not authenticated, login is not enabled for this user.
```

**原因**

ユーザーのロールのいずれかで、ロールのオプション `allowLogin` が `false` に設定されています。ログには
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings` と出力されます。

**解決方法**

ロールから `allowLogin: false` を削除するか、ユーザーをそのロールから外します。 [ロール](config/roles.html) を参照してください。

---

## 再起動後または 1 日後にログアウトされる

AnsibleForms の再起動後、または 1 日使った後に、すべてのユーザーがログインページに戻されます。

**原因**

[`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) が設定されていないと、起動のたびに
新しい署名鍵が生成され、次のメッセージがログに出力されます。
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
その結果、再起動前のトークンは
受け付けられなくなります。これとは別に、セッションはリフレッシュトークンの期限が切れると終了します
（ `Refresh token is expired` ）。期限は
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) で、既定は 24 時間です。

**解決方法**

`ACCESS_TOKEN_SECRET` に固定の秘密の値を設定します。1 日では短すぎる場合は `ACCESS_TOKEN_REFRESH_EXPIRATION` を大きくします。
長期間の API アクセスには [API トークン](profile/api-token.html) を使ってください。

---

## シングルサインオン後にフォームとジョブが空になる（HTTP 431）

ユーザーは Entra ID または OIDC でエラーなくサインインできますが、フォームとジョブのページが空のままです。ブラウザーのネットワーク
タブでは、API の呼び出しが次の応答を返しています。

```
431 Request Header Fields Too Large
```

サーバーログにはこれらの呼び出しについて何も出力されず、同じユーザーでも LDAP やローカルのアカウントなら問題なく使えることがあります。

**原因**

7.1.0 より前は、サインインのトークンにユーザーのすべてのグループが含まれ、Entra ID のグループはオブジェクト ID と
名前で 2 回含まれていました。ブラウザーはこのトークンをすべてのリクエストの `Authorization` ヘッダーで送るため、100 前後
以上のグループに属するユーザーでは、ヘッダーが 16 KB を大きく超えます。Node.js は 16 KB を超えるリクエストヘッダーを、リクエストが
AnsibleForms に届く前に 431 で拒否するため、何もログに出力されません。前段のリバースプロキシは、さらに早い段階でリクエストを拒否することがあります。
Nginx の既定ではヘッダーフィールドあたり 8 KB までで
（ `large_client_header_buffers 4 8k` ）、代わりに 400 を返します。

**解決方法**

7.1.0 以降にアップグレードします。サインインのトークンにグループが含まれなくなるため、そのサイズはユーザーが属するグループの数に
左右されなくなります。また、リクエストが 431 で拒否されたときは、空のページを表示する代わりにインターフェースがそう伝えます。
アップグレードできるまでは、次のどちらかを行います。

* **アクセス > SSO** でプロバイダーに **グループフィルター** を設定します。これはロールが使うグループだけを残す正規表現です。
  [Entra ID](authentication/entra-id.html) または [OIDC](authentication/oidc.html) を参照してください。ユーザーはもう一度サインインして
  小さなトークンを取得します
* または、環境変数 `NODE_OPTIONS=--max-http-header-size=65536` で Node.js の上限を引き上げ、
  AnsibleForms を再起動します

7.1.0 以降は、 [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) で同じ上限を設定できます。既定は 16384
バイトで、起動時に読み取られます。前段のシングルサインオンゲートウェイが設定する大きなクッキーなど、ほかの大きなヘッダーにも使えます。
プロキシのヘッダーの上限も引き上げてください。 [リクエストヘッダーのサイズ](production/reverse-proxy.html#request-header-size) を参照してください。

---

## Playbook failed with status

Ansible のジョブが失敗で終わり、その出力の最後の行が次のようになります。

```
[ERROR]: Playbook failed with status (<code>)
```

**原因**

`ansible-playbook` が 0 以外のコードで終了しました。その上の行に Ansible 自身のエラーがあります。プレイブックが
見つからなかった、ホストに到達できなかった、タスクが失敗した、インベントリが間違っている、などです。プレイブックは
**playbook に使用しますか?** を有効にしたリポジトリ、または [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) で探されます。
ログの行 `Running from directory : <path>` で、使われたフォルダーがわかります。

**解決方法**

最後の行より上のジョブの出力を読みます。プレイブックが見つからない場合は、フォームの `playbook` を
`Running from directory` のフォルダーと照らし合わせます。 [Ansible フォーム](forms/ansible.html) を参照してください。

---

## Playbook was aborted by the main process

Ansible のジョブが次のメッセージで失敗します。

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**原因**

RTE 上の `ansible-playbook` プロセスがシグナルで終了しましたが、誰もジョブを中止していません。7.0.0 以降、
出力のサイズが原因になることはなくなりました。 [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) （既定はストリームあたり 50 MB）を
超えると残りの出力は保存されず、ジョブに
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on` と表示され、
プレイブックは最後まで実行されます。現在よくある原因はメモリです。RTE のコンテナーがメモリの上限に達し、
カーネルがプレイブックを強制終了したもので、たとえばフォークが多い場合や facts が大きい場合に起きます。

**解決方法**

プレイブックの実行中に RTE のコンテナーのメモリを確認し（ `docker stats` 、 `kubectl top pod` ）、上限を引き上げるか、
プレイブックのメモリ使用量を減らします（ `forks` を減らす、不要な facts の収集をしない）。 `PROCESS_MAX_BUFFER` の警告だけが出ていて
出力全体が必要な場合は、RTE のコンテナーの環境で `PROCESS_MAX_BUFFER` を引き上げます。これを読み取るのはアプリではなく RTE です。
---

## Failed to launch awx template

AWX のジョブが失敗で終わり、出力が次のように始まります。

```
failed to launch awx template <name>
```

**原因**

次の行に理由が示されます。 `Request failed with status code 401` は、AWX ランナーの認証情報にあるトークン、またはユーザー名とパスワードが
拒否されたことを意味します。 `could not find job template <name>` は、その名前と完全に一致するジョブテンプレートもワークフロージョブテンプレートも
ない、または接続のユーザーがそれを見られないことを意味します。 `unable to verify the first certificate` のような証明書のエラーは、
AWX の証明書が信頼されていないことを意味します。

**解決方法**

ランナー（ **接続 > ランナー** ）の **接続テスト** を使います。正常であれば `Runner connection is OK` と応答します。7.3.0 以降、
トークンまたはユーザーとパスワード、アドレス、 **CA バンドル** は、 **接続 > 認証情報** にあるランナーの認証情報に設定されています。
トークンやパスワードはそこで更新し、証明書のエラーではその **CA バンドル** に CA を貼り付けてください。
テンプレートの名前と権限を確認します。アドレスは `/api/v2` を付けずに入力してください。AnsibleForms が
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX) を自動で付け加えます。
[AWX フォーム](forms/awx.html) を参照してください。

---

## ジョブのステータスが abandoned になる

実行中だったジョブが `abandoned` とマークされ、ノードまたは RTE のログに次のいずれかが出力されます。

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

非推奨のデータベースモードの RTE は、独自のメッセージを出力します。

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**原因**

ジョブは、それを実行または追跡するコンテナーに属します。プレイブックはその RTE に、それ以外のジョブ（AWX のジョブ、マルチステップ
フォームのステップ）はそれを開始したアプリノードに属します。そのコンテナーが再起動すると、自分の未完了のジョブを終了させます。たとえば Pod が
置き換えられてコンテナーがなくなった場合は、2 分間応答がなければワーカーがそのジョブを終了させます。ソケットモードの RTE が、実行中だったジョブを持たずに
戻ってきた場合（たとえばスプールのない新しいコンテナー）は、そのジョブは abandoned で終わります。停止する RTE は、まず
[`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) の間、プレイブックの終了を待ちます。また 1 時間ごとに、
1 日以上実行中のままのジョブも abandoned とマークされます。

7.3.0 以降、AWX、AAP、Ascender 上のジョブはそのランナーで続行されます。再起動でジョブが放棄された直後に、それが過去 24 時間以内に開始されたものであれば
ノードがもう一度追跡し、ジョブはそこで実際に起きた結果で終わります。その場合、ログには `Following <n> abandoned job(s) again on their runner` と出力されます。

**解決方法**

プレイブックのジョブを再起動します。RTE やアプリノードの再起動やアップグレードはジョブが実行されていないときに行い、停止する RTE には十分な時間を
与えてください（ [スケーリング](rte/run.html) を参照）。プレイブックは途中まで実行されている可能性があるため、再起動する前に、管理対象ホストで
本当に完了したかどうかを確認してください。

---

## RTE が接続しない

RTE ランナー（ **接続 > ランナー** ）の **接続テスト** が、次のメッセージで失敗します。

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**原因**

ソケットモードの RTE は、1 本の WebSocket でアプリと通信します。アウトバウンドでは RTE がアプリに接続し、インバウンドではアプリが RTE に接続します（
[モード](rte/modes.html) を参照）。ソケットが開かない理由は、アプリと RTE のログに出力されます。

| メッセージ | 出力される場所 | 意味 |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | RTE（インバウンド） | ランナーの RTE 認証情報のトークンが、RTE の `RTE_TOKEN` と一致しない |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | アプリ（インバウンド） | 同じことをアプリ側から見たもの |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | アプリと、拒否された RTE（ `401` ） | RTE が、アプリがそのランナー用に保持しているものとは別のトークンでサインインしている |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | RTE（アウトバウンド） | 参加を求めて承認を待っている |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | RTE（インバウンド、 `APP_URL` あり） | インバウンドの RTE で同じ状況 |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | アプリと、拒否された RTE（ `409` ） | 設定シードがランナーを `rte_mode` なし、つまりデータベースモードで宣言しており、そのモードはシードが決める。インバウンドの RTE には `rte_mode: inbound` と `(and its credential with the address the app dials, RTE_URL)` が表示される |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | RTE | 自分自身を登録するインバウンドの RTE には、アプリが接続するアドレスが必要 |
| `Runner '<name>': dialing <address>: <reason>` | アプリ（ `debug` レベル） | アプリがソケットを開けない。たとえば RTE の証明書が、そのランナーにピン留めされたものと違う |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | RTE | データベースモードで動いており、ソケットをまったく開かない |

**解決方法**

* **トークンが拒否される** : RTE に、そのランナーの RTE 認証情報（ **接続 > 認証情報** ）のトークンを与えます。またはその逆を行います
* **承認待ち** : **接続 > ランナー** で、そこに表示されるフィンガープリントがログのものと同じであることを確認してから承認します
  （ [RTE の承認](runners/registration.html#approving-an-rte) を参照）
* **データベースモードの設定シードで管理されている** : シードのランナーに、RTE の認証情報（インバウンドの場合はそのアドレス付き）とともに
  `rte_mode` を設定し、RTE を再起動します
* **`RTE_URL` のないインバウンド** : `RTE_URL` にアプリが RTE に到達するアドレスを設定するか、 `APP_URL` を外して、ランナーを
  シードまたは **接続 > ランナー** で宣言します
* **ピン留めされたものと違う証明書** : HTTPS のインバウンドの RTE は登録時に証明書を送り、アプリはその証明書でのみ
  接続します。証明書を新しくすると、RTE は登録時にもう一度それを送ります。認証情報の CA バンドルが手動で設定されていた場合、
  アプリはそれを維持し、次のログを出力します。
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **[DEPRECATED] の警告** : RTE に `RTE_MODE` を設定し、その環境から `DB_*` を削除して、ランナーをそのモードに設定します（
  [モード](rte/modes.html) を参照）

---

## The form data is not valid

起動時の検証が `enforce` のとき、起動が `422` と次のメッセージで拒否されます。

```
The form data is not valid
```

**原因**

サーバーがフィールドの値をフォームのルールに照らしてチェックし、欠けているフィールドや無効なフィールドを見つけました。それらは応答の
`details` に列挙されます。 `rawFormData` のない起動も拒否されます。ウィザードなど、まだチェックできないフォームは
`Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>` で拒否されます。

**解決方法**

詳細に示されたフィールドを修正するか、ルールが厳しすぎる場合はフォームのルールを修正します。まず `log` で実行してください。
何も拒否せずに `Launch validation would refuse form '<name>' ...` をログに出力します。
[enforce の動作](launch-validation/log-and-enforce.html#what-enforce-does) と
[段階的な導入](launch-validation/rolling-it-out.html) を参照してください。

---

## リポジトリのクローンまたは pull に失敗する

リポジトリのステータスが失敗を示し、その出力に git のエラーが含まれるか、ログに
`Background clone of '<name>' failed : <reason>` と出力されます。

**原因**

Git がリモートに到達できないか、認証できませんでした。SSH の URL（ `git@host:path` ）では、リモートが AnsibleForms の
公開鍵を受け入れる必要があります。HTTPS では、ユーザー名とトークンが有効である必要があります。作業ツリーに変更がある場合も
pull は拒否され、次のメッセージが出ます。
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**解決方法**

SSH の場合は、 **接続 > SSH** の **キー** タブから公開鍵をコピーし、デプロイキーとして、またはリポジトリにアクセスできるユーザーに
追加します。AnsibleForms はクローン時にリモートホストを既知のホストに追加します。それ以外のホストには、同じページの
**既知のホスト** タブを使います。
HTTPS の場合は、トークンを更新します。 [Git リポジトリ](gui/designer-and-git.html#git-repositories) と
[リポジトリについて](faq.html#about-repositories) を参照してください。

---

## フォームリポジトリがまだクローンされていない

デザイナーでのフォームの保存が、次のエラーで失敗します。

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**原因**

**フォームに使用しますか?** を有効にしたリポジトリに、まだ作業ツリーがありません。クローンが実行されていないか、失敗しています。

**解決方法**

リポジトリの設定からリポジトリをクローンします。クローンに失敗する場合は、
[リポジトリのクローンまたは pull に失敗する](#a-repository-clone-or-pull-failed) を参照してください。

---

## バックアップに失敗する

バックアップが失敗し、バックアップの一覧に何も追加されません。理由は次のいずれかです。

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**原因**

ダンプのコマンド [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND) がインストールされていない、
接続に失敗した、または空のファイルを生成しました。大きなデータベースでは、
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) （既定は 1 時間）より長くかかることもあります。
失敗したバックアップはフォルダーを残しません。ログには `Backup failed, removing the incomplete folder '<folder>' : <reason>` と出力されます。

**解決方法**

MySQL または MariaDB のクライアントツールをインストールするか、 `MYSQLDUMP_COMMAND` （復元には `MYSQL_COMMAND` も）を、
このホストで、サーバーのバージョンに対して動作するコマンドに設定します。大きなデータベースでは `BACKUP_COMMAND_TIMEOUT_SECONDS` を引き上げます。
[バックアップ](gui/administration.html#backups) を参照してください。
