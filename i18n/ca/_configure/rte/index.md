---
layout: default
title: RTE
nav_order: 11
has_children: true
has_toc: false
permalink: /rte/
translated_from: 75a4facc8ad51d9d74b8fccfd2bbfd7ba48b17f9
---

# Entorns d'execució (RTE)
{: .no_toc }

Què és un RTE, com executa un playbook i què pot tocar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: entén l'RTE abans d'executar-ne un, de dimensionar-lo o de moure'l a una altra xarxa.

| Pàgina | Què hi trobaràs |
|---|---|
| [Imatges](images.html) | Les tres imatges de l'RTE, i com construir la teva pròpia amb les col·leccions que fan servir els teus playbooks |
| [Modes](modes.html) | Sortint, entrant o base de dades: qui obre la connexió, l'spool, els fitxers de la tasca |
| [Executar un RTE](run.html) | Els ajustos de cada mode, i un exemple de `docker run` de cadascun |
| [Diversos RTE](several.html) | Capacitat, rèpliques darrere d'una adreça, i què passa quan un RTE s'atura o mor |
| [Un altre centre de dades](another-datacenter.html) | Un runbook: afegir un RTE en un segon centre de dades, des d'un host buit fins a la seva primera tasca |

---

## Què és un RTE

AnsibleForms 7 no executa cap playbook al contenidor de l'aplicació. La tasca d'un formulari `ansible` es passa a un [runner](../runners.html) de tipus
`rte`, un entorn d'execució: el servidor d'AnsibleForms iniciat amb `AF_ROLE=rte`, al costat de python i ansible, sense interfície
web. Parla amb l'aplicació per un sol WebSocket i no té cap credencial de base de dades
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` o `inbound`, vegeu [Modes](modes.html)): l'aplicació li envia la tasca,
l'RTE executa `ansible-playbook`, i l'aplicació desa la sortida i l'estat final que li torna, d'on els llegeix el navegador.

L'aplicació resol les credencials de la tasca i les passa a l'RTE segellades només per a aquell RTE i aquella tasca. L'RTE mai no llegeix la
taula de credencials ni cap magatzem de secrets, i un playbook no hereta les variables d'entorn pròpies d'AnsibleForms
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` i les altres): passa un valor d'aquests com a extravar o com a credencial. L'RTE de la 7.0 a la 7.2,
que llegia i escrivia ell mateix la base de dades, encara funciona a la 7.x com a mode base de dades obsolet (vegeu [Mode base de dades](#database-mode-deprecated)).

---

## Com s'executa l'RTE

L'RTE és un contenidor que executes tu mateix, al costat de l'aplicació o en una altra xarxa: AnsibleForms mai no en crea cap. Aquí es repassa
on s'executa, què comparteix amb l'aplicació i què hi passa a dins des del moment que es llança un formulari fins que el procés del playbook
desapareix:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">Com executa un playbook l'RTE</title>
<desc id="afr-desc">En un host de contenidors o en un clúster de Kubernetes, tots dos gestionats per l'operador, el contenidor de l'aplicació i un o més contenidors RTE mantenen cadascun un WebSocket entre ells, obert per l'aplicació (entrant) o per l'RTE (sortint). Només l'aplicació parla amb la base de dades. 1: el navegador llança un formulari a l'aplicació. 2: l'aplicació desa la tasca a la base de dades, tria el runner i hi segella els secrets de la tasca. 3: l'aplicació envia la tasca pel sòcol. 4: l'RTE la reclama i obté els fitxers de la tasca, de la seva memòria cau o de l'aplicació. 5: l'RTE inicia ansible-playbook com a procés fill, un per tasca, fins a RTE_MAX_JOBS. 6: el playbook arriba als hosts gestionats. 7: l'RTE escriu la sortida, els esdeveniments i el final al seu spool i els envia pel sòcol; l'aplicació els desa a la base de dades i en confirma la recepció. 8: el navegador segueix la tasca a través de l'aplicació. El volum de l'aplicació només es munta a l'RTE amb RTE_FILES=local.</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">Host de contenidors o clúster de Kubernetes</text>
<text class="afr-s" x="181" y="61">gestionat per tu; un RTE sortint pot ser en una altra xarxa</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Navegador</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">formularis, tasca</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">Contenidor app</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">web, API, worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runners</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">segellen els secrets</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">Hub de l'RTE</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">desa i confirma</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">Contenidor RTE</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="477" y="160" text-anchor="middle">Fitxers de la tasca</text>
<text class="afr-s" x="477" y="174" text-anchor="middle">en memòria cau per hash</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">fins a RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">fins a la confirmació</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">un</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Hosts gestionats</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">Volum de l'app</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbooks, inventaris</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">només RTE_FILES=local</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">només de l'app</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="548" cy="142" r="9"/><text class="afr-nt" x="548" y="146" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

El diagrama mostra un sòcol per RTE, l'obri qui l'obri: l'aplicació truca a un RTE entrant, un RTE sortint truca a l'aplicació (vegeu
[Modes](modes.html)). Un cop obert, hi circulen els mateixos missatges en tots dos sentits, i només l'aplicació llegeix i escriu la base de dades.

**Qui l'inicia.** Un RTE és un contenidor de llarga durada, iniciat pel mateix que executa els teus altres contenidors. Espera tasques i continua
funcionant entre una i una altra:

| Com executes AnsibleForms | Qui inicia l'RTE |
|---|---|
| `docker run` o `podman run` | Tu, amb una ordre com la d'[Executar un RTE](run.html), en qualsevol host que arribi a l'aplicació, o al qual arribi l'aplicació |
| [Docker Compose](../installation/docker-compose.html) | El servei `rte` de `docker-compose.yml`, al costat d'`app` i `mysqldb`. La seva llavor de configuració el declara com el runner predeterminat `rte`, entrant, a `http://rte:8000` |
| [Chart de Helm](../installation/kubernetes.html) | Kubernetes, com un segon contenidor anomenat `rte` al pod de l'aplicació (`containers.rte`). L'aplicació hi truca a `127.0.0.1`, entrant, i la llavor del chart el declara com el runner predeterminat |
| [L'instal·lador](../installation/installer.html) | Docker Compose o el chart de Helm com més amunt, o un servei systemd [sense contenidors](../installation/native.html); un Runner propi, que demana unir-se i espera l'aprovació d'un admin |

El motor de contenidors és teu: Docker o Podman a l'amfitrió, o el runtime de contenidors del teu clúster de Kubernetes, instal·lat i mantingut
al dia per tu. AnsibleForms mai no hi parla. Ni l'aplicació ni l'RTE criden Docker o Podman, en munten el sòcol o inicien cap
contenidor: l'aplicació només parla amb l'RTE pel seu sòcol.

**Què hi ha a dins.** Un contenidor, amb el que cal per executar un playbook i res més:

* **El servidor** : el mateix servidor Node.js que l'aplicació, iniciat amb `AF_ROLE=rte` (definit a la imatge) sota `tini`
* **El que queda fora** : la interfície web, l'inici de sessió, el planificador, el worker i tots els mòduls de base de dades, que aquest rol no carrega
* **On escolta** : al seu `PORT` (`8000`): `/live` i `/ready` per a les sondes i `/metrics` per a Prometheus, i en mode entrant el sòcol
  al qual truca l'aplicació, `/rte/v1/socket`. Un RTE sortint no accepta cap connexió de l'aplicació
* **Python i ansible** : els aporta la capa d'imatge que triïs (vegeu [Les imatges de l'RTE](images.html))
* **L'usuari** : el servidor i tots els playbooks s'executen com a `node` (uid 1000), mai com a root

**Què comparteix amb l'aplicació.** El seu token, i amb `RTE_FILES=local` els fitxers de l'aplicació. Amb `RTE_FILES=transfer`, el predeterminat, els
playbooks i els inventaris arriben amb cada tasca, i l'RTE no necessita cap disc compartit:

| Compartit amb l'aplicació | Què en fa l'RTE |
|---|---|
| `RTE_TOKEN` | El presenta quan truca a l'aplicació (sortint), o el comprova quan l'aplicació li truca (entrant). L'aplicació té el mateix valor a la credencial RTE del runner, i els secrets de la tasca es segellen amb ell |
| El volum persistent, `/app/dist/persistent`, només amb `RTE_FILES=local` | La carpeta de playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), o el repositori de playbooks que el worker ha clonat sota [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), els inventaris ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) i els repositoris d'inventari) i els fitxers pujats. L'RTE escriu els fitxers d'extravars de la tasca a la carpeta del playbook, així que munta-la en lectura i escriptura |
| La carpeta ssh, `/home/node/.ssh` | La clau privada i el `known_hosts` que fan servir les connexions ssh del playbook: munta la de l'aplicació, gestionada a les seves pàgines de configuració, o dona a l'RTE la seva pròpia |

