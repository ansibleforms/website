---
layout: default
title: Wartości domyślne
parent: Wygląd
nav_order: 1
translated_from: 2974af3a3fc29115349fad94498cac9ecd8c6123
---

# Wartości domyślne
{: .no_toc }

Motyw, język, strefa czasowa i format daty dla użytkowników, którzy żadnych nie wybrali
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wartości domyślne

**Wartości domyślne** określają, jak aplikacja wygląda dla użytkownika, który nie dokonał własnego wyboru w swoich
[preferencjach](../profile/preferences.html); własny wybór użytkownika zawsze wygrywa:

| Pole | Możliwości | Bez wyboru |
|---|---|---|
| **Domyślny motyw** | Zgodnie z przeglądarką, Jasny, Ciemny lub Kolor, z jednym z 12 kolorów dla Kolor | Zgodnie z przeglądarką (do wersji 7.2 Jasny) |
| **Domyślny język** | Języki aplikacji, zapisany w [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | angielski |
| **Domyślny widok formularzy** | Kafelki lub Lista, dla strony formularzy | Kafelki |
| **Domyślna strefa czasowa** | UTC, przeglądarka każdego użytkownika lub dowolna strefa według nazwy | UTC |
| **Domyślny format daty** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` lub `DD.MM.YYYY`, pokazany z dzisiejszą datą | `YYYY-MM-DD` |

Język jest zmienną środowiskową i działa bez restartu. Przy
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) ustawionym na `0` strona pokazuje go tylko do odczytu.

Od wersji 7.3.0 strona ma te same dwie karty co preferencje profilu, **Wygląd** (motyw, język i widok formularzy) oraz **Data i
godzina** (strefa czasowa i format daty, z podglądem bieżącej godziny), a jej pole wyszukiwania wyświetla trafienia pod nazwą każdej karty.

---

## Zgodnie z przeglądarką

Od wersji 7.3.0 **Zgodnie z przeglądarką** pokazuje każdemu użytkownikowi jasny lub ciemny motyw, o który prosi jego przeglądarka, i zmienia się razem z nią.

Jest to wartość domyślna, gdy nie wybrano domyślnego motywu, więc nowa instalacja podąża za przeglądarką. Najechanie na jeden z kolorów
motywu **Kolor** pokazuje podgląd aplikacji w tym kolorze; poprzedni motyw wraca, gdy wskaźnik się oddali, a nic nie zostaje zapisane przed kliknięciem **Zapisz**.
