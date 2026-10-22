---
layout: default
title: Conceptes
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# Conceptes
{: .no_toc }

Els termes que es fan servir en aquesta documentació, cadascun enllaçat a la seva pàgina
{: .fs-6 .fw-300 }

---

## Glossari

Els termes que es fan servir en aquesta documentació:

| Terme | Significat |
|---|---|
| **[Formulari](forms/)** | Una definició YAML que recull dades i executa un playbook, una plantilla o un workflow |
| **[Camp de formulari](formfields/)** | Una entrada d'un formulari, com ara `text`, `enum` o `checkbox`; el seu valor es converteix en una extravar |
| **[Categoria](config/categories.html)** | Un grup de l'arbre de formularis que es mostra a la pàgina Formularis, definit a `config.yaml` |
| **[Rol](config/roles.html)** | Un conjunt d'usuaris i grups; un formulari llista els rols que el poden veure i executar, `default` per a tothom |
| **[Expressió](expressions/)** | JavaScript que calcula el valor d'un camp, al navegador (`runLocal: true`) o al servidor |
| **[Extravars](formfields/)** | Les variables que s'envien al playbook o a la plantilla, construïdes a partir dels valors dels camps |
| **[Credencial](expressions/credentials.html)** | Un inici de sessió desat, xifrat amb `ENCRYPTION_SECRET`: un usuari i una contrasenya (i host, port, base de dades) o, des de la 7.3.0, l'adreça i els secrets d'un directori LDAP, un proveïdor d'SSO, un runner o un HashiCorp Vault |
| **[Magatzem de secrets](secret-stores/)** | Una connexió a HashiCorp Vault o CyberArk que proporciona l'usuari i la contrasenya d'una credencial |
| **[Tasca](gui/forms-and-jobs.html)** | Una execució d'un formulari, amb el seu estat, les seves extravars i la seva sortida, que es conserva a l'historial de tasques |
| **[Runner](runners.html)** | On s'executa una tasca, afegit a **Connexions > Runners**: `rte` per a playbooks, `awx` (AWX, o la variant `aap` o `ascender`), `semaphore`, `rundeck` o `jenkins` per a plantilles i jobs. Un formulari en tria un amb `runner:`, o s'executa al runner `rte` (playbooks) o `awx` (plantilles) predeterminat |
| **[RTE](rte/)** | Un entorn d'execució (runtime environment): el servidor d'AnsibleForms iniciat amb `AF_ROLE=rte` al seu propi contenidor, al costat de python i ansible, que executa els playbooks d'un runner de tipus `rte` |
| **[Punt d'aprovació](forms/approval.html)** | Una pausa en una tasca fins que un usuari amb un rol d'aprovació l'aprova o la rebutja |
| **[Workflow](workflows/)** | Un graf de playbooks, aprovacions i altres workflows enllaçats en cas d'èxit, en cas d'error o sempre, amb la sintaxi d'AWX |
| **[Formulari de diversos passos](forms/multistep.html)** | Obsolet des de la 7: un formulari que executa diversos playbooks o plantilles en seqüència; el substitueix un workflow |
| **[Canal de notificació](notification-channels.html)** | Un servidor de correu, un webhook de Slack o Teams, un xat de Telegram o un webhook on van les notificacions i les sol·licituds d'aprovació |
| **[Dissenyador](designer/)** | L'editor del navegador per a formularis, playbooks, inventaris i workflows, que fa servir una sola persona alhora |
| **[Subform](forms/subform.html)** | Un conjunt reutilitzable de camps que descriu les files d'un camp `list` o l'objecte d'un camp `yaml` |
| **[config.yaml](config/)** | El fitxer amb les categories, els rols i les constants; els formularis són als seus propis fitxers |
| **[Config seed](seed/)** | Un fitxer YAML (`CONFIG_SEED_PATH`) que declara els objectes d'administració, com ara runners i credencials |
| **[Carpeta persistent](customization/paths.html)** | La carpeta que conté els fitxers que AnsibleForms ha de conservar entre reinicis i actualitzacions |
