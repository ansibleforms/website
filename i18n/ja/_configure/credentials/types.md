---
layout: default
title: 認証情報の種類
parent: 認証情報
nav_order: 1
translated_from: d6f228571406245ed64b84cb0a6bf1888ae5d53c
---

# 認証情報の種類
{: .no_toc }

各種類が保持するものと、選択できる場所
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 種類

種類は、認証情報の用途を示します。ダイアログが尋ねるフィールドと、その認証情報を選択できる場所は種類によって決まります。

| 種類 | 保持するもの | 使用するもの |
|---|---|---|
| ユーザーとパスワード | 任意のログイン用のユーザーとパスワード。ベーシック認証の REST API、サービスなど。任意でホストとポートも持てます。既定の種類です | フォームの `credentials` または認証情報フィールドを通じたプレイブック、 [REST 式](../expressions/credentials.html) |
| SSH | サーバーへの SSH 用のユーザーと、パスワードまたは秘密鍵、およびそのホストとポート | フォームの `credentials` 、 `ansibleCredentials` 、または認証情報フィールドを通じたプレイブック、ワークフローノードのログイン |
| Git | git リポジトリ用のユーザーとパスワードまたはトークン | [リポジトリ](../repositories/authentication.html) |
| API | REST API 用のユーザーとパスワードまたはトークン。任意でホストとポートも持てます | [REST 式](../expressions/credentials.html) 、Telegram ボットのトークン、Webhook のベアラートークン、チャットアシスタントの API キー |
| データベース | データベースのログイン。種類、ホスト、ポート、データベース名を含みます | フォームが照会する [データベース](../databases.html) （ `dbConfig` 、7.5.0 から）、またはフォームの `dbConfig` から直接。 `fnCredentials` 。テストできます |
| CyberArk | CyberArk Central Credential Provider（CCP）のアドレスとその TLS、CyberArk ストアがログインに使う AppID、クライアント証明書、キー | [CyberArk](../secret-stores/cyberark.html) シークレットストア |
| SMTP | メールサーバー、そのポートと TLS、任意のログイン（リレーの場合はなし） | メールの [通知チャネル](../notification-channels.html) |
| LDAP | ディレクトリのサーバー、ポート、TLS、証明書、バインド DN とパスワード | [LDAP ディレクトリ](../authentication/ldap.html) |
| Microsoft Entra ID | アプリの登録。テナント ID、クライアント ID、クライアントシークレットまたは証明書、リダイレクト URI | [Entra ID プロバイダー](../authentication/entra-id.html) 、 [Microsoft 365](../notification-channels/microsoft-365.html) 経由で送信するメールチャネル |
| Open ID | プロバイダーのクライアント。発行者、クライアント ID、クライアントシークレット、リダイレクト URI | [OIDC プロバイダー](../authentication/oidc.html) |
| RTE | RTE のトークン（ `RTE_TOKEN` ）とアドレス | RTE の [ランナー](../runners.html) |
| AWX、AAP、Ascender | そのプラットフォームのトークンまたはログインと、アドレス | その種類のランナー |
| Semaphore、Rundeck | その製品の API トークンとアドレス | その種類のランナー |
| Jenkins | Jenkins のユーザー、その API トークンとアドレス | Jenkins ランナー |
| HashiCorp Vault | Vault ストアがログインに使うトークンとアドレス | [HashiCorp Vault](../secret-stores/hashicorp-vault.html) シークレットストア |

データベースの認証情報の種類には、MySQL、MSSQL、PostgreSQL、Oracle、MongoDB があります。7.5.0 からは
[接続 > データベース](../databases.html) のデータベースがそれを選び、7.5.0 へのアップグレードでは、それぞれに同じ名前のデータベースが一つ作られます。

API と [構成シード](../seed/) では、種類は `userpass` 、 `ssh` 、 `git` 、 `api` 、 `database` 、 `cyberark` 、 `smtp` 、
`ldap` 、 `entraid` 、 `oidc` 、 `rte` 、 `awx` 、 `aap` 、 `ascender` 、 `semaphore` 、 `rundeck` 、 `jenkins` 、 `vault` です。バージョン 6 からの
アップグレードでは、すべての認証情報に種類 `userpass` 、データベースのものには `database` が付与されます。フォームでは 6 と同じように使われます。ワークフローノードの
プレイブックが接続に使うログインは SSH に、REST API 用のものは API に変更してください。

