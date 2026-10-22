---
layout: default
title: Uzyskiwanie pomocy
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# Uzyskiwanie pomocy
{: .no_toc }

Gdzie zadać pytanie, zgłosić błąd lub problem z bezpieczeństwem i zaproponować usprawnienie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Zanim zapytasz

Większość odpowiedzi jest już spisana; szybkie sprawdzenie często oszczędza wymiany wiadomości:

1. Przeszukaj tę witrynę polem wyszukiwania na górze każdej strony.
2. Wyszukaj dokładny komunikat błędu w [Rozwiązywaniu problemów](troubleshooting.html) i przejrzyj [FAQ](faq.html).
3. Sprawdź dziennik serwera (**Ustawienia**, a potem **Dziennik serwera**) i stronę **Stan**, które zgłaszają większość problemów z konfiguracją.
4. Sprawdź [Dziennik zmian](changelog.html): problem może być już naprawiony w nowszym wydaniu.

---

## Dokąd się udać

Każdy rodzaj zgłoszenia ma swoje miejsce, wszystkie na GitHub:

| Chcesz | Przejdź do |
|---|---|
| Zadać pytanie lub podzielić się pomysłem | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Zgłosić błąd | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Zaproponować funkcję | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Zgłosić problem z bezpieczeństwem | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), poufnie |
| Poprawić lub ulepszyć tę dokumentację | **Edit this page on GitHub** na dole każdej strony lub [issue w repozytorium witryny](https://github.com/ansibleforms/website/issues) |

---

## Zgłaszanie błędu

Najszybciej naprawiane jest zgłoszenie, które da się odtworzyć. Szablon zgłoszenia błędu prosi o następujące informacje:

* **Wersja** : widoczna w **O programie** w menu pomocy (**?**) na górnym pasku
* **Wdrożenie** : Docker, Docker Compose, Kubernetes, instalator (i jego silnik), instalacja natywna lub ze źródeł
* **Kroki do odtworzenia** : co zrobiłeś, czego się spodziewałeś i co stało się zamiast tego
* **Dowody** : odpowiednie wiersze dziennika serwera oraz zrzut ekranu, gdy problem jest widoczny

W przypadku problemu z formularzem dołącz minimalną definicję formularza, która go pokazuje. Usuń hasła, tokeny, nazwy hostów i wszelkie
inne prywatne dane z dzienników i formularzy, zanim je opublikujesz: zgłoszenia i dyskusje są publiczne.

---

## Zgłaszanie problemu z bezpieczeństwem

**Nigdy nie otwieraj w tej sprawie publicznego zgłoszenia:** użyj [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), które widzą tylko opiekunowie projektu.

[Polityka bezpieczeństwa](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) wymienia obsługiwane wersje i
opisuje, co dzieje się po zgłoszeniu.
