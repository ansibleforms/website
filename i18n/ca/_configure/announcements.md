---
layout: default
title: Anuncis
nav_order: 1
has_children: true
has_toc: false
permalink: /announcements.html
translated_from: 9569cbdaa1c1d1d215f521f21023566e3a4df572
---

# Anuncis
{: .no_toc }

Missatges sota la capçalera per a tothom, com ara una finestra de manteniment, cadascun des del seu inici fins al seu final
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: avisa tots els usuaris d'una finestra de manteniment o d'una incidència, a **Configuració > Aparença > Anuncis**.

La pàgina necessita l'opció de rol `showSettings` o `showAppearanceSettings`. Des de la 7.3.0 és una sola llista, i cada anunci
té la seva pròpia pàgina i el seu interruptor Activat.

---

## En aquesta secció

| Pàgina | Què hi trobaràs |
|---|---|
| [General](announcements/general.html) | L'interruptor Activat de cada anunci, que va substituir l'interruptor de tots alhora |
| [Llista](announcements/list.html) | Els anuncis que no han acabat, les seves columnes i la pàgina d'un anunci |
| [Afegir-ne un](announcements/adding-one.html) | L'assistent de dos passos: el missatge i, després, quan es mostra |


---

## On es mostren

Els anuncis es mostren com una línia sota la capçalera de cada pàgina, per a tots els usuaris que han iniciat sessió, cadascun amb el color del seu tipus.

Se'n poden mostrar diversos d'activats alhora, el més recent primer. La pàgina d'inici de sessió i un formulari incrustat en un altre lloc web no en mostren cap.

Cadascun té un botó per tancar-lo. Un anunci tancat continua tancat en aquella pestanya del navegador fins que es tanca la pestanya, o
fins que canvia el seu missatge o la seva data de final. Un anunci desat arriba alhora a tots els navegadors oberts; un que
arriba a la seva data d'inici o de final s'hi mostra o s'hi amaga en menys d'un minut.