---

## 認証情報内のアドレス

7.3.0 からは、一つのサーバーで使うログインはそのサーバーを持つので、それを使うレコードは認証情報を指定するだけで済みます。

| レコード | 認証情報に移されたもの |
|---|---|
| LDAP ディレクトリ | サーバー、ポート、TLS、証明書、バインドアカウント。 `<directory>-ldap` という名前の `ldap` 認証情報へ |
| SSO プロバイダー | クライアント ID とシークレット、テナントまたは発行者、リダイレクト URI。 `<provider>-sso` という名前の `entraid` または `oidc` 認証情報へ |
| ランナー | アドレスと TLS、トークンまたはログイン。その種類の認証情報 `<runner>-token` または `<runner>-login` へ |
| シークレットストア | アドレスと TLS、トークン（ `<store>-token` ）、または CyberArk の AppID と証明書（ `<store>-appid` ） |
| メールチャネル | サーバー、ポート、TLS。その `smtp` 認証情報、または `<channel>-smtp` という名前の新しい認証情報へ |

7.3.0 へのアップグレードで、これらの移動が一度だけ行われます。すでに認証情報を指定していたレコードはそれを使い続けますが、
別のレコードが同じログインを別のサーバーで使っていた場合は、そのコピーが作られます。 [構成シード](../seed/) で宣言されたレコードは、シードの内容のまま残ります。
接続とサインインの認証情報を変更できるのは管理者だけです。 [認証情報を変更できるユーザー](../credentials.html#who-may-change-a-credential) を参照してください。

---

## ログインのホストとポート

7.6.0 からは、ユーザーとパスワードまたは API の認証情報も、 **ログイン** ステップで **ホスト** と **ポート** を持てます。どちらも任意です。

これらは認証情報とともに、 `user` と `password` の隣の `host` と `port` として、プレイブックと式に渡されます。フォームの `credentials` と
[`fn.fnCredentials`](../expressions/credentials.html) を通じてです。シークレットストアから読み込まれた認証情報は自身のホストとポートを保ち、
それらが空の場合にだけシークレットのものを使います。SSH とデータベースの認証情報は以前からこれらを持っています。

---

## SSH 認証情報の秘密鍵

7.6.0 からは、SSH 認証情報はパスワードの代わりに、またはパスワードと併せて、秘密鍵でログインできます。

| フィールド | 意味 |
|---|---|
| 秘密鍵 | プレイブックがログインに使う PEM または OpenSSH の秘密鍵。暗号化して保存され、二度と表示されません。空のままにすると、保存されているものが残ります。 |
| パスフレーズ | 鍵にパスフレーズがある場合、そのパスフレーズ。暗号化して保存されます。 |
| パスワード | 秘密鍵がある場合は任意です。 |

認証情報のページには **保存済みの秘密鍵とパスフレーズを削除** スイッチがあり、 **保存** 時に適用されます。鍵とそのパスフレーズは
API から返されることはなく、ジョブの出力ではマスクされます。

フォームが `ansibleCredentials` でこの認証情報を指定すると、RTE は鍵を非公開の一時ファイル（そのユーザーだけが読める専用のフォルダー）に
書き込み、 `ansible_ssh_private_key_file` としてプレイブックに渡します。パスフレーズ付きの鍵は、そのジョブ専用に起動した `ssh-agent` に
読み込まれ、読み込み後にファイルは削除されます。ファイルとエージェントは、失敗したジョブや中止したジョブも含め、ジョブの終了時に
なくなるので、RTE に鍵が残ることはありません。

RTE のイメージには `ssh-agent` と `ssh-add` があります。これらを持たない独自の RTE では、パスフレーズ付きの鍵を使うジョブは、その旨を示して失敗します。

フォームの `credentials` が SSH 認証情報を指定すると、鍵は `private_key` として、パスフレーズは `private_key_passphrase` として
プレイブックに渡されます。 [構成シード](../seed/) では、鍵は認証情報の `client_key` 、パスフレーズは `key_passphrase` です。
