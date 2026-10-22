---
layout: default
title: Token d'API
parent: El teu perfil
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# Token d'API
{: .no_toc }

Crea un token per a scripts i agents d'IA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qui en pot crear un

Un token de llarga durada permet que els scripts cridin l'API sense la teva contrasenya. A partir de la 7.3.0 necessita l'opció de rol `allowApiTokens`:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Fins a la 7.2.0, l'opció era només `extendedTokenExpiration`. A un rol d'abans de la 7.3.0 que només defineix aquesta opció se li dona
`allowApiTokens`, de manera que conserva els seus tokens; amb totes dues, també es pot crear un token que no caduqui mai. Vegeu [Opcions de rol](../config/roles.html#role-options).

---

## Crear un token

**Nou token**, a la línia del títol de **Perfil > Tokens d'API**, obre un assistent en tres passos:

1. **Detalls**: un nom, perquè reconeguis el token a la llista, i quant de temps és vàlid. Les opcions són 30, 90, 180
   o 365 dies fins a [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 per defecte), aquest
   mateix màxim, i **No caduca mai** amb `extendedTokenExpiration`. Tria el període més curt que necessiti el teu script.
2. **Confirma**: un compte local o d'LDAP introdueix la seva contrasenya, que no es desa al token. Un compte de Microsoft Entra ID o
   d'OIDC no té contrasenya aquí: el seu token es crea a partir de la seva sessió, que ha d'haver iniciat la sessió com a màxim 10 minuts
   abans, així que el proveïdor et pot demanar primer que tornis a iniciar la sessió.
3. **Copia**: el token, que es mostra **només un cop**. Copia'l amb **Copia** i guarda'l amb la mateixa cura que una contrasenya.

Envia el token a la capçalera `Authorization` de cada crida a l'API:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

Un token d'API no en pot crear un altre. El token d'un compte SSO porta els rols del seu últim inici de sessió: un canvi de grup al
proveïdor d'identitat només hi arriba quan tornes a iniciar la sessió i crees un token nou.

---

## Els teus tokens

Els tokens que has creat es mostren amb el seu nom i amb quan es va crear cadascun, quan caduca i quan es va fer servir per última vegada; **Revoca** al menú d'una fila n'invalida un.
Un administrador també els veu i els revoca a la teva pàgina a **Configuració > Usuaris**. Un token deixa de funcionar quan caduca, o abans:

- **en revocar-lo**, des de la llista;
- **en tancar la sessió amb el token** (`POST /api/v2/auth/logout` amb el token a la capçalera `Authorization`), cosa que l'invalida juntament amb
  la sessió en què es va crear;
- **en canviar la contrasenya**, cosa que invalida tots els tokens i les sessions del teu compte creats abans, i en bloquejar el teu compte.

Un token que no caduca mai també deixa de funcionar en aquests casos. Un script també pot demanar un token pel seu compte a través de l'API d'inici de sessió i
el seu paràmetre `expiryDays` (`POST /api/v2/auth/login?expiryDays=90`, o `expiryDays=never`); un `expiryDays` més llarg es retalla
a `API_TOKEN_MAX_DAYS`.
