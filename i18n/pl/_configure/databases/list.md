---
layout: default
title: Strona baz danych
parent: Bazy danych
nav_order: 1
translated_from: 66ffec0a34395642b0208e81078dbc725bdc7123
---

# Strona baz danych
{: .no_toc }

Lista baz danych, jej kolumny i okno, które dodaje nową
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Lista

Strona w **Połączenia > Bazy danych** wyświetla każdą bazę danych z tymi kolumnami:

| Kolumna | Znaczenie |
|---|---|
| Nazwa | Jak odwołują się do niej formularze, przez `dbConfig: <name>` |
| Opis | Do czego służy |
| Typ bazy danych | Typ jej poświadczenia: MySQL, MSSQL, PostgreSQL, Oracle lub MongoDB |
| Baza danych | Baza danych, którą otwiera jej poświadczenie |

**Kolumny** dodaje dwie kolejne, domyślnie wyłączone: **Host**, gdzie łączy się jej poświadczenie, z portem, jeśli go ma, oraz **Używane przez**,
czyli ile formularzy ją odpytuje, po jej nazwie lub po nazwie jej poświadczenia (zobacz [Używane przez](database-page.html#used-by)).

Typ bazy danych, baza danych i host są odczytywane z poświadczenia: zmień je na poświadczeniu, w
**Połączenia > Poświadczenia**. Żadna kolumna nie pokazuje użytkownika ani hasła.

---

## Dodawanie bazy danych

**Dodaj bazę danych** otwiera okno w dwóch krokach, tak jak okno runnera.

| Krok | Pola |
|---|---|
| Baza danych | **Nazwa** i **Opis**. Nazwa jest wymagana i unikalna |
| Poświadczenia | **Poświadczenie**, wymagane: poświadczenie typu **Baza danych**. Tylko takie są proponowane |

W kroku **Poświadczenia** **Dodaj poświadczenie** otwiera okno nowego poświadczenia typu **Baza danych** (zobacz
[Strona poświadczeń](../credentials/list.html)) i wybiera je po zapisaniu, więc bazę danych i jej login można dodać za jednym razem.

---

## Menu wiersza

Wiersz otwiera własną stronę bazy danych, a jego menu oferuje:

| Akcja | Co robi |
|---|---|
| Edytuj | Otwiera jej stronę |
| Testuj połączenie | Łączy się jej poświadczeniem, uruchamia najprostsze zapytanie jej typu bazy danych i mówi, czy się udało |
| Usuń | Usuwa bazę danych po potwierdzeniu. Jej poświadczenie zostaje |

Usunięcie bazy danych, którą formularze nadal wskazują, sprawia, że ich zapytania kończą się błędem, chyba że zostaje poświadczenie o tej samej
nazwie, do którego mogą się cofnąć (zobacz [Bazy danych w formularzach](in-forms.html)). Najpierw sprawdź jej kartę **Używane przez**.
