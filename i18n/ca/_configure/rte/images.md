---
layout: default
title: Imatges
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# Imatges de l'RTE
{: .no_toc }

Les tres imatges publicades de l'RTE, i un RTE propi amb les col·leccions i les biblioteques que fan servir els teus playbooks
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les imatges de l'RTE

L'RTE es publica en tres capes, cadascuna construïda sobre l'anterior, amb les mateixes etiquetes que l'aplicació (vegeu [Etiquetes d'imatge](../installation/#image-tags)):

| Imatge | Què conté | Fes-la servir |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js i el servidor d'AnsibleForms, git, ssh i sshpass. Sense python ni ansible, així que tota sola no executa cap playbook | Per construir un RTE amb les teves pròpies versions de python i ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base, més python 3.14, ansible-core i unes quantes biblioteques habituals (`jmespath`, `netaddr`, `requests`, `paramiko`). Sense col·leccions | Per construir un RTE més petit només amb les col·leccions i les biblioteques que fan servir els teus playbooks |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | La core, més el paquet `ansible` sobre el mateix ansible-core, i el que tenia la imatge d'AnsibleForms 6.5: les col·leccions de NetApp, AWS i community, `pandas`, `pyvmomi`, `boto3`, el client de mariadb, ytt i unes quantes eines del sistema | **La predeterminada.** Executa-la tal com és: els playbooks de la 6.5 hi troben el que feien servir |

Igual que la imatge de l'aplicació, totes les capes s'executen amb l'usuari `node` (uid 1000), i els playbooks també s'executen amb aquest usuari.

---

## Construir el teu propi RTE

Construeix sobre `ansibleforms-rte-core` i afegeix les col·leccions i les biblioteques de python que fan servir els teus playbooks. Aquest exemple de NetApp és un dels
Dockerfiles d'[examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

L'entorn de python i la carpeta de col·leccions pertanyen a `node`, així que aquestes instal·lacions no necessiten root. Una capa que instal·la paquets
del sistema canvia a `USER root` per fer-ho i torna a `USER node` al final. Per portar el teu propi python i ansible, construeix sobre
`ansibleforms-rte-base` (`Dockerfile.own-ansible` a la mateixa carpeta).

Mantén la imatge a la versió de l'aplicació: `:7` segueix el `:7` de l'aplicació. Les col·leccions i els rols també es poden muntar en lloc d'incloure'ls a la imatge, a
`/etc/ansible/collections` i `/etc/ansible/roles`. Llavors no cal reconstruir la imatge per a cada canvi, però el que s'executa depèn d'aquell volum;
les biblioteques de python sempre van a la imatge. Incloure-ho tot a la imatge és reproduïble i arrenca de pressa, i per això és la manera de fer-ho en producció.

---

## El contracte

El que han de compartir l'aplicació i un RTE és el seu contracte, un número que tots dos indiquen. Un RTE d'una versió més antiga continua funcionant amb una aplicació
més nova mentre tots dos parlin el mateix contracte; quan una versió el canvia, les seves notes de versió diuen que cal actualitzar els RTE. Cada mode
té el seu:

| Mode | Contracte | Si no coincideix |
|---|---|---|
| Sortint, Entrant | 3, nou a la 7.3.0 | L'aplicació tanca el sòcol de l'RTE amb el codi `4409` i registra *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Un RTE sortint registra *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Una tasca enviada amb un altre contracte es rebutja |
| Base de dades (obsolet) | 2, des de la 7.0.0 | L'RTE rebutja les tasques de l'aplicació |

**Prova la connexió** al runner indica quin contracte parla l'RTE i quin necessita l'aplicació (vegeu
[Prova la connexió](../runners/runner-page.html#test-connection)), i la fila **Runners** de la pàgina **Estat** fa la mateixa comprovació.