L'RTE no clona res: un repositori li arriba als fitxers d'una tasca, o al volum que comparteix amb l'aplicació. Les col·leccions, els rols i
`ansible.cfg` vénen de la imatge, de les carpetes `/etc/ansible/collections`, `/etc/ansible/roles` i `/etc/ansible/ansible.cfg` quan
les hi muntes (el projecte Docker Compose ho fa), o d'un `ansible.cfg` al costat dels playbooks.

**La vida d'una tasca.** Els números de sota són els del diagrama, per a un formulari de playbook llançat des del navegador o l'API:

1. **Llançament** : l'aplicació comprova el formulari i els seus valors, construeix les extravars i desa la tasca amb l'estat `running`. Un formulari amb una
   [aprovació](../forms/approval.html) s'atura aquí fins que un aprovador l'accepta, i abans no arriba a cap RTE
2. **Tria del runner** : l'aplicació pren l'RTE que el formulari nomena amb `runner: <name>`, o si no el runner predeterminat de tipus RTE, i en desa el
   nom a la tasca. Resol les credencials de la tasca a partir de la base de dades o d'un [magatzem de secrets](../secret-stores/), el seu accés d'ansible i la seva
   contrasenya de vault, i les segella amb AES-256-GCM sota una clau derivada del token d'aquell runner i de l'id de la tasca
