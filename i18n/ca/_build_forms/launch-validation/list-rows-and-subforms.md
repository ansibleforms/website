---
layout: default
title: Files de llista
parent: Validació del llançament
nav_order: 3
translated_from: 2f28c42b47c253f87a9be9d5b1bd8638f7dca685
---

# Files de llista
{: .no_toc }

Com es validen les files dels camps list
{: .fs-6 .fw-300 }

---

Un camp `list` conté files; cada fila és una instància del seu subformulari, emplenada amb l'editor
de files. Un camp `yaml` amb un `subform` és una d'aquestes files. El servidor les tracta de la mateixa manera
que l'editor de files del navegador: cada fila es resol a través del seu subformulari, amb els valors del formulari
com a `__parent__`, se'n comproven les regles i se n'avaluen els camps calculats. Les llistes niades funcionen
igual: dins de la llista pròpia d'una fila, `$(__parent__.__parent__.x)` arriba fins al formulari.

Les files es comproven així:

- **Una fila que l'usuari ha afegit o editat** a l'editor es resol i es valida.
- **Una fila que ningú no ha tocat**, generada pel valor per defecte, l'expressió o la consulta de la mateixa llista
  (com ara les entrades existents d'una llista d'ACL), passa **exactament tal com ha arribat**, igual que al
  navegador: no es torna a validar i no s'hi afegeix res. Una entrada existent que incompleix una regla
  escrita més tard no atura el llançament.
- **Una fila marcada com a eliminada** (el `deleteMarker` de la llista) es conserva tal com és i no es valida.

Per distingir aquestes files sense fiar-se de la petició, el servidor torna a executar la font de la
llista (el seu valor per defecte o, si no, la seva expressió o consulta) sota la validació del llançament. Una fila
que no ha passat per l'editor passa sense canvis **només si és una de les files que genera
aquesta font**. Qualsevol altra fila, com ara una que s'inventi qui fa una crida REST, es resol i es
valida com una fila editada. Per tant, una fila senzilla no es pot saltar les comprovacions, mentre que les
files no tocades del navegador continuen passant sense canvis.

Un usuari del navegador només ho nota en un cas: les dades de la font han canviat entre que s'ha obert el
formulari i que s'ha llançat (mentrestant s'ha canviat o eliminat una entrada), **i** aquesta fila
incompleix una regla del seu subformulari. Llavors la fila ja no compta com una de les files de la font, de manera que
es valida, i el llançament es rebutja indicant la fila, per exemple
`acls[2].user_or_group (regex)`.

Les files que fallen apareixen a `rowErrors` amb el seu `index` (un camp `yaml` no en té) i al registre com a
`disks[1].size (maxValue)`.

Un llançament pot contenir com a màxim **500 files** sumant tots els nivells de niament, ja que cada fila executa les consultes del seu subformulari.

---

## Marcadors de fila

Els marcadors que una llista posa a les seves files (`insertMarker`, `updateMarker` i `deleteMarker`; sense
`insertMarker`, les files noves reben `__inserted__` quan la llista defineix `allowDelete: false`, un `deleteMarker` o un `updateMarker`)
arriben al playbook en cada fila que en porta un. Una fila eliminada s'envia amb el seu marcador
d'eliminació, perquè el playbook la pugui eliminar. Abans de la 6.4.1, una fila de llista només portava un marcador si el seu
subformulari el declarava com a camp (ocult).
