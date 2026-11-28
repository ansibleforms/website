---
layout: default
title: Imatges
parent: RTE
nav_order: 1
translated_from: 793f1c4efa7fb085bdd4b1551161e3b57b52ff12
---

# Imatges de l'RTE
{: .no_toc }

Les tres imatges publicades de l'RTE, i un RTE propi amb les col·leccions i les biblioteques que fan servir els teus playbooks
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les imatges de l'RTE

L'RTE es publica en tres capes, cadascuna construïda sobre l'anterior, amb les mateixes etiquetes que el controlador (vegeu [Etiquetes d'imatge](../installation/#image-tags)):

| Imatge | Què conté | Fes-la servir |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js i el servidor d'AnsibleForms, git, ssh i sshpass. Sense python ni ansible, així que tota sola no executa cap playbook | Per construir un RTE amb les teves pròpies versions de python i ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base, més python 3.14, ansible-core i unes quantes biblioteques habituals (`jmespath`, `netaddr`, `requests`, `paramiko`). Sense col·leccions | Per construir un RTE més petit només amb les col·leccions i les biblioteques que fan servir els teus playbooks |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | La core, més el paquet `ansible` sobre el mateix ansible-core, i el que tenia la imatge d'AnsibleForms 6.5: les col·leccions de NetApp, AWS i community, `pandas`, `pyvmomi`, `boto3`, el client de mariadb, ytt i unes quantes eines del sistema | **La predeterminada.** Executa-la tal com és: els playbooks de la 6.5 hi troben el que feien servir |

Igual que la imatge del controlador, totes les capes s'executen amb l'usuari `node` (uid 1000), i els playbooks també s'executen amb aquest usuari.

Des de la 7.6.0 cada capa es publica per a `linux/amd64` i `linux/arm64` amb la mateixa etiqueta. Un RTE que construeixes a partir
d'una d'elles es construeix per a l'arquitectura de la màquina que el construeix: per a amfitrions arm64, construeix-lo en un d'ells,
o amb `docker buildx build --platform linux/arm64`.

---

## Construir el teu propi RTE

Construeix sobre `ansibleforms-rte-core` i afegeix les col·leccions i les biblioteques de python que fan servir els teus playbooks. Aquest exemple de NetApp és un dels
Dockerfiles d'[ansibleforms/rte](https://github.com/ansibleforms/rte/tree/main/examples):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

L'entorn de python i la carpeta de col·leccions pertanyen a `node`, així que aquestes instal·lacions no necessiten root. Una capa que instal·la paquets
del sistema canvia a `USER root` per fer-ho i torna a `USER node` al final. Per portar el teu propi python i ansible, construeix sobre
`ansibleforms-rte-base` (`Dockerfile.own-ansible` a la mateixa carpeta).

Mantén la imatge a la versió del controlador: `:7` segueix el `:7` del controlador. Les col·leccions i els rols també es poden muntar en lloc d'incloure'ls a la imatge, a
`/etc/ansible/collections` i `/etc/ansible/roles`. Llavors no cal reconstruir la imatge per a cada canvi, però el que s'executa depèn d'aquell volum;
les biblioteques de python sempre van a la imatge. Incloure-ho tot a la imatge és reproduïble i arrenca de pressa, i per això és la manera de fer-ho en producció.

---

## Construeix-lo al Dissenyador

Des de 7.9.0 descrius un entorn d'execució al Dissenyador; un [builder](builder.html) construeix la seva imatge, la puja i la signa.

1. Dona a un repositori l'ús **Entorns d'execució** (Configuració > Repositoris); hi desa les definicions.
2. Al Dissenyador, obre **Entorns d'execució** i fes clic a **Nou**: omple'l a la pestanya **Visual**, o escriu-lo a la pestanya **YAML**.
3. **Desa**, després **Push** per fer-ne commit al repositori, i **Compila**: la compilació és una tasca a la pàgina **Tasques**, amb el seu log en directe.

Cada entorn d'execució és una carpeta pròpia al repositori, amb el seu nom, que només conté la seva definició:

```text
rte-netapp/
  rte.yaml
```

El Dockerfile, `ansible.cfg` i els fitxers de requisits es tornen a escriure a cada compilació, a partir de la definició i de la versió
de l'app, de manera que mai no queden desfasats al repositori. La pestanya **Fitxers** els mostra tal com els rep el builder.

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

Totes les claus excepte el nom es poden ometre; la barra d'eines de la pestanya **YAML** ajusta cada part en un diàleg.

| Clau | Què és |
|---|---|
| `name` | El nom de l'entorn d'execució, el de la seva carpeta i el de la seva imatge: lletres minúscules, dígits, punts, guions i guions baixos |
| `arch` | `all`, una imatge per a amd64 i arm64 com les publicades, o només `amd64` o `arm64`; `all` si s'omet. Una arquitectura diferent de la del host del builder necessita [QEMU en aquest host](builder.html#amd64-and-arm64) |
| `python` | El python que executa la imatge, de 3.11 a 3.15; 3.15 si s'omet |
| `ansible_core` | Una release d'ansible-core (`2.22`) o una versió (`2.22.0`) que funcioni amb aquest python; la més recent que ho faci si s'omet |
| `ansible_collections` | Les col·leccions, cadascuna amb el seu `name` (namespace.name) i una `version` opcional; l'última si s'omet. El que cada col·lecció necessita, el seu `requirements.txt` i `bindep.txt` (o el seu `meta/execution-environment.yml`), s'instal·la amb ella, com fa ansible-builder |
| `python_packages` | Paquets de python, com a línies d'un `requirements.txt` |
| `os_packages` | Paquets de Debian 13 (trixie) |
| `registry` | `credential`: una credencial de **Registre de contenidors**, que conté l'adreça del registre i el seu login; `path`: el camí de la imatge, el seu nom si s'omet; `tag`: `app`, la versió de l'app (`7.9.0`), perquè una recompilació segueixi cada actualització, o una etiqueta pròpia |
| `sbom` | `true` adjunta a la imatge una llista de materials de programari (SBOM) |
| `sign` | `credential`: una credencial de **Clau de signatura**, amb què el builder signa la imatge amb cosign 3; comprova-la amb `cosign verify --key <clau pública>` de cosign 3 (cosign 2 no llegeix les seves signatures) |

Cada entorn d'execució es construeix a partir de `ansibleforms-rte-base` de la versió de l'app, de manera que un amb l'etiqueta `app` la imatge
del qual es va construir per a una versió anterior es mostra així a la pàgina **Entorns d'execució**, amb **Recompila-los**.

---

## El contracte

El que han de compartir el controlador i un RTE és el seu contracte, un número que tots dos indiquen. Un RTE d'una versió més antiga continua funcionant amb un controlador
més nou mentre tots dos parlin el mateix contracte; quan una versió el canvia, les seves notes de versió diuen que cal actualitzar els RTE. Cada mode
té el seu:

| Mode | Contracte | Si no coincideix |
|---|---|---|
| Sortint, Entrant | 3, nou a la 7.3.0 | El controlador tanca el sòcol de l'RTE amb el codi `4409` i registra *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Un RTE sortint registra *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Una tasca enviada amb un altre contracte es rebutja |
| Base de dades (obsolet) | 2, des de la 7.0.0 | L'RTE rebutja les tasques del controlador |

**Prova la connexió** al runner indica quin contracte parla l'RTE i quin necessita el controlador (vegeu
[Prova la connexió](../runners/runner-page.html#test-connection)), i la fila **Runners** de la pàgina **Estat** fa la mateixa comprovació.

