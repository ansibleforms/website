---
layout: default
title: Des del codi font
parent: Actualització
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# Des del codi font
{: .no_toc }

Actualitza una instal·lació compilada des del codi font
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Una instal·lació compilada des del codi font s'actualitza obtenint la versió nova, tornant-la a compilar i reiniciant
l'aplicació. La teva configuració, els formularis, els playbooks, els certificats i els registres es desen a `server/persistent`, que ni Git ni la
compilació modifiquen.

---

## Abans d'actualitzar

Prepara l'actualització de manera que puguis tornar enrere si alguna cosa va malament:

* **Fes una còpia de seguretat** a **Configuració → Còpies de seguretat**. La versió nova actualitza l'esquema de la base de dades en el primer inici.
* **Llegeix el [registre de canvis](../changelog)** de les versions entre la teva i la nova.
* **Passes a una versió major nova?** Segueix primer [Actualitzar a la v7](../upgrade-7.html).
* **Comprova la versió de Node.js** que necessita la versió nova, al registre de canvis.

---

## 1. Obtén la versió nova

Obtén les etiquetes de les versions i fes checkout de la versió que vulguis. Les etiquetes de versió porten el número de versió, i `git tag` les
llista; la branca `main` pot contenir canvis que encara no s'han publicat:

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Torna a compilar

Torna a compilar amb els mateixos tres passos que en la instal·lació. Primer torna a compilar el client:

```bash
cd client
npm ci
npm run build
```

Després actualitza les dependències del servidor:

```bash
cd ../server
npm ci --omit=dev
```

Finalment torna a copiar el client compilat a la carpeta `views` del servidor:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Compara `.env.example`, a l'arrel del repositori, amb el teu `persistent/.env` per incorporar qualsevol paràmetre que afegeixi la versió.

---

## 3. Reinicia

Reinicia l'aplicació i el seu RTE per carregar el codi nou. L'esquema de la base de dades s'actualitza en el primer inici:

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Si véns de la 7.2, l'RTE s'executava en mode database, amb la configuració de la base de dades i `RTE_URL`, obsolet a la 7.3.0 i eliminat a la 8.0.0.
Torna'l a iniciar en mode inbound, i declara'n el runner amb una credencial d'RTE al seed o a **Connexions → Runners**, com mostra la
[instal·lació](../installation/from-source.html#run): `pm2 delete ansibleforms-rte`, i després la seva ordre `pm2 start`.

Si executes l'aplicació sense PM2, atura `npm run start` i torna'l a iniciar.

---

## 4. Comprova l'actualització

Segueix el registre de l'aplicació mentre s'inicia:

```bash
pm2 logs ansibleforms
```

A AnsibleForms, **Ajuda → Quant a** mostra la versió que s'està executant, i **Configuració → Estat** mostra la salut de la
base de dades, de l'esquema i dels altres sistemes dels quals depèn AnsibleForms.

---

## Tornar enrere

Per tornar a la versió que executaves abans, la que mostrava **Ajuda → Quant a** abans de l'actualització, fes checkout de la seva etiqueta amb
`git checkout <version>`, i després torna a compilar i reinicia com als passos 2 i 3. Si aquella versió no s'inicia amb la base de dades actualitzada, restaura la còpia de seguretat que vas fer a
**Configuració → Còpies de seguretat**.
