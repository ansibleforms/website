---
layout: default
title: Entra ID
parent: Autenticació
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Inici de sessió únic amb Microsoft Entra ID (Azure AD), amb rols segons els grups d'Entra ID de l'usuari
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Com funciona

Amb un proveïdor Entra ID activat, la pàgina d'inici de sessió mostra un botó d'Entra ID sota **Inicia la sessió**. Un inici de sessió segueix aquests passos:

1. El botó envia el navegador a `/api/v2/auth/entraid`, que el redirigeix a Microsoft.
2. L'usuari inicia sessió a Microsoft, que el redirigeix de tornada a la **URL de redirecció** amb un codi d'autorització. El servidor
   intercanvia aquest codi amb Microsoft per l'ID token i un access token per a Microsoft Graph.
3. El servidor llegeix els grups de l'usuari de Microsoft Graph (`/v1.0/me/transitiveMemberOf`), de manera que els grups niats també compten.
4. Els grups es filtren amb el **Filtre de grups** sobre el seu nom de visualització, i cada grup que es conserva es desa dues vegades,
   com a `azuread/<object id>` i com a `azuread/<display name>`.

El nom d'usuari és el claim `upn` del token, p. ex. `jdoe@example.com`, o el claim `preferred_username` quan el token
no té `upn`; en un compte de feina tots dos contenen el mateix valor.

---

## Registrar l'aplicació

AnsibleForms necessita un registre d'aplicació a l'Entra admin center, a **App registrations > New registration**:

1. Dona-li un nom, tria **Accounts in this organizational directory only** com a tipus de compte admesos i afegeix un
   URI de redirecció de tipus **Web**: `https://af.example.com/api/v2/auth/entraid/callback`.
2. A **Certificates & secrets**, crea un secret de client i copia'n el valor; només es mostra una vegada.
3. A **API permissions**, afegeix els permisos **delegated** de Microsoft Graph `User.Read` i `GroupMember.Read.All`,
   i concedeix-los el consentiment d'administrador.
4. A la pàgina **Overview**, anota l'**Application (client) ID** i el **Directory (tenant) ID**.

