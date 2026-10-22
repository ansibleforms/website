---
layout: default
title: Instal·lador
parent: Instal·lació
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# L'instal·lador
{: .no_toc }

Instal·la, actualitza i manté AnsibleForms en un servidor Linux, amb una sola ordre
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: la manera més ràpida de tenir una instància en marxa, o un Runner per a un AnsibleForms instal·lat en un altre lloc. Des de la 7.3.0.

---

## Què instal·la

L'instal·lador fa unes quantes preguntes en un assistent a pantalla completa, mostra totes les respostes perquè les revisis, i només aleshores canvia el servidor.
Instal·la un de dos rols, en un de quatre motors:

| Rol | Què és |
|---|---|
| Controlador | L'aplicació completa: la interfície web, la seva base de dades i el seu propi Runner. Tria aquest per a una primera instal·lació |
| Runner | Un RTE que executa els playbooks d'un AnsibleForms instal·lat en un altre lloc, com ara en una altra xarxa, una DMZ o un altre centre de dades. Parla amb AnsibleForms a través d'un sol WebSocket i no té credencials de la base de dades |

Els motors on els instal·la:

| Motor | Com s'executa |
|---|---|
| Docker | El [projecte de Docker Compose](docker-compose.html), a Docker Engine amb el seu plugin compose. Els contenidors es reinicien juntament amb Docker |
| Podman | El mateix projecte a Podman, rootless o com a root, amb podman-compose. Una unitat de systemd inicia els contenidors en arrencar |
| Kubernetes | El [chart de Helm](kubernetes.html), al clúster on arriba `kubectl`. Un controlador se serveix darrere d'un ingress; un Runner fa servir el mode runner del chart |
| Directament en aquest servidor | Sense contenidors: Node.js, MariaDB i Ansible al servidor, i AnsibleForms com a serveis de systemd. Consulta [Instal·lació nativa](native.html) |

