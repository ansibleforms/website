---
layout: default
title: Autenticació
parent: API REST
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# Autenticació
{: .no_toc }

Iniciar sessió, renovar el token o fer servir un token de llarga durada
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cada crida necessita un token d'accés a la capçalera `Authorization`. Un token s'obté iniciant sessió, i es manté vigent amb
el token de renovació.

---

## Iniciar sessió

Inicia sessió amb autenticació bàsica, amb el nom i la contrasenya de l'usuari:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

La resposta conté dos tokens, el token d'accés i el token de renovació:

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Cridar l'API

Envia el token d'accés com a token bearer amb cada crida:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Renovar el token

El token d'accés caduca (`ACCESS_TOKEN_EXPIRATION`, 30 minuts per defecte). Obtén-ne un de nou amb el token de renovació,
sense la contrasenya:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

La resposta conté un parell nou, amb la mateixa forma que l'inici de sessió. Un token de renovació funciona una sola vegada: guarda el nou per a la renovació següent.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Tokens de llarga durada

Un script que s'executa desatès pot fer servir un token que duri més. Des de la 7.3.0 necessita l'opció de rol `allowApiTokens`:

* Crea'n un a [Perfil > Tokens d'API](../profile/api-token.html).
* O inicia sessió amb el paràmetre de consulta `expiryDays`, per obtenir un token vàlid durant aquest nombre de dies:

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` només es llegeix de l'URL, mai del cos. Per a un usuari amb rols que no tenen `allowApiTokens`, s'ignora,
i l'inici de sessió retorna un token amb la durada habitual. `expiryDays=never` també necessita `extendedTokenExpiration`. Afegeix el paràmetre de consulta `name`
(`?expiryDays=90&name=nightly-backup`) per posar nom al token a la llista de tokens de l'usuari.

Un token de llarga durada dura com a màxim [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) dies, 90 per
defecte: un `expiryDays` més llarg es retalla a aquest valor, tret que sigui `never`. Renovar-lo retorna un token ordinari, així que torna a iniciar sessió quan caduqui.

### Tokens de l'usuari que ha iniciat sessió

La vista **Tokens d'API** del perfil fa servir aquests endpoints, que funcionen per a qualsevol compte, SSO inclòs, perquè no necessiten contrasenya:

| Crida | Què fa |
|---|---|
| `GET /api/v2/profile/tokens` | Llista els teus tokens d'API, amb el seu `sid`, `name`, creació, caducitat i darrer ús |
| `POST /api/v2/profile/tokens` | Crea un token a partir de la teva sessió; el cos conté `expiryDays` (un número, o `never`) i un `name` opcional |
| `DELETE /api/v2/profile/tokens/{sid}` | Revoca un dels teus tokens |

`POST` respon `403` quan es crida amb un token d'API (un token no en pot crear un altre), sense `allowApiTokens`, o quan la
sessió es va iniciar fa més de 10 minuts (codi `sign_in_again`): torna a iniciar sessió primer. Una durada per sobre del màxim respon `400`.

---

## Quan un token s'acaba abans d'hora

Un token, de llarga durada o no, deixa de funcionar abans de caducar quan passa una d'aquestes coses:

* **Un tancament de la seva sessió**: `POST /api/v2/auth/logout` amb el token acaba els tokens d'aquell inici de sessió, i només aquests. Un
  tancament de sessió al navegador no acaba el token d'un script.
* **Un canvi de contrasenya**: l'usuari canvia la seva contrasenya, o un administrador la defineix. Es rebutja qualsevol token emès abans.
* **L'usuari s'elimina o es bloqueja**: suprimir un usuari local, o bloquejar un usuari, acaba tots els seus tokens. Un administrador també pot
  acabar les sessions d'un usuari de LDAP o SSO.

Un token rebutjat respon `401`. Torna a iniciar sessió, amb la contrasenya nova si ha canviat.

---

## Scripts que inicien sessió a cada execució

Els endpoints d'inici de sessió i de tokens estan protegits contra allaus de peticions i contra l'endevinament de contrasenyes, així que un script que inicia sessió cada vegada que s'executa
hauria de conèixer aquests límits:

| Límit | Predeterminat | Què passa |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 peticions per minut des d'una adreça | L'inici de sessió, el tancament de sessió, la renovació, els endpoints d'SSO, `PUT /api/v2/profile` (canvi de contrasenya) i `POST` o `DELETE /api/v2/profile/tokens` responen `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 inicis de sessió fallits seguits | El compte es bloqueja durant [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15), i qualsevol inici de sessió respon `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 inicis de sessió fallits des d'una adreça | Qualsevol inici de sessió des d'aquesta adreça respon `429` fins que s'acaba la finestra |

Un `429` porta una capçalera `Retry-After` amb els segons que cal esperar: atura't i espera, no ho tornis a provar de seguida. Un compte bloquejat
rebutja fins i tot la contrasenya correcta fins que s'acaba el bloqueig, així que un script amb una contrasenya incorrecta bloqueja el seu usuari per a tothom.
Una contrasenya actual incorrecta en un canvi de contrasenya (`PUT /api/v2/profile`) també compta com a inici de sessió fallit, i un compte bloquejat
no pot canviar la seva contrasenya. Un inici de sessió correcte posa a zero el comptador del compte, i també ho fa que un administrador defineixi la contrasenya.

Per no topar amb aquests límits, inicia sessió una vegada i reutilitza el token, o fes servir un token de llarga durada, en lloc d'iniciar sessió a
cada crida. Darrere d'un servidor intermediari invers, defineix [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) perquè el servidor vegi
l'adreça del client, o tots els clients comptaran com un de sol.
