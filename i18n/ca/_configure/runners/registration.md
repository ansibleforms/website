---
layout: default
title: Registre
parent: Runners
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# Registre
{: .no_toc }

Com un RTE demana unir-se i s'aprova, els tokens d'unió per a instal·lacions desateses, i el mode base de dades
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Demanar unir-se

Des de la 7.3.0, un RTE en un mode de sòcol (`outbound` o `inbound`) que l'aplicació encara no coneix demana unir-se, i un admin l'aprova.
Es presenta amb el seu propi `RTE_TOKEN` i el seu `RTE_NAME`: un RTE sortint quan truca per primer cop a l'aplicació, un d'entrant en la seva única
crida de registre. Sense token d'unió, l'aplicació llavors:

1. Desa l'`RTE_TOKEN` de l'RTE en una credencial nova de tipus RTE anomenada `<name>-rte` (amb un número afegit quan aquest nom ja està agafat), i
   per a un RTE entrant la seva adreça, `RTE_URL`
2. Afegeix un runner amb el nom de l'`RTE_NAME`, de tipus RTE, en el mode de l'RTE, que inicia sessió amb aquesta credencial, marcat com a **Pendent d'aprovació**
   i desactivat. La seva descripció indica l'host des d'on ho ha demanat

Un RTE sortint es manté connectat mentre espera, però no rep cap tasca. L'aplicació no truca a un d'entrant fins que no està aprovat. Tots dos registren
que esperen que un admin els aprovi a **Connexions > Runners**, amb l'empremta del seu token.

