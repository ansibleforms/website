---
layout: default
title: Il blocco del designer
parent: Designer
nav_order: 1
translated_from: f23a01e973e287a772930e69ca9ccaa7cb463c65
---

# Il blocco del designer
{: .no_toc }

Modifica una sola persona alla volta
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Prendere il blocco

Il designer è disattivato finché non lo attivi, con l'interruttore in alto a destra del designer. Attivarlo prende il
blocco: da quel momento sei l'unico che può salvare, finché non lo disattivi di nuovo.

Senza il blocco il designer mostra **Il designer non è attivo**, e non si può modificare nulla.

I salvataggi non si sovrappongono mai: dalla 7.3.0, mentre è in corso un salvataggio, un push o un caricamento, un secondo **Salva** (un doppio clic, o Ctrl+S tenuto premuto) viene
ignorato, così non può scrivere un secondo backup o un secondo commit in concorrenza con il primo.

---

## Quando ce l'ha qualcun altro

Mentre un altro utente detiene il blocco, il designer mostra **Il designer è in uso da** quell'utente, e nient'altro: nessuna sezione,
nessun file.

L'interruttore appare attivo ma in grigio, con accanto **Bloccato da** e il nome dell'utente. Puoi prendere il blocco quando quell'utente
disattiva il designer. Ogni designer aperto se ne accorge subito quando il blocco viene preso o liberato, senza ricaricare.

Quando due utenti attivano il designer nello stesso momento, uno dei due ottiene il blocco. Dalla 7.3.0 l'altro vede chi lo detiene
e ogni editor resta in sola lettura, così non si può digitare nulla che poi non si potrebbe salvare.

---

## Rilasciare il blocco di qualcuno

Un amministratore può liberare un blocco detenuto da qualcun altro, per esempio quando è andato a casa lasciando il designer aperto.

**Rilascia**, accanto a **Bloccato da**, compare solo agli amministratori. Chiede prima conferma: le modifiche non salvate dell'utente vanno perse.

Dalla 7.3.0 l'utente il cui blocco è stato rilasciato viene avvisato, e gli viene detto da chi: **Il tuo blocco del designer è stato rilasciato da** e il nome dell'amministratore,
con **Le modifiche non salvate non possono più essere salvate.** Il suo designer non riprende il blocco da solo; lo riattiva
quando vuole continuare.

---

## Un blocco dimenticato

Un blocco che nessuno usa si libera da solo, così nessuno resta in attesa di un designer che nessuno ha aperto.

Il designer aperto di chi detiene il blocco continua a comunicare al server che è ancora lì. Quando il server non ne ha notizie da
5 minuti, perché il browser è stato chiuso, il computer spento o la rete è caduta, il blocco torna libero. Quando
chi lo deteneva torna al designer, riprende il blocco se nessun altro l'ha preso. Il rilascio da parte di un amministratore è l'eccezione: dopo di esso il
blocco non viene ripreso.
