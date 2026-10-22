---
layout: default
title: Preferències
parent: El teu perfil
nav_order: 2
translated_from: d67f4050fea45cbd0cccd16c37cdc03838042925
---

# Preferències
{: .no_toc }

Idioma, tema, zona horària, format de data i notificacions d'escriptori
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les preferències

La vista Preferències canvia com veus AnsibleForms. Cada opció es desa al navegador
on la tries, de manera que un altre navegador o un altre ordinador comença amb els valors per defecte.

| Opció | Valors | També es defineix des de |
|---|---|---|
| Idioma | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (japonès), 简体中文 (xinès simplificat) | la bandera de la capçalera |
| Tema | Segueix el navegador, Clar, Fosc, o Color (una capçalera del color que triïs) | la icona del sol de la capçalera |
| Vista dels formularis | Mosaic o Llista | el botó de la pàgina Formularis |
| Zona horària | UTC, la zona d'aquest navegador, o qualsevol zona pel nom | només aquí |
| Format de data | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY` | només aquí |
| Notificacions d'escriptori | Activades o desactivades | només aquí |

A partir de la 7.3.0, la vista està en pestanyes, cadascuna amb la seva pròpia adreça (`/profile/preferences/<tab>`): **Aparença** (idioma, tema i vista
dels formularis), **Data i hora** (zona horària i format de data) i **Notificacions**. El quadre de cerca que hi ha a sobre mostra les opcions que coincideixen
sota el nom de la seva pestanya. Una opció és un esborrany fins que fas **Desa**, i si surts de la vista amb un canvi sense desar, primer t'ho pregunta.

**Segueix el navegador** canvia a clar o fosc segons el navegador, i canvia quan ell canvia. És el tema per defecte a partir de la 7.3.0, tret que el teu
administrador en triï un altre. En passar el ratolí per sobre d'un color del tema **Color**, aquí o al menú de temes de la capçalera, es previsualitza l'aplicació amb aquell
color, i el tema anterior torna quan el punter surt de la paleta; no canvia res fins que fas clic.

---

## Notificacions d'escriptori

A partir de la 7.3.0, la pestanya **Notificacions** activa les notificacions d'escriptori en aquest navegador, per als usuaris el rol dels quals defineix `showJobs`.

El navegador demana permís la primera vegada. Quan bloqueja les notificacions per al lloc, l'interruptor es queda desactivat i explica com
permetre-les, i un lloc amb `http` sense xifrar no les pot mostrar de cap manera. Un cop activades, arriba una notificació:

| Quan | Què diu | Un clic a sobre |
|---|---|---|
| Acaba una tasca que has llançat tu | El formulari i el seu resultat, com ara *Patch Linux servers: Correctes*, amb el número de la tasca i la durada | Porta la pestanya al davant, sobre aquella tasca |
| Una tasca espera la teva aprovació | El formulari, el número de la tasca i qui l'ha llançada, amb els botons **Aprova** i **Rebutja** | Obre les tasques pendents d'aprovació |

Els botons **Aprova** i **Rebutja** es mostren a Chrome i Edge; Firefox i Safari mostren la notificació sense ells, i el mateix passa amb un
lloc amb un certificat autosignat, ja que els botons necessiten un service worker. Les notificacions només arriben mentre hi ha una pestanya d'AnsibleForms oberta,
encara que sigui en segon pla: no s'envia res un cop tancades totes les pestanyes. Cadascuna es mostra un sol cop, per moltes pestanyes que hi hagi obertes, i els passos d'una
tasca multipas i la tasca que estàs mirant no en generen.

---

## Zona horària

Les dates i les hores de tot AnsibleForms es mostren a la zona horària que seleccionis. Això inclou les hores d'inici
i de finalització de les tasques, el registre d'auditoria, la pàgina d'estat, les còpies de seguretat, les tasques desades i la caducitat d'un token
d'API. En canviar la zona horària s'actualitzen totes les pàgines immediatament, sense recarregar.

Fins que en triïs una, s'aplica la zona horària que el teu administrador ha definit per a tothom (**Configuració > Aparença > Valors predeterminats**, vegeu
[Aparença](../appearance.html)), **UTC** si no s'ha canviat. **Aquest navegador** segueix la zona horària del teu ordinador, i la
llista conté totes les zones pel nom, com ara `Europe/Madrid`. La targeta mostra l'hora actual a la zona i el format seleccionats.

---

## Format de data

El format de data defineix com es llegeix la part de data de cada data, i cada opció es mostra amb la data d'avui: `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY`. Fins que en triïs un, s'aplica el format de data per defecte del teu administrador,
`YYYY-MM-DD` si no s'ha canviat. Com les altres opcions, es desa en aquest navegador.

---

## Què conserva les hores del servidor

Dues excepcions conserven les hores pròpies del servidor:

- **El registre del servidor i la sortida de les tasques** són text que conté les hores que hi va escriure el servidor.
- **Les hores que introdueixes tu**, com ara quan s'ha d'executar una tasca planificada, i les programacions cron, funcionen com
  abans.
