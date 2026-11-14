---
layout: default
title: "Strona poświadczenia"
parent: Poświadczenia
nav_order: 3
translated_from: 0f97a94cda545c02b3d293fdf2de486d1d066905
---

# Strona poświadczenia
{: .no_toc }

Karty poświadczenia i to, co go używa
{: .fs-6 .fw-300 }

Strona poświadczenia pokazuje kroki jego okna jako karty, a do tego to, co go używa:

| Karta | Co zawiera |
|---|---|
| Szczegóły | Nazwa i opis. |
| Typ | Do czego służy poświadczenie. |
| Logowanie | Każde pole jego typu, jak w kroku **Logowanie** okna: użytkownik, hasło i miejsce logowania (host i port, baza danych, serwer poczty, serwery katalogu, dzierżawa lub wystawca, adres serwera i jego TLS). W poświadczeniu CyberArk: AppID, certyfikat klienta i klucz. W poświadczeniu SSH: klucz prywatny i jego hasło, od wersji 7.6.0. |
| Magazyn | Baza danych lub Magazyn sekretów oraz magazyn i odwołanie. Nie dotyczy CyberArk ani HashiCorp Vault. |
| Używane przez | Wszystko, co wskazuje to poświadczenie: magazyny sekretów, kanały powiadomień, repozytoria, katalogi LDAP, dostawcy SSO, runnery, [bazy danych](../databases.html) (od wersji 7.5.0), asystent czatu, formularze i workflowy projektanta. Wiersz je otwiera. |

Hasło wpisuje się na karcie **Logowanie** i po zapisaniu nigdy nie jest już pokazywane: pozostawione puste, zapisane hasło zostaje. To samo
dotyczy klucza klienta poświadczenia CyberArk, a od wersji 7.6.0 klucza prywatnego i hasła klucza poświadczenia SSH, które przełącznik
**Usuń zapisany klucz prywatny i jego hasło** usuwa przy **Zapisz**.

W prawym górnym rogu są **Testuj połączenie** (tylko poświadczenia bazy danych), **Usuń** i **Zapisz**.

Od wersji 7.3.0 **Usuń** i nowa nazwa są odrzucane, dopóki **Używane przez** cokolwiek wymienia, zobacz [Poświadczenia w użyciu](../credentials.html#credentials-in-use).

Poświadczenie zadeklarowane w [config seed](../seed/) jest na tej stronie tylko do odczytu: zmień je zamiast tego w pliku seed.
