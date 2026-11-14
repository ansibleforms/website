---
layout: default
title: Microsoft 365
parent: 通知チャネル
nav_order: 1.5
translated_from: ed40e8d615d4ac22fad138311f56e478cccba98a
---

# Microsoft 365
{: .no_toc }

パスワードの代わりに OAuth2 を使い、Microsoft 365 経由でメールを送信する
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## OAuth2 を使う理由

Microsoft は 2026 年 12 月末に、Exchange Online でユーザーとパスワードによる SMTP AUTH（基本認証）を既定でオフにします。

7.6.0 からは、メールチャネルは代わりにアプリの登録を使って Microsoft 365 経由で送信できます。チャネルは smtp 認証情報の代わりに
**Microsoft Entra ID** 認証情報を指定し、 **送信方法** で送信のしかたを決めます。

| 送信方法 | 送信のしかた | Microsoft 365 に必要なもの |
|---|---|---|
| **Microsoft Graph** （既定） | Graph の `sendMail` への HTTPS。送信者のメールボックスとして、SMTP を使わずに送信します | アプリケーションのアクセス許可 `Mail.Send` 、または Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com` 、ポート 587 で STARTTLS を使用。パスワードの代わりにトークンでサインインします | アクセス許可 `SMTP.SendAsApp` 、Exchange でのアプリの登録、メールボックスで SMTP AUTH がオン |

**送信者** ステップの **送信元アドレス** は、メールの送信元となるメールボックスです。smtp 認証情報を持つチャネルは、これまでどおり送信します。

---

## アプリの登録

どちらの方法も、Microsoft Entra 管理センターでのアプリの登録と、それを保持する認証情報から始めます。

1. **App registrations > New registration** で、シングルテナントの登録を作成します。その **Application (client) ID** と **Directory (tenant) ID** を控えます。
2. **Certificates & secrets** で、新しいクライアントシークレット（ID ではなく *Value* をコピー）または証明書を作成します。 [シークレットの代わりの証明書](#a-certificate-instead-of-a-secret) を参照してください。
3. AnsibleForms の **接続 > 認証情報** で、種類 **Microsoft Entra ID** の認証情報を作成し、 **テナント ID** と **クライアント ID** を入力して、
   **サインイン方法** を **シークレット** （その後シークレットの値を **クライアントシークレット** に入力）または **証明書** にします。
4. メールチャネルで、その認証情報と **送信方法** を選びます。

トークンは有効期限の 5 分前まで保持され、シークレットや証明書を変更すると新しいトークンが取得されます。国内クラウドでは、トークン用に
[`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) を、Graph 用に
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) を設定します。

---

## Microsoft Graph

Graph はアプリケーションのアクセス許可 `Mail.Send` で送信します。Exchange で制限しない限り、アプリは任意のメールボックスとして送信できます。

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send** を追加し、 **Grant admin consent** を押します。
2. アプリを送信用のメールボックスに限定するには、代わりに Exchange RBAC for Applications でアクセス許可を与えます。アプリの登録から
   `Mail.Send` を削除し、Exchange Online PowerShell で次を実行します。

```powershell
# the ObjectId is the one of the Enterprise application (service principal), not of the app registration
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
New-ManagementScope -Name "AnsibleForms mail" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'noreply@contoso.com'"
New-ManagementRoleAssignment -App <client-id> -Role "Application Mail.Send" -CustomResourceScope "AnsibleForms mail"
# check: InScope is True for the sender, False for another mailbox
Test-ServicePrincipalAuthorization -Identity <client-id> -Resource noreply@contoso.com
```

---

## SMTP (OAuth2)

OAuth2 による SMTP には、Exchange のアクセス許可、Exchange へのアプリの登録、送信用メールボックスでの SMTP AUTH の有効化が必要です。

1. アプリの登録で、 **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp** を追加し、 **Grant admin consent** を押します。SMTP には Graph のアクセス許可は不要です。
2. Exchange Online PowerShell で、アプリを Exchange に登録し、メールボックスへのアクセスを与え、そのメールボックスの SMTP AUTH をオンにします。

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## シークレットの代わりの証明書

Entra ID 認証情報は、メールに限り、クライアントシークレットの代わりに証明書でサインインできます。

1. 証明書とその鍵を作成します。例えば次のようにします。

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. 証明書（ `ansibleforms-mail.pem` ）を、アプリの登録の **Certificates & secrets > Certificates** にアップロードします。
3. 認証情報で **サインイン方法** を **証明書** にし、 **証明書** とその秘密鍵を **クライアントキー** に（PEM、RSA、パスフレーズなし）貼り付けます。
   どちらも **保存** 時に検証され、鍵は暗号化して保存され、二度と表示されません。

SSO プロバイダーは常にクライアントシークレットでサインインするので、サインインとメールの両方に使う認証情報はシークレットも保持します。
[構成シード](../seed/) では、 `entraid` 認証情報は証明書を `client_cert` に、その鍵を `client_key` に持ち、メールチャネルは
`send_through: graph` または `send_through: smtp` を受け付けます。

---

## Microsoft が拒否した場合

チャネルの **テスト送信** は、何が足りないかをわかりやすい言葉で示します。シークレット、鍵、トークンは示しません。

- `Mail.Send` のアクセス許可、またはその管理者の同意
- アプリのスコープ外（Exchange RBAC for Applications）の送信者メールボックス、または存在しないメールボックス
- 誤った、または期限切れのクライアントシークレットや証明書
- **SMTP (OAuth2)** で、メールボックスの SMTP AUTH がオフ
