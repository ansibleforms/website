---
layout: default
title: Microsoft 365
parent: 通知通道
nav_order: 1.5
translated_from: ed40e8d615d4ac22fad138311f56e478cccba98a
---

# Microsoft 365
{: .no_toc }

通过 Microsoft 365 使用 OAuth2 代替密码发送邮件
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 为什么使用 OAuth2

Microsoft 将于 2026 年 12 月底默认在 Exchange Online 中关闭使用用户和密码的 SMTP AUTH（基本认证）。

从 7.6.0 起，邮件通道可以改为通过应用注册经由 Microsoft 365 发送。它引用一个 **Microsoft Entra ID** 凭据来代替
smtp 凭据，并由 **发送方式** 决定如何发送：

| 发送方式 | 如何发送 | Microsoft 365 需要什么 |
|---|---|---|
| **Microsoft Graph**（默认） | 通过 HTTPS 调用 Graph 的 `sendMail`，以发件人邮箱的身份发送，不经过 SMTP | `Mail.Send` 应用程序权限，或 Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`，端口 587，使用 STARTTLS，用令牌代替密码登录 | `SMTP.SendAsApp` 权限、在 Exchange 中注册的应用，以及为该邮箱开启的 SMTP AUTH |

**发件人** 步骤中的 **发件人** 是发送邮件所用的邮箱。使用 smtp 凭据的通道照旧发送。

---

## 应用注册

两种方式都从 Microsoft Entra 管理中心的应用注册开始，再加上一个保存该应用注册的凭据：

1. **App registrations > New registration**，单租户。记下其 **Application (client) ID** 和 **Directory (tenant) ID**。
2. **Certificates & secrets**：新建一个客户端密钥（复制其 *Value*，而不是其 ID），或者一个证书，参见 [用证书代替密钥](#a-certificate-instead-of-a-secret)。
3. 在 AnsibleForms 的 **连接 > 凭据** 下，创建一个类型为 **Microsoft Entra ID** 的凭据，填写 **租户 ID** 和
   **客户端 ID**，并将 **登录方式** 设为 **密钥**（然后将密钥的值填入 **客户端密钥**）或 **证书**。
4. 在邮件通道上，选择该凭据和 **发送方式**。

令牌会一直保留到过期前五分钟；更改了密钥或证书时会获取新的令牌。国家云需要为令牌设置
[`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI)，为 Graph 设置
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI)。

---

## Microsoft Graph

Graph 使用 `Mail.Send` 应用程序权限发送，除非 Exchange 加以限制，否则该权限允许应用以任何邮箱的身份发送：

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**，然后 **Grant admin consent**。
2. 若要将应用限制在发件邮箱上，请改为通过 Exchange RBAC for Applications 授予该权限：从应用注册中删除
   `Mail.Send`，并在 Exchange Online PowerShell 中执行：

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

使用 OAuth2 的 SMTP 需要一项 Exchange 权限、在 Exchange 中注册的应用，以及为发件邮箱开启的 SMTP AUTH：

1. 在应用注册中，**API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**，然后 **Grant admin consent**：SMTP 不需要任何 Graph 权限。
2. 在 Exchange Online PowerShell 中，在 Exchange 中注册该应用，授予它该邮箱，并为该邮箱开启 SMTP AUTH：

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## 用证书代替密钥

Entra ID 凭据可以使用证书代替其客户端密钥登录，但仅限于邮件：

1. 创建证书及其私钥，例如：

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. 在应用注册的 **Certificates & secrets > Certificates** 下上传证书（`ansibleforms-mail.pem`）。
3. 在凭据上，将 **登录方式** 设为 **证书**，并粘贴 **证书** 及其私钥，即 **客户端密钥**（PEM、RSA，不带密码短语）。
   两者都会在 **保存** 时检查；私钥会加密存储，且永不再显示。

SSO 提供商始终使用客户端密钥登录，因此同时用于登录和邮件的凭据也要保留其密钥。在 [配置种子](../seed/) 中，
`entraid` 凭据在 `client_cert` 中保存证书，在 `client_key` 中保存其私钥，邮件通道则使用 `send_through: graph` 或 `send_through: smtp`。

---

## Microsoft 拒绝时

通道上的 **发送测试** 会用通俗的语言说明缺少什么，但从不显示密钥、私钥或令牌：

- `Mail.Send` 权限，或其管理员同意
- 发件邮箱超出应用的范围（Exchange RBAC for Applications），或邮箱不存在
- 客户端密钥或证书错误或已过期
- 使用 **SMTP (OAuth2)** 时，邮箱的 SMTP AUTH 已关闭
