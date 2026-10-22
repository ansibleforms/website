---
layout: default
title: Nativa
parent: Instal·lació
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# Instal·lació nativa
{: .no_toc }

AnsibleForms directament al servidor, sense contenidors, com a serveis de systemd que configura l'instal·lador
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per als administradors de servidors on no es permeten contenidors: l'[instal·lador](installer.html) instal·la tot el que necessita AnsibleForms al
mateix servidor, i després l'actualitza i el desinstal·la. Instal·la AnsibleForms 7.3.0 o posterior.

---

## Què necessita

Tria **Directament en aquest servidor, sense contenidors** al pas **Motor** de l'instal·lador, o passa `--mode native`. Necessita:

* **Root** : executa l'instal·lador amb `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : els serveis s'executen com a unitats de systemd
* **Un Linux compatible** : Ubuntu, Debian, RHEL i les seves recompilacions com ara Rocky Linux i AlmaLinux, SUSE Linux Enterprise o openSUSE
* **amd64 o arm64**
* **Accés a Internet** : als repositoris de la distribució, GitHub, nodejs.org i els índexs de paquets de Python i Ansible (consulta
  [Sense connexió](#air-gapped) per saber què substitueix un bundle de versió)

En un servidor que no compleixi això, el motor apareix com a *Directament en aquest servidor (cal root: executeu-lo amb sudo)* o
*Directament en aquest servidor (no compatible amb aquest Linux)*. Tots dos rols s'instal·len així: un controlador i un [Runner](installer.html#a-runner).

---

## Què instal·la

L'instal·lador instal·la això des dels paquets de la distribució, per a tots dos rols:

| Paquet | Per què |
|---|---|
| `git` | Els repositoris |
| El client ssh | Les connexions dels playbooks |
| El client de MariaDB | Les còpies de seguretat de l'aplicació: `app.env` defineix [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) i [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) amb el client trobat, `mariadb-dump` i `mariadb` o els més antics `mysqldump` i `mysql` |
| `ca-certificates`, `curl`, `tar`, `gzip` | Les baixades |
| `libatomic` | Node.js s'hi enllaça, i els servidors mínims no el tenen |
| `sshpass` | Els playbooks que inicien sessió amb una contrasenya ssh. A RHEL i les seves recompilacions ve d'EPEL, que l'instal·lador intenta activar amb `epel-release`; quan no es pot instal·lar, la instal·lació continua i ho indica |
| El servidor MariaDB | Només un controlador: la seva base de dades |

Després, a la carpeta d'instal·lació, amb cada baixada comprovada amb el seu checksum publicat:

* **AnsibleForms** : el bundle de versió `ansibleforms-<version>-linux-<arch>.tar.gz` de la release de GitHub de l'aplicació, l'aplicació compilada per a
  Node.js. Una versió sense bundle mostra *Instal·lar sense contenidors requereix AnsibleForms 7.3.0 o posterior.*
* **Node.js** : la versió més nova de la versió major que indica el bundle, de nodejs.org
* **Python i Ansible** : uv, i després amb ell el Python de les imatges de l'RTE i un entorn virtual amb Ansible i les biblioteques de
  la imatge completa de l'RTE, i després les seves col·leccions d'Ansible (consulta [Les imatges de l'RTE](../rte/images.html)). Això triga uns minuts
* **Els fitxers inicials** : els formularis, els playbooks i la configuració de la carpeta `data` del [projecte de docker-compose](https://github.com/ansibleforms/docker),
  tal com els rep una instal·lació nova de Docker Compose. Un Runner només en conserva la configuració d'Ansible, ssh i git

Per a un controlador, després crea l'esquema `AnsibleForms` a MariaDB, i un usuari de base de dades amb el nom de la instància, amb tots els permisos sobre aquest
esquema i cap més enlloc, que només pot iniciar sessió des d'aquest servidor.

---

## La carpeta

Tot és a la carpeta d'instal·lació, `/opt/ansibleforms` (o `/opt/ansibleforms-runner` per a un Runner) per defecte:

| Ruta | Què conté |
|---|---|
| `releases/<version>/` | Una versió: el bundle, el seu enllaç a Node.js, el seu entorn virtual de Python i les seves col·leccions |
| `current` | L'enllaç a la versió que s'executa; una actualització el mou, i una marxa enrere també |
| `runtime/` | Node.js, uv i Python, compartits per les versions |
| `data/` | El que els contenidors munten com a `/app/dist/persistent`: formularis, playbooks, `config.yaml`, el config seed, certificats i registres |
| `home/` | El directori personal de l'usuari del sistema: `.ssh` i `.gitconfig`, enllaçats a `data/ssh` i `data/git` |
| `app.env`, `rte.env` | La configuració i els secrets dels serveis, llegibles només per root i per l'usuari del sistema. El de l'RTE no conté cap configuració de la base de dades |
| `installer-backups/` | Les còpies de seguretat de la base de dades que fa l'instal·lador, abans d'una actualització o amb `backup` |

Les versions i els entorns d'execució pertanyen a root, així que els serveis no poden canviar el seu propi codi; `data/` i `home/` pertanyen a l'usuari del sistema.
Els fitxers de la base de dades els guarda MariaDB, fora de la carpeta.

---

## Els serveis

Un controlador executa dos serveis de systemd, un Runner un de sol. Cadascun s'executa amb un usuari del sistema amb el nom de la instància (`ansibleforms` per defecte),
des de `current/server`, amb el seu fitxer de configuració:

| Servei | Què executa | Configuració |
|---|---|---|
| `<name>` | L'aplicació: la interfície web, l'API i el worker. Només un controlador | `app.env` |
| `<name>-rte` | L'RTE que executa els playbooks | `rte.env` |

L'RTE d'un controlador és `inbound` en un port propi a `127.0.0.1` (`8001`, o el següent lliure, amb
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`), executa els playbooks des de les carpetes de l'aplicació (`RTE_FILES=local`),
i el config seed `data/seed.yaml` el declara com a runner predeterminat.

L'RTE d'un Runner rep el mode, `APP_URL`, `RTE_NAME` i, amb `--join`, el token d'unió, i rep els playbooks amb cada tasca (consulta
[Modes](../rte/modes.html)). Un d'outbound no rep cap crida de l'aplicació, així que només escolta a `127.0.0.1` (`LISTEN_HOST=127.0.0.1`).
Un d'inbound serveix HTTPS amb un certificat autosignat propi de la seva adreça a `data/certificates`, que AnsibleForms fixa (pinning).
Sense token d'unió demana unir-se, i un administrador l'aprova a **Connexions > Runners**.

S'inicien en arrencar i es reinicien després d'una fallada. Gestiona'ls i llegeix-ne els registres amb les eines de systemd:

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

L'aplicació pot escoltar en un port per sota de 1024, com ara `443`, sense ser root. L'RTE conserva el dret d'utilitzar `sudo`, que necessiten els playbooks amb
`become` en aquest servidor, perquè un playbook pugui gestionar el servidor on s'executa l'RTE.

---

## Actualitzar i tornar enrere

`sudo /usr/local/bin/ansibleforms-installer upgrade` actualitza una instal·lació nativa com fa amb les altres (consulta [Actualitzar](installer.html#upgrade)), en
aquest ordre:

1. Posa la versió nova al seu lloc al costat de la que s'executa: el seu bundle, Node.js, Python, Ansible i les col·leccions. Els serveis
   en execució encara no es toquen
2. Afegeix els fitxers inicials nous que porta la versió, conservant tots els fitxers que ja existeixen
3. Fa una còpia de seguretat de la base de dades (un controlador) a `installer-backups/`, amb una còpia d'`app.env` i `rte.env`
4. Atura els serveis, fa que `current` apunti a la versió nova, i els torna a iniciar
5. Espera que l'aplicació respongui amb la versió nova (un Runner: que el seu RTE torni a escoltar)

Quan la versió nova no respon, l'instal·lador ofereix tornar enrere: `current` torna a apuntar a la versió anterior, la
base de dades es restaura a partir de la còpia de seguretat, i els serveis s'inicien. Només es conserven la versió en execució i l'anterior.

Els serveis natius amb l'estructura de l'instal·lador sense cap `installer.json` al costat, per exemple després que s'hagi suprimit, els troben `install`
i `upgrade`, que ofereixen fer-se'n càrrec (consulta [Una instal·lació existent](installer.html#an-existing-installation)).

---

## Desinstal·lar

`sudo /usr/local/bin/ansibleforms-installer uninstall` atura i elimina els serveis. Conserva la carpeta i la base de dades, tret que triïs suprimir
les dades (o passis `--purge`) i escriguis el nom de la instància per confirmar-ho. Aleshores també elimina la base de dades i el seu usuari (un controlador),
suprimeix la carpeta i elimina l'usuari del sistema.

Els paquets continuen instal·lats, MariaDB entre ells: altre programari els pot fer servir.

---

## Sense connexió

`--bundle` instal·la a partir d'un bundle de versió que hagis copiat al servidor, en lloc de baixar-lo de GitHub. Agafa el fitxer de la seva
arquitectura, `ansibleforms-<version>-linux-amd64.tar.gz` o `-arm64`, de les [Releases](https://github.com/ansibleforms/ansibleforms/releases) de l'aplicació:

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` fa el mateix amb els fitxers inicials, a partir d'una còpia local del repositori [ansibleforms/docker](https://github.com/ansibleforms/docker).
Node.js, Python amb els seus paquets i les col·leccions d'Ansible encara es baixen durant la instal·lació.
