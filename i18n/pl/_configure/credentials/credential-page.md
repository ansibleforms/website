---
layout: default
title: "Strona poświadczenia"
parent: Poświadczenia
nav_order: 3
translated_from: e6bb8581b39ffc997504889b1b6e8d245cd51d13
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
| Logowanie | Każde pole jego typu, jak w kroku **Logowanie** okna: użytkownik, hasło i miejsce logowania (host i port, baza danych, serwer poczty, serwery katalogu, dzierżawa lub wystawca, adres serwera i jego TLS). W poświadczeniu CyberArk: AppID, certyfikat klienta i klucz. Od wersji 7.6.0 wybór sposobu logowania, a w poświadczeniu SSH klucz prywatny i jego hasło. |
| Magazyn | Baza danych lub Magazyn sekretów oraz magazyn i odwołanie. Nie dotyczy CyberArk ani HashiCorp Vault. |
| Używane przez | Wszystko, co wskazuje to poświadczenie: magazyny sekretów, kanały powiadomień, repozytoria, katalogi LDAP, dostawcy SSO, runnery, [bazy danych](../databases.html) (od wersji 7.5.0), asystent czatu, formularze i workflowy projektanta. Wiersz je otwiera. |

Hasło wpisuje się na karcie **Logowanie** i po zapisaniu nigdy nie jest już pokazywane: pozostawione puste, zapisane hasło zostaje. To samo
dotyczy klucza klienta poświadczenia CyberArk, a od wersji 7.6.0 klucza prywatnego i hasła klucza poświadczenia SSH.

Od wersji 7.6.0 obowiązuje to tylko, dopóki wybór logowania się nie zmienia. Po zmianie (**Klucz prywatny** SSH na **Hasło** i z powrotem,
**Bez logowania** SMTP na **Logowanie**, **Certyfikat** Entra ID na **Sekret** i z powrotem, **Token** na **Hasło** i z powrotem) nic
zapisanego do niego nie pasuje: nowy potrzebny sekret jest wymagany, a **Zapisz** o niego prosi. Poświadczenie SSH zmienione na **Hasło**
usuwa przy **Zapisz** zapisany klucz prywatny i jego hasło, jak mówi karta pod wyborem. Przy **Zapisz w kluczu** na karcie **Magazyn**
oferowane są tylko wybory z hasłem, zobacz [Jak poświadczenie się loguje](types.html#how-a-credential-signs-in).

W prawym górnym rogu są **Testuj połączenie** (tylko poświadczenia bazy danych), **Usuń** i **Zapisz**.

Od wersji 7.3.0 **Usuń** i nowa nazwa są odrzucane, dopóki **Używane przez** cokolwiek wymienia, zobacz [Poświadczenia w użyciu](../credentials.html#credentials-in-use).

Poświadczenie zadeklarowane w [config seed](../seed/) jest na tej stronie tylko do odczytu: zmień je zamiast tego w pliku seed.
