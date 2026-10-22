---
layout: default
title: "La pàgina d'un runner"
parent: Runners
nav_order: 4
translated_from: 4260f9b8ce60f26e8808cf17bf4a4c3993229c5d
---

# La pàgina d'un runner
{: .no_toc }

Les pestanyes d'un runner, el mode, la connexió i la configuració d'un RTE, i Prova la connexió
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pestanyes

La pàgina d'un runner mostra els passos del seu diàleg com a pestanyes, més el que s'hi executa:

| Pestanya | Què conté |
|---|---|
| Detalls | El nom i la descripció, l'interruptor **És el predeterminat** i l'interruptor **Activat**, iguals per a tots els tipus de runner |
| Tipus | El producte, com al diàleg. Per a un RTE també el seu **Mode**: **Base de dades (obsolet)**, **Entrant** o **Sortint**, l'`RTE_MODE` amb què s'executa el seu RTE (vegeu [Modes](../rte/modes.html)) |
| RTE | Només per a un RTE: el seu **Mode** en paraules i, en un mode de sòcol, la seva **Connexió** i la seva configuració (vegeu [La configuració d'un RTE](#an-rtes-settings)) |
| Credencials | La **Credencial** amb què inicia sessió, una credencial de Connexions > Credencials del tipus del runner, que conté el seu token o accés i l'adreça del seu servidor. La d'un RTE conté el seu `RTE_TOKEN`, i l'adreça de l'RTE tret que sigui sortint. **Projecte** per a Semaphore, Rundeck i Jenkins |
| Formularis | Els formularis que s'hi executen, i com: **El nomena** o **Com a runner per defecte**. Una fila obre el formulari |
| Tasques | Les 100 darreres tasques que s'hi han executat, amb el seu estat, inici, final i durada. Una fila obre la tasca |

Cada pestanya té la seva pròpia adreça, com ara `/settings/runners/<id>/rte`, de manera que un enllaç o una adreça d'interès l'obre. Un runner sense aquesta pestanya s'obre a
Detalls.

Els dos interruptors de la pestanya Detalls es desen a l'instant. **És el predeterminat** fa que el runner sigui el predeterminat del seu tipus; es desactiva fent
que un altre runner sigui el predeterminat. **Activat** activa o desactiva el runner: desactivat, no hi va cap tasca, tampoc com a predeterminat del seu tipus (vegeu
[Predeterminat i Activat](list.html#default-and-enabled)).

Un RTE que ha demanat unir-se s'obre amb un requadre groc, **Aquest RTE ha demanat unir-se**, amb la seva empremta i el que ha dit de si mateix, i
**Aprova** i **Rebutja** (vegeu [Aprovar un RTE](registration.html#approving-an-rte)). Un runner de la [llavor de configuració](../seed/) ho indica
a la part superior de la seva pàgina, i és només de lectura.

---

## La configuració d'un RTE

La pestanya RTE gestiona un RTE des de l'aplicació, sense editar-ne l'entorn a la màquina on s'executa.

**Connexió.** Un RTE en un mode de sòcol mostra una insígnia: **Connectat** o **No connectat**. En passar-hi el punter, **Connectat** mostra el node d'aplicació
que té el seu sòcol, la versió de l'RTE, i quantes de les seves tasques s'executen. **No connectat** vol dir que cap node d'aplicació no hi té un sòcol:
comprova que l'RTE s'executa, la seva adreça o `APP_URL`, i el seu token.

**Configuració.** Un RTE en mode sortint o entrant té quatre ajustos, cadascun buit per defecte:

| Ajust | El mateix que | Què fa |
|---|---|---|
| Màxim de treballs simultanis | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Quants playbooks executa alhora, `10` per defecte; `0` no posa cap límit |
| Memòria cau de fitxers | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Quant dels fitxers de tasca que li ha enviat l'aplicació conserva, en MB, `1024` per defecte; `0` no en conserva cap |
| Temps d'espera en aturar | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Quant de temps espera un RTE que s'atura els seus playbooks en execució, `25` segons per defecte |
| Fitxers de treball | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Transferència**: l'aplicació envia els fitxers d'una tasca amb la tasca. **Local**: s'executa des de les seves pròpies carpetes muntades |

**Quin valor guanya.** Un valor a la pàgina guanya a la mateixa variable definida a l'RTE. Un camp deixat buit fa servir la variable pròpia de l'RTE,
o si no el valor predeterminat. Sota cada camp la pàgina indica quin: **Substitueix RTE_MAX_JOBS definida a l'RTE (3).**, o **Buit: l'RTE fa servir la seva
RTE_MAX_JOBS, 3.**; el text indicatiu mostra el valor que representa un camp buit.

**Com arriben a l'RTE.** Els ajustos es desen amb el runner a la base de dades de l'aplicació. L'aplicació els envia pel sòcol de l'RTE
quan es connecta i cada vegada que es desen, i l'RTE els aplica a l'instant: una memòria cau més petita es retalla, un límit nou compta a partir de la
tasca següent. L'RTE només els conserva a la memòria i no escriu cap fitxer: després d'un reinici els torna a rebre en connectar-se, abans de la seva primera tasca.

Un RTE en mode base de dades (obsolet) no té sòcol: llegeix aquests ajustos de les seves pròpies variables, i la pestanya ho indica.

---

## Prova la connexió

Els botons de dalt a la dreta actuen sobre el runner tal com està desat.

Al costat de **Desa** hi ha **Prova la connexió** i **Suprimeix**, i a la pestanya Credencials **Afegeix una credencial**, que crea una credencial del
tipus del runner i la tria. Un token o una contrasenya no es tornen a mostrar mai un cop desats: canvia'ls a la credencial.

**Prova la connexió** comprova que el runner respon i que accepta el seu token o accés, i ho indica en un missatge: **Runner connection is
OK**, o per què ha fallat. No executa cap tasca. Per a un RTE també comprova el contracte que parla l'RTE (vegeu
[El contracte](../rte/images.html#the-contract)):

| RTE | Què llegeix la prova | Quan falla |
|---|---|---|
| Sortint o Entrant | Qui té el seu sòcol, tal com ho registra cada node d'aplicació, i el que ha dit l'RTE quan s'ha connectat. No crida res | Cap node d'aplicació no hi té un sòcol: *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, o per a un d'entrant, *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. O l'RTE parla un altre contracte que no és el 3 |
| Base de dades (obsolet) | El `/rte/v1/health` de l'RTE, cridat amb el seu token | L'RTE no respon a la seva adreça, rebutja el token, o parla un altre contracte que no és el 2 |

La insígnia de **Connexió** de la pestanya RTE mostra el mateix estat del sòcol sense cap prova.

