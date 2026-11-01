---
layout: default
title: Variables d'entorn
nav_order: 9
has_children: true
has_toc: false
permalink: /customization/
translated_from: e0bc1d7c5bd2df4a3f9036a2d9413a276b228156
---

# Variables d'entorn
{: .no_toc }

Configura AnsibleForms amb variables d'entorn
{: .fs-6 .fw-300 }

---

Per a administradors que despleguen AnsibleForms: les variables d'entorn que llegeix el servidor, agrupades per tema.

AnsibleForms s'ajusta amb variables d'entorn, tant si s'executa amb Docker Compose, a Kubernetes o des del codi font.

---

## D'on surten els valors

El servidor llegeix cada variable de la primera d'aquestes fonts que la defineix, així que un valor més amunt a la llista sempre guanya:

1. **L'entorn del procés**: `environment:` i `env_file:` a docker-compose (el `.env` del projecte es passa així),
   `env` i `envFrom` a Kubernetes, o la shell que arrenca `node`.
2. **`persistent/.env`**, el fitxer que escriuen les pàgines de configuració (`data/.env` al projecte docker-compose, un altre camí amb
   `MANAGED_ENV_PATH`). Es llegeix a cada arrencada, també en producció, i mai no sobreescriu una variable que ja està definida.
3. **`server/.env.<NODE_ENV>`**, per exemple `.env.development`. Només es llegeix quan `NODE_ENV` no és `production` (o amb
   `FORCE_DOTENV=1`), a la pràctica quan s'executa [des del codi font](../installation/from-source.html) en mode de desenvolupament.
4. **El valor predeterminat integrat**, que apareix a les taules de cada grup.

Les pàgines de configuració, a **Configuració > General**, mostren el valor vigent i desen els canvis a `persistent/.env`. Moltes variables
s'apliquen tan bon punt es desen; les altres es desen però necessiten un reinici, i la pàgina les llista després de desar. Una variable definida a
l'entorn del procés no s'hi pot canviar: la pàgina la mostra com a *Definit a l'entorn, així que no es pot canviar aquí.*
Algunes variables, com ara `ENCRYPTION_SECRET` i `ACCESS_TOKEN_SECRET`, no es poden canviar mai des de la pàgina.

Les variables que llegeix un RTE, com ara `AF_ROLE`, `RTE_MODE`, `APP_URL` o `RTE_MAX_JOBS`, no són a les pàgines de configuració: l'aplicació
no les utilitza, així que defineix-les a l'entorn on s'executa l'RTE. Les variables `RTE_*` que llegeix la mateixa aplicació,
`RTE_QUEUE_MINUTES` i `RTE_FILES_MAX_MB`, són l'excepció i continuen a les pàgines. Quatre variables de l'RTE, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` i `RTE_DRAIN_SECONDS`, es poden definir per a cada RTE a la seva pàgina de runner, on un valor guanya a la
variable (vegeu [La configuració d'un RTE](../runners/runner-page.html#an-rtes-settings)).

Amb [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` les pàgines només mostren els valors i el desament es rebutja. Fes-lo servir
quan l'entorn es declara en un manifest, tal com es descriu a [Edició i auditoria](../seed/environment-and-audit.html).

La [llavor de configuració](../seed/) no defineix cap variable d'entorn. Declara objectes que es desen a la base de dades, i les
referències `${ENV_VAR}` que conté es resolen a partir de l'entorn del servidor en execució.

Algunes variables només es llegeixen de l'entorn i no són a les taules: `MANAGED_ENV_PATH` i `FORCE_DOTENV`, descrites
més amunt, i les variables de proxy del sistema `HTTPS_PROXY` i `NO_PROXY` (també es llegeixen en minúscules). Un RTE sortint truca a l'aplicació a través de
`HTTPS_PROXY`, i un RTE entrant hi envia la seva crida de registre, tret que el host de l'aplicació sigui a `NO_PROXY` (noms de host,
sufixos `.domain`, o `*` per a tots els hosts).

Les variables marcades amb <span class="af-badge af-badge-secret">Secret</span> contenen una contrasenya, un token o una clau: mantén-les fora del control
de versions, per exemple en un Secret de Kubernetes o en un fitxer `.env` que no es faci commit.

---

## En aquesta secció

Les variables s'agrupen per tema, amb una pàgina per grup:

| Pàgina | Què hi trobaràs |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Altres variables

Les variables següents encara no estan assignades a cap grup:

{{ other }}
{% endif %}