Després de la instal·lació, el mateix programa actualitza la instal·lació, en fa còpies de seguretat, en mostra l'estat i l'elimina. També es fa càrrec d'un
AnsibleForms que no ha instal·lat ell, com ara un configurat a mà a partir del projecte de Docker Compose (consulta [Una instal·lació existent](#an-existing-installation)).

---

## Executar-lo

L'script d'instal·lació baixa l'instal·lador per a aquest servidor i l'inicia:

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Les variants habituals: com a root, per instal·lar Docker o Podman, per instal·lar directament al servidor o sota `/opt`; amb una ordre o
amb opcions (consulta [Opcions](#flags)); i un instal·lador d'una versió concreta en lloc de la més recent:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

L'script:

1. Comprova que el servidor executa Linux en amd64 o arm64, i troba `curl` o `wget` i `sha256sum`
2. Baixa `ansibleforms-installer_linux_<arch>` de la darrera versió de
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases), o de la versió que indica `AF_INSTALLER_VERSION`
3. El comprova amb el `checksums.txt` de la versió, i no fa servir cap baixada amb un checksum diferent
4. El conserva com a `ansibleforms-installer`, a `/usr/local/bin` per a root i a `~/.local/bin` altrament, per a les actualitzacions i les còpies de seguretat posteriors.
   Amb sudo, executa'l amb la ruta completa: el `secure_path` de sudo, com als sistemes Red Hat, sovint no inclou `/usr/local/bin`
5. L'inicia amb les opcions donades, llegint el teclat des del terminal encara que l'script hagi arribat a través d'una canonada

Sense terminal, com ara en una tasca de CI, l'instal·lador s'executa de manera desatesa (consulta [Desatès](#unattended)).

---

## L'assistent

L'assistent fa una pregunta cada vegada, amb els passos llistats a l'esquerra. **Esc** torna al pas anterior, i en conserva la resposta:

| Pas | Què pregunta |
|---|---|
| Idioma | L'idioma de l'instal·lador, per defecte el de la configuració regional d'aquest servidor: català, alemany, anglès, espanyol, francès, italià, japonès, neerlandès, polonès, portuguès o xinès. Es pregunta el primer, abans que l'instal·lador digui res d'una instal·lació que hagi trobat |
| Novetats | El que hi ha de nou a la versió que instal·la, amb primer els canvis incompatibles, les eliminacions i les funcions obsoletes |
| Rol | Controlador o Runner |
| Motor | Docker, Podman, Kubernetes, o directament en aquest servidor |
| Carpeta | La carpeta d'instal·lació i el nom de la instància |
| Unió, Aplicació, Mode | Només un Runner: consulta [Un Runner](#a-runner). A Kubernetes no es pregunta el mode |
| Xarxa | El port de la interfície web, o del Runner. No a Kubernetes |
| HTTPS | Com es connecten els navegadors a un controlador |
| Admin | La contrasenya del primer administrador, escrita dues vegades |
| Clúster, Ingress, Emmagatzematge | Només Kubernetes: el namespace i la release, l'ingress (un controlador), la classe d'emmagatzematge |
| Revisió | Totes les respostes: **Instal·la**, o **Canvia les respostes** |

**Motor.** La llista mostra el que té aquest servidor. Un motor que hi falta s'ofereix com a *Docker (no instal·lat: l'instal·lador l'instal·la)*
o el mateix per a Podman: quan ho confirmes, l'instal·lador instal·la Docker amb l'script del mateix Docker (`get.docker.com`, amb el plugin compose
inclòs) o Podman amb podman-compose des dels paquets de la distribució. Això necessita root. Kubernetes s'ofereix quan `kubectl` i
`helm` estan instal·lats i arriben a un clúster. *Directament en aquest servidor* necessita root i un Linux compatible, i diu per què quan apareix en gris.

**Carpeta.** Els valors predeterminats:

| | Controlador | Runner |
|---|---|---|
| Carpeta, com a root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Carpeta, com a un altre usuari | `~/ansibleforms` | `~/ansibleforms-runner` |
| Nom de la instància, Docker o Podman | `af` | `runner` |
| Nom de la instància, nativa | `ansibleforms` | `ansibleforms-runner` |

Amb Docker o Podman, la carpeta conté el fitxer compose i el seu `.env` amb els secrets, i totes les dades: base de dades, formularis, playbooks
i registres. Ha d'estar buida. El nom de la instància, en minúscules, dígits i `-`, és el prefix dels contenidors (`af_app`, `af_db`, `af_rte`), així que diverses
instàncies poden compartir un servidor. El nom de la instància d'un Runner també és el nom del seu runner a **Connexions > Runners** (`RTE_NAME`).

**Xarxa.** La interfície web d'un controlador escolta al `443`, o al següent port lliure. **HTTPS** ofereix aleshores:

| Opció | Què fa |
|---|---|
| HTTPS amb un certificat autosignat creat per a aquest servidor | Un certificat per als noms d'aquest servidor, vàlid durant deu anys. Els navegadors et demanen que l'acceptis una vegada |
| HTTPS amb el meu propi certificat i clau | El teu propi certificat i clau, en format PEM, de la teva CA o de Let's Encrypt |
| HTTP, amb HTTPS gestionat per un servidor intermediari invers | HTTP sense xifrar al port, per a nginx, Traefik o un balancejador de càrrega que gestioni HTTPS |

**Admin.** La contrasenya de l'usuari `admin`, escrita dues vegades perquè un error tipogràfic no et deixi fora. Si es deixa buida, l'instal·lador en genera
una de robusta.

**El final.** L'instal·lador genera la contrasenya de la base de dades i els secrets, inicia AnsibleForms i espera que respongui. Després
mostra l'adreça que cal obrir, l'usuari i la contrasenya, i la carpeta. Els Runners instal·lats per a ell demanen unir-s'hi, i un administrador els aprova
a **Connexions > Runners** (consulta [Un Runner](#a-runner)).

---

## Un Runner

Un Runner és un RTE per a un AnsibleForms que s'executa en un altre lloc, amb la versió 7.3.0 o posterior. No té credencials de la base de dades: s'autentica
amb un token propi, que AnsibleForms guarda en una credencial d'RTE (consulta [Modes](../rte/modes.html)). Després de la carpeta, l'assistent
pregunta tres coses més:

| Pas | Què pregunta |
|---|---|
| Aplicació | L'adreça de l'AnsibleForms per al qual treballa aquest Runner, la que la gent obre en un navegador |
| Mode | **Sortint: el Runner es connecta a AnsibleForms** (el predeterminat), o **Entrant: AnsibleForms es connecta al Runner** |
| Xarxa | El port del Runner, `8000` per defecte. En sortint, només hi escolten les comprovacions de salut, accessibles només des d'aquest servidor. En entrant, també l'adreça d'aquest servidor tal com hi arriba AnsibleForms |

`--role runner` se salta la pregunta del rol, així que aquesta ordre, executada al servidor del Runner, comença amb les preguntes d'un Runner:

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

Després l'instal·lador es connecta a AnsibleForms. Un certificat autosignat, o un d'una CA privada, pregunta **Voleu confiar en aquest certificat?**:
sí defineix [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) al Runner. Llegeix la versió que executa AnsibleForms,
en rebutja una anterior a la 7.3.0, i instal·la el Runner amb aquesta mateixa versió, sigui quina sigui la versió que instal·laria el mateix instal·lador.

Tria sortint per a una DMZ, NAT o una zona que no permet connexions entrants: només trànsit d'aquest servidor cap a AnsibleForms, al seu
port. Tria entrant per a xarxes on el costat central obre totes les connexions.

La revisió mostra **Registre: demana aprovació**, o **sol, amb un token d'unió** quan `--join` n'ha donat un. Al final l'instal·lador
mostra el nom del Runner, el seu mode, l'aplicació i, en entrant, la seva adreça, i després diu que ha demanat unir-se a AnsibleForms: aprova'l a
**Connexions > Runners**, després de comprovar que l'empremta que s'hi mostra és la que imprimeix:

```
Fingerprint: abcd-ef12
```

L'empremta són els primers 8 dígits hexadecimals del SHA-256 del token del Runner, `RTE_TOKEN`, que es guarda al fitxer
`.env` de la carpeta (`rte.env` per a una [instal·lació nativa](native.html)). Consulta [Aprovar un RTE](../runners/registration.html#approving-an-rte). Amb `--join`, el Runner s'aprova a l'instant:
s'ha registrat ell mateix, i apareix com a connectat a **Connexions > Runners**.

Un Runner entrant serveix el seu socket per HTTPS. L'instal·lador crea un certificat autosignat per a l'adreça per on hi arriba AnsibleForms,
vàlid durant deu anys, a `data/certificates` de la carpeta, i defineix `RTE_URL` com a `https://<address>:<port>`.
El Runner envia el certificat quan demana unir-se, i AnsibleForms el fixa: només truca a aquell Runner quan presenta
aquest mateix certificat, així que no cal cap CA. L'instal·lador imprimeix l'empremta del certificat sota la del token:

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

Són els primers 8 dígits hexadecimals del SHA-256 dels bytes DER del certificat, com a `xxxx-xxxx`. Abans d'aprovar el Runner,
comprova que el diàleg d'aprovació mostra la mateixa empremta del certificat. Un Runner registrat amb `--join` també la imprimeix.

A Kubernetes, un Runner és el mode runner del chart de Helm, i sempre és sortint: l'assistent no pregunta ni el mode ni la xarxa, ja que res
no hi arriba des de fora (consulta [Kubernetes](#kubernetes)).

---

## Kubernetes

Per a un controlador a Kubernetes, l'instal·lador instal·la el [chart de Helm](kubernetes.html) al clúster on arriba `kubectl`:

| Pregunta | Valor predeterminat |
|---|---|
| Namespace | `ansibleforms` |
| Nom de la release de Helm | `ansibleforms` |
| Nom d'amfitrió servit per l'ingress | Cap: obligatori, per exemple `ansibleforms.example.com` |
| Classe d'ingress | Una de les del clúster, `nginx` per defecte |
| Voleu servir-lo per HTTPS (amb el certificat de l'ingress)? | Sí |
| Classe d'emmagatzematge per als volums | La predeterminada del clúster |

La contrasenya de l'administrador és al Secret `<release>-secrets` d'aquest namespace, amb la clau `ADMIN_PASSWORD`. L'instal·lador guarda els
values del chart en un fitxer al costat del seu fitxer d'estat, `<release>-values.yaml`, i el torna a aplicar en les actualitzacions; `--values` hi afegeix un fitxer propi. El chart d'una versió es publica poc després d'ella.

Per a un Runner, l'instal·lador instal·la el mateix chart en el seu [mode runner](kubernetes.html#a-runner-on-kubernetes) (`runner.enabled`): un RTE
sol, sense aplicació, sense base de dades i sense ingress, que truca a AnsibleForms (sortint). Després de l'adreça de l'aplicació, l'assistent pregunta:

| Pregunta | Valor predeterminat |
|---|---|
| Namespace | `ansibleforms` |
| Nom de la release de Helm | `ansibleforms-runner`, que també és el nom del seu runner a **Connexions > Runners** |
| Classe d'emmagatzematge per als volums | La predeterminada del clúster |

L'instal·lador crea el token del Runner i defineix l'adreça de l'aplicació, el nom del runner i, quan confies en el certificat de l'aplicació,
`runner.appTlsVerify: false`. Amb `--join`, el token d'unió aprova el Runner a l'instant; sense, el Runner demana unir-se, i
l'instal·lador n'imprimeix l'empremta perquè la comprovis abans d'aprovar-lo a **Connexions > Runners**.

---

## Ordres

L'instal·lador accepta una ordre, abans o després de les opcions. Sense cap ordre, instal·la:

| Ordre | Què fa |
|---|---|
| `install` | Instal·la AnsibleForms, com a controlador o com a Runner (el predeterminat). En un servidor que ja té una instal·lació, la seva o una que troba, ofereix actualitzar-la |
| `upgrade` | Actualitza a una versió més nova, mostrant-ne primer les novetats (consulta [Actualitzar](#upgrade)) |
| `status` | Mostra la instal·lació (el seu rol, motor i versió) i els seus contenidors, pods o serveis, i si respon. Després llista qualsevol altre AnsibleForms que trobi al servidor |
| `backup` | Fa ara una còpia de seguretat de la base de dades, a `installer-backups` dins la carpeta d'instal·lació (a Kubernetes, `backups` al costat del fitxer d'estat de l'instal·lador). Un Runner no té dades de què fer còpia |
| `release-notes` | Mostra les novetats d'una versió, `--version` o la d'aquest instal·lador, amb primer els canvis incompatibles |
| `uninstall` | Elimina la instal·lació, i amb `--purge` les seves dades |
| `version` | Imprimeix la versió de l'instal·lador |

L'instal·lador recorda la instal·lació a `/etc/ansibleforms/installer.json` per a root, o a `~/.config/ansibleforms/installer.json`
per a un altre usuari, així que les ordres posteriors a `install` no necessiten opcions i troben la instal·lació tot soles. Aquesta carpeta no conté cap binari,
i només existeix un cop l'instal·lador ha instal·lat un AnsibleForms o se n'ha fet càrrec d'un:

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` pregunta **Suprimir també les dades (base de dades, formularis, playbooks, logs)?**. Per suprimir-les, escriu el nom de la instància (la release de Helm
a Kubernetes); altrament elimina els contenidors, els pods o els serveis i conserva les dades.

---

## Opcions

Cada opció respon una pregunta, que l'assistent aleshores se salta. `ansibleforms-installer --help` les llista:

| Opció | Què respon |
|---|---|
| `--lang <code>` | L'idioma: `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` o `zh` |
| `--version <version>` | La versió d'AnsibleForms que s'instal·la o a la qual s'actualitza; la d'aquest instal·lador per defecte |
| `--role <role>` | `controller` o `runner` |
| `--mode <mode>` | `compose`, `kubernetes` o `native` |
| `--runtime <runtime>` | `docker` o `podman` (compose) |
| `--install-runtime` | Instal·la Docker o Podman quan falta, sense preguntar |
| `--dir <folder>` | La carpeta d'instal·lació (compose) |
| `--name <name>` | El nom de la instància, el prefix dels seus contenidors (compose, `af` per defecte) |
| `--port <port>` | El port de l'amfitrió: la interfície web per a un controlador, l'RTE per a un Runner |
| `--tls <choice>` | `self`, `own` o `off` (un controlador compose) |
| `--cert <file>`, `--key <file>` | Els fitxers del certificat i de la clau, amb `--tls own` |
| `--admin-password <password>` | La contrasenya del primer administrador; generada per defecte |
| `--join <token>` | Un token d'unió (`afj_...`), creat a través de l'API, que aprova el Runner a l'instant (un Runner, desatès; consulta [Tokens d'unió](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | L'adreça de l'aplicació, com ara `https://forms.example.com` (un Runner) |
| `--runner-mode <mode>` | `outbound` (l'RTE truca a l'aplicació) o `inbound` (l'aplicació truca a l'RTE) (un Runner) |
| `--host <address>` | L'adreça d'aquest servidor, a la qual truca l'aplicació (un Runner entrant) |
| `--namespace <namespace>` | El namespace de Kubernetes, `ansibleforms` per defecte |
| `--release <release>` | La release de Helm, `ansibleforms` per defecte |
| `--hostname <name>` | El nom d'amfitrió de l'ingress (kubernetes) |
| `--ingress-class <class>` | La classe d'ingress (kubernetes) |
| `--storage-class <class>` | La classe d'emmagatzematge (kubernetes) |
| `--values <file>` | Un fitxer de values de Helm addicional (kubernetes) |
| `--purge` | Amb `uninstall`: també suprimeix les dades |
| `--source <folder>` | Una còpia local del repositori [ansibleforms/docker](https://github.com/ansibleforms/docker) des de la qual instal·lar (sense connexió) |
| `--bundle <file>` | Un bundle de versió, `ansibleforms-<version>-linux-<arch>.tar.gz`, des del qual instal·lar de manera nativa (consulta [Instal·lació nativa](native.html#air-gapped)) |
| `--yes` | Respon totes les preguntes amb el seu valor predeterminat (desatès) |
| `--verbose` | Mostra totes les ordres que executa |

---

## Desatès

Amb `--yes`, o sense terminal, l'instal·lador no pregunta res: les opcions responen les seves preguntes i els valors predeterminats responen la resta. Se salta
l'idioma, les novetats, la contrasenya de l'administrador (generada, tret que `--admin-password` en doni una) i la revisió, i en canvi imprimeix
l'enllaç a les novetats. Només instal·la un Docker o un Podman que falti amb `--install-runtime` o `--yes`, i un Runner
necessita `--app-url`. Sense `--join`, el Runner demana unir-se i espera l'aprovació d'un administrador; amb aquesta opció, s'aprova a l'instant.

Un controlador a Docker, que instal·la Docker quan falta:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

Un Runner entrant a Podman, al qual l'aplicació truca a `rte-dmz.example.com:8000`:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## Una instal·lació existent

L'instal·lador recorda el que ha instal·lat a `installer.json`. Sense aquest fitxer, `install`, `upgrade` i `status` busquen primer un
AnsibleForms que ja sigui al servidor, sigui qui sigui qui l'hagi instal·lat:

| Trobat | Com es troba | Se'n fa càrrec quan |
|---|---|---|
| Docker o Podman | Contenidors de la imatge de l'aplicació o de l'RTE, agrupats per projecte compose | La carpeta conté el fitxer compose i el `.env` del repositori [ansibleforms/docker](https://github.com/ansibleforms/docker): els serveis `mysqldb`, `app` i `rte`, als contenidors `<name>_db`, `<name>_app` i `<name>_rte` |
| Un Runner de la 7.2 | Un RTE sol al seu projecte compose, amb els `DB_*` de l'aplicació i sense `RTE_MODE` (mode database) | El seu fitxer compose es pot llegir. La seva actualització el passa a un mode de socket (consulta [Un Runner de la 7.2](#a-72-runner)) |
| Kubernetes | Releases de Helm del chart `ansibleforms`, i Deployments i StatefulSets de les seves imatges | És una release del chart: els seus values actuals es converteixen en el seu fitxer de values |
| Nativa | Serveis de systemd que executen AnsibleForms amb Node.js | Segueixen l'estructura de l'instal·lador: `releases/`, `current`, `app.env` i `rte.env` (consulta [Instal·lació nativa](native.html#the-folder)) |
| Cap motor | L'aplicació o un RTE que respon en un port habitual: 443, 3000, 3001, 8000, 8001, 8010 o 8443 | Mai: s'executa des del codi font o a mà. L'instal·lador només n'informa |

Només compten les imatges de l'aplicació i de l'RTE: un contenidor de MySQL amb el nom d'AnsibleForms no és una instal·lació. L'instal·lador llista el que
ha trobat, una línia per element, amb el motiu i el que cal fer a mà per a un del qual no es pot fer càrrec: el seu fitxer compose no és el del repositori,
la seva base de dades és fora del seu projecte compose, s'executa a Kubernetes sense el chart de Helm, el gestiona Argo CD (actualitza'l allà,
canviant la versió del chart de l'Application), o no se'n pot llegir la versió.

Per a una instal·lació de la qual es pot fer càrrec, `install` ofereix tres opcions:

| Opció | Què fa |
|---|---|
| Fer-se'n càrrec i actualitzar | Mostra el que recordarà, després escriu `installer.json` un cop ho confirmes, i continua amb l'[actualització](#upgrade) |
| Instal·lar igualment un nou AnsibleForms al costat | Una segona instal·lació, amb la seva pròpia carpeta, ports i base de dades, després d'una confirmació pròpia |
| Atura | No es canvia res |

Per a una instal·lació que ja executa la versió que instal·laria l'instal·lador, la primera opció és **Fes-te'n càrrec**: l'instal·lador
recorda on és i com s'executa, per a les seves còpies de seguretat, el seu estat i les properes actualitzacions, i ara no es canvia res.

`upgrade` ofereix el mateix sense la segona opció, i s'atura quan no es pot fer càrrec de res. De manera desatesa, `install` s'atura amb un missatge,
i `upgrade --yes` només es fa càrrec d'una instal·lació quan en troba exactament una de la qual es pot fer càrrec. Els values actuals d'una release de Kubernetes es
desen al costat d'`installer.json`, i les actualitzacions els tornen a aplicar amb el chart de la versió nova.

---

## Actualitzar

`ansibleforms-installer upgrade` porta la instal·lació a una versió més nova de la mateixa versió major. Llista les versions més noves,
la més recent primer (de manera desatesa, agafa la més recent), i mostra les novetats de cada versió que deixa enrere, amb primer els canvis incompatibles
i les eliminacions. Quan contenen canvis incompatibles, et demana que confirmis que les has llegides; de manera desatesa, només `--yes` continua.

L'instal·lador fa una còpia de seguretat de la base de dades abans de canviar res. Quan la versió nova no respon, ofereix tornar enrere: torna la versió
anterior, i la seva base de dades es restaura a partir d'aquella còpia. No baixa de versió, i no travessa una versió major: per a això segueix
la [guia d'actualització](../upgrade-7.html), per exemple de la 6.x a la 7.x, amb el que cal fer a la 6.5 abans d'actualitzar.

A Docker o Podman, l'actualització d'un controlador també posa al dia els seus fitxers amb la versió nova del repositori docker:

| Fitxer | Què fa l'actualització |
|---|---|
| `docker-compose.yml` | Se substitueix pel de la versió nova, després de desar-ne una còpia a `installer-backups` |
| `.env` | Es conserva cada línia existent, i s'hi afegeixen les claus que necessita la versió nova, amb secrets creats com els crea una instal·lació nova. Abans se'n desa una còpia |
| `data/seed.yaml` | Se substitueix quan és un seed que venia amb el repositori docker, sense canvis. Un que s'hagi canviat a mà es conserva, i el nou es desa al costat |
| `data/` | S'hi afegeixen els fitxers nous que porta la versió, com ara un playbook nou. Es conserven tots els fitxers que ja existeixen |

Un paràmetre de base de dades que falti (`MYSQLDB_USER` o una contrasenya) no es pot inventar per a una base de dades que ja existeix, així que aleshores l'actualització s'atura abans
de cap canvi. Una marxa enrere torna a deixar el fitxer compose, el `.env` i el seed tal com eren.

Un Runner executa la mateixa versió que el seu AnsibleForms: actualitza primer AnsibleForms, i després els seus Runners. L'actualització d'un Runner reescriu el seu
fitxer compose per a la nova imatge de l'RTE i en conserva el `.env` i les dades tal com són.

---

## Un Runner de la 7.2

Un Runner de la 7.2 s'executa en mode database, obsolet des de la 7.3.0: el seu RTE té la configuració de la base de dades d'AnsibleForms. L'instal·lador el
troba (consulta [Una instal·lació existent](#an-existing-installation)), i la seva actualització el passa a un mode de socket amb el mateix runner:

1. Llegeix el nom del runner (`RTE_NAME`) i el token (`RTE_TOKEN`) del contenidor de l'RTE antic. Quan l'RTE no es registrava ell mateix
   (`RTE_REGISTER=0`), escrius el nom que té el seu runner a **Connexions > Runners**
2. Pregunta l'adreça de l'aplicació i el mode, **sortint** per defecte o entrant, i en entrant el port i l'adreça d'aquest servidor
3. Mostra el pla, i després fa una còpia de seguretat del fitxer compose antic i del `.env` a `installer-backups`
4. Escriu l'estructura de Runner de l'instal·lador sense els paràmetres `DB_*`. Conserva `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` i `METRICS_TOKEN`, que un RTE en mode de socket encara llegeix
5. Inicia l'RTE nou al costat de l'antic. L'RTE nou s'autentica amb el token propi del runner, i AnsibleForms passa el runner al
   mode nou ell mateix, **sense cap aprovació**: les seves tasques i els formularis que l'anomenen no canvien
6. Un cop l'RTE nou està connectat, el contenidor antic s'atura i s'elimina

Un Runner entrant serveix HTTPS amb un certificat fixat, com en fa un de nou (consulta [Un Runner](#a-runner)), i l'instal·lador n'imprimeix
l'empremta del certificat. Quan l'RTE antic ocupa el port que necessita el nou, primer s'atura, així que el Runner queda fora de línia fins que
el nou es connecta. L'RTE nou d'un Runner sortint agafa un port lliure a `127.0.0.1` i s'executa al costat de l'antic sense interrupció.

Quan l'instal·lador no pot llegir cap token de l'RTE antic, tries com s'autentica l'RTE nou:

| Opció | Què passa després |
|---|---|
| Escriure el testimoni del runner | La contrasenya de la credencial d'RTE del runner a **Connexions > Credencials**. El runner conserva el nom i les tasques |
| Unir-se com a runner nou amb un testimoni d'unió | Un [token d'unió](../runners/registration.html#join-tokens) afegeix un runner nou amb un altre nom. Retira el runner antic a mà |

Quan l'RTE nou no es connecta, l'instal·lador ofereix tornar a posar els fitxers antics i tornar a iniciar el contenidor antic; si AnsibleForms
ja havia passat el runner al mode nou, torna a posar-ne el mode a database a **Connexions > Runners**. Un cop l'RTE nou està connectat, ja no
hi ha marxa enrere: els fitxers antics es queden a `installer-backups`.

Quan AnsibleForms no coneix cap runner amb aquest nom, l'RTE nou demana unir-se i espera una aprovació. Rebutja aquesta sol·licitud a
**Connexions > Runners**, i després torna a executar l'actualització amb el nom que hi té el runner.

---

## Versions

La versió de l'instal·lador segueix la de l'aplicació: cada versió d'AnsibleForms ve amb un instal·lador de la mateixa versió, publicat amb ella, i
aquest instal·lador instal·la aquesta versió per defecte. `--version` n'instal·la una altra. Cada versió de la
[pàgina de Releases de l'instal·lador](https://github.com/ansibleforms/installer/releases) té binaris per a Linux en amd64 i arm64, amb els seus
checksums.