3. **Lliurament** : el node d'aplicació que té el sòcol de l'RTE li envia la tasca: les extravars, les opcions del formulari, els secrets segellats i
   els hashes dels fitxers de la tasca. Qualsevol node d'aplicació pot llançar la tasca; el que té el sòcol l'envia en menys de dos segons. Un RTE ple,
   o un que no està connectat, fa esperar la tasca, fins a [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Reclamació** : l'RTE respon `claimed`, o `refused` quan està ple, s'està aturant, no pot obrir els secrets, o la tasca arriba amb un altre
   [contracte](images.html#the-contract) que el seu. Amb `RTE_FILES=transfer` pren els playbooks i els inventaris de la seva
   memòria cau pel seu hash, demana a l'aplicació un hash que no té, i els desempaqueta en una carpeta pròpia de la tasca
5. **Inici** : a la carpeta del playbook (més el `playbookSubPath` del formulari, que ha d'existir) escriu dos fitxers: `extravars_<id>.json`
   amb els valors del formulari i les credencials, i un d'ocult amb l'accés d'ansible. Després inicia `ansible-playbook` com a procés fill
   seu, sense shell, en un grup de processos propi, amb `-e @` aquests fitxers, un `-i` per inventari, i els tags, el limit, el check, el
   diff i la verbositat del formulari. La contrasenya de vault entra per stdin, mai en un fitxer ni a la línia d'ordres, i el procés s'executa com a
   `node` amb un entorn filtrat (vegeu més avall)
6. **Execució** : el playbook es connecta als hosts gestionats des del contenidor de l'RTE, per ssh amb la clau i el `known_hosts` de
   `/home/node/.ssh`, amb `sshpass` per a un accés amb contrasenya, o per les API que criden els seus mòduls. És l'RTE, no l'aplicació, qui hi ha d'arribar
7. **Sortida i final** : l'RTE agrupa stdout i stderr cada mig segon o cada 64 KB, amb les credencials emmascarades, i numera cada
   lot. Escriu cada element a l'spool de la tasca al seu disc abans d'enviar-lo: la sortida, els esdeveniments, el registre de la tasca de
   `.joblogs/job_log_<id>.log` (cada 2 segons), l'inici i el final amb l'estat final (`success`, `failed` o `aborted`). L'aplicació
   desa cada element una sola vegada i en confirma la recepció, i l'RTE descarta l'spool un cop desat el final. Passats
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) bytes en un flux (50 MB per defecte) ja no n'envia més, i
   el playbook continua. L'aplicació envia llavors les [notificacions](../forms/notifications.html) del formulari
8. **Seguiment** : el navegador mai no parla amb l'RTE: la pàgina del formulari torna a llegir la tasca a través de l'aplicació cada 2 segons, i la pàgina Tasques
   la segueix en directe a mesura que l'aplicació desa cada element

**Un sòcol que cau.** El playbook continua. L'RTE torna a trucar (sortint), o un node d'aplicació hi torna a trucar (entrant), i torna a enviar el que
l'aplicació no havia confirmat: l'aplicació salta el que ja havia desat, de manera que no es perd ni es desa dues vegades cap línia. Això val mentre el sòcol
torni en menys de dos minuts: l'aplicació escriu el heartbeat de l'RTE només mentre el seu sòcol està obert, i quan aquest heartbeat té dos minuts
el worker acaba les tasques en execució de l'RTE com a abandonades, encara que els seus playbooks continuïn funcionant. Mantén l'spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) en un volum, perquè un RTE reiniciat encara enviï el que havia conservat. Un
playbook que s'estava executant quan el seu RTE s'ha reiniciat no pot continuar: l'aplicació n'acaba la tasca com a abandonada quan l'RTE torna sense ell.

**Avortament.** Un avortament activa l'indicador d'avortament de la tasca, i el node d'aplicació que té el sòcol de l'RTE envia `cancel` en menys de dos segons. L'RTE
envia `SIGTERM` al grup de processos del playbook, de manera que `ansible-playbook` i tots els forks que ha iniciat s'aturen alhora, i la tasca acaba
`aborted`. Una cancel·lació que arriba abans que la seva tasca es conserva durant un minut, i llavors la tasca comença avortada.

**Neteja.** Tan bon punt el procés acaba, sigui quin sigui el resultat, l'RTE elimina els dos fitxers d'extravars (un formulari amb `keepExtravars`
conserva el visible, mai l'ocult), el fitxer d'artefactes de `/tmp`, el fitxer de registre de la tasca i la carpeta de fitxers pròpia de la tasca. El
final es desa una sola vegada: un segon escriptor, com ara l'aplicació fent fallar una tasca que l'RTE ja ha acabat, no canvia res.

**Un procés per tasca, no un contenidor per tasca.** AWX i AAP inicien un pod o un contenidor nou a partir d'una imatge d'execution environment per a
cada tasca. AnsibleForms no inicia res: el contenidor de l'RTE ja està en marxa, i cada tasca és un procés fill a dins seu. Una tasca comença
sense descarregar cap imatge ni planificar cap pod, i AnsibleForms no necessita cap permís sobre el teu motor de contenidors o el teu clúster. A canvi, els
playbooks que s'executen en un RTE en comparteixen la CPU, la memòria, `/tmp`, la carpeta personal i python: dona al contenidor prou recursos per a
`RTE_MAX_JOBS` playbooks amb els seus forks. Per canviar el que pot fer servir un playbook, canvia la imatge, no la tasca.

---

## El límit de seguretat

L'RTE executa codi que han escrit els autors dels formularis, així que està fet per contenir tan poc com sigui possible:

* **Només el seu token** : l'RTE no té cap credencial de base de dades ni cap `ENCRYPTION_SECRET`. No accepta cap crida tret del sòcol de l'aplicació, amb
  el seu token, i no té usuaris, ni inici de sessió, ni pàgines web. Pel sòcol només pot executar les tasques que li envia l'aplicació, informar-ne i
  demanar-ne els fitxers: no pot crear cap tasca, llegir-ne una altra ni repartir credencials
* **Secrets segellats** : per executar una tasca, l'RTE mai no llegeix la taula de credencials ni cap magatzem de secrets. Rep els secrets de les tasques que
  executa, segellats només per al seu token i aquell id de tasca, de manera que un paquet pensat per a un altre RTE o una altra tasca no s'obre, i un byte canviat
  es rebutja
* **Una connexió comprovada** : en mode sortint, l'RTE comprova el certificat de l'aplicació. En mode entrant per HTTPS, l'aplicació fixa el certificat propi de l'RTE
  quan s'uneix, i només hi truca quan presenta aquest certificat (vegeu [Modes](modes.html#inbound)). Un RTE entrant per HTTP sense xifrar ha de ser
  en una xarxa privada, com la del projecte Docker Compose
* **Cap entorn heretat** : `ansible-playbook` rep l'entorn de l'RTE sense cap de les variables que llegeix el mateix AnsibleForms
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, les `MYSQL_*` i les altres), de manera que
  `lookup('env', ...)` no hi pot arribar. El que defineixis per als playbooks (`PATH`, proxies, `ANSIBLE_*`) passa tal com és
* **Cap plantilla dels usuaris** : {% raw %}un valor de formulari que conté `{{`, `{%` o `{#` arriba al playbook com a cadena unsafe{% endraw %}
  que ansible mai no processa com a plantilla, tret que el formulari defineixi `allowJinjaInExtravars`, i cap shell no executa mai la línia d'ordres
* **No root** : l'RTE i els seus playbooks s'executen com a `node` (uid 1000), de manera que un playbook pot fer el que pot fer aquest usuari al contenidor, com ara
  llegir-ne els fitxers i la clau ssh, i res més

Tracta el seu contenidor, la seva imatge i el seu entorn amb la mateixa cura que els de l'aplicació.

---

## Mode base de dades (obsolet)

L'RTE de la 7.0 a la 7.2, sense `RTE_MODE`, funciona durant tota la 7.x i s'elimina a la 8.0.0. Es diferencia dels passos de més amunt en quatre punts:

* **Té la base de dades** : els seus ajustos `DB_*`, i `ENCRYPTION_SECRET` quan es registra ell mateix
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **El lliurament és una crida HTTP** : l'aplicació crida `POST <address>/rte/v1/jobs` amb el token i els secrets segellats, i l'RTE reclama
  la tasca escrivint-hi el seu nom a la base de dades (passos 3 i 4)
* **Escriu ell mateix la sortida** : a la base de dades, per lots, sense spool (pas 7). Un avortament li arriba per l'indicador d'avortament de la tasca,
  que llegeix cada 2 segons, i per una crida `/cancel`
* **Llegeix els fitxers del volum de l'aplicació** : necessita el mateix disc que l'aplicació, com amb `RTE_FILES=local`

La seva pàgina de runner no té cap dels [ajustos de l'RTE](../runners/runner-page.html#an-rtes-settings): llegeix les seves pròpies variables. Per passar-lo a un
mode de sòcol, vegeu [Modes](modes.html#database-deprecated).
