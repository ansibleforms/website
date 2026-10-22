---
layout: default
title: Edició i auditoria
parent: Llavor de configuració
nav_order: 5
translated_from: 84af9202344ae1fc62b7b882fdc12f1799dd1bd3
---

# Edició i auditoria
{: .no_toc }

Bloquejar les pàgines de configuració, i què registra el registre d'auditoria
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Desactivar l'edició de l'entorn

`ALLOW_ENV_EDIT=0` fa que les pàgines de configuració siguin només de lectura. Cada variable es continua mostrant amb
el valor vigent i el motiu pel qual no es pot canviar, i l'endpoint de desament respon amb
403.

Fes-lo servir sempre que l'entorn es declari en un altre lloc. Si no, la pàgina de configuració escriu
`persistent/.env`, que en un volum efímer es perd sense avís al següent reinici, i en
un de durador s'allunya del manifest que hauria de ser la referència.

{: .note }
> Les còpies de seguretat inclouen `persistent/.env` com a `managed.env`, de manera que una reconstrucció recupera els ajustos de la base de dades i
> dels camins. **`ENCRYPTION_SECRET` i `ACCESS_TOKEN_SECRET` se n'eliminen**:
> el bolcat del costat conté totes les credencials desades com a text xifrat AES, i escriure la clau que
> el desxifra a la mateixa carpeta faria que n'hi hagués prou amb una còpia de seguretat copiada per llegir-les totes. Defineix
> aquests dos secrets a l'amfitrió de destinació; un comentari al fitxer ho indica.
>
> El que queda encara pot contenir credencials (`DB_PASSWORD`, `METRICS_TOKEN`, un antic `VAULT_TOKEN`), així que el fitxer
> s'escriu amb `0600`. Restaurar-lo és un pas opcional a part en lloc de formar part d'una restauració normal,
> perquè l'amfitrió de la base de dades i els camins que conté descriuen la màquina d'on prové la còpia. El
> diàleg de restauració llista el fitxer i ofereix el seu propi botó *Restaura l'entorn*
> (`POST /api/v2/backup/:folder/restore-env`), que conserva el fitxer anterior com a `.env.bak`.

---

## Què es registra

Cada aplicació que canvia alguna cosa escriu una entrada `seed.apply` al registre d'auditoria, que nomena
els objectes creats, actualitzats, alliberats i purgats. Els valors no es registren mai, perquè la majoria
són secrets. Una aplicació que no canvia res no escriu res, cosa que manté el rastre significatiu. Una
comprovació que troba el fitxer sense canvis no canvia res, de manera que el rastre no guanya una fila cada minut.

Una aplicació demanada a través de l'endpoint es registra dues vegades a propòsit, i les dues files
registren coses diferents: `config-seed.apply.create` és **qui** l'ha demanada, `seed.apply` és
**què** ha canviat.

La pàgina Estat informa de la llavor dues vegades: una **comprovació** que el fitxer encara es pot llegir i analitzar,
i que la darrera recàrrega ha funcionat, i una fila d'**informació** que indica quants registres té
actualment. La comprovació és l'únic lloc que informa quan el fitxer del disc i la configuració
vigent han divergit, perquè una recàrrega fallida deixa la instància en funcionament.

