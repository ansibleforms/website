---
layout: default
title: 認証情報ページ
parent: 認証情報
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
---

# 認証情報ページ
{: .no_toc }

認証情報のリストと、認証情報を追加するダイアログ
{: .fs-6 .fw-300 }

**接続 > 認証情報** のページには、すべての認証情報が **名前** 、 **種類** 、 **説明** 、 **使用元** とともに表示されます。使用元は、
その認証情報を指定しているレコード、フォーム、ワークフローの数です（ [使用中の認証情報](../credentials.html#credentials-in-use) を参照）。

**認証情報を追加** を押すと、ステップ形式のダイアログが開きます。

| ステップ | フィールド |
|---|---|
| 認証情報 | 名前と説明。どちらも必須です。 |
| 種類 | 18 種類のいずれか。下記を参照。 |
| ログイン | その種類が何を使ってどこにログインするか。下記を参照。 |
| 保存先 | ユーザーとパスワードの保存場所。 **データベース** （AnsibleForms のデータベースに暗号化して保存）または **シークレットストア** で、後者の場合はストアとその中の **参照** を指定します。シークレットストアのログインに使う CyberArk と HashiCorp Vault にはありません。 |

**種類** ステップには、種類が名前で表示されます。AAP、API、Ascender、AWX、CyberArk、データベース、Git、HashiCorp Vault、Jenkins、LDAP、
Microsoft Entra ID、Open ID、RTE、Rundeck、Semaphore、SMTP、SSH、ユーザーとパスワードです（ [認証情報の種類](types.html) を参照）。

**ログイン** ステップには、アドレスを含め、その種類のすべてのフィールドがあります。接続用の別のステップはありません。

| 種類 | ログインステップのフィールド |
|---|---|
| CyberArk 以外のすべての種類 | パスワード、またはその代わりになるもの。LDAP のバインドパスワード、Entra ID と Open ID のクライアントシークレット、HashiCorp Vault のトークン、RTE トークン、Semaphore、Rundeck、Jenkins の API トークン、AWX、AAP、Ascender のトークンまたはパスワード |
| HashiCorp Vault、RTE、Semaphore、Rundeck 以外のすべての種類 | ユーザー。CyberArk の AppID、LDAP のバインド DN、Entra ID と Open ID のクライアント ID。AWX、AAP、Ascender では任意 |
| SSH、データベース | **ホスト** と **ポート** 。データベースの場合は **データベースの種類** と **データベース** も |
| SMTP | **メールサーバー** （必須）、その **ポート** と **TLS を使用** |
| LDAP | ディレクトリの **サーバー** （必須）、その **ポート** と **TLS を有効にする** 。TLS の場合は **証明書を無視** 、 **CA バンドル** 、 **クライアント証明書** |
| Microsoft Entra ID | **テナント ID** （必須）と **リダイレクト URI** |
| Open ID | **発行者 (Issuer)** （必須）と **リダイレクト URI** |
| HashiCorp Vault、CyberArk、RTE、AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins | ログイン先のアドレスである **サーバー** （必須）と、 **証明書の検証をスキップ** 、 **CA バンドル** |
| CyberArk | **クライアント証明書** と **クライアントキー** |

行をクリックすると、その認証情報のページが開きます。行メニューには **編集** 、 **接続テスト** （データベースの認証情報のみ）、 **削除** があります。
パスワードは認証情報のページの **ログイン** タブで変更します。
