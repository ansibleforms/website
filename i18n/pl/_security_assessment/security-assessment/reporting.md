---
layout: default
title: Zgłaszanie podatności
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# Zgłaszanie podatności
{: .no_toc }

Jak prywatnie zgłosić problem z bezpieczeństwem i co dzieje się potem
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Zgłoś to prywatnie

AnsibleForms przechowuje poświadczenia i tokeny vault, więc nigdy nie zgłaszaj problemu z bezpieczeństwem w publicznym issue:

1. Otwórz **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**: prywatny biuletyn widoczny tylko dla maintainerów.
2. Jeśli ta strona nie jest dla ciebie dostępna, otwórz zwykłe issue, w którym napiszesz tylko, że masz zgłoszenie dotyczące bezpieczeństwa, i poprosisz
   o prywatny kanał: bez szczegółów, bez sposobu odtworzenia, bez numerów wersji. Maintainer otworzy prywatny biuletyn i
   zaprosi cię do niego.

Pełna polityka to [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) repozytorium.

---

## Co zawrzeć

Im więcej z tych informacji zawiera zgłoszenie, tym szybciej problem zostanie naprawiony:

* Co zyskuje atakujący: dane innego użytkownika, playbook, którego nie może uruchamiać, hosta lub uprawnienia administratora.
* Wersję i sposób wdrożenia: Docker, Kubernetes lub instalacja natywna.
* Sposób odtworzenia lub żądanie, które wywołuje problem.
* Czy wymaga zalogowanego użytkownika i z jakimi [opcjami ról](../config/roles.html).

---

## Co dzieje się potem

Zgłoszenie przechodzi przez ten sam prywatny biuletyn od pierwszej wiadomości do publikacji:

| Etap | Co otrzymujesz |
|---|---|
| Potwierdzenie | Potwierdzenie, że zgłoszenie dotarło, i informację, czy udało się je odtworzyć |
| Przyjęte | Poprawkę w następnym wydaniu każdej [wspieranej wersji](development.html#supported-versions) i opublikowany biuletyn z podziękowaniem dla ciebie, chyba że wolisz nie być wymieniony |
| Odrzucone | Uzasadnienie, zwykle takie, że dane zachowanie wymaga uprawnienia, które zgłaszający już miał |

Po wydaniu poprawki biuletyn zostaje opublikowany i pojawia się w [Biuletynach bezpieczeństwa](advisories.html).

---

## Zakres

Polityka wyznacza granicę tam, gdzie wyznacza ją model ról:

| W zakresie | Poza zakresem |
|---|---|
| Wszystko, do czego zalogowany użytkownik może dotrzeć poza tym, na co pozwala mu rola | Ustalenia, które wymagają wcześniejszego przejęcia konta administratora: administrator uruchamiający dowolny playbook to sama istota produktu |
| Wszystko, do czego można dotrzeć bez logowania | Raporty skanerów bez wykazanego wpływu |
| Przechowywane poświadczenia, które stają się czytelne lub trafiają do logu | |
| Wstrzyknięcie do powłoki, bazy danych lub przeglądarki | |
