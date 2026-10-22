---
layout: default
title: Modes
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# Com parla un RTE amb l'aplicació
{: .no_toc }

Sortint, entrant o base de dades: qui obre la connexió, i què hi passa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: des de la 7.3.0 un RTE parla amb l'aplicació per un sol WebSocket i no té cap credencial de base de dades. Tria el mode
que s'adapti a la xarxa que hi ha entre tots dos: qui pot obrir una connexió cap a qui, i per quins proxies i tallafocs passa.

---

## Els tres modes

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) a l'RTE indica com arriba a l'aplicació; el seu runner té el mateix **Mode**:

| Mode | Qui obre la connexió | Què té l'RTE | Per a |
|---|---|---|---|
| `outbound` | L'RTE truca a l'aplicació a [`APP_URL`](../customization/server.html#env_APP_URL) i manté un WebSocket obert | El seu `RTE_TOKEN`, cap credencial de base de dades | Una DMZ, NAT, o una zona que no permet connexions entrants: res no arriba a l'RTE des de fora |
| `inbound` | L'aplicació truca a l'RTE a l'adreça del seu runner i manté un WebSocket obert | El seu `RTE_TOKEN`, cap credencial de base de dades | Una xarxa on la banda central obre totes les connexions, un projecte compose, un pod |
| `database` (obsolet) | L'aplicació crida l'API de l'RTE per HTTP, i l'RTE llegeix i escriu ell mateix la base de dades de l'aplicació | Les credencials de la base de dades (`DB_*`) i `ENCRYPTION_SECRET` | El comportament de la 7.0 a la 7.2, eliminat a la 8.0.0 |

Un RTE sense `RTE_MODE` funciona en mode base de dades durant tota la 7.x, i registra un avís `[DEPRECATED] This RTE runs in database mode` en
arrencar. Un runner afegit abans de la 7.3.0 té el mode **Base de dades (obsolet)**; posa-li el mode en què s'executa el seu RTE quan el migris.

---

## Sortint

L'RTE obre la connexió, així que funciona des d'una xarxa que no accepta cap connexió entrant:

* **El sòcol** : l'RTE truca a `APP_URL` amb `/api/v2/rte/socket` afegit, per `wss://` (`ws://` per a una adreça `http://`), amb el seu
  `RTE_TOKEN` i el nom del seu runner, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). Torna a trucar quan el sòcol cau
