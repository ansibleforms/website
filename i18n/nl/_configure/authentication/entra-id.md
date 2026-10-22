---
layout: default
title: Entra ID
parent: Authenticatie
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Single sign-on met Microsoft Entra ID (Azure AD), met rollen op basis van de Entra ID-groepen van de gebruiker
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Hoe het werkt

Met een ingeschakelde Entra ID-provider toont de aanmeldpagina een Entra ID-knop onder **Aanmelden**. Een aanmelding verloopt dan als volgt:

1. De knop stuurt de browser naar `/api/v2/auth/entraid`, dat hem doorstuurt naar Microsoft.
2. De gebruiker meldt zich aan bij Microsoft, dat met een autorisatiecode terugstuurt naar de **Omleidings-URI**. De server
   wisselt die code bij Microsoft in voor het ID-token en een toegangstoken voor Microsoft Graph.
3. De server leest de groepen van de gebruiker uit Microsoft Graph (`/v1.0/me/transitiveMemberOf`), zodat geneste groepen ook meetellen.
4. De groepen worden met het **Groepfilter** op hun weergavenaam gefilterd, en elke groep die overblijft wordt twee keer opgeslagen,
   als `azuread/<object id>` en als `azuread/<display name>`.

De gebruikersnaam is de claim `upn` van het token, bijv. `jdoe@example.com`, of de claim `preferred_username` als het token
geen `upn` heeft; voor een werkaccount bevatten beide dezelfde waarde.

---

## De applicatie registreren

AnsibleForms heeft een app-registratie nodig in het Entra-beheercentrum, onder **App registrations > New registration**:

1. Geef haar een naam, kies **Accounts in this organizational directory only** als ondersteunde accounttypen, en voeg een
   omleidings-URI van het type **Web** toe: `https://af.example.com/api/v2/auth/entraid/callback`.
2. Maak onder **Certificates & secrets** een clientgeheim aan en kopieer de waarde; die wordt maar één keer getoond.
3. Voeg onder **API permissions** de **gedelegeerde** Microsoft Graph-machtigingen `User.Read` en `GroupMember.Read.All` toe,
   en verleen er beheerderstoestemming voor.
4. Noteer op de pagina **Overview** de **Application (client) ID** en de **Directory (tenant) ID**.

