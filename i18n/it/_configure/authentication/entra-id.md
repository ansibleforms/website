---
layout: default
title: Entra ID
parent: Autenticazione
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Single sign-on con Microsoft Entra ID (Azure AD), con i ruoli ricavati dai gruppi Entra ID dell'utente
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Come funziona

Con un provider Entra ID abilitato, la pagina di accesso mostra un pulsante Entra ID sotto **Accedi**. Un accesso procede così:

1. Il pulsante manda il browser a `/api/v2/auth/entraid`, che lo reindirizza a Microsoft.
2. L'utente accede da Microsoft, che lo reindirizza di nuovo all'**URI di reindirizzamento** con un codice di autorizzazione. Il server
   scambia quel codice con Microsoft per l'ID token e un access token per Microsoft Graph.
3. Il server legge i gruppi dell'utente da Microsoft Graph (`/v1.0/me/transitiveMemberOf`), quindi contano anche i gruppi annidati.
4. I gruppi vengono filtrati con il **Filtro gruppi** sul loro nome visualizzato, e ogni gruppo tenuto viene salvato due volte,
   come `azuread/<object id>` e come `azuread/<display name>`.

Il nome utente è la claim `upn` del token, es. `jdoe@example.com`, oppure la claim `preferred_username` quando il token
non ha `upn`; per un account aziendale entrambe contengono lo stesso valore.

---

## Registrare l'applicazione

AnsibleForms ha bisogno di una registrazione dell'app nell'Entra admin center, in **App registrations > New registration**:

1. Dalle un nome, scegli **Accounts in this organizational directory only** come tipi di account supportati, e aggiungi un
   URI di reindirizzamento di tipo **Web**: `https://af.example.com/api/v2/auth/entraid/callback`.
2. In **Certificates & secrets**, crea un client secret e copiane il valore; viene mostrato una sola volta.
3. In **API permissions**, aggiungi i permessi **delegated** di Microsoft Graph `User.Read` e `GroupMember.Read.All`,
   e concedi per essi il consenso dell'amministratore.
4. Nella pagina **Overview**, annota l'**Application (client) ID** e il **Directory (tenant) ID**.