* **La primera vegada** : demana unir-se, i el seu runner espera l'aprovació d'un admin a **Connexions > Runners**, connectat
  però sense tasques (vegeu [Demanar unir-se](../runners/registration.html#asking-to-join)). Un token d'unió,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), l'aprova a l'instant. A partir d'aleshores inicia sessió amb el seu propi token
* **La xarxa** : només des de la zona de l'RTE cap a l'aplicació, al port de l'aplicació, a través d'un proxy quan ho indica `HTTPS_PROXY`. Un proxy
  invers davant de l'aplicació ha de deixar passar el WebSocket en aquest camí (vegeu [WebSockets dels runners](../production/reverse-proxy.html#runner-websockets))
* **El certificat** : es comprova el certificat de l'aplicació. Indica una CA privada amb `NODE_EXTRA_CA_CERTS`, o, només dins d'una xarxa
  de confiança, desactiva la comprovació amb [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY)
* **El runner** : no necessita cap adreça, així que la seva credencial RTE només conté el token
* **Preparat** : `/ready` respon `503` fins que el sòcol cap a l'aplicació està obert

Amb diversos nodes d'aplicació darrere d'un balancejador de càrrega, el node al qual arriba l'RTE en té el sòcol. Qualsevol node pot llançar una tasca: el node que té
el sòcol l'envia a l'RTE, en menys de dos segons quan la tasca s'ha llançat en un altre node.

---

## Entrant

L'RTE escolta al seu `PORT`, i l'aplicació hi truca a l'adreça del seu runner, amb `/rte/v1/socket` afegit i el token de l'RTE. Amb
diversos nodes d'aplicació, cada vegada només un té el sòcol de cada runner entrant; quan aquest node s'atura, un altre pren el relleu i hi torna a trucar.

L'aplicació necessita el runner de l'RTE abans de poder-hi trucar: tipus RTE, mode **Entrant**, i una credencial RTE amb l'adreça de l'RTE i el seu
`RTE_TOKEN`. Hi arriba d'una de dues maneres:

| Com | Què cal definir |
|---|---|
| L'RTE demana unir-se | `APP_URL` i [`RTE_URL`](../customization/server.html#env_RTE_URL) (l'adreça a la qual truca l'aplicació). L'RTE fa una sola crida, `POST /api/v2/rte/register`, i el seu runner espera l'aprovació d'un admin: l'aplicació hi truca un cop aprovat (vegeu [Demanar unir-se](../runners/registration.html#asking-to-join)). Amb `RTE_JOIN_TOKEN` s'aprova a l'instant. Un RTE entrant amb `APP_URL` però sense `RTE_URL` es nega a arrencar |
| Afegeixes tu el runner | Sense `APP_URL`: afegeix el runner a **Connexions > Runners**, o a la [llavor de configuració](../seed/), com a [Executar un RTE](run.html#start-it) |

El projecte Docker Compose, el chart de Helm i el controlador de l'instal·lador executen el seu propi RTE d'aquesta manera, entrant, declarat per la llavor.

**Per HTTPS.** Amb [`HTTPS=1`](../customization/server.html#env_HTTPS) l'RTE serveix el seu sòcol per TLS, amb la clau i el certificat
d'[`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) i [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(`key.pem` i `cert.pem` a la seva carpeta `certificates` per defecte). Un RTE amb un `RTE_URL` `https://` envia aquest certificat quan
demana unir-se, i l'aplicació el fixa: només truca a l'RTE quan presenta el mateix certificat, de manera que un d'autosignat funciona sense CA.
L'RTE registra l'empremta del certificat en arrencar (els 8 primers dígits hexadecimals del SHA-256 dels seus bytes DER, com a `abcd-ef12`),
i el diàleg d'aprovació mostra la que ha rebut l'aplicació: comprova que coincideixen abans d'aprovar-lo.
L'[instal·lador](../installation/installer.html#a-runner) configura els seus Runners entrants d'aquesta manera, amb un certificat de la seva pròpia adreça.

---

## Base de dades (obsolet)

L'RTE de la 7.0 a la 7.2: l'aplicació crida la seva API per HTTP, i l'RTE reclama la tasca a la base de dades, hi escriu la sortida i manté al dia la seva
pròpia fila de runner, amb [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [Mode base de dades](./#database-mode-deprecated)
explica en què es diferencien els seus passos. Encara funciona a la 7.x, amb un avís a cada arrencada, i s'elimina a la 8.0.0.

Per passar un RTE d'aquests a un mode de sòcol, conserva el seu runner i el seu token:

1. Un runner de la [llavor de configuració](../seed/): primer defineix-hi `rte_mode: outbound` o `rte_mode: inbound` a la llavor (entrant: amb
   l'adreça a la qual truca l'aplicació a l'`url` de la seva credencial). L'RTE no pot moure ell mateix un runner de la llavor
2. A l'RTE, defineix `RTE_MODE=outbound` amb `APP_URL`, o `RTE_MODE=inbound` (amb `APP_URL` i `RTE_URL` per fer la seva única
   crida de registre), i posa a [`RTE_NAME`](../customization/server.html#env_RTE_NAME) el nom que té el seu runner a
   **Connexions > Runners**. Conserva el seu `RTE_TOKEN`
3. Treu `DB_*` i `ENCRYPTION_SECRET` del seu entorn, i `RTE_REGISTER`, que només llegeix el mode base de dades, i després reinicia'l

Quan l'RTE actualitzat inicia sessió amb el nom del runner i el token propi del runner, l'aplicació passa aquest runner al mode de l'RTE a
l'instant, sense aprovació, i registra *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*. El runner ja no és una fila que el seu RTE ha registrat, de manera que el worker no l'elimina mai quan el contenidor antic deixa de respondre. Un
runner de la llavor de configuració que encara és en mode base de dades es rebutja, en canvi, amb *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*. No facis servir un token d'unió per a això: un token
d'unió es rebutja per a un runner que ja està aprovat. Un RTE entrant sense `APP_URL` no fa cap crida: posa en canvi el **Mode** del seu runner a
**Entrant** a **Connexions > Runners**, i l'aplicació hi truca. L'[instal·lador](../installation/installer.html#a-72-runner)
actualitza un Runner de la 7.2 d'aquesta manera.

---

## Què passa pel sòcol

En tots dos modes de sòcol, l'aplicació envia a l'RTE cada tasca amb tot el que l'RTE llegia abans a la base de dades, i desa el que torna,
la sortida, els esdeveniments, el registre de la tasca i el final, exactament una vegada. L'aplicació també envia les notificacions de final.

**L'spool.** Cada lot de sortida, lot d'esdeveniments, registre, inici i final es numera i s'escriu al fitxer d'spool de la tasca
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) abans d'enviar-se, i es conserva fins que l'aplicació diu que l'ha desat.
Després d'una reconnexió, al mateix node d'aplicació o a un altre, l'RTE torna a enviar el que no s'havia confirmat, i l'aplicació salta el que ja havia
desat: no es perd res, i no es desa res dues vegades. Mantén l'spool en un volum, perquè un RTE que es reinicia encara enviï el que no havia
lliurat. Un playbook que s'estava executant quan l'RTE s'ha reiniciat no pot continuar: la seva tasca acaba com a abandonada.

**Capacitat.** L'RTE executa fins a [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks alhora, o el valor definit
a la seva [pàgina de runner](../runners/runner-page.html#an-rtes-settings), i indica a l'aplicació cada 20 segons quants se n'executen. Una tasca per a un RTE
ple espera, tal com es descriu a [Diversos RTE](several.html#several-jobs-on-one-rte).

**Els fitxers de la tasca.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES), o l'ajust **Fitxers de treball** de la seva pàgina de runner, indica
d'on obté l'RTE els playbooks i els inventaris:

| `RTE_FILES` | D'on vénen els fitxers |
|---|---|
| `transfer` (predeterminat) | L'aplicació envia la carpeta de playbooks i els inventaris amb la tasca, cadascun empaquetat i anomenat amb un hash del seu contingut. L'RTE els conserva empaquetats sota [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH), els darrers utilitzats fins a [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) (1024 MB per defecte), i només demana un hash que no té: una carpeta sense canvis no s'envia mai dues vegades. L'RTE no necessita cap disc compartit ni accés als repositoris |
| `local` | L'RTE s'executa des de les seves pròpies carpetes, com un RTE en mode base de dades: munta-hi els playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) i els repositoris ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) |

Amb `transfer`, cada tasca desempaqueta els seus fitxers en una carpeta privada pròpia, que s'elimina quan la tasca acaba: cap tasca no veu el que una altra
ha escrit, i cap fitxer d'inventari o d'extravars no queda desempaquetat al disc de l'RTE. Els RTE poden compartir un mateix `RTE_CACHE_PATH`; cadascun conserva les seves tasques en
una carpeta pròpia, i els altres eliminen la carpeta d'un RTE que s'ha aturat (mort a mitja tasca, o recreat amb un altre nom de host)
al cap de 10 minuts. Una carpeta més gran que [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 per defecte, la llegeix
l'aplicació i s'aplica sense reiniciar) no s'envia: la tasca falla i diu que cal muntar la carpeta a l'RTE. La carpeta ssh no s'envia mai: l'RTE conserva la seva pròpia
clau privada i el seu `known_hosts` a `/home/node/.ssh`.

**Hosts i tasques.** Des de la 7.3.0, un RTE en qualsevol mode registra els esdeveniments estructurats d'un playbook al costat de la seva sortida de text: cada play, task i
resultat de host, i el resum, escrits pel seu plugin de callback `af_events`. La pàgina de la tasca els mostra a **Hosts i tasques** (vegeu
[Seguir una tasca](../jobs/following.html#hosts-and-tasks)).

---

## Xarxa

Què cal obrir entre l'aplicació, l'RTE i els hosts gestionats, per mode:

| Mode | Des de | Cap a | Port |
|---|---|---|---|
| Sortint | L'RTE | L'aplicació, a `APP_URL` | El port de l'aplicació (`443` darrere de la majoria de proxies) |
| Entrant | Els nodes d'aplicació | L'RTE, a l'adreça del seu runner | El `PORT` de l'RTE (`8000`) |
| Base de dades (obsolet) | L'RTE, i els nodes d'aplicació i el worker | La base de dades, i l'RTE | `3306`, i el `PORT` de l'RTE |
| Tots els modes | L'RTE | Els hosts gestionats | ssh (`22`), WinRM, les seves API |

En un mode de sòcol l'RTE no es connecta mai a la base de dades. La seva API només respon al sòcol i a les sondes: `/live`, `/ready`, `/metrics`.
