---
layout: default
title: Correu
parent: Canals de notificació
nav_order: 1
translated_from: 912c390487fa6b9e65cd83eb1e626c18c44f981a
---

# Correu
{: .no_toc }

Els servidors de correu, el predeterminat i com inicien sessió
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El canal de correu

Un canal de correu és el servidor a través del qual l'aplicació envia el seu correu: un servidor SMTP, o Microsoft 365 des de la 7.6.0.
En pots tenir diversos; el marcat com a **Predeterminat** és el que fa servir quan un formulari no nomena cap canal de correu:

| Pas | Camp | Significat |
|---|---|---|
| Credencials | Credencial | Una credencial **smtp** de [Connexions > Credencials](../credentials.html) (el servidor de correu, el seu port i TLS, i el seu inici de sessió, o **Sense inici de sessió** per a un relay), o una credencial **Microsoft Entra ID** per enviar a través de [Microsoft 365](microsoft-365.html). Obligatòria per a un canal nou; el pas no demana res més del servidor. |
| Credencials | Servidor de correu, Port de correu, Utilitza TLS | No són al diàleg. Només a la pàgina d'un canal sense credencial, o la credencial smtp del qual no té servidor, vegeu més avall. |
| Credencials | Envia a través de | Només amb una credencial Microsoft Entra ID: **Microsoft Graph** (el predeterminat) o **SMTP (OAuth2)**, vegeu [Microsoft 365](microsoft-365.html). |
| Remitent | Remitent | L'adreça del remitent que veuen els destinataris. Amb Microsoft 365, la bústia en nom de la qual s'envia el correu. |

---

## Un relay sense inici de sessió

Un servidor de correu que accepta correu sense inici de sessió (un relay) es pot utilitzar de dues maneres, i totes dues envien sense autenticació:

- **Una credencial smtp amb Sense inici de sessió** (des de la 7.6.0): només té el **Servidor de correu**, el **Port de correu** i **Utilitza TLS**, sense usuari ni contrasenya.
- **Cap credencial**: un canal sense credencial (d'abans, o el relay de l'actualització, vegeu més avall) conserva el seu propi **Servidor de correu**, **Port de correu** i **Utilitza TLS** a la seva pàgina.

Un canal la credencial smtp del qual no té servidor (feta abans que les credencials en tinguessin) també conserva el seu propi servidor, port i
TLS a la seva pàgina, on inicia la sessió l'accés de la credencial. Un canal que nomena una credencial amb el seu propi servidor oblida el servidor que s'hi havia escrit abans.

---

## El canal predeterminat

El primer canal de correu passa a ser el predeterminat, i **Fes-lo predeterminat** al menú de la fila el passa a un altre. L'interruptor
**Predeterminat** de la pestanya **Detalls** de la pàgina d'un canal de correu fa el mateix.

Des de la 7.6.0, l'aplicació no envia cap correu mentre cap canal de correu no sigui el predeterminat, o mentre el predeterminat estigui
desactivat. Abans, recorria als ajustos de correu de la pàgina de configuració o de la llavor de configuració. L'actualització a la 7.6.0
converteix aquests ajustos en el canal de correu predeterminat `default` quan encara no hi havia cap canal de correu actiu: amb un inici de
sessió, nomena una credencial smtp nova `mail-login`; per a un relay, té el seu propi servidor i cap credencial. A la
[llavor de configuració](../seed/), declara un canal de correu a `notification_channels:` (vegeu [Exemple](../seed/example.html)): les
antigues claus `mail_*` de `settings:` continuen funcionant, però estan obsoletes.
