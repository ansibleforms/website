---
layout: default
title: Etykiety
parent: Wygląd
nav_order: 6
redirect_from:
  - /appearance/environment.html
translated_from: 2b439f61976fc2cc161250c82c629ec40713ef2c
---

# Etykiety
{: .no_toc }

Etykiety obok logo, które mówią, która to instancja
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Lista

Od wersji 7.3.0 **Ustawienia > Wygląd > Etykiety** przechowuje kilka etykiet obok logo w nagłówku, np. PRODUCTION i EU:

| Kolumna | Znaczenie |
|---|---|
| **Włączone** | Czy etykieta jest widoczna obok logo i na stronie logowania |
| **Etykieta** | Jej tekst, pokazany jako kolorowa pigułka w nagłówku |

Wiersze są w kolejności nagłówka. Kliknięcie wiersza albo **Edytuj** w menu wiersza otwiera stronę etykiety; menu wiersza ma też
**Włącz** lub **Wyłącz**, zależnie od stanu, **Przenieś w górę** i **Przenieś w dół** do zmiany kolejności oraz **Usuń**.

Nagłówek i strona logowania pokazują włączone etykiety w ich kolejności. Powyżej trzech szare **+N** zbiera pozostałe w swojej podpowiedzi,
a telefon pokazuje pierwszą etykietę i **+N**. Zapisana etykieta pojawia się od razu w każdej otwartej przeglądarce.

---

## Dodawanie etykiety

**Dodaj etykietę** otwiera okno z dwoma polami etykiety, oba wymagane:

| Pole | Znaczenie |
|---|---|
| **Etykieta** | Tekst etykiety, np. PRODUCTION |
| **Kolor** | Niebieski, zielony, bursztynowy, pomarańczowy, czerwony lub szary, jako okrągłe próbki; na początku czerwony |

Podgląd pokazuje nagłówek ze wszystkimi włączonymi etykietami i nową, w miarę jak ją wpisujesz. Nowa etykieta jest włączona i trafia za
pozostałe. Jej strona ma jedną kartę, **Szczegóły**, z tymi samymi polami, przełącznikiem **Włączone**, który zapisuje się od razu, i podglądem.

---

## Etykieta środowiska z wersji 7.2

Do wersji 7.2 **Ustawienia > Wygląd > Środowisko** ustawiało jedną etykietę obok logo.

Przy jednej etykiecie PRODUCTION EU i PRODUCTION US czyta się tak samo, jako PRODUCTION, gdy kilka instancji jest otwartych obok siebie. Od wersji 7.3.0
aktualizacja robi z tej etykiety pierwszą pozycję listy, z jej tekstem, kolorem i informacją, czy była widoczna, a stary adres **Środowisko**
otwiera listę.

---

## Etykiety w config seed

Od wersji 7.3.0 [config seed](../seed/) deklaruje etykiety w sekcji `labels`, każdą z tekstem i opcjonalnie z kolorem:

```yaml
labels:
  items:
    - name: PRODUCTION
      color: red
    - name: EU
      color: blue
      enabled: true
      position: 2
```

`color` to jedno z `blue`, `green`, `amber`, `orange`, `red` lub `grey`, a `position` ustala kolejność, od najniższej. Etykieta zadeklarowana
w seedzie jest na swojej stronie tylko do odczytu, jak każdy [obiekt zarządzany](../seed/managed-objects.html).
