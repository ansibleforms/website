---
layout: default
title: OIDC
parent: Autenticació
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Inici de sessió únic amb un proveïdor OpenID Connect com ara Keycloak, amb rols segons un claim de grups
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Com funciona

Amb un proveïdor OIDC activat, la pàgina d'inici de sessió mostra un botó d'OpenID sota **Inicia la sessió**. Un inici de sessió segueix aquests passos:

1. El botó envia el navegador a `/api/v2/auth/oidc`, que el redirigeix al proveïdor (flux de codi d'autorització
   amb PKCE).
2. L'usuari inicia sessió al proveïdor, que el redirigeix de tornada a la **URL de redirecció**.
3. El servidor intercanvia el codi per tokens i llegeix els claims de l'ID token.
4. El nom d'usuari és el claim `preferred_username`, i cada valor del claim `groups` que passa el
   **Filtre de grups** es converteix en un grup `oidc/<value>`.

AnsibleForms demana els scopes `openid profile email`; els scopes no són configurables. Tancar la sessió d'AnsibleForms
també envia el navegador a l'endpoint de final de sessió del proveïdor, quan el proveïdor en publica un.

{: .note }
> OIDC s'ha provat amb Keycloak. Altres proveïdors funcionen quan compleixen els requisits següents.

---

## Requisits del proveïdor

El proveïdor ha d'oferir el descobriment d'OpenID Connect i un client confidencial per a AnsibleForms:

- **Descobriment**: AnsibleForms llegeix `<issuer>/.well-known/openid-configuration`, així que l'emissor ha de ser accessible des
  del servidor d'AnsibleForms, per HTTPS.
- **Un client confidencial** amb el flux de codi d'autorització, un ID de client i un secret de client.
- **L'URI de redirecció** `https://af.example.com/api/v2/auth/oidc/callback`, és a dir, l'adreça amb què els usuaris arriben a
  AnsibleForms seguida de `/api/v2/auth/oidc/callback`. Amb [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms`, passa a ser `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **Un claim `groups` a l'ID token**, amb una llista de noms de grup. Sense aquest claim, l'usuari no rep cap grup OIDC.
- **Un claim `preferred_username`**, que es converteix en el nom d'usuari.

---

## Exemple amb Keycloak

Aquest exemple utilitza un realm `example` a `https://keycloak.example.com`; l'emissor és llavors
`https://keycloak.example.com/realms/example`. En aquest realm:

1. A **Clients**, crea un client OpenID Connect amb el client ID `ansibleforms`. Activa **Client authentication**,
   mantén **Standard flow** i posa a **Valid redirect URIs** `https://af.example.com/api/v2/auth/oidc/callback`.
2. A la pestanya **Credentials** del client, copia el **Client secret**.
3. A la pestanya **Client scopes**, obre `ansibleforms-dedicated` i afegeix un mapper **By configuration > Group Membership**,
   amb **Token Claim Name** `groups`, **Full group path** desactivat i **Add to ID token** activat.

Amb **Full group path** activat, el claim conté camins com ara `/af-admins`, i llavors el rol ha d'utilitzar `oidc//af-admins`.

---

## Afegir el proveïdor

Afegeix el proveïdor a **Accés > SSO**: un assistent en demana els camps en quatre passos, amb **Open ID** al pas **Tipus**:

| Pas | Camp | Significat |
|---|---|---|
| Detalls | Nom, Descripció | Un nom únic per al proveïdor i una descripció opcional |
| Tipus | Proveïdor | **Open ID**; es fixa quan es crea i no canvia |
| Credencials | Credencial | Una credencial **Open ID** de [Connexions > Credencials](../credentials.html), vegeu més avall |
| Grups | Filtre de grups | Expressió regular; només es conserven els valors del claim `groups` que coincideixen. Buit conserva tots els grups |

La credencial conté el client, així que només un admin la pot afegir o canviar:

| Camp | Significat |
|---|---|
| Emissor | Obligatori. La URL de l'emissor, p. ex. `https://keycloak.example.com/realms/example` |
| ID del client | L'ID de client al proveïdor, p. ex. `ansibleforms` |
| Secret del client | El secret de client, desat xifrat o llegit d'un [magatzem de secrets](../secret-stores/) |
| URI de redirecció | Tal com està registrat, p. ex. `https://af.example.com/api/v2/auth/oidc/callback`. Buit: la URL de l'aplicació i el camí de retorn |

Fins a la 7.2.0 l'emissor, l'ID del client, el secret i la URL de redirecció eren camps del proveïdor. L'actualització a la 7.3.0 els trasllada a una
credencial anomenada `<provider>-sso`, vegeu [Adreces a les credencials](../credentials/types.html#addresses-in-credentials).
Tria una credencial per a cada proveïdor nou: el servidor encara accepta un proveïdor amb el seu propi ID de client i secret d'abans
de la 7.3.0, que hi inicia sessió fins que es tria una credencial.

Només hi ha un proveïdor OIDC activat alhora, aquell amb què inicia sessió el botó d'OpenID. **Activa** al menú de fila d'un altre,
o el seu interruptor **Activat**, desactiva els altres del seu tipus; la columna **Activat** de la llista mostra quin s'està fent servir.
Un proveïdor també es pot saltar la pàgina d'inici de sessió, vegeu [Activar i desactivar l'inici de sessió únic](./#switching-single-sign-on).

Desar el proveïdor l'aplica immediatament. Quan no es pot arribar a l'emissor, el servidor registra
`Failed to initialize OIDC strategy` i els inicis de sessió OIDC fallen fins que es torna a desar el proveïdor o es reinicia el servidor.

---

## Assignació a rols

A config.yaml, un grup OIDC és `oidc/<group>` i un usuari és `oidc/<preferred_username>`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - oidc/af-admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - oidc/jdoe
```

Els valors es comparen exactament, majúscules i minúscules incloses. Vegeu [Rols](../config/roles.html) per a les opcions dels rols.

---

## Limitacions

Els usuaris OIDC inicien sessió al proveïdor, així que algunes coses funcionen de manera diferent que amb els comptes locals i LDAP:

- No tenen contrasenya a AnsibleForms, així que no la hi poden canviar; des de la 7.2.0 un [token d'API](../profile/api-token.html)
  es crea des de la seva sessió.
- Mantén curt el claim `groups`: envia només els grups que importen a AnsibleForms, per exemple amb un client scope dedicat
  o una estructura de grups al proveïdor, o filtra'ls amb el **Filtre de grups**. Des de la 7.1.0 el token d'inici
  de sessió d'AnsibleForms ja no porta els grups; abans, un usuari amb cent grups o més podia no veure cap formulari, vegeu
  [Formularis i tasques buits després d'un inici de sessió únic](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
