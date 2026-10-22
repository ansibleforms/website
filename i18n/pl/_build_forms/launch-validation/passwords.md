---
layout: default
title: Hasła
parent: Weryfikacja uruchomienia
nav_order: 5
translated_from: 2fc2d2e8cdd997efaf221bd8e0114df2a4ee873e
---

# Hasła
{: .no_toc }

Jak pola haseł są weryfikowane, przechowywane i trzymane z dala od API
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pole hasła jest weryfikowane jak każde inne pole. Jego wartość jest jednak przechowywana na serwerze i nigdy nie jest zwracana
klientowi.

---

## Gdzie przechowywane jest hasło

Serwer przechowuje hasło razem z zadaniem, w jego extravars:

* **Zatwierdzenie** może wtedy kontynuować zadanie z hasłem wprowadzonym przez użytkownika.
* **Ponowne uruchomienie w pierwotnej postaci** może je odtworzyć, gdy weryfikacja uruchomienia nie jest ustawiona na `enforce`.

Zapisane hasło jest używane wyłącznie na serwerze.

---

## Co zwracają API

Żadne API nigdy nie zwraca hasła:

* Zadanie odczytane przez REST API lub przez `get_job` serwera MCP ma zamaskowane wszystkie pola `password` swojego formularza, także wewnątrz
  wierszy list i podformularzy YAML.
* `MASK_EXTRAVARS_REGEX` (domyślnie `password|secret|token`) maskuje też każdą zmienną extravars, której nazwa pasuje, dla
  sekretów, które nie są polami haseł.

---

## Co otrzymuje ponowne uruchomienie

Aby wstępnie wypełnić ponowne uruchomienie, przeglądarka otrzymuje surowe dane formularza zadania. Te dane nigdy nie zawierają hasła, nawet wewnątrz
wierszy list czy podformularzy YAML, więc użytkownik wprowadza hasło ponownie.

Pole hasła ukryte przez zależności formularza nie jest potrzebne i nie trzeba go wprowadzać ponownie.