L'URI di reindirizzamento è l'indirizzo con cui gli utenti raggiungono AnsibleForms, seguito da `/api/v2/auth/entraid/callback`.
Con [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms`, diventa
`https://af.example.com/forms/api/v2/auth/entraid/callback`. Deve corrispondere esattamente all'**URI di reindirizzamento** della
credenziale del provider.

Fino alla 7.2.0 il percorso era `/api/v2/auth/azureadoauth2/callback`. Funziona ancora dalla 7.3.0, quindi una registrazione esistente
non va modificata; una credenziale con l'**URI di reindirizzamento** vuoto usa il nuovo percorso, quindi in quel caso aggiungilo alla registrazione.

AnsibleForms legge i gruppi da Graph e non usa una claim dei gruppi nel token, quindi non serve configurare nessuna claim di gruppo
nella registrazione.

---

## Aggiungere il provider

Aggiungi il provider in **Accesso > SSO**: una procedura guidata chiede i suoi campi in quattro passaggi, con **Microsoft Entra ID** nel passaggio **Tipo**:

| Passaggio | Campo | Significato |
|---|---|---|
| Dettagli | Nome, Descrizione | Un nome unico per il provider, e una descrizione facoltativa |
| Tipo | Provider | **Microsoft Entra ID**; si imposta quando viene creato, e resta |
| Credenziali | Credenziale | Una credenziale **Microsoft Entra ID** di [Connessioni > Credenziali](../credentials.html), vedi sotto |
| Gruppi | Filtro gruppi | Espressione regolare; si tengono solo i gruppi il cui nome visualizzato corrisponde. Vuoto tiene tutti i gruppi |

La credenziale contiene la registrazione dell'app, quindi solo un admin può aggiungerla o modificarla:

| Campo | Significato |
|---|---|
| Tenant ID | Obbligatorio. Il Directory (tenant) ID, un GUID, o uno dei domini del tenant. Solo gli utenti di quel tenant possono accedere |
| Client ID | L'Application (client) ID |
| Client secret | Il valore del client secret, salvato cifrato o letto da un [archivio di segreti](../secret-stores/) |
| URI di reindirizzamento | Come registrato, es. `https://af.example.com/api/v2/auth/entraid/callback`. Vuoto: l'URL dell'app e il percorso di callback |

Una credenziale con il tenant ID vuoto viene rifiutata al salvataggio. Gli endpoint multi-tenant `common`, `organizations`
e `consumers` vengono rifiutati quando si salva il provider che indica la credenziale, perché permetterebbero di accedere agli utenti di qualsiasi
tenant Microsoft. All'accesso, il server verifica anche che il token provenga dal tenant configurato. Un provider
salvato in passato senza tenant ID non fa accedere nessuno: finché il tenant ID non viene compilato, il server registra
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Fino alla 7.2.0 il tenant, il client ID, il secret e l'URL di reindirizzamento erano campi del provider. L'aggiornamento alla 7.3.0 li sposta in una
credenziale chiamata `<provider>-sso`, vedi [Indirizzi nelle credenziali](../credentials/types.html#addresses-in-credentials).
Scegli una credenziale per ogni nuovo provider: il server accetta ancora un provider con un proprio client ID e secret di
prima della 7.3.0, che accede con quelli finché non si sceglie una credenziale.

Si abilita un solo provider Entra ID alla volta, quello con cui accede il pulsante Entra ID. **Abilita** nel menu di riga di un altro,
o il suo interruttore **Abilitato**, disattiva gli altri del suo tipo; la colonna **Abilitato** della lista mostra quale è in uso. Un provider
può anche saltare la pagina di accesso, vedi [Attivare il single sign-on](./#switching-single-sign-on). Il salvataggio lo applica subito, senza riavvio.

---

## Corrispondenza con i ruoli

In config.yaml, un gruppo Entra ID è `entraid/<object id>` o `entraid/<display name>`, e un utente è `entraid/<upn>`.
L'object id è unico nel tenant, quindi è la scelta più sicura; un nome visualizzato è più facile da leggere:

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

Fino alla 7.2.0 il prefisso era `azuread/`. In un ruolo corrisponde ancora agli stessi membri dalla 7.3.0 e verrà rimosso nella 8.0; l'editor
dei ruoli scrive `entraid/`. Solo i ruoli accettano `entraid/`: i gruppi dell'utente sono salvati come `azuread/<object id>` e
`azuread/<display name>`, e la pagina del profilo e la extravar `ansibleforms_user` li mostrano così. Un **Filtro gruppi** come `^AF-` tiene solo i gruppi usati dai tuoi ruoli; vedi [Ruoli](../config/roles.html). Dalla 7.1.0
il token di accesso non contiene più i gruppi, quindi la sua dimensione non cresce più con essi. Il filtro conta ancora per
gli utenti con molti gruppi: a ogni accesso si confrontano meno gruppi con i ruoli, e il
[record della directory](../users-and-groups/directory.html) dell'utente elenca solo i gruppi che contano. Prima della 7.1.0,
un utente con cento gruppi o più ne ha bisogno per vedere qualsiasi modulo, vedi
[Moduli e job vuoti dopo un single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Endpoint di Microsoft Graph

Il server fa accedere gli utenti su `https://login.microsoftonline.com` e chiama Microsoft Graph su `https://graph.microsoft.com` per impostazione predefinita:

| Variabile | Cosa cambia |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | L'authority di accesso, per un cloud nazionale come `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | L'endpoint Graph da cui si leggono i gruppi, come `https://graph.microsoft.us` |

Entrambe accettano un URI di base senza slash finale, e sono nuove nella 7.3.0. `AZURE_AUTHORITY_URI` e `AZURE_GRAPH_URI` vengono ancora lette
quando quelle non sono impostate, con un avviso nel log, e verranno rimosse nella 8.0. Il server deve raggiungere Graph: un accesso non riesce quando i gruppi non si possono leggere.

---

## Limitazioni

Gli utenti Entra ID accedono con Microsoft, quindi alcune cose funzionano in modo diverso rispetto agli account locali e LDAP:

- Non hanno una password in AnsibleForms, quindi non possono cambiarla lì; un [token API](../profile/api-token.html) viene creato dalla loro sessione.
- I nomi visualizzati non sono unici in Entra ID: due gruppi con lo stesso nome corrispondono allo stesso ruolo. Indica il gruppo con il suo
  object id nel ruolo, `entraid/<object id>`, per corrispondere solo a quel gruppo.