De omleidings-URI is het adres waarop gebruikers AnsibleForms bereiken, gevolgd door `/api/v2/auth/entraid/callback`.
Met [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms` wordt dat
`https://af.example.com/forms/api/v2/auth/entraid/callback`. Hij moet exact overeenkomen met de **Omleidings-URI** van de
referentie van de provider.

Tot en met 7.2.0 was het pad `/api/v2/auth/azureadoauth2/callback`. Vanaf 7.3.0 werkt het nog steeds, dus een bestaande registratie
hoeft niet te worden gewijzigd; een referentie met een lege **Omleidings-URI** gebruikt het nieuwe pad, dus voeg dat dan aan de registratie toe.

AnsibleForms leest de groepen uit Graph en gebruikt geen groepsclaim in het token, dus er hoeft geen groepsclaim
op de registratie te worden geconfigureerd.

---

## De provider toevoegen

Voeg de provider toe onder **Toegang > SSO**: een wizard vraagt de velden in vier stappen, met **Microsoft Entra ID** in de stap **Type**:

| Stap | Veld | Betekenis |
|---|---|---|
| Details | Naam, Beschrijving | Een unieke naam voor de provider, en een optionele beschrijving |
| Type | Provider | **Microsoft Entra ID**; ingesteld bij het aanmaken, blijft zo |
| Referenties | Referentie | Een referentie van het type **Microsoft Entra ID** uit [Verbindingen > Inloggegevens](../credentials.html), zie hieronder |
| Groepen | Groepfilter | Reguliere expressie; alleen de groepen waarvan de weergavenaam overeenkomt blijven over. Leeg houdt elke groep |

De referentie bevat de app-registratie, dus alleen een admin kan haar toevoegen of wijzigen:

| Veld | Betekenis |
|---|---|
| Tenant ID | Verplicht. De Directory (tenant) ID, een GUID, of een van de domeinen van de tenant. Alleen gebruikers van die tenant kunnen zich aanmelden |
| Client ID | De Application (client) ID |
| Client secret | De waarde van het clientgeheim, versleuteld opgeslagen of gelezen uit een [secret store](../secret-stores/) |
| Omleidings-URI | Zoals geregistreerd, bijv. `https://af.example.com/api/v2/auth/entraid/callback`. Leeg: de URL van de app en het callbackpad |

Een referentie met een lege tenant ID wordt bij het opslaan geweigerd. De multi-tenant-endpoints `common`, `organizations`
en `consumers` worden geweigerd wanneer de provider die de referentie noemt wordt opgeslagen, omdat ze gebruikers van elke
Microsoft-tenant zouden laten aanmelden. Bij het aanmelden controleert de server ook dat het token van de geconfigureerde tenant komt. Een provider
die eerder zonder tenant ID is opgeslagen, meldt niemand aan: zolang de tenant ID niet is ingevuld, logt de server
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Tot en met 7.2.0 waren de tenant, de client ID, het geheim en de redirect URL velden van de provider. De upgrade naar 7.3.0 verplaatst ze naar een
referentie met de naam `<provider>-sso`, zie [Adressen in referenties](../credentials/types.html#addresses-in-credentials).
Kies voor elke nieuwe provider een referentie: de server accepteert nog steeds een provider met een eigen client ID en geheim van
vóór 7.3.0, die zich daarmee aanmeldt totdat er een referentie is gekozen.

Er is steeds één Entra ID-provider ingeschakeld, degene waarmee de Entra ID-knop aanmeldt. **Inschakelen** in het menu van de rij van een andere,
of zijn schakelaar **Ingeschakeld**, schakelt de andere van hetzelfde type uit; de kolom **Ingeschakeld** van de lijst toont welke in gebruik is. Een provider
kan ook de aanmeldpagina overslaan, zie [Single sign-on omschakelen](./#switching-single-sign-on). Opslaan past het meteen toe, zonder herstart.

---

## Koppelen aan rollen

In config.yaml is een Entra ID-groep `entraid/<object id>` of `entraid/<display name>`, en een gebruiker `entraid/<upn>`.
Het object-id is uniek in de tenant en dus de veiligere keuze; een weergavenaam is makkelijker te lezen:

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

Tot en met 7.2.0 was het voorvoegsel `azuread/`. In een rol matcht het vanaf 7.3.0 nog steeds dezelfde leden en wordt het in 8.0 verwijderd; de
roleditor schrijft `entraid/`. Alleen de rollen accepteren `entraid/`: de groepen van de gebruiker worden opgeslagen als `azuread/<object id>` en
`azuread/<display name>`, en de profielpagina en de extravar `ansibleforms_user` tonen ze zo. Een **Groepfilter** zoals `^AF-` houdt alleen de groepen over die je rollen gebruiken; zie [Rollen](../config/roles.html). Vanaf 7.1.0
draagt het aanmeldtoken de groepen niet meer, dus de grootte ervan groeit er niet meer mee. Het filter blijft belangrijk voor
gebruikers in veel groepen: er worden bij elke aanmelding minder groepen met de rollen vergeleken, en het
[directoryrecord](../users-and-groups/directory.html) van de gebruiker toont alleen de groepen die meetellen. Vóór 7.1.0
heeft een gebruiker in honderd groepen of meer het nodig om überhaupt formulieren te zien, zie
[Lege formulieren en jobs na een single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Microsoft Graph-endpoint

De server meldt gebruikers standaard aan bij `https://login.microsoftonline.com` en roept Microsoft Graph aan op `https://graph.microsoft.com`:

| Variabele | Wat ze wijzigt |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | De aanmeldautoriteit, voor een nationale cloud zoals `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | Het Graph-endpoint waaruit de groepen worden gelezen, zoals `https://graph.microsoft.us` |

Beide nemen een basis-URI zonder afsluitende slash, en zijn nieuw in 7.3.0. `AZURE_AUTHORITY_URI` en `AZURE_GRAPH_URI` worden nog gelezen
als die niet zijn ingesteld, met een waarschuwing in het log, en worden in 8.0 verwijderd. De server moet Graph kunnen bereiken: een aanmelding mislukt als de groepen niet kunnen worden gelezen.

---

## Beperkingen

Entra ID-gebruikers melden zich aan bij Microsoft, dus een paar dingen werken anders dan bij lokale en LDAP-accounts:

- Ze hebben geen wachtwoord in AnsibleForms, dus ze kunnen het daar niet wijzigen; een [API-token](../profile/api-token.html) wordt gemaakt vanuit hun sessie.
- Weergavenamen zijn niet uniek in Entra ID: twee groepen met dezelfde naam worden aan dezelfde rol gekoppeld. Noem de groep in de rol bij zijn
  object-id, `entraid/<object id>`, om alleen die groep te matchen.
