---
layout: default
title: OIDC
parent: Autenticazione
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Single sign-on con un provider OpenID Connect come Keycloak, con i ruoli ricavati da una claim dei gruppi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Come funziona

Con un provider OIDC abilitato, la pagina di accesso mostra un pulsante OpenID sotto **Accedi**. Un accesso procede così:

1. Il pulsante manda il browser a `/api/v2/auth/oidc`, che lo reindirizza al provider (flusso authorization code
   con PKCE).
2. L'utente accede presso il provider, che lo reindirizza di nuovo all'**URI di reindirizzamento**.
3. Il server scambia il codice con i token e legge le claim dell'ID token.
4. Il nome utente è la claim `preferred_username`, e ogni valore della claim `groups` che supera il
   **Filtro gruppi** diventa un gruppo `oidc/<value>`.

AnsibleForms richiede gli scope `openid profile email`; gli scope non sono configurabili. Disconnettersi da AnsibleForms
manda anche il browser all'endpoint di fine sessione del provider, quando il provider ne pubblica uno.

{: .note }
> OIDC è stato testato con Keycloak. Gli altri provider funzionano quando soddisfano i requisiti qui sotto.

---

## Requisiti del provider

Il provider deve offrire la discovery di OpenID Connect, e un client confidenziale per AnsibleForms:

- **Discovery**: AnsibleForms legge `<issuer>/.well-known/openid-configuration`, quindi l'issuer deve essere raggiungibile dal
  server di AnsibleForms, via HTTPS.
- **Un client confidenziale** con il flusso authorization code, un client ID e un client secret.
- **L'URI di reindirizzamento** `https://af.example.com/api/v2/auth/oidc/callback`, cioè l'indirizzo con cui gli utenti raggiungono
  AnsibleForms seguito da `/api/v2/auth/oidc/callback`. Con [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms`, diventa `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **Una claim `groups` nell'ID token**, che contiene un elenco di nomi di gruppo. Senza di essa, l'utente non riceve gruppi OIDC.
- **Una claim `preferred_username`**, che diventa il nome utente.

---

## Esempio con Keycloak

Questo esempio usa un realm `example` su `https://keycloak.example.com`; l'issuer è quindi
`https://keycloak.example.com/realms/example`. In quel realm:

1. In **Clients**, crea un client OpenID Connect con client ID `ansibleforms`. Attiva **Client authentication**,
   lascia **Standard flow**, e imposta **Valid redirect URIs** a `https://af.example.com/api/v2/auth/oidc/callback`.
2. Nella scheda **Credentials** del client, copia il **Client secret**.
3. Nella scheda **Client scopes**, apri `ansibleforms-dedicated` e aggiungi un mapper **By configuration > Group Membership**,
   con **Token Claim Name** `groups`, **Full group path** disattivato e **Add to ID token** attivato.

Con **Full group path** attivato, la claim contiene percorsi come `/af-admins`, e il ruolo deve allora usare `oidc//af-admins`.

---

## Aggiungere il provider

Aggiungi il provider in **Accesso > SSO**: una procedura guidata chiede i suoi campi in quattro passaggi, con **Open ID** nel passaggio **Tipo**:

| Passaggio | Campo | Significato |
|---|---|---|
| Dettagli | Nome, Descrizione | Un nome unico per il provider, e una descrizione facoltativa |
| Tipo | Provider | **Open ID**; si imposta quando viene creato, e resta |
| Credenziali | Credenziale | Una credenziale **Open ID** di [Connessioni > Credenziali](../credentials.html), vedi sotto |
| Gruppi | Filtro gruppi | Espressione regolare; si tengono solo i valori della claim `groups` che corrispondono. Vuoto tiene tutti i gruppi |

La credenziale contiene il client, quindi solo un admin può aggiungerla o modificarla:

| Campo | Significato |
|---|---|
| Issuer | Obbligatorio. L'URL dell'issuer, es. `https://keycloak.example.com/realms/example` |
| Client ID | Il client ID presso il provider, es. `ansibleforms` |
| Client secret | Il client secret, salvato cifrato o letto da un [archivio di segreti](../secret-stores/) |
| URI di reindirizzamento | Come registrato, es. `https://af.example.com/api/v2/auth/oidc/callback`. Vuoto: l'URL dell'app e il percorso di callback |

Fino alla 7.2.0 l'issuer, il client ID, il secret e l'URL di reindirizzamento erano campi del provider. L'aggiornamento alla 7.3.0 li sposta in una
credenziale chiamata `<provider>-sso`, vedi [Indirizzi nelle credenziali](../credentials/types.html#addresses-in-credentials).
Scegli una credenziale per ogni nuovo provider: il server accetta ancora un provider con un proprio client ID e secret di
prima della 7.3.0, che accede con quelli finché non si sceglie una credenziale.

Si abilita un solo provider OIDC alla volta, quello con cui accede il pulsante OpenID. **Abilita** nel menu di riga di un altro,
o il suo interruttore **Abilitato**, disattiva gli altri del suo tipo; la colonna **Abilitato** della lista mostra quale è in uso.
Un provider può anche saltare la pagina di accesso, vedi [Attivare il single sign-on](./#switching-single-sign-on).

Salvare il provider lo applica immediatamente. Quando l'issuer non è raggiungibile, il server registra
`Failed to initialize OIDC strategy` e gli accessi OIDC non riescono finché il provider non viene salvato di nuovo o il server non si riavvia.

---

## Corrispondenza con i ruoli

In config.yaml, un gruppo OIDC è `oidc/<group>` e un utente è `oidc/<preferred_username>`:

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

I valori si confrontano esattamente, maiuscole e minuscole comprese. Vedi [Ruoli](../config/roles.html) per le opzioni dei ruoli.

---

## Limitazioni

Gli utenti OIDC accedono presso il provider, quindi alcune cose funzionano in modo diverso rispetto agli account locali e LDAP:

- Non hanno una password in AnsibleForms, quindi non possono cambiarla lì; dalla 7.2.0 un [token API](../profile/api-token.html)
  viene creato dalla loro sessione.
- Mantieni corta la claim `groups`: invia solo i gruppi che contano per AnsibleForms, per esempio con uno scope client
  dedicato o una struttura di gruppi presso il provider, oppure filtrali con il **Filtro gruppi**. Dalla 7.1.0 il token
  di accesso di AnsibleForms non contiene più i gruppi; prima, un utente con cento gruppi o più poteva non vedere nessun modulo, vedi
  [Moduli e job vuoti dopo un single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
