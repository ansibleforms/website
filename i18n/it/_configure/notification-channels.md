---
layout: default
title: Canali di notifica
nav_order: 9
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1488a67f6f281b0236e4bad3a8b3d0c3bb32326c
---

# Canali di notifica
{: .no_toc }

Invia richieste di approvazione e notifiche dei job via mail, a Slack, Microsoft Teams, Telegram o a qualsiasi webhook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: aggiungi i server mail e i canali di chat a cui i moduli inviano le loro notifiche e approvazioni.

---

## In questa sezione

| Pagina | Cosa tratta |
|---|---|
| [Mail](notification-channels/mail.html) | I server SMTP, quello predefinito, e il loro accesso |
| [Slack e Microsoft Teams](notification-channels/slack-and-teams.html) | Un webhook di canale di Slack o Teams |
| [Telegram](notification-channels/telegram.html) | Un bot che pubblica in una chat Telegram |
| [Webhook](notification-channels/webhook.html) | Una richiesta JSON a qualsiasi endpoint HTTP |
| [Usare i canali in un modulo](notification-channels/in-a-form.html) | Indicare i canali nelle notifiche e nelle approvazioni |
| [Provare un canale](notification-channels/testing.html) | Invia prova, e cosa dimostra |


---

## Come funziona

Un **canale di notifica** è un posto dove vanno le notifiche, aggiunto in **Connessioni > Notifiche**. Ogni canale ha
uno di questi tipi:

| Tipo | Cosa invia |
|---|---|
| Mail | Mail tramite un server SMTP: richieste di approvazione e notifiche dei job. |
| Slack | Un messaggio in un canale Slack, tramite il suo webhook in entrata, con un pulsante per il job. |
| Microsoft Teams | Una scheda in un canale Teams, tramite un webhook di Workflows, con un pulsante per il job. |
| Telegram | Un messaggio di un bot in una chat Telegram, con un collegamento al job. |
| Webhook | Una richiesta JSON a qualsiasi endpoint HTTP, costruita da un template. |

Un modulo indica i suoi canali nelle sue [notifiche](forms/notifications.html) e nella sua [approvazione](forms/approval.html),
con `channels:`. Una notifica che non si può inviare viene scritta nel log; non fa mai fallire il job né l'approvazione.

---

## La pagina delle notifiche

La pagina in **Connessioni > Notifiche** elenca ogni canale con queste colonne:

| Colonna | Significato |
|---|---|
| Abilitato | Se gli vengono inviate notifiche, vedi [Usare i canali in un modulo](notification-channels/in-a-form.html). |
| Nome | Come lo indicano i moduli in `channels:`. |
| Tipo | Mail, Slack, Microsoft Teams, Telegram o Webhook. Il canale mail predefinito mostra una pillola **Predefinito** dopo il suo tipo. |
| Descrizione | A cosa serve il canale. |

**Aggiungi canale di notifica** apre una finestra di dialogo: **Canale** (nome e descrizione), **Tipo**, poi i passaggi del tipo
scelto. Il tipo si imposta quando il canale viene creato, e resta. Una riga apre la pagina del canale, con gli stessi passaggi come
schede dopo **Dettagli**, e **Invia prova**, **Elimina** e **Salva** in alto a destra. Il menu della riga offre
**Modifica**, **Attiva** o **Disattiva** (a seconda del caso), **Imposta come predefinito** (mail), **Invia prova** ed **Elimina**.

La scheda **Dettagli** della pagina di un canale contiene l'interruttore **Abilitato**, che viene salvato subito, e per la mail l'interruttore
**Predefinito**, che si salva con **Salva**.

Un utente che apre queste pagine con `showConnectionsSettings` ma senza il ruolo admin non può scegliere una credenziale che solo
un admin può indicare, vedi [Chi può modificare una credenziale](credentials.html#who-may-change-a-credential). Quando un utente del genere cambia
dove invia un canale (l'url di un webhook o la sua verifica del certificato, l'indirizzo di una Bot API di Telegram), il canale perde la
credenziale che indicava, a meno che non ne scelga una nella stessa modifica.

Un canale dichiarato nel [config seed](seed/) è in sola lettura in questa pagina, e si può comunque provare.