L'URI de redirecció és l'adreça amb què els usuaris arriben a AnsibleForms, seguida de `/api/v2/auth/entraid/callback`.
Amb [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms`, passa a ser
`https://af.example.com/forms/api/v2/auth/entraid/callback`. Ha de coincidir exactament amb l'**URI de redirecció** de la
credencial del proveïdor.

Fins a la 7.2.0 el camí era `/api/v2/auth/azureadoauth2/callback`. Continua funcionant des de la 7.3.0, així que un registre existent
no necessita cap canvi; una credencial amb l'**URI de redirecció** buit utilitza el camí nou, així que en aquest cas afegeix-lo al registre.

AnsibleForms llegeix els grups de Graph i no utilitza cap claim de grups al token, així que no cal configurar cap claim de grups
al registre.

---

## Afegir el proveïdor

Afegeix el proveïdor a **Accés > SSO**: un assistent en demana els camps en quatre passos, amb **Microsoft Entra ID** al pas **Tipus**:

| Pas | Camp | Significat |
|---|---|---|
| Detalls | Nom, Descripció | Un nom únic per al proveïdor i una descripció opcional |
| Tipus | Proveïdor | **Microsoft Entra ID**; es fixa quan es crea i no canvia |
| Credencials | Credencial | Una credencial **Microsoft Entra ID** de [Connexions > Credencials](../credentials.html), vegeu més avall |
| Grups | Filtre de grups | Expressió regular; només es conserven els grups el nom de visualització dels quals coincideix. Buit conserva tots els grups |

La credencial conté el registre de l'aplicació, així que només un admin la pot afegir o canviar:

| Camp | Significat |
|---|---|
| ID del tenant | Obligatori. El Directory (tenant) ID, un GUID, o un dels dominis del tenant. Només els usuaris d'aquest tenant poden iniciar sessió |
| ID del client | L'Application (client) ID |
| Secret del client | El valor del secret de client, desat xifrat o llegit d'un [magatzem de secrets](../secret-stores/) |
| URI de redirecció | Tal com està registrat, p. ex. `https://af.example.com/api/v2/auth/entraid/callback`. Buit: la URL de l'aplicació i el camí de retorn |

Una credencial amb l'ID del tenant buit es rebutja quan es desa. Els endpoints multitenant `common`, `organizations`
i `consumers` es rebutgen quan es desa el proveïdor que nomena la credencial, perquè permetrien iniciar sessió a usuaris de qualsevol
tenant de Microsoft. En iniciar sessió, el servidor també comprova que el token ve del tenant configurat. Un proveïdor
desat abans sense ID del tenant no deixa entrar ningú: fins que no s'emplena l'ID del tenant, el servidor registra
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Fins a la 7.2.0 el tenant, l'ID del client, el secret i la URL de redirecció eren camps del proveïdor. L'actualització a la 7.3.0 els trasllada a una
credencial anomenada `<provider>-sso`, vegeu [Adreces a les credencials](../credentials/types.html#addresses-in-credentials).
Tria una credencial per a cada proveïdor nou: el servidor encara accepta un proveïdor amb el seu propi ID de client i secret d'abans
de la 7.3.0, que hi inicia sessió fins que es tria una credencial.

Només hi ha un proveïdor Entra ID activat alhora, aquell amb què inicia sessió el botó d'Entra ID. **Activa** al menú de fila d'un altre,
o el seu interruptor **Activat**, desactiva els altres del seu tipus; la columna **Activat** de la llista mostra quin s'està fent servir. Un proveïdor
també es pot saltar la pàgina d'inici de sessió, vegeu [Activar i desactivar l'inici de sessió únic](./#switching-single-sign-on). En desar, s'aplica a l'instant, sense reiniciar.

---

## Assignació a rols

A config.yaml, un grup d'Entra ID és `entraid/<object id>` o `entraid/<display name>`, i un usuari és `entraid/<upn>`.
L'object id és únic al tenant, així que és l'opció més segura; un nom de visualització és més fàcil de llegir:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

Fins a la 7.2.0 el prefix era `azuread/`. En un rol continua coincidint amb els mateixos membres des de la 7.3.0 i s'elimina a la 8.0; l'editor
de rols escriu `entraid/`. Només els rols accepten `entraid/`: els grups de l'usuari es desen com a `azuread/<object id>` i
`azuread/<display name>`, i així els mostren la pàgina del perfil i l'extravar `ansibleforms_user`. Un **Filtre de grups** com ara `^AF-` conserva només els grups que fan servir els teus rols; vegeu [Rols](../config/roles.html). Des de la 7.1.0
el token d'inici de sessió ja no porta els grups, de manera que la seva mida ja no creix amb ells. El filtre continua sent important per als
usuaris amb molts grups: a cada inici de sessió es comparen menys grups amb els rols, i el
[registre del directori](../users-and-groups/directory.html) de l'usuari només llista els grups que compten. Abans de la 7.1.0,
un usuari amb cent grups o més el necessita per veure algun formulari, vegeu
[Formularis i tasques buits després d'un inici de sessió únic](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Endpoint de Microsoft Graph

Per defecte, el servidor inicia la sessió dels usuaris a `https://login.microsoftonline.com` i crida Microsoft Graph a `https://graph.microsoft.com`:

| Variable | Què canvia |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | L'autoritat d'inici de sessió, per a un núvol nacional com ara `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | L'endpoint de Graph del qual es llegeixen els grups, com ara `https://graph.microsoft.us` |

Totes dues reben un URI base sense barra final, i són noves a la 7.3.0. `AZURE_AUTHORITY_URI` i `AZURE_GRAPH_URI` encara es llegeixen
quan no estan definides, amb un avís al registre, i s'eliminen a la 8.0. El servidor ha de poder arribar a Graph: un inici de sessió falla quan no es poden llegir els grups.

---

## Limitacions

Els usuaris d'Entra ID inicien sessió amb Microsoft, així que algunes coses funcionen de manera diferent que amb els comptes locals i LDAP:

- No tenen contrasenya a AnsibleForms, així que no la hi poden canviar; un [token d'API](../profile/api-token.html) es crea des de la seva sessió.
- Els noms de visualització no són únics a Entra ID: dos grups amb el mateix nom corresponen al mateix rol. Nomena el grup pel seu
  object id al rol, `entraid/<object id>`, perquè només coincideixi amb aquest grup.
