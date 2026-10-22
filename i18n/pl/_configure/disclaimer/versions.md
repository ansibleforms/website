---
layout: default
title: Wersje
parent: Zastrzeżenie
nav_order: 2
translated_from: dcab4535a8f7e4aeaff321136564ab14d61dc3fa
---

# Wersje
{: .no_toc }

Strona wersji i zmiana jej tekstu jako poprawki lub ponownie dla wszystkich
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Strona wersji

Od wersji 7.3.0 każda wersja ma własną stronę, pod adresem `/settings/disclaimer/<version>`, z dwiema kartami:

| Karta | Co zawiera |
|---|---|
| **Szczegóły** | Tytuł, tekst i etykietę pola wyboru oraz przełącznik **Włączona**, który zapisuje się od razu |
| **Akceptacje** | Kto zaakceptował tę wersję, zobacz [Akceptacje](acceptances.html) |

**Podgląd** pokazuje okno tak, jak zobaczą je użytkownicy, a **Usuń** usuwa wersję razem z jej akceptacjami. Pole wyszukiwania nad
kartami przeszukuje obie naraz: pasujące pola w **Szczegóły** i pasujące wiersze w **Akceptacje**.

---

## Zmiana tekstu

**Zapisz** przy zmienionym tytule, tekście lub etykiecie pola wyboru, które użytkownicy już zaakceptowali, pyta **Zapytać wszystkich ponownie?**:

| Odpowiedź | Co się dzieje |
|---|---|
| **Zapytaj wszystkich ponownie** | Akceptacje tej wersji są usuwane, a każdy użytkownik akceptuje ją ponownie przy następnym żądaniu |
| **Zachowaj jako poprawkę** | Tekst zostaje przepisany, np. z powodu literówki, a akceptacje nadal się liczą: nikt nie jest pytany ponownie |

Wersja, której nikt jeszcze nie zaakceptował, zapisuje się bez pytania. Aby zachować zaakceptowany tekst, [dodaj nową wersję](general.html#adding-a-version) i ją włącz.
