---
layout: default
title: Secrets i xifratge
parent: Seguretat
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# Secrets i xifratge
{: .no_toc }

Els dos secrets mestres, què protegeixen, i quant duren les sessions i els tokens
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Els dos secrets mestres

Dos secrets protegeixen tota la resta. Defineix-los tots dos abans que la instància contingui dades reals, desa'ls fora de la instància,
i no els canviïs mai a la lleugera:

| Secret | Què protegeix | Si no està definit | Si es perd o es canvia |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Totes les contrasenyes i tots els tokens desats a la base de dades: credencials, la contrasenya de bind de LDAP, els tokens dels runners, els secrets de client SSO, les adreces de webhook de Slack i Teams, la clau d'API del xat | Es fa servir una clau predeterminada, que és pública al codi font | Si es perd: cal tornar a introduir tots els secrets desats. Si es canvia: des de la 7.3.0 tots els secrets desats es tornen a xifrar, vegeu [més avall](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | La signatura dels access tokens i dels refresh tokens, inclosos els [tokens d'API](../profile/api-token.html) de llarga durada | Es genera un secret aleatori a cada arrencada, de manera que cada reinici tanca la sessió de tothom | Totes les sessions i tots els tokens d'API deixen de ser vàlids |

Tots dos es registren com a avís `[SECURITY]` en arrencar mentre falten. Les pàgines de configuració no permeten editar-los,
l'API no els retorna mai, i les còpies de seguretat els deixen fora a propòsit, de manera que un `ENCRYPTION_SECRET` perdut no es pot recuperar
d'enlloc: conserva'n una còpia al teu gestor de secrets. El secret de xifratge es fa servir com a clau de 32 caràcters; un valor més curt o
més llarg s'emplena o es retalla.

Canviar `ACCESS_TOKEN_SECRET` acaba totes les sessions i tots els tokens d'API alhora. Per acabar els tokens d'un usuari o d'una
sessió, fes servir les revocacions descrites a [Tokens](#tokens).

---

## Canviar el secret de xifratge

Des de la 7.3.0, definir o canviar `ENCRYPTION_SECRET` ja no fa perdre els secrets desats. A la següent arrencada el worker torna a xifrar
cadascun d'ells amb la clau nova, en una sola transacció de base de dades, abans que res més escrigui cap secret:

| Situació | Què cal definir |
|---|---|
| La instància funcionava sense `ENCRYPTION_SECRET`, amb la clau predeterminada pública | Només `ENCRYPTION_SECRET`: els secrets es tornen a xifrar a partir de la clau predeterminada |
| La instància funcionava amb una clau pròpia | `ENCRYPTION_SECRET` amb la clau nova i [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) amb l'antiga, per a aquesta única arrencada |

Quan els secrets desats es van xifrar amb una clau que no és cap de les dues, no es canvia res i l'aplicació es nega a arrencar fins que
`ENCRYPTION_SECRET_PREVIOUS` indiqui aquesta clau. Treu `ENCRYPTION_SECRET_PREVIOUS` un cop l'arrencada els hagi tornat a xifrar, i defineix el
nou `ENCRYPTION_SECRET` a tots els nodes d'aplicació, al worker i a tots els RTE en mode base de dades que es registren ells mateixos. Aquest
autoregistre (`RTE_REGISTER`) és obsolet a la 7.3.0: un RTE que s'uneix amb un token d'unió (`RTE_JOIN_TOKEN`) en mode
de sòcol no necessita `ENCRYPTION_SECRET`, vegeu [Modes de l'RTE](../rte/modes.html).

---

## Tokens

Un inici de sessió retorna un access token de curta durada i un refresh token més llarg, que el navegador fa servir per obtenir un parell nou:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : `30m` per defecte. Un valor més curt
  limita l'ús d'un token interceptat.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : `24h` per
  defecte. És el temps que un navegador inactiu continua amb la sessió iniciada.
* L'opció de rol `allowApiTokens` permet a un usuari demanar un token d'API vàlid durant un nombre de dies, i
  `extendedTokenExpiration` n'hi afegeix un que no caduca mai. Concedeix-les només als rols que necessiten accés a l'API des de scripts.
  A la [pàgina del perfil](../profile/api-token.html) un token es crea des d'una sessió del navegador que ha iniciat sessió fa com a màxim 10 minuts,
  i mai des d'un altre token d'API. Un token que no caduca mai dura 50 anys, i els esdeveniments de més avall també l'acaben.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : `90` per defecte. El màxim que dura un
  token d'API: una petició més llarga s'hi retalla.

Un token és un JWT signat, però el servidor també manté una llista de tokens revocats, compartida per tots els nodes d'aplicació, de manera que un token
pot acabar abans de caducar:

| Esdeveniment | Què acaba |
|-------|-----------|
| Tancar la sessió | Tots els tokens d'aquell inici de sessió: l'access token, el seu refresh token, i un token d'API quan el tancament de sessió el fa servir |
| Un canvi de contrasenya, fet per l'usuari o per un admin | Tots els tokens de l'usuari emesos abans del canvi, tokens d'API inclosos, a tots els dispositius |
| L'interruptor **Permet l'inici de sessió** d'un usuari desactivat (usuari local, LDAP o SSO), o un usuari local suprimit | Tots els tokens de l'usuari |
| **Tanca les sessions** a la pàgina d'un usuari LDAP o SSO | Tots els tokens de l'usuari; pot tornar a iniciar sessió tret que estigui bloquejat |
| **Revoca** en un token d'API, a la pàgina del perfil o a la pestanya **Tokens d'API** de l'usuari | Aquest token d'API, a l'instant |

Un script acaba el seu propi token d'API tancant la sessió amb ell: `POST /api/v2/auth/logout` amb el token a la capçalera
`Authorization`.
