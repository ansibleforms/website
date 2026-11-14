---
layout: default
title: Typy poświadczeń
parent: Poświadczenia
nav_order: 1
translated_from: eb4f5cce55db979ca4f0d1304d797decc01192ee
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
| Użytkownik i hasło | Użytkownik i hasło do dowolnego logowania: API REST z basic auth, usługa i inne, z opcjonalnym hostem i portem. Domyślny | Playbooki, przez `credentials` formularza lub pole poświadczenia; [wyrażenia REST](../expressions/credentials.html) |
| SSH | Użytkownik z hasłem lub kluczem prywatnym do SSH na serwer, z jego hostem i portem | Playbooki, przez `credentials`, `ansibleCredentials` formularza lub pole poświadczenia, oraz logowanie węzła workflow |
| Git | Token albo użytkownik i hasło do repozytoriów git | [Repozytoria](../repositories/authentication.html) |
| API | Użytkownik i hasło lub token do API REST, z opcjonalnym hostem i portem | [Wyrażenia REST](../expressions/credentials.html), token bota Telegram, token bearer webhooka, klucz API asystenta czatu |
| Baza danych | Dostęp do bazy danych z jej typem, hostem, portem i nazwą bazy | [Baza danych](../databases.html), którą odpytują formularze (`dbConfig`), od wersji 7.5.0, lub bezpośrednio `dbConfig` formularza; `fnCredentials`; można go przetestować |
| CyberArk | Adres CyberArk Central Credential Provider (CCP) i jego TLS oraz AppID, certyfikat klienta i klucz, którymi loguje się magazyn CyberArk | Magazyn sekretów [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Serwer poczty, jego port i TLS oraz opcjonalne logowanie (brak dla przekaźnika) | Pocztowy [kanał powiadomień](../notification-channels.html) |
| LDAP | Serwery katalogu, port, TLS i certyfikaty oraz jego bind DN i hasło | [Katalog LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | Rejestracja aplikacji: tenant ID, client ID, client secret lub certyfikat oraz identyfikator URI przekierowania | [Dostawca Entra ID](../authentication/entra-id.html); kanał pocztowy wysyłający przez [Microsoft 365](../notification-channels/microsoft-365.html) |
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

## Jak poświadczenie się loguje

Od wersji 7.6.0 krok **Logowanie** tych typów najpierw pyta, jak poświadczenie się loguje, a potem pokazuje tylko pola potrzebne dla tego wyboru:

| Typ | Wybór | Pola |
|---|---|---|
| SSH | **Logowanie za pomocą**: **Hasło** lub **Klucz prywatny** | Hasło: użytkownik i jego hasło. Klucz prywatny: użytkownik, **Klucz prywatny** PEM lub OpenSSH i opcjonalne **Hasło klucza** |
| AWX, AAP, Ascender | **Logowanie za pomocą**: **Token** lub **Hasło** | Token: **Token**, bez użytkownika. Hasło: użytkownik i jego hasło |
| Git | **Logowanie za pomocą**: **Token** lub **Hasło** | Token: **Token**, bez użytkownika (git wysyła wtedy użytkownika `oauth2`). Hasło: użytkownik i jego hasło |
| SMTP | **Logowanie za pomocą**: **Bez logowania** lub **Logowanie** | Bez logowania, dla przekaźnika: tylko **Serwer poczty**, **Port poczty** i **Używaj TLS**. Logowanie: te pola oraz użytkownik i jego hasło |
| Microsoft Entra ID | **Logowanie za pomocą**: **Sekret** lub **Certyfikat** | Sekret: **Client secret**. Certyfikat: **Certyfikat** PEM i jego klucz prywatny, tylko do poczty przez Microsoft 365 |

Poświadczenie zachowuje tylko to, czego wymaga jego wybór: poświadczenie SSH nigdy nie ma jednocześnie hasła i klucza, drugie jest usuwane
przy zapisie. Przy **Zapisz w kluczu** w kroku **Magazyn** oferowane są tylko wybory z hasłem, bez **Klucz prywatny**, **Bez logowania** i **Certyfikat**.

Pozostałe typy logują się w jeden sposób. Poświadczenie typu Użytkownik i hasło lub API ma po haśle przełącznik **Dodaj host i port**, zobacz
[Host i port logowania](#host-and-port-of-a-login). Okno nazywa hasło bind LDAP **Hasło**, token RTE **Token**, a typ bazy danych **Silnik**.

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

---

## Host i port logowania

Od wersji 7.6.0 poświadczenie typu Użytkownik i hasło lub API może też zawierać **Host** i **Port**, oba opcjonalne: w kroku
**Logowanie** pokazuje je przełącznik **Dodaj host i port** po haśle.

Trafiają one do playbooka i do wyrażeń razem z poświadczeniem, jako `host` i `port`, obok `user` i `password`: przez `credentials`
formularza i [`fn.fnCredentials`](../expressions/credentials.html). Poświadczenie odczytane z magazynu sekretów zachowuje własny host
i port, a z sekretu bierze je tylko tam, gdzie zostawia je puste. Poświadczenia SSH i bazy danych zawsze je miały.

---

## Klucz prywatny poświadczenia SSH

Od wersji 7.6.0 poświadczenie SSH może logować się kluczem prywatnym zamiast hasła: **Logowanie za pomocą** ustawione na **Klucz prywatny** pyta o:

| Pole | Znaczenie |
|---|---|
| Klucz prywatny | Klucz prywatny PEM lub OpenSSH, którym loguje się playbook. Przechowywany zaszyfrowany, nigdy więcej nie pokazywany: pozostawiony pusty, zapisany zostaje. |
| Hasło klucza | Hasło klucza, jeśli je ma. Przechowywane zaszyfrowane. |

Loguje się jednym albo drugim, nigdy obydwoma: przy zapisie klucz usuwa zapisane hasło, a **Hasło** usuwa zapisany klucz i jego
hasło, jak mówi strona poświadczenia. Klucz i jego hasło nigdy nie są zwracane przez API i są maskowane w wyniku zadania.

Gdy formularz wskazuje poświadczenie w `ansibleCredentials`, RTE zapisuje klucz do prywatnego pliku tymczasowego (we własnym folderze,
czytelnym tylko dla jego użytkownika) i przekazuje go playbookowi jako `ansible_ssh_private_key_file`. Klucz z hasłem jest ładowany do
`ssh-agent` uruchomionego tylko dla tego zadania, a plik jest usuwany zaraz po załadowaniu. Plik i agent znikają, gdy zadanie się kończy,
także nieudane lub przerwane, więc na RTE nie zostaje żaden klucz.

Obrazy RTE mają `ssh-agent` i `ssh-add`; własne RTE bez nich kończy błędem zadanie, którego klucz ma hasło, i podaje tego przyczynę.

`credentials` formularza, które wskazuje poświadczenie SSH, przekazuje playbookowi klucz jako `private_key`, a jego hasło jako
`private_key_passphrase`. W [config seed](../seed/) klucz to `client_key` poświadczenia, a jego hasło to `key_passphrase`.
