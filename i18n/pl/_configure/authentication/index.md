---
layout: default
title: Uwierzytelnianie
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# Uwierzytelnianie
{: .no_toc }

Wybierz, jak użytkownicy się logują i jak ich konto oraz grupy przekładają się na role
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Metody logowania

AnsibleForms obsługuje cztery metody logowania, a kilka z nich może być aktywnych jednocześnie:

| Metoda | Kiedy jej używać | Strona |
|---|---|---|
| Konta lokalne | Wbudowany admin, konta usługowe, małe zespoły albo awaryjne logowanie, gdy katalog nie działa. | [Konta lokalne](local.html) |
| LDAP | Użytkownicy i grupy są w Active Directory, OpenLDAP lub innym katalogu LDAP. | [LDAP](ldap.html) |
| Entra ID | Użytkownicy logują się kontem Microsoft 365 / Entra ID (logowanie jednokrotne). | [Entra ID](entra-id.html) |
| OIDC | Logowanie jednokrotne przez innego dostawcę OpenID Connect, np. Keycloak. | [OIDC](oidc.html) |

Konta lokalne i LDAP konfiguruje się w **Dostęp > Użytkownicy**, **Grupy** i **LDAP**; Entra ID i OIDC w
**Dostęp > SSO**.

---

## Jak logowanie wybiera metodę

Strona logowania ma formularz z nazwą użytkownika i hasłem oraz po jednym przycisku dla każdego włączonego dostawcy logowania jednokrotnego:

- **Nazwa użytkownika i hasło** są najpierw sprawdzane wśród użytkowników lokalnych. Dopiero gdy żaden lokalny użytkownik nie ma tej nazwy, a LDAP
  jest włączony, sprawdzany jest katalog. Lokalny użytkownik z błędnym hasłem zostaje odrzucony bez pytania LDAP.
- **Przyciski Entra ID i OpenID** pojawiają się pod **Zaloguj się**, gdy taki dostawca jest włączony. Przekierowują przeglądarkę do
  dostawcy i z powrotem; żadne hasło nie trafia do AnsibleForms.

Naraz może być włączony tylko jeden dostawca Entra ID i jeden dostawca OIDC: włączenie jednego wyłącza pozostałych tego samego typu.
Nieudane logowanie nazwą użytkownika i hasłem zawsze pokazuje ten sam ogólny komunikat; przyczyna jest w dzienniku serwera i w dzienniku audytu.

---

## Przełączanie logowania jednokrotnego

Od wersji 7.3.0 każdy dostawca w **Dostęp > SSO** ma dwa własne przełączniki, które działają bez restartu:

| Przełącznik | Efekt |
|---|---|
| **Włączony** | Pokazuje przycisk dostawcy na stronie logowania i przyjmuje jego logowanie. Włączenie go wyłącza pozostałych dostawców tego typu. |
| **Pomiń stronę logowania** | Użytkownicy trafiają prosto do tego dostawcy, bez strony logowania, dopóki dostawca jest włączony. Włączenie tej opcji u jednego dostawcy wyłącza ją u pozostałych; u wyłączonego dostawcy jest wyszarzona. |

Formularz z nazwą użytkownika i hasłem pozostaje dostępny pod `/login?local`, dla lokalnego admina lub gdy dostawca zawiedzie,
i jest pokazywany po wylogowaniu oraz gdy logowanie jednokrotne wraca z błędem.

Zmienne `ENABLE_SSO` i `SSO_AUTO_LOGIN` zostały usunięte w wersji 7.3.0. Pierwsze uruchomienie 7.3.0 odczytuje je jeden raz i
przy każdym starcie zapisuje ostrzeżenie w dzienniku, dopóki są ustawione, więc po aktualizacji usuń je ze środowiska:

| Zmienna przed 7.3.0 | Co robi aktualizacja |
|---|---|
| `ENABLE_SSO=0` | Wyłącza wszystkich dostawców: pozostają skonfigurowani, ale bez przycisku na stronie logowania |
| `SSO_AUTO_LOGIN=1` | Włącza **Pomiń stronę logowania** dla włączonego dostawcy, gdy włączony jest dokładnie jeden, a `ENABLE_SSO` nie jest `0` |

---

## Od użytkownika do ról

Każde logowanie daje użytkownika z **typem** (`local`, `ldap`, `azuread` lub `oidc`), nazwą użytkownika i listą grup.
Każda grupa dostaje prefiks swojego typu, więc grupa Entra ID jest zapisywana i wyświetlana jako `azuread/...`:

| Metoda logowania | Nazwa użytkownika | Grupy |
|---|---|---|
| Lokalna | lokalna nazwa użytkownika | `local/<group>`, po jednej dla każdej lokalnej grupy użytkownika |
| LDAP, katalog `main` | wartość atrybutu nazwy użytkownika (Username Attribute) | `ldap/<cn>`, CN każdej grupy zwróconej przez katalog |
| LDAP, inny katalog | `<directory>/<username>` | `ldap/<directory>/<cn>`, zobacz [Kilka katalogów](ldap.html#several-directories) |
| Entra ID | claim `upn` albo `preferred_username`, gdy token nie ma `upn` | `azuread/<object id>` i `azuread/<display name>` każdej grupy, odczytane z Microsoft Graph |
| OIDC | claim `preferred_username` | `oidc/<name>`, z claimu `groups` tokenu ID |

[Role](../config/roles.html) w config.yaml dopasowują następnie te wartości: rola obowiązuje, gdy jedna z jej `groups` jest jedną
z grup użytkownika albo gdy jej `users` zawiera `<type>/<username>`. Każdy użytkownik dostaje też rolę `default`. Od wersji 7.3.0
rola nazywa członka Entra ID `entraid/<group>` lub `entraid/<upn>`, co pasuje do zapisanej wartości `azuread/`; `azuread/`
w roli nadal działa i zostanie usunięte w 8.0. Profil i extravars zadania nadal pokazują `azuread/`.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

Strona **profilu** użytkownika pokazuje typ logowania, grupy i role, co jest najszybszym sposobem sprawdzenia mapowania.
Opcja roli `allowLogin` może odmówić logowania użytkownikom, którzy nie pasują do żadnej roli: ustaw ją na `false` w `default` i na
`true` w rolach, które mogą się logować.
