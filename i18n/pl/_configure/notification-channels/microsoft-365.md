---
layout: default
title: Microsoft 365
parent: Kanały powiadomień
nav_order: 1.5
translated_from: 7726278c07b456c4b765f5319ffec54361f4c5f9
---

# Microsoft 365
{: .no_toc }

Wysyłanie poczty przez Microsoft 365 z OAuth2 zamiast hasła
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dlaczego OAuth2

Microsoft domyślnie wyłącza w Exchange Online SMTP AUTH z użytkownikiem i hasłem (basic auth) z końcem grudnia 2026.

Od wersji 7.6.0 kanał pocztowy może zamiast tego wysyłać przez Microsoft 365 z rejestracją aplikacji. Wskazuje wtedy poświadczenie
**Microsoft Entra ID** zamiast poświadczenia smtp, a **Wysyłaj przez** określa, jak wysyła:

| Wysyłaj przez | Jak wysyła | Czego potrzebuje Microsoft 365 |
|---|---|---|
| **Microsoft Graph** (domyślnie) | HTTPS do `sendMail` w Graph, jako skrzynka nadawcy, bez SMTP | Uprawnienie aplikacji `Mail.Send` lub Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, port 587 ze STARTTLS, logowanie tokenem zamiast hasła | Uprawnienie `SMTP.SendAsApp`, aplikacja w Exchange, SMTP AUTH włączone dla skrzynki |

Pole **Nadawca** w kroku **Nadawca** to skrzynka, w imieniu której wysyłana jest poczta. Kanały z poświadczeniem smtp wysyłają jak dotąd.

---

## Rejestracja aplikacji

Oba sposoby zaczynają się od rejestracji aplikacji w centrum administracyjnym Microsoft Entra i poświadczenia, które ją przechowuje:

1. **App registrations > New registration**, single tenant. Zanotuj jej **Application (client) ID** i **Directory (tenant) ID**.
2. **Certificates & secrets**: nowy client secret (skopiuj jego *Value*, nie ID) albo certyfikat, zobacz [Certyfikat zamiast sekretu](#a-certificate-instead-of-a-secret).
3. W AnsibleForms, w **Połączenia > Poświadczenia**, poświadczenie typu **Microsoft Entra ID** z **Tenant ID** i **Client ID**
   oraz **Logowanie przez** ustawionym na **Sekret klienta** (wtedy wartość sekretu) lub **Certyfikat**.
4. W kanale pocztowym wybierz to poświadczenie i **Wysyłaj przez**.

Token jest przechowywany do pięciu minut przed wygaśnięciem; zmieniony sekret lub certyfikat dostaje nowy. Chmura krajowa ustawia
[`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) dla tokenu i
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) dla Graph.

---

## Microsoft Graph

Graph wysyła z uprawnieniem aplikacji `Mail.Send`, które pozwala aplikacji wysyłać jako dowolna skrzynka, chyba że Exchange to ogranicza:

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, potem **Grant admin consent**.
2. Aby ograniczyć aplikację do skrzynki nadawcy, nadaj jej to uprawnienie zamiast tego przez Exchange RBAC for Applications: usuń
   `Mail.Send` z rejestracji aplikacji i w Exchange Online PowerShell wykonaj:

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

SMTP z OAuth2 wymaga uprawnienia Exchange, aplikacji zarejestrowanej w Exchange i SMTP AUTH włączonego dla skrzynki nadawcy:

1. W rejestracji aplikacji **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, potem **Grant admin consent**: SMTP nie potrzebuje żadnego uprawnienia Graph.
2. W Exchange Online PowerShell zarejestruj aplikację w Exchange, daj jej dostęp do skrzynki i włącz SMTP AUTH dla tej skrzynki:

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## Certyfikat zamiast sekretu

Poświadczenie Entra ID może logować się certyfikatem zamiast client secret, tylko dla poczty:

1. Utwórz certyfikat i jego klucz, na przykład:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Prześlij certyfikat (`ansibleforms-mail.pem`) do rejestracji aplikacji, w **Certificates & secrets > Certificates**.
3. W poświadczeniu ustaw **Logowanie przez** na **Certyfikat** i wklej **Certyfikat** oraz jego klucz prywatny (PEM, RSA, bez
   hasła). Oba są sprawdzane przy **Zapisz**; klucz jest przechowywany zaszyfrowany i nigdy więcej nie jest pokazywany.

Dostawca SSO zawsze loguje się client secret, więc poświadczenie używane do logowania i do poczty też zachowuje swój sekret. W
[config seed](../seed/) poświadczenie `entraid` przechowuje certyfikat w `client_cert`, a jego klucz w `client_key`, a kanał
pocztowy przyjmuje `send_through: graph` lub `send_through: smtp`.

---

## Gdy Microsoft odmawia

**Wyślij test** w kanale mówi prostymi słowami, czego brakuje, nigdy nie pokazując sekretu, klucza ani tokenu:

- uprawnienia `Mail.Send` lub zgody administratora dla niego
- skrzynki nadawcy poza zakresem aplikacji (Exchange RBAC for Applications) lub skrzynki, która nie istnieje
- poprawnego client secret lub certyfikatu: jest błędny lub wygasł
- SMTP AUTH włączonego dla skrzynki, przy **SMTP (OAuth2)**
