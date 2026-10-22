---
layout: default
title: Avís legal
nav_order: 7
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: a22b56db001904583c51e6bd28f1281737f32a32
---

# Avís legal
{: .no_toc }

Condicions que cada usuari accepta una vegada abans d'utilitzar l'aplicació, registrades amb qui ha acceptat quina versió i quan
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: demana a tots els usuaris que acceptin unes condicions d'ús, a **Configuració > Accés > Avís legal**, amb l'opció de rol `showSettings`.

Des de la 7.3.0 la pàgina llista totes les versions de l'avís legal, i cada versió s'obre en una pàgina pròpia amb les seves acceptacions.
Fins a la 7.2, la pàgina tenia en canvi tres pestanyes (**General**, **Versions** i **Acceptacions**); l'actualització conserva totes les versions.

---

## En aquesta secció

| Pàgina | Què hi trobaràs |
|---|---|
| [General](disclaimer/general.html) | La llista de versions, com afegir-ne una i com activar la que accepten els usuaris |
| [Versions](disclaimer/versions.html) | La pàgina d'una versió, i com canviar-ne el text com a correcció o tornar-lo a demanar a tothom |
| [Acceptacions](disclaimer/acceptances.html) | Qui ha acceptat quina versió, i com tornar-ho a demanar als usuaris que triïs |


---

## Què veuen els usuaris

Amb una versió activada, tots els usuaris que inicien sessió la reben en un diàleg abans de res més, admins inclosos:

1. En llegeixen el títol i el text.
2. Marquen la casella i després fan clic a **Accepta**. **Rebutja**, en vermell, els tanca la sessió.

Des de la 7.3.0 la pàgina de darrere del diàleg es veu desenfocada fins que responen.

Un usuari accepta cada versió una sola vegada: no se li torna a demanar al següent inici de sessió, només quan arriba una versió nova, quan
un admin desa un text canviat amb [Demana-ho a tothom de nou](disclaimer/versions.html#changing-the-text), o quan un admin fa servir
[Torna a demanar](disclaimer/acceptances.html#asking-users-again) sobre la seva acceptació.

Fins que no l'accepten, l'API respon a cada crida de la seva sessió amb l'estat `403` i el codi `disclaimer_required`,
excepte les crides sota `/api/v2/disclaimer` i `/api/v2/profile`, i els esdeveniments en directe que segueix el navegador.
A un [token d'API](profile/api-token.html) no se li demana mai, ja que un script no té ningú que hi faci clic.

