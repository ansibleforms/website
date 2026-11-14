---
layout: default
title: Correu
parent: Canals de notificació
nav_order: 1
translated_from: 8348d14d37bdc4afc9b68869be9fe8021197597e
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
| Credencials | Credencial | Una credencial **smtp** de [Connexions > Credencials](../credentials.html) (el servidor de correu, el seu port i TLS, i l'inici de sessió), o una credencial **Microsoft Entra ID** per enviar a través de [Microsoft 365](microsoft-365.html). Opcional des de la 7.6.0: sense credencial, s'envia a través del servidor de correu propi del canal, vegeu més avall. |
| Credencials | Servidor de correu, Port de correu, Utilitza TLS | Només sense credencial: el servidor a través del qual el canal envia sense inici de sessió (un relay). **Servidor de correu** és llavors obligatori. |
| Credencials | Envia a través de | Només amb una credencial Microsoft Entra ID: **Microsoft Graph** (el predeterminat) o **SMTP (OAuth2)**, vegeu [Microsoft 365](microsoft-365.html). |
| Remitent | Remitent | L'adreça del remitent que veuen els destinataris. Amb Microsoft 365, la bústia en nom de la qual s'envia el correu. |

---

## Un relay sense inici de sessió

Un servidor de correu que accepta correu sense inici de sessió (un relay) es pot utilitzar de dues maneres, i totes dues envien sense autenticació:

- **Una credencial smtp només amb el seu servidor**: el seu **Usuari (opcional)** i la seva **Contrasenya (opcional)** queden buits.
- **Cap credencial** (des de la 7.6.0): el pas **Credencials** demana el **Servidor de correu**, el **Port de correu** i **Utilitza TLS** propis del canal.

Un canal que nomena una credencial amb el seu propi servidor oblida el servidor que s'hi havia escrit abans.

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
