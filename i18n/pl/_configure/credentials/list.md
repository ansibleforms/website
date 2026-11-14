---
layout: default
title: Strona poświadczeń
parent: Poświadczenia
nav_order: 2
translated_from: 6e745bbf0a6688646a821d2bec900e5f0406f4ba
---

# Strona poświadczeń
{: .no_toc }

Lista poświadczeń i okno, które dodaje nowe
{: .fs-6 .fw-300 }

Strona w **Połączenia > Poświadczenia** wyświetla każde poświadczenie z jego **Nazwą**, **Typem**, **Opisem** i **Używane przez**, czyli
liczbą rekordów, formularzy i workflowów, które je wskazują (zobacz [Poświadczenia w użyciu](../credentials.html#credentials-in-use)).

**Dodaj poświadczenie** otwiera okno w krokach:

| Krok | Pola |
|---|---|
| Poświadczenie | Nazwa i opis, oba wymagane. |
| Typ | Jeden z 18 typów, zobacz niżej. |
| Magazyn | Gdzie są przechowywane użytkownik i hasło: **Baza danych** (zaszyfrowane w bazie danych AnsibleForms) lub **Magazyn sekretów**. W **Magazyn sekretów** opcja **Wskaż klucz** odczytuje sekret, który już jest w magazynie, a **Zapisz w kluczu** zapisuje w magazynie, przy **Zapisie**, użytkownika i hasło wpisane w kroku **Logowanie**. Potem wybierz magazyn i wypełnij **Odwołanie**; jego przykład zależy od magazynu: ścieżka HashiCorp Vault lub konto CyberArk. Nie dla CyberArk ani HashiCorp Vault, którymi loguje się magazyn sekretów. |
| Logowanie | Czym i gdzie loguje się dany typ, zobacz niżej. |

Krok **Typ** wyświetla typy według nazwy: AAP, API, Ascender, AWX, CyberArk, Baza danych, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH oraz Użytkownik i hasło (zobacz [Typy poświadczeń](types.html)).

Krok **Logowanie** zawiera każde pole typu, łącznie z adresem; nie ma osobnego kroku połączenia:

| Typy | Pola kroku Logowanie |
|---|---|
| Każdy typ poza CyberArk | Hasło lub to, co je zastępuje: hasło bind w LDAP, client secret w Entra ID i Open ID, token w HashiCorp Vault, token RTE, token API w Semaphore, Rundeck i Jenkins, token lub hasło w AWX, AAP i Ascender |
| Każdy typ poza HashiCorp Vault, RTE, Semaphore i Rundeck | Użytkownik: AppID w CyberArk, bind DN w LDAP, client ID w Entra ID i Open ID, opcjonalny w AWX, AAP i Ascender |
| SSH, Baza danych | **Host** i **Port**; dla bazy danych także **Typ bazy danych** i **Baza danych** |
| SSH | **Klucz prywatny** i jego **Hasło klucza**, od wersji 7.6.0; z kluczem hasło jest opcjonalne |
| Użytkownik i hasło, API | **Host** i **Port**, oba opcjonalne, od wersji 7.6.0 |
| SMTP | **Serwer poczty** (wymagany), jego **Port** i **Używaj TLS**; od wersji 7.6.0 użytkownik i hasło są opcjonalne, puste dla przekaźnika |
| LDAP | **Serwery** katalogu (wymagane), jego **Port** i **Włącz TLS**; z TLS także **Ignoruj certyfikaty**, **Pakiet CA** i **Certyfikat klienta** |
| Microsoft Entra ID | **Tenant ID** (wymagany) i **Identyfikator URI przekierowania**; od wersji 7.6.0 **Logowanie przez**: **Sekret klienta** lub **Certyfikat** (tylko poczta) |
| Open ID | **Wystawca** (wymagany) i **Identyfikator URI przekierowania** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Serwer**, adres, do którego się loguje, wymagany, z **Pomiń weryfikację certyfikatu** i **Pakietem CA** |
| CyberArk | **Certyfikat klienta** i **Klucz klienta** |

Przy **Wskaż klucz** użytkownik i hasło nie są pytane: podaje je magazyn. Krok **Logowanie** zachowuje wtedy tylko pola adresu danego typu (SSH, baza danych, serwery poczty i katalogu, adres serwera, opcjonalny host i port typów Użytkownik i hasło oraz API od wersji 7.6.0), a logowanie Git nie ma kroku **Logowanie**: zapisuje się je z kroku **Magazyn**.

Przy **Zapisz w kluczu** (od 7.6.0) krok **Logowanie** pyta o użytkownika i hasło, a **Zapisz** zapisuje je w magazynie pod **Odwołaniem**; AnsibleForms przechowuje tylko magazyn i odwołanie. Oferowane są tylko magazyny, które zezwalają na zapis, a **Dodaj magazyn sekretów** tworzy taki z już włączonym zapisem. Klucz, w którym jest już sekret, zostaje zastąpiony tylko po zaznaczeniu **Nadpisz sekret, który już tam jest**, zob. [Zapisywanie poświadczeń](../secret-stores/#writing-credentials).

Wiersz otwiera własną stronę poświadczenia. Jego menu oferuje **Edytuj**, **Testuj połączenie** (tylko poświadczenia bazy danych) i **Usuń**.
Hasło zmienia się na stronie poświadczenia, na karcie **Logowanie**.
