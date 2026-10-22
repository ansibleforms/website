---
layout: default
title: Disclaimer
nav_order: 7
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: a22b56db001904583c51e6bd28f1281737f32a32
---

# Disclaimer
{: .no_toc }

Condizioni che ogni utente accetta una volta prima di usare l'app, registrate con chi ha accettato quale versione e quando
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: chiedi a ogni utente di accettare delle condizioni d'uso, in **Impostazioni > Accesso > Disclaimer**, con l'opzione di ruolo `showSettings`.

Dalla 7.3.0 la pagina elenca ogni versione del disclaimer, e ogni versione si apre in una pagina propria con le sue accettazioni.
Fino alla 7.2, la pagina aveva invece tre schede (**Generale**, **Versioni** e **Accettazioni**); l'aggiornamento conserva ogni versione.

---

## In questa sezione

| Pagina | Cosa tratta |
|---|---|
| [Generale](disclaimer/general.html) | La lista delle versioni, come aggiungerne una, e come abilitare quella che gli utenti accettano |
| [Versioni](disclaimer/versions.html) | La pagina di una versione, e come cambiarne il testo come correzione o di nuovo per tutti |
| [Accettazioni](disclaimer/acceptances.html) | Chi ha accettato quale versione, e come chiederlo di nuovo a utenti scelti |


---

## Cosa vedono gli utenti

Con una versione abilitata, ogni utente che accede la riceve in una finestra di dialogo prima di qualsiasi altra cosa, admin compresi:

1. Leggono il suo titolo e il suo testo.
2. Spuntano la casella, poi fanno clic su **Accetta**. **Rifiuta**, in rosso, invece li disconnette.

Dalla 7.3.0 la pagina dietro la finestra di dialogo resta sfocata finché non rispondono.

Un utente accetta ogni versione una sola volta: non gli viene richiesto al successivo accesso, ma solo quando arriva una nuova versione, quando
un admin salva un testo modificato con [Chiedi di nuovo a tutti](disclaimer/versions.html#changing-the-text), o quando un admin usa
[Richiedi di nuovo](disclaimer/acceptances.html#asking-users-again) sulla sua accettazione.

Finché non accettano, l'API risponde a ogni chiamata della loro sessione con lo stato `403` e il codice `disclaimer_required`,
tranne le chiamate sotto `/api/v2/disclaimer` e `/api/v2/profile`, e gli eventi live che il browser segue.
A un [token API](profile/api-token.html) non viene mai chiesto, perché uno script non ha nessuno che faccia clic.
