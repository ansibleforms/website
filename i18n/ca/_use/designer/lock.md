---
layout: default
title: El bloqueig del dissenyador
parent: Dissenyador
nav_order: 1
translated_from: f23a01e973e287a772930e69ca9ccaa7cb463c65
---

# El bloqueig del dissenyador
{: .no_toc }

Només edita una persona alhora
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Obtenir el bloqueig

El dissenyador està desactivat fins que l'actives, amb l'interruptor de l'extrem superior dret del dissenyador. En activar-lo, obtens el
bloqueig: a partir d'aquell moment ets l'única persona que pot desar, fins que el tornis a desactivar.

Sense el bloqueig, el dissenyador mostra **El dissenyador no està actiu**, i no es pot editar res.

Els desaments no se superposen mai: a partir de la 7.3.0, mentre s'executa un desament, un push o una càrrega, un segon **Desa** (un doble clic, o Ctrl+S mantingut) s'ignora,
de manera que no pot escriure una segona còpia de seguretat o un segon commit que competeixi amb el primer.

---

## Quan el té una altra persona

Mentre un altre usuari té el bloqueig, el dissenyador mostra **{user} està fent servir el dissenyador** amb el nom d'aquest usuari, i res més: ni seccions
ni fitxers.

L'interruptor apareix activat però en gris, amb **Bloquejat per** i el nom de l'usuari al costat. Pots obtenir el bloqueig quan aquella persona
desactivi el dissenyador. Tots els dissenyadors oberts ho veuen immediatament quan el bloqueig s'obté o s'allibera, sense recarregar.

Quan dos usuaris activen el dissenyador en el mateix moment, un dels dos obté el bloqueig. A partir de la 7.3.0, l'altre veu qui el té
i tots els editors queden en només lectura, de manera que no es pot escriure res que no es pugui desar.

---

## Alliberar el bloqueig d'una altra persona

Un administrador pot alliberar un bloqueig que té una altra persona, per exemple quan se n'ha anat a casa amb el dissenyador obert.

**Alliberar**, al costat de **Bloquejat per**, només el veuen els administradors. Abans demana confirmació: es perden els canvis de l'usuari que no s'han desat.

A partir de la 7.3.0, a l'usuari a qui s'ha alliberat el bloqueig se li indica, i qui ho ha fet: **{name} ha alliberat el teu bloqueig del dissenyador** amb el nom de l'administrador,
i **Els canvis no desats ja no es poden desar.** El seu dissenyador no torna a obtenir el bloqueig pel seu compte; el torna a activar
quan vol continuar.

---

## Un bloqueig oblidat

Un bloqueig que ningú no fa servir s'allibera sol, de manera que ningú no espera un dissenyador que ningú no té obert.

El dissenyador obert de qui té el bloqueig va dient al servidor que encara hi és. Quan el servidor no en té notícies durant
5 minuts, perquè s'ha tancat el navegador, s'ha apagat l'ordinador o ha caigut la xarxa, el bloqueig torna a quedar lliure. Quan
qui el tenia torna al dissenyador, torna a obtenir el bloqueig si ningú altre no l'ha agafat. L'alliberament per part d'un administrador és l'excepció:
després d'aquest, el bloqueig no es torna a obtenir.
