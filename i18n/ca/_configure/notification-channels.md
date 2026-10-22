---
layout: default
title: Canals de notificació
nav_order: 9
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1488a67f6f281b0236e4bad3a8b3d0c3bb32326c
---

# Canals de notificació
{: .no_toc }

Envia sol·licituds d'aprovació i notificacions de tasques per correu, a Slack, Microsoft Teams, Telegram o a qualsevol webhook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: afegeix els servidors de correu i els canals de xat als quals els formularis envien les seves notificacions i aprovacions.

---

## En aquesta secció

| Pàgina | Què hi trobaràs |
|---|---|
| [Correu](notification-channels/mail.html) | Els servidors SMTP, el predeterminat i el seu inici de sessió |
| [Slack i Microsoft Teams](notification-channels/slack-and-teams.html) | El webhook d'un canal de Slack o de Teams |
| [Telegram](notification-channels/telegram.html) | Un bot que publica en un xat de Telegram |
| [Webhook](notification-channels/webhook.html) | Una petició JSON a qualsevol endpoint HTTP |
| [Utilitzar canals en un formulari](notification-channels/in-a-form.html) | Com nomenar canals a les notificacions i a les aprovacions |
| [Provar un canal](notification-channels/testing.html) | Envia una prova, i què demostra |


---

## Com funciona

Un **canal de notificació** és un lloc on van les notificacions, que s'afegeix a **Connexions > Notificacions**. Cada canal és
d'un d'aquests tipus:

| Tipus | Què envia |
|---|---|
| Correu | Correu a través d'un servidor SMTP: sol·licituds d'aprovació i notificacions de tasques. |
| Slack | Un missatge en un canal de Slack, mitjançant el seu webhook d'entrada, amb un botó que porta a la tasca. |
| Microsoft Teams | Una targeta en un canal de Teams, mitjançant un webhook de Workflows, amb un botó que porta a la tasca. |
| Telegram | Un missatge d'un bot en un xat de Telegram, amb un enllaç a la tasca. |
| Webhook | Una petició JSON a qualsevol endpoint HTTP, construïda a partir d'una plantilla. |

Un formulari nomena els seus canals a les seves [notificacions](forms/notifications.html) i a la seva [aprovació](forms/approval.html),
amb `channels:`. Una notificació que no es pot enviar s'escriu al registre; mai no fa fallar la tasca ni l'aprovació.

---

## La pàgina de notificacions

La pàgina de **Connexions > Notificacions** llista tots els canals amb aquestes columnes:

| Columna | Significat |
|---|---|
| Activat | Si se li envien notificacions, vegeu [Utilitzar canals en un formulari](notification-channels/in-a-form.html). |
| Nom | Com el nomenen els formularis a `channels:`. |
| Tipus | Correu, Slack, Microsoft Teams, Telegram o Webhook. El canal de correu predeterminat mostra una etiqueta **Predeterminat** després del seu tipus. |
| Descripció | Per a què serveix el canal. |

**Afegeix canal de notificació** obre un diàleg: **Canal** (nom i descripció), **Tipus** i després els passos del tipus
triat. El tipus es fixa quan es crea el canal i ja no canvia. Una fila obre la pàgina pròpia del canal, amb els mateixos passos com a
pestanyes després de **Detalls**, i **Envia una prova**, **Suprimeix** i **Desa** a dalt a la dreta. El menú de la fila ofereix
**Edita**, **Activa** o **Desactiva** (segons correspongui), **Fes-lo predeterminat** (correu), **Envia una prova** i **Suprimeix**.

La pestanya **Detalls** de la pàgina d'un canal conté l'interruptor **Activat**, que es desa a l'instant, i per al correu l'interruptor
**Predeterminat**, que es desa amb **Desa**.

Un usuari que obre aquestes pàgines amb `showConnectionsSettings` però sense el rol d'admin no pot triar una credencial que només
pot nomenar un admin, vegeu [Qui pot canviar una credencial](credentials.html#who-may-change-a-credential). Quan un usuari així canvia
on envia un canal (la url d'un webhook o la seva comprovació del certificat, l'adreça de la Bot API de Telegram), el canal perd la
credencial que nomenava, tret que en triï una en el mateix canvi.

Un canal declarat a la [llavor de configuració](seed/) és només de lectura en aquesta pàgina, i tot i així es pot provar.