Un RTE entrant amb un `RTE_URL` `https://` també envia el seu certificat quan demana unir-se, i l'aplicació el fixa: a partir d'aleshores
l'aplicació només truca a aquest RTE quan presenta el mateix certificat, de manera que un d'autosignat funciona sense CA (vegeu [Entrant](../rte/modes.html#inbound)).

Com a màxim hi pot haver 20 RTE esperant aprovació alhora: els altres es rebutgen fins que se n'aprovin o rebutgin alguns. Una sol·licitud que ningú no gestiona en
24 hores l'elimina el worker, juntament amb la seva credencial.

Un RTE amb el nom d'un runner que l'aplicació ja coneix, però amb un altre token, es rebutja i no demana unir-se. Dona-li el token d'aquell
runner, o suprimeix el runner perquè demani unir-se. Un [token d'unió](#join-tokens) només ajuda mentre aquell runner encara espera aprovació.

---

## Aprovar un RTE

Els runners pendents d'aprovació surten de la llista de **Connexions > Runners** i passen a un avís taronja damunt seu, com ara
**2 Runners esperen aprovació**, amb una línia per runner: el seu nom, host, adreça IP, mode, adreça i empremta.
La campana de la capçalera els compta, per als usuaris que poden veure els runners (vegeu [la campana](../jobs/#the-jobs-page)).

Un clic a l'avís obre el diàleg **Revisar l'aprovació** per a cada runner, un rere l'altre; un clic en un nom obre només aquell.
La seva pàgina mostra les mateixes dades en un requadre groc, **Aquest RTE ha demanat unir-se**. Comprova que és un que has iniciat tu abans d'aprovar-lo:

| Camp | Què mostra |
|---|---|
| Empremta | Els 8 primers dígits hexadecimals del SHA-256 del seu `RTE_TOKEN`, com a `abcd-ef12`. L'RTE la registra en arrencar, i l'[instal·lador](../installation/installer.html#a-runner) la mostra al final. Ha de ser la mateixa |
| Empremta del certificat | Al diàleg, per a un RTE entrant per HTTPS: els 8 primers dígits hexadecimals del SHA-256 del certificat que fixa l'aplicació (els seus bytes DER), com a `abcd-ef12`. L'RTE la registra en arrencar i l'[instal·lador](../installation/installer.html#a-runner) la mostra al final. Ha de ser la mateixa |
| Host | L'host on s'executa |
| Adreça IP | L'adreça des d'on ha trucat a l'aplicació |
| Mode | Sortint o Entrant |
| URI | L'adreça d'un RTE entrant, on hi truca l'aplicació |
| Versió | La seva versió |
| Sol·licitat el | Quan ha demanat unir-se |

**Aprova** i **Rebutja**, al diàleg o al requadre de la seva pàgina, decideixen:

| Acció | Què passa |
|---|---|
| Aprova | El runner s'activa i rep tasques a partir d'ara. Passa a ser el predeterminat del seu tipus quan no n'hi ha cap |
| Rebutja | El runner s'elimina juntament amb la seva credencial, i el seu sòcol es tanca. L'RTE pot tornar a demanar unir-se; llavors torna a esperar aprovació |

Només un admin aprova o rebutja un RTE.

---

## Tokens d'unió

Un token d'unió aprova un RTE a l'instant, per a instal·lacions desateses: un RTE iniciat amb
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), o un Runner instal·lat amb el `--join` de l'instal·lador, el presenta una vegada
i el seu runner s'afegeix activat, sense esperar. Els tokens d'unió no tenen cap pàgina a la interfície: un admin els crea a través de
l'[API REST](../api/), sota `/api/v2/runner`:

| Crida | Què fa |
|---|---|
| `POST /api/v2/runner/jointoken` | Crea un token d'unió. El cos conté el seu `name`, i opcionalment `expiresInHours` (cap: no caduca mai) i `maxUses` (cap: qualsevol nombre d'RTE) |
| `GET /api/v2/runner/jointoken` | Llista els tokens d'unió, el més nou primer, amb els seus usos i si encara es poden fer servir; mai els tokens en si |
| `POST /api/v2/runner/jointoken/<id>/revoke` | El revoca: ja no afegeix cap runner, i es queda a la llista |
| `DELETE /api/v2/runner/jointoken/<id>` | El suprimeix |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

La resposta conté el token, que comença per `afj_`, aquesta única vegada: només se'n desa el SHA-256. Un RTE que el presenta rep la mateixa
credencial i el mateix runner que un que [demana unir-se](#asking-to-join), activat, i la seva descripció nomena el token d'unió. A partir d'aleshores l'RTE
inicia sessió amb el seu propi token, de manera que el token d'unió pot caducar o revocar-se sense afectar-lo. Revocar o suprimir un token d'unió
no elimina els runners que ha afegit.

Un token d'unió mai no dona un token nou a un runner aprovat. Quan ja existeix un runner RTE amb aquest nom:

| El runner | Què passa |
|---|---|
| Espera aprovació | Rep el token nou a la seva credencial, i continua esperant l'aprovació d'un admin |
| Està aprovat | Es rebutja amb `409`: *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. El token d'unió no es gasta |
| Ve de la [llavor de configuració](../seed/) | Es rebutja: *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

Per tant, un RTE que s'ha tornat a instal·lar amb un token nou inicia sessió amb el token de la credencial del seu runner, o bé un admin canvia aquest token
a **Connexions > Credencials**, o suprimeix el runner perquè l'RTE s'uneixi com a nou.

---

## Registre en mode base de dades

Un RTE en mode base de dades, obsolet des de la 7.3.0, es registra ell mateix per defecte, al seu `RTE_URL` o, si no, a la seva pròpia adreça i port. El
worker elimina un runner d'aquests quan el seu RTE fa 10 minuts que no escriu cap heartbeat. Un runner afegit a mà, per la llavor de configuració o per un
RTE en un mode de sòcol no s'elimina mai d'aquesta manera.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), que activa o desactiva aquest registre, és obsolet a la 7.3.0 juntament amb el
mode base de dades: un RTE en un mode de sòcol demana unir-se, o s'uneix amb un token d'unió. Per gestionar tu mateix aquests runners mentrestant, inicia
l'RTE amb `RTE_REGISTER=0` i afegeix-lo aquí amb el tipus RTE, el mode **Base de dades (obsolet)**, i una credencial RTE amb la seva adreça i el
mateix token. Per passar-lo a un mode de sòcol, vegeu [Modes](../rte/modes.html#database-deprecated).

