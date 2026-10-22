---
layout: default
title: "Strona poświadczenia"
parent: Poświadczenia
nav_order: 3
translated_from: 0269b5c0d313622bea6c910b96231f41ffd852d7
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
| Logowanie | Każde pole jego typu, jak w kroku **Logowanie** okna: użytkownik, hasło i miejsce logowania (host i port, baza danych, serwer poczty, serwery katalogu, dzierżawa lub wystawca, adres serwera i jego TLS). W poświadczeniu CyberArk: AppID, certyfikat klienta i klucz. |
| Magazyn | Baza danych lub Magazyn sekretów oraz magazyn i odwołanie. Nie dotyczy CyberArk ani HashiCorp Vault. |
| Używane przez | Wszystko, co wskazuje to poświadczenie: magazyny sekretów, kanały powiadomień, repozytoria, katalogi LDAP, dostawcy SSO, runnery, asystent czatu, formularze i workflowy projektanta. Wiersz je otwiera. |

Hasło wpisuje się na karcie **Logowanie** i po zapisaniu nigdy nie jest już pokazywane: pozostawione puste, zapisane hasło zostaje. W poświadczeniu
CyberArk zostaw klucz klienta pusty, żeby zachować zapisany. W prawym górnym rogu są **Testuj połączenie** (tylko poświadczenia bazy danych),
**Usuń** i **Zapisz**.

Od wersji 7.3.0 **Usuń** i nowa nazwa są odrzucane, dopóki **Używane przez** cokolwiek wymienia, zobacz [Poświadczenia w użyciu](../credentials.html#credentials-in-use).

Poświadczenie zadeklarowane w [config seed](../seed/) jest na tej stronie tylko do odczytu: zmień je zamiast tego w pliku seed.
