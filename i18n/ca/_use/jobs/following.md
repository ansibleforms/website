---
layout: default
title: Seguir una tasca
parent: Tasques
nav_order: 2
translated_from: 31962d9845c3241caca78025476d82f772e9d7a5
---

# Seguir una tasca
{: .no_toc }

Sortida en directe, extravars, filtres i baixades
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Seguir una tasca

En fer clic en una tasca s'obre la seva pàgina: el formulari de la tasca com a títol, les seves accions a la capçalera i la seva sortida a sota.

![La sortida d'una tasca](../assets/screenshots/job-output.jpg)

A partir de la 7.3.0, la pàgina està formada per targetes, i cadascuna es plega sota la seva capçalera:

| Targeta | Què mostra |
|---|---|
| **Resum** | El nom, l'estat i el tipus de la tasca com a capçalera, i les seves dades a sota en una graella de tres columnes (dues, i després una, en una pàgina estreta) |
| **Workflow** | Per a una tasca de workflow, també una tasca de workflow d'AWX o AAP, el seu graf i el seu nombre de nodes (vegeu [El graf del workflow](#the-workflow-graph)) |
| **Sortida** | La sortida de la tasca i la seva barra d'eines |

Una tasca que s'ha executat a AWX, AAP, Ascender, Jenkins, Semaphore o Rundeck hi mostra el seu número com un enllaç a la seva pàgina en aquesta eina, que s'obre
en una pestanya nova. L'enllaç es desa a la tasca, de manera que continua funcionant si més endavant el runner es reanomena o s'elimina.

La pàgina s'actualitza en directe: el servidor envia un esdeveniment cada vegada que es llança una tasca, canvia d'estat, escriu sortida o se
suprimeix, i la pàgina torna a llegir la tasca, de manera que la sortida creix a mesura que la tasca l'escriu. La llista de tasques s'actualitza de la mateixa manera.
**Actualitza** torna a carregar la tasca manualment.

Mentre ets al final de la sortida, la pàgina la segueix cap avall a mesura que arriben línies noves. Desplaça't cap amunt per llegir una línia anterior
i la pàgina es queda on ets: llavors apareix **Ves al més recent** a sobre de la part inferior de la sortida, que es converteix en **Línies noves** quan
n'arriben més. Fes-hi clic, o torna a baixar fins al final, per tornar a seguir les línies noves. La sortida de la pàgina del formulari, després
d'**Envia**, i el [registre del servidor](../production/logs.html) segueixen les seves línies noves de la mateixa manera.

La barra d'eines de la sortida té:

| Botó | Què fa |
|---|---|
| **Mostra les extravars** | Mostra les extravars amb què s'ha executat la tasca en un panell a sobre de la sortida, amb un selector **JSON** / **YAML** i **Copia** |
| **Mostra els artefactes** | Mostra els artefactes de la tasca al mateix panell (vegeu més avall) |
| **Mostra els paràmetres** | Ocupa el lloc de **Mostra les extravars** per a una tasca de Jenkins: els valors amb què s'ha executat, els seus paràmetres de build |
| **Mostra el payload** | Ocupa el lloc de **Mostra les extravars** per a una tasca de Rundeck: el payload que se li ha enviat |
| **Hosts i tasques** | Mostra els hosts i les tasques d'un playbook a sobre de la seva sortida (vegeu [Hosts i tasques](#hosts-and-tasks)) |
| **Actualitza** | Torna a carregar la sortida |
| **Aplica el filtre** | Amaga les tasques el nom de les quals coincideix amb el filtre de sortida; **Treu el filtre** les torna a mostrar |
| **Copia la sortida** | Copia la sortida com a text pla, amb el filtre aplicat o no |
| **Baixa la sortida** | Baixa la sortida com a `ansibleforms-job-<id>.txt` |

**Mostra els artefactes** s'ofereix per a totes les tasques que no són tasques de plantilla, com ara un playbook a l'RTE o un workflow (buit quan
els seus playbooks no han recollit cap artefacte amb `set_stats`), i per a una tasca de plantilla que s'ha executat a AWX, AAP o Ascender. Les tasques de Semaphore, Rundeck
i Jenkins no tenen artefactes, així que no s'ofereix mai per a elles.

A l'esquerra de la barra d'eines, el botó **Replega-ho tot** plega totes les seccions de la sortida (cada play i cada tasca) i es converteix en
**Desplega-ho tot**, que les torna a desplegar.

**Mostra les extravars** requereix l'opció de rol `showExtravars`, i **Mostra els artefactes**, l'opció de rol `showArtifacts` (vegeu
[opcions de rol](../config/roles.html#role-options)). Els valors dels camps de contrasenya i de les claus que coincideixen amb
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) s'emmascaren.

El filtre el defineix [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT), `\[low\]` per
defecte. Posa `[low]` al nom d'una tasca sorollosa, i **Aplica el filtre** amaga aquesta tasca i les seves línies.

La pàgina d'una tasca multipas mostra tots els passos sota la tasca principal, l'un sota l'altre, cadascun sota una barra de títol com ara
**Pas 1 · Prepare the server (id de tasca 98)** amb el seu estat. Fes clic en un títol (o prem Retorn o Espai a sobre) per plegar aquella sortida,
i torna-hi a fer clic per desplegar-la. Els workflows d'AWX/AAP també mostren l'estat dels seus nodes.

Les tasques de [workflow](../workflows/running.html#the-job) guarden la sortida de cada node dins de la seva, sota una capçalera `WORKFLOW NODE` per
node; dibuixen el seu graf en directe, i un clic en un node n'obre la sortida.

---

## Cercar un text a la sortida

A partir de la 7.3.0, la pàgina de la tasca té un quadre de cerca, **Cerca a la sortida**, a la seva línia de títol, a l'esquerra de les accions de la tasca.

Cada lloc on apareix el text a la sortida es ressalta, sense distingir majúscules i minúscules, i la pàgina es desplaça fins al primer. **Retorn** va al
següent, que es mostra més marcat, i la barra d'eines indica quin és de quants (**2 de 4**), o **No trobat**. La cerca primer desplega la sortida i
les seves seccions, i mentre la tasca s'executa també es busca a les línies noves, sense moure la pàgina.

---

## Moure's per una sortida llarga

A partir de la 7.3.0, una sortida llarga, a la pàgina de la tasca i sota un formulari després d'**Envia**, té aquestes maneres de recórrer-la:

| Control | Què fa |
|---|---|
| Capçaleres fixes | La capçalera d'una secció (un node de workflow, el playbook de la tasca, un pas d'una tasca multipas) es queda a dalt mentre les seves línies es desplacen |
| **2 fallides** | Compta les tasques fallides, sense comptar les fallades que s'ha indicat a Ansible que ignori; cada clic va a la següent, desplegada i ressaltada. Sense tasques fallides, **1 error** compta en canvi les línies d'error |
| Números de línia | Cada número de línia enllaça amb la seva línia, com ara `#L45` a l'adreça: obrir aquesta adreça desplaça fins a la línia i la ressalta |
| Botons amunt i avall | Es mostren a la part inferior dreta quan s'ha desplaçat la pàgina, per tornar al principi o anar al final |
| **En execució** i **Avorta** | Mentre la tasca s'executa, la barra de la pàgina del formulari es manté a la part inferior de la finestra, i **Avorta** des d'allà atura la tasca immediatament |

---

## Resultats de les tasques

A partir de la 7.3.0, la línia de resultat d'un host a la sortida d'un playbook obre aquest resultat en un diàleg **Resultat de la tasca**, com fa AWX.

La línia, el cos del resultat que la segueix (`=> { ... }`) i l'error que s'imprimeix abans d'un resultat fallit es ressalten com un sol bloc en passar-hi el ratolí, i un
clic obre el diàleg. Funciona a la pàgina de la tasca i sota un formulari després d'**Envia**, per a un playbook que s'ha executat en un RTE de la 7.3.0 o
posterior, ja que el resultat surt dels mateixos esdeveniments que [Hosts i tasques](#hosts-and-tasks). El diàleg té aquestes pestanyes:

| Pestanya | Què mostra |
|---|---|
| **Detalls** | L'estat, el host, el play, la tasca, el mòdul, l'element del bucle, l'hora d'inici, la durada, el codi de retorn i el missatge |
| **JSON** i **YAML** | Tot el resultat del mòdul, amb colors i amb les línies numerades |
| **Sortida estàndard** i **Error estàndard** | L'`stdout` i l'`stderr` del resultat, quan en té |

A partir de la 7.5.0, el resultat sencer, i amb ell les pestanyes **JSON**, **YAML** i de sortida, es desa sigui quin sigui el nivell de detall
de la tasca, com a AWX; un RTE anterior a la 7.5.0 només el desa en mode detallat. Una tasca amb `no_log` té el resultat censurat per Ansible,
els arguments del mòdul (`invocation`) i les claus pròpies d'Ansible `_ansible*` es deixen fora, els valors de les claus que semblen un secret
s'emmascaren, i un resultat es talla quan supera els 64 KB de JSON.

---

## El graf del workflow

A partir de la 7.3.0, el graf d'un workflow en execució es desplaça per mantenir a la vista el node en curs.

Si allunyes el graf, es queda on l'has deixat, amb un botó **Segueix el node en curs** per tornar-lo a seguir. En passar el ratolí per sobre d'un node
es mostra la seva targeta amb el nom sencer i es destaquen el node i els seus enllaços, amb la resta del graf atenuada. El graf té els botons **Ajusta a la
pantalla** i **Pantalla completa**, i sota un formulari després d'**Envia**, un clic en un node n'obre la sortida com a la pàgina de la tasca.

---

## Hosts i tasques

Des de la 7.3.0, una tasca de playbook que s'ha executat en un RTE de la 7.3.0 o posterior registra els seus esdeveniments estructurats al costat de la seva sortida de text: cada play, tasca
i resultat de host, i el resum final. **Hosts i tasques**, a la barra d'eines de la sortida, els mostra en un panell a sobre de la sortida, a la pàgina de la tasca i
sota un formulari després d'**Envia**. S'ofereix quan la tasca té esdeveniments, i el panell es torna a llegir cada pocs segons mentre la tasca s'executa:

| Vista | Què mostra |
|---|---|
| **Graella** | El resum per host (ok, changed, failed, unreachable, skipped, rescued, ignored), i després una graella d'hosts per tasques: cada cel·la té el color del resultat del host per a aquella tasca, amb el seu missatge i el seu temps en passar-hi el ratolí, o *no executada* |
| **Cronologia** | Cada tasca com una barra, tan llarga com el que ha trigat el seu host més lent, amb el seu temps en segons i el total |

La sortida de text es queda tal com és. Els esdeveniments els escriu el plugin de callback `af_events` propi de l'RTE, de manera que el playbook no necessita cap canvi.
