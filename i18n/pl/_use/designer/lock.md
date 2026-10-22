---
layout: default
title: Blokada projektanta
parent: Projektant
nav_order: 1
translated_from: f23a01e973e287a772930e69ca9ccaa7cb463c65
---

# Blokada projektanta
{: .no_toc }

Edytuje tylko jedna osoba naraz
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Przejęcie blokady

Projektant jest wyłączony, dopóki go nie włączysz przełącznikiem w prawym górnym rogu projektanta. Włączenie go przejmuje
blokadę: od tej chwili tylko ty możesz zapisywać, dopóki go znowu nie wyłączysz.

Bez blokady projektant pokazuje **Projektant nie jest aktywny** i niczego nie można edytować.

Zapisy nigdy się nie nakładają: od wersji 7.3.0, gdy trwa zapis, push lub ładowanie, drugie **Zapisz** (podwójne kliknięcie lub przytrzymane Ctrl+S) jest
ignorowane, więc nie może zapisać drugiej kopii zapasowej ani drugiego commita, który ścigałby się z pierwszym.

---

## Gdy ma ją ktoś inny

Gdy blokadę trzyma inny użytkownik, projektant pokazuje **Projektant jest używany przez** tego użytkownika i nic poza tym: żadnych sekcji,
żadnych plików.

Przełącznik jest włączony, ale wyszarzony, a obok niego widnieje **Zablokowane przez** z nazwą użytkownika. Blokadę możesz przejąć, gdy
ten użytkownik wyłączy projektant. Każdy otwarty projektant od razu widzi przejęcie lub zwolnienie blokady, bez przeładowania.

Gdy dwóch użytkowników włączy projektant w tej samej chwili, blokadę dostaje jeden z nich. Od wersji 7.3.0 drugi widzi, kto ją trzyma,
a każdy edytor pozostaje tylko do odczytu, więc nie da się wpisać niczego, czego nie można by zapisać.

---

## Zwalnianie cudzej blokady

Administrator może zwolnić blokadę trzymaną przez kogoś innego, na przykład gdy ten ktoś poszedł do domu z otwartym projektantem.

**Zwolnij**, obok **Zablokowane przez**, widzą tylko administratorzy. Przed zwolnieniem pojawia się pytanie: niezapisane zmiany użytkownika przepadną.

Od wersji 7.3.0 użytkownik, którego blokada została zwolniona, dostaje o tym informację wraz z tym, kto to zrobił: **Twoja blokada projektanta została zwolniona przez** z nazwą administratora,
oraz **Niezapisanych zmian nie można już zapisać.** Jego projektant nie przejmuje blokady z powrotem sam; użytkownik włącza go ponownie,
gdy chce kontynuować.

---

## Zapomniana blokada

Nieużywana blokada zwalnia się sama, więc nikt nie czeka na projektant, którego nikt nie ma otwartego.

Otwarty projektant posiadacza blokady stale informuje serwer, że nadal jest obecny. Gdy serwer nie dostanie od niego sygnału przez
5 minut, bo przeglądarka została zamknięta, komputer wyłączony lub zniknęła sieć, blokada znów jest wolna. Gdy
posiadacz wróci do projektanta, ponownie przejmuje blokadę, jeśli nikt inny jej nie ma. Wyjątkiem jest zwolnienie przez administratora: po nim
blokada nie jest przejmowana z powrotem.
