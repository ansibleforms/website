---
layout: default
title: Strona poświadczeń
parent: Poświadczenia
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
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
| Logowanie | Czym i gdzie loguje się dany typ, zobacz niżej. |
| Magazyn | Gdzie przechowywane są użytkownik i hasło: **Baza danych** (zaszyfrowane w bazie danych AnsibleForms) lub **Magazyn sekretów**, z magazynem i **Odwołaniem** w nim. Nie dotyczy CyberArk ani HashiCorp Vault, którymi loguje się magazyn sekretów. |

Krok **Typ** wyświetla typy według nazwy: AAP, API, Ascender, AWX, CyberArk, Baza danych, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH oraz Użytkownik i hasło (zobacz [Typy poświadczeń](types.html)).

Krok **Logowanie** zawiera każde pole typu, łącznie z adresem; nie ma osobnego kroku połączenia:

| Typy | Pola kroku Logowanie |
|---|---|
| Każdy typ poza CyberArk | Hasło lub to, co je zastępuje: hasło bind w LDAP, client secret w Entra ID i Open ID, token w HashiCorp Vault, token RTE, token API w Semaphore, Rundeck i Jenkins, token lub hasło w AWX, AAP i Ascender |
| Każdy typ poza HashiCorp Vault, RTE, Semaphore i Rundeck | Użytkownik: AppID w CyberArk, bind DN w LDAP, client ID w Entra ID i Open ID, opcjonalny w AWX, AAP i Ascender |
| SSH, Baza danych | **Host** i **Port**; dla bazy danych także **Typ bazy danych** i **Baza danych** |
| SMTP | **Serwer poczty** (wymagany), jego **Port** i **Używaj TLS** |
| LDAP | **Serwery** katalogu (wymagane), jego **Port** i **Włącz TLS**; z TLS także **Ignoruj certyfikaty**, **Pakiet CA** i **Certyfikat klienta** |
| Microsoft Entra ID | **Tenant ID** (wymagany) i **Identyfikator URI przekierowania** |
| Open ID | **Wystawca** (wymagany) i **Identyfikator URI przekierowania** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Serwer**, adres, do którego się loguje, wymagany, z **Pomiń weryfikację certyfikatu** i **Pakietem CA** |
| CyberArk | **Certyfikat klienta** i **Klucz klienta** |

Wiersz otwiera własną stronę poświadczenia. Jego menu oferuje **Edytuj**, **Testuj połączenie** (tylko poświadczenia bazy danych) i **Usuń**.
Hasło zmienia się na stronie poświadczenia, na karcie **Logowanie**.
