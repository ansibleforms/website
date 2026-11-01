---
layout: default
title: "Strona bazy danych"
parent: Bazy danych
nav_order: 2
translated_from: b027ce5ca33397772148bb221bd9eaab4984f276
---

# Strona bazy danych
{: .no_toc }

Karty bazy danych, jej formularze, Testuj połączenie i Usuń
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Karty

Strona bazy danych pokazuje kroki jej okna jako karty, a do tego formularze, które ją odpytują:

| Karta | Co zawiera |
|---|---|
| Szczegóły | **Nazwę**, tę, którą podaje `dbConfig` pola, i **Opis** |
| Poświadczenia | **Poświadczenie**, którym się łączy, czyli poświadczenie z Połączenia > Poświadczenia typu **Baza danych**, które zawiera jej typ bazy danych, host, port, bazę danych, TLS i login |
| Używane przez | Formularze, które ją odpytują, z liczbą na karcie, zobacz [Używane przez](#used-by) |

Każda karta ma własny adres, np. `/settings/databases/<id>/used-by`, więc link lub zakładka ją otwiera. Wyszukiwanie w wierszu tytułu
zawęża wszystkie karty naraz.

Na karcie **Poświadczenia** **Dodaj poświadczenie** tworzy nowe poświadczenie typu **Baza danych** i je wybiera. Hasło po zapisaniu nigdy
nie jest już pokazywane: zmień je na poświadczeniu.

---

## Używane przez

Karta **Używane przez** wymienia formularze, których pola odpytują bazę danych, tak jak aplikacja odczytuje je z formularzy.

| Kolumna | Co pokazuje |
|---|---|
| Formularz | Formularz, wiersz go otwiera |
| Opis | Opis formularza |
| Pole | Pola tego formularza, których `dbConfig` wskazuje bazę danych |

Pole się liczy, gdy jego `dbConfig` wskazuje bazę danych albo jej poświadczenie, jak robi to formularz napisany przed 7.5.0. Oba
łączą się tym samym poświadczeniem, więc oba są wymienione. Gdy nie ma żadnego, karta mówi **Żaden formularz nie odpytuje tej bazy danych.**

---

## Testuj połączenie i Usuń

Przyciski w prawym górnym rogu działają na bazie danych w zapisanej postaci.

**Testuj połączenie** łączy się jej poświadczeniem, uruchamia najprostsze zapytanie jej typu bazy danych, a potem mówi o tym w komunikacie,
**&lt;name&gt; connection ok**, lub podaje, dlaczego się nie udało. To ten sam test co **Testuj połączenie** samego poświadczenia.

**Usuń** najpierw pyta, potem usuwa bazę danych i wraca do listy. Jej poświadczenie zostaje w **Połączenia > Poświadczenia**.
Obok nich **Zapisz** zapisuje karty Szczegóły i Poświadczenia.
