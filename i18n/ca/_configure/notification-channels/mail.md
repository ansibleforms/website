---
layout: default
title: Correu
parent: Canals de notificació
nav_order: 1
translated_from: 3ab21a1f2987744527863f5f25ce347dbdf2cd3d
---

# Correu
{: .no_toc }

Els servidors SMTP, el predeterminat i el seu inici de sessió
{: .fs-6 .fw-300 }

Un canal de correu és un servidor SMTP. En pots tenir diversos; el marcat com a **Predeterminat** és el servidor amb què l'aplicació envia el seu
correu quan un formulari no nomena cap canal de correu. El primer canal de correu passa a ser el predeterminat, i **Fes-lo predeterminat** el canvia.

| Pas | Camp | Significat |
|---|---|---|
| Credencials | Credencial | Obligatori. Una credencial **smtp** de [Connexions > Credencials](../credentials.html): el servidor de correu, el seu port i TLS, i l'inici de sessió. Per a un relay sense inici de sessió, una credencial smtp sense usuari. |
| Remitent | Remitent | L'adreça del remitent que veuen els destinataris. |

L'interruptor **Predeterminat** de la pestanya **Detalls** de la pàgina d'un canal de correu el converteix en el predeterminat, igual que **Fes-lo predeterminat**.
Els ajustos de correu de la llavor de configuració s'utilitzen mentre cap canal de correu no sigui el predeterminat, o mentre el predeterminat estigui desactivat.
