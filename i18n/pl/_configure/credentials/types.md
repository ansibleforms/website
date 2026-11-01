---
layout: default
title: Typy poświadczeń
parent: Poświadczenia
nav_order: 1
translated_from: 2782b0144b1442eceb8684fb1407827cef5fde8f
---

# Typy poświadczeń
{: .no_toc }

Co zawiera każdy typ i gdzie można go wybrać
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Typy

Typ mówi, do czego służy poświadczenie. Decyduje, o które pola pyta okno i gdzie można je wybrać:

| Typ | Co zawiera | Używane przez |
|---|---|---|
| Użytkownik i hasło | Użytkownik i hasło do dowolnego logowania: API REST z basic auth, usługa i inne. Domyślny | Playbooki, przez `credentials` formularza lub pole poświadczenia; [wyrażenia REST](../expressions/credentials.html) |
| SSH | Użytkownik i hasło do SSH na serwer, z jego hostem i portem | Playbooki, przez `credentials`, `ansibleCredentials` formularza lub pole poświadczenia, oraz logowanie węzła workflow |
| Git | Użytkownik i hasło lub token do repozytoriów git | [Repozytoria](../repositories/authentication.html) |
| API | Użytkownik i hasło lub token do API REST | [Wyrażenia REST](../expressions/credentials.html), token bota Telegram, token bearer webhooka, klucz API asystenta czatu |
| Baza danych | Dostęp do bazy danych z jej typem, hostem, portem i nazwą bazy | [Baza danych](../databases.html), którą odpytują formularze (`dbConfig`), od wersji 7.5.0, lub bezpośrednio `dbConfig` formularza; `fnCredentials`; można go przetestować |
| CyberArk | Adres CyberArk Central Credential Provider (CCP) i jego TLS oraz AppID, certyfikat klienta i klucz, którymi loguje się magazyn CyberArk | Magazyn sekretów [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Serwer poczty, jego port i TLS oraz logowanie (brak dla przekaźnika) | Pocztowy [kanał powiadomień](../notification-channels.html) |
| LDAP | Serwery katalogu, port, TLS i certyfikaty oraz jego bind DN i hasło | [Katalog LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | Rejestracja aplikacji dostawcy: tenant ID, client ID, client secret i identyfikator URI przekierowania | [Dostawca Entra ID](../authentication/entra-id.html) |
| Open ID | Klient dostawcy: wystawca, client ID, client secret i identyfikator URI przekierowania | [Dostawca OIDC](../authentication/oidc.html) |
| RTE | Token (`RTE_TOKEN`) i adres RTE | [Runner](../runners.html) RTE |
| AWX, AAP, Ascender | Token lub login oraz adres tej platformy | Runner tego typu |
| Semaphore, Rundeck | Token API i adres tego produktu | Runner tego typu |
| Jenkins | Użytkownik, jego token API i adres Jenkinsa | Runner Jenkins |
| HashiCorp Vault | Token i adres, którymi loguje się magazyn Vault | Magazyn sekretów [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Poświadczenie bazy danych może być typu MySQL, MSSQL, PostgreSQL, Oracle lub MongoDB. Od wersji 7.5.0 wybiera je baza danych z
[Połączenia > Bazy danych](../databases.html), a aktualizacja do 7.5.0 tworzy jedną bazę danych dla każdego z nich, o tej samej nazwie.

W API i w [config seed](../seed/) typy to `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` i `vault`. Aktualizacja z wersji 6
nadaje każdemu poświadczeniu typ `userpass` albo `database` dla poświadczenia bazy danych: formularz używa go tak jak w 6. Zmień go na SSH dla
logowania, którym łączy się playbook węzła workflow, albo na API dla API REST.

---

## Adresy w poświadczeniach

Od wersji 7.3.0 dane logowania, które działają na jednym serwerze, zawierają ten serwer, więc rekord, który ich używa, tylko wskazuje poświadczenie:

| Rekord | Co przeniesiono do jego poświadczenia |
|---|---|
| Katalog LDAP | Jego serwery, port, TLS, certyfikaty i konto bind, do poświadczenia `ldap` o nazwie `<directory>-ldap` |
| Dostawca SSO | Jego client ID i secret, dzierżawa lub wystawca oraz identyfikator URI przekierowania, do poświadczenia `entraid` lub `oidc` o nazwie `<provider>-sso` |
| Runner | Jego adres i TLS oraz token lub login, do poświadczenia jego typu, `<runner>-token` lub `<runner>-login` |
| Magazyn sekretów | Jego adres i TLS oraz token (`<store>-token`) lub AppID i certyfikat CyberArk (`<store>-appid`) |
| Kanał pocztowy | Jego serwer, port i TLS, do jego poświadczenia `smtp` lub nowego o nazwie `<channel>-smtp` |

Aktualizacja do 7.3.0 wykonuje te przeniesienia raz. Rekord, który już wskazywał poświadczenie, zachowuje je i dostaje jego kopię, gdy
inny rekord używał tych samych danych logowania z innym serwerem. Rekordy zadeklarowane w [config seed](../seed/) pozostają takie, jak w seedzie.
Poświadczenia połączeń i logowań może zmienić tylko admin, zobacz [Kto może zmienić poświadczenie](../credentials.html#who-may-change-a-credential).
