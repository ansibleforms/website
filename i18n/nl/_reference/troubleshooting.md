---
layout: default
title: Probleemoplossing
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# Probleemoplossing
{: .no_toc }

Foutmeldingen en symptomen, waarom ze optreden en hoe je ze oplost
{: .fs-6 .fw-300 }

---

Elk probleem hieronder heeft als titel de melding of het symptoom dat je ziet, gevolgd door de oorzaak en de oplossing. Meldingen worden
letterlijk geciteerd zoals AnsibleForms ze schrijft; `<name>` staat voor een waarde die per geval verschilt. De meeste komen in het serverlog
terecht, dat je kunt lezen onder [Serverlog](gui/administration.html#server-log) of met `docker logs`.

**Database en opstarten**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**Configuratie en formulieren**

* [Could not load the forms](#could-not-load-the-forms)
* [De basisconfiguratie heeft een sectie forms](#the-base-config-has-a-forms-section)
* [Een formulier ontbreekt op het dashboard](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Aanmelden**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Authenticatie met Azure AD of OIDC mislukt](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Afgemeld na een herstart of na een dag](#logged-out-after-a-restart-or-after-a-day)
* [Lege formulieren en jobs na een single sign-on (HTTP 431)](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**Jobs**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [Een job toont de status abandoned](#a-job-shows-the-status-abandoned)
* [Een RTE maakt geen verbinding](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Git-repositories en back-ups**

* [Een clone of pull van een repository is mislukt](#a-repository-clone-or-pull-failed)
* [De formulierenrepository is nog niet gecloned](#the-forms-repository-is-not-cloned-yet)
* [Een back-up is mislukt](#a-backup-failed)

De [FAQ](faq.html) behandelt twee verwante problemen uitgebreid: een
[verloren beheerderswachtwoord](faq.html#recovering-a-lost-admin-password) en
[het beperken van de bestemmingen van REST-helpers](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

AnsibleForms start niet, en het log herhaalt deze regels elke 5 seconden:

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Waarom dit gebeurt**

Bij het opstarten wacht AnsibleForms tot de database op een query antwoordt, en het blijft wachten zolang dat niet gebeurt.
De `<reason>` is het eigen bericht van de databasedriver: een geweigerde of verlopen verbinding wijst op de host of de poort,
een access-denied-melding op de gebruikersnaam of het wachtwoord.

**Hoe je het oplost**

Controleer [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) en [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
Binnen een container is `localhost` de container zelf, niet de host waarop MySQL draait. Zorg dat MySQL luistert
op een netwerkadres en dat de gebruiker verbinding mag maken vanaf de AnsibleForms-host. AnsibleForms gaat vanzelf verder zodra
de database antwoordt; er is geen herstart nodig.

---

## Schema is not ready, skipping group and user initialization

De browser opent een databasepagina in plaats van de aanmeldpagina, en het log toont:

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Waarom dit gebeurt**

Het schema `AnsibleForms` ontbreekt of is onvolledig. Een *lege* database wordt bij het opstarten automatisch ingericht, tenzij
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) `0` is. Als dat mislukt, bijvoorbeeld omdat
de databasegebruiker geen schema mag aanmaken, zegt het log `Failed to create the schema automatically : <reason>`. Een schema
dat bestaat maar tabellen mist (`Table '<name>' is not present`) wordt nooit automatisch opnieuw aangemaakt, omdat het aanmaken van het
schema eerst alle tabellen verwijdert. De databasepagina zegt dan *It appears that you have an unuseable schema*.

**Hoe je het oplost**

Geef bij een verse installatie de databasegebruiker het recht om het schema `AnsibleForms` aan te maken en herstart, of druk op
**Aanmaken** op de databasepagina. Bij een gedeeltelijk aanwezig schema herstel je een back-up of verwijder je het onvolledige schema `AnsibleForms`
zodat AnsibleForms het opnieuw kan aanmaken. Het log toont welke tabellen en patches zijn mislukt.

---

## Schema creation is disabled

Het aanmaken van het schema, vanaf de databasepagina of met `POST /api/v2/schema`, mislukt met:

```
Schema creation is disabled
```

**Waarom dit gebeurt**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) is `0`, wat zowel het automatisch
aanmaken bij het opstarten als het endpoint uitschakelt. Op een database die al gebruikers heeft, weigert het endpoint ook aanroepers die niet
als beheerder zijn aangemeld, met `Schema creation requires an authenticated administrator`.

**Hoe je het oplost**

Maak het schema één keer aan met `ALLOW_SCHEMA_CREATION=1` (dat is de standaard), of herstel het uit een back-up, en zet de
variabele daarna terug op `0`. Meld je op een ingerichte database aan als beheerder voordat je het schema opnieuw aanmaakt, en onthoud
dat dit elke tabel verwijdert en opnieuw aanmaakt.

---

## Config seed failed, refusing to start

De container stopt direct na het opstarten, en de uitvoer eindigt met:

```
Config seed failed, refusing to start : <reason>
```

**Waarom dit gebeurt**

Het bestand in [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) kon niet worden toegepast: het is bijvoorbeeld geen geldige
YAML of schendt het seedschema; `<reason>` zegt wat er misging. AnsibleForms weigert te starten in plaats van
te draaien met de helft van zijn gedeclareerde objecten. De reden wordt ook naar standard error geschreven, dus `docker logs` en `kubectl logs` tonen hem.

**Hoe je het oplost**

Corrigeer wat `<reason>` noemt en start opnieuw. Zie [Herladen en opstarten](seed/reloading.html) voor hoe de seed wordt
toegepast, en [Voorbeeld](seed/example.html) voor een geldig bestand.

---

## ENCRYPTION_SECRET is not set

Elke start logt deze waarschuwing:

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

Of de worker weigert te starten met:

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**Waarom dit gebeurt**

Opgeslagen secrets worden versleuteld met [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET): sinds 7.3.0 staan ze in
referenties (onder andere de wachtwoorden en tokens van LDAP-directory's, SSO-providers, runners en secret stores), naast de webhookadressen van Slack
en Teams. Zonder deze variabele wordt een sleutel gebruikt die openbaar in de broncode staat. Sinds 7.3.0 versleutelt een start met een nieuwe
`ENCRYPTION_SECRET` elk opgeslagen secret opnieuw daarmee, in één transactie: vanaf de standaardsleutel als hij voor het eerst wordt
ingesteld, of vanaf [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) als hij verandert. Als de
opgeslagen secrets met geen van beide zijn versleuteld, wordt er niets gewijzigd en start AnsibleForms niet.

**Hoe je het oplost**

Stel `ENCRYPTION_SECRET` in, en bewaar hem bij je andere secrets: back-ups bevatten hem nooit. De volgende start logt
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`. Om hem later te wijzigen, zet je de nieuwe waarde in
`ENCRYPTION_SECRET` en de oude in `ENCRYPTION_SECRET_PREVIOUS` voor één start, en verwijder je daarna `ENCRYPTION_SECRET_PREVIOUS`. Als de
worker weigert te starten, zet je `ENCRYPTION_SECRET_PREVIOUS` op de sleutel waarmee de secrets zijn versleuteld, of zet je de oude waarde terug.

---

## Could not load the forms

Het dashboard toont geen formulieren en meldt:

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Waarom dit gebeurt**

De basisconfiguratie (`config.yaml`) kon niet worden gelezen of is niet geldig. De `<reason>` zegt welke van de twee:

| Reden | Oorzaak |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | Een YAML-syntaxfout |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | Een leeg bestand, of een bestand met alleen commentaar |
| `Duplicate role name(s) : <names>. Each role must appear once.` | Dezelfde rol is twee keer gedefinieerd |
| `There is no config.yaml nor could one be created from template.` | `config.yaml` ontbreekt en de map ervan is niet beschrijfbaar |
| `There is no forms directory nor could there be one created from template.` | De map met formulieren ontbreekt en kan niet worden aangemaakt |
| Elke andere regel | De configuratie schendt het schema, bijvoorbeeld een rol zonder `groups` |

**Hoe je het oplost**

Corrigeer het bestand dat [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) noemt, of de `config.yaml` in de
repository die voor de configuratie wordt gebruikt. Als er bestanden ontbreken, laat je [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) en
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) naar een beschrijfbare, persistente locatie wijzen. Zie
[config.yaml](config/) voor de structuur.

---

## De basisconfiguratie heeft een sectie forms

Na een upgrade vanaf 6.x is het dashboard leeg, en het waarschuwingspaneel toont:

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Waarom dit gebeurt**

Sinds 7.0.0 staat elk formulier in een eigen bestand in de map met formulieren. Formulieren die nog in `config.yaml` staan, worden
genegeerd.

**Hoe je het oplost**

Zet elk formulier in een eigen bestand in [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). Zie
[Upgraden naar 7.x](upgrade-7.html).

---

## Een formulier ontbreekt op het dashboard

Een formulierbestand bestaat, maar een gebruiker ziet het formulier niet op het dashboard.

**Waarom dit gebeurt**

Een gebruiker ziet een formulier alleen als een van de `roles` van het formulier een van zijn rollen is; beheerders zien elk formulier. Elke gebruiker heeft
de rol `default`, dus een formulier met `roles: [default]` is voor iedereen zichtbaar. De rollen van een gebruiker komen uit de groepen en gebruikers
die onder `roles` in `config.yaml` staan. Een formulier zonder `categories` verschijnt onder **Default**, en ontbreekt dus in de
andere categorieën, al staat het nog wel onder **Alle formulieren**. Tot slot wordt een formulier dat niet door de validatie komt, overgeslagen. Het
dashboard toont dan een knop **Deze configuratie heeft Waarschuwingen of fouten**, die meldingen opent zoals:

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**Hoe je het oplost**

Open het waarschuwingspaneel en corrigeer wat het opsomt. Controleer de rollen van de gebruiker onder
[Rechten](profile/permissions.html) in het profiel, en de `roles` en `categories` van het formulier. Zie
[Rollen](config/roles.html) en [Categorieën](config/categories.html). Als twee bestanden dezelfde formuliernaam definiëren,
wint het bestand dat als eerste wordt geladen.

---

## Could not save the forms

Opslaan in de designer mislukt met:

```
Could not save the forms.

Failed to save forms

<messages>
```

**Waarom dit gebeurt**

De designer valideert elk formulier tegen het schema voordat hij iets schrijft. Elke regel van `<messages>` noemt het
formulier en het veld dat een regel schendt. Opties die in 7.0.0 zijn verwijderd, krijgen een eigen melding, bijvoorbeeld
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**Hoe je het oplost**

Corrigeer de velden die de meldingen noemen. Voor opties die 7.0.0 heeft verwijderd, volg je [Upgraden naar 7.x](upgrade-7.html).
Om formulierbestanden te valideren voordat ze AnsibleForms bereiken, zie
[VS Code-validatie voor formulierbestanden](faq.html#vs-code-validation-for-form-files) in de FAQ.

---

## The editor is read-only

De designer toont **Vergrendeld door** met de naam van een andere gebruiker, en opslaan mislukt met:

```
The editor is read-only
```

**Waarom dit gebeurt**

Er kan maar één persoon tegelijk de formulieren bewerken. De vergrendeling wordt genomen als iemand de designer start, en blijft staan tot
die persoon hem stopt, ook als hij de browser heeft gesloten zonder te stoppen. De API weigert een opslag door ieder ander met
`Designer is locked by <username>`.

**Hoe je het oplost**

Vraag `<username>` de designer te stoppen. Als dat niet kan, gebruik je **Force Unlock** in de designer. Wie de
vergrendeling heeft, verliest de wijzigingen die nog niet zijn opgeslagen.

---

## Abuse attempt of eval function

Een expressieveld toont een fout, en het log bevat een regel zoals:

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Waarom dit gebeurt**

Expressies aan de serverkant worden gecontroleerd voordat ze draaien. Ze mogen alleen `fn.`- en `fnc.`-functies aanroepen; meerdere statements,
meerdere regels, template literals, `process.env` en woorden zoals `require` of `constructor` worden geweigerd. De melding
zegt welke regel is geschonden. Met [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) op
`off` mislukt elke serverexpressie met
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**Hoe je het oplost**

Herschrijf de expressie als één `fn.`-aanroep of een eenvoudige bewerking, of voer haar in de browser uit met `runLocal: true`. Zie
[Expressies](expressions/) en [Lokale expressies](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

Een veld dat een REST API aanroept blijft leeg, en het log toont:

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Waarom dit gebeurt**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) is ingesteld, en de host van de URL staat er niet in.
Een host die overeenkomt met [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) wordt geweigerd met
`blocked by REST_DENIED_HOSTS entry "<entry>"`, en een host die niet wordt opgelost met `cannot resolve <host>`.

**Hoe je het oplost**

Voeg de hostnaam, of een CIDR die de adressen ervan dekt, toe aan `REST_ALLOWED_HOSTS`, of verwijder de regel die hem blokkeert uit
`REST_DENIED_HOSTS`. Zie [Bestemmingen van REST-helpers beperken](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

De aanmeldpagina weigert een gebruikersnaam en wachtwoord met:

```
Authentication failed: Invalid credentials
```

**Waarom dit gebeurt**

De aanmeldpagina geeft bij elke mislukking hetzelfde antwoord, zodat ze niet verraadt of een gebruiker bestaat. AnsibleForms
probeert eerst de lokale gebruikers en daarna LDAP: met meerdere directory's wordt een gebruikersnaam opgezocht in hun volgorde onder **Toegang > LDAP**,
tenzij hij een directory noemt (`corp\jane`) of een van haar aanmelddomeinen (`jane@corp.example`). De echte reden gaat naar het log. LDAP-
fouten worden gelogd als `Error connecting to ldap: <reason>`, met redenen zoals `Wrong binding credentials` of
`Unable to verify the certificate`; codes van Active Directory worden vertaald naar `Wrong password`, `User not found`,
`Account disabled`, `Account locked` of `Password expired`.

**Hoe je het oplost**

Lees de reden in het log. Voor de volledige reden van elke mislukte aanmelding zet je
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) op `debug`, wat `Ldap authentication failed: <reason>` logt.
Als het lokale beheerderswachtwoord kwijt is, zie [Een verloren beheerderswachtwoord herstellen](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Het testen van een LDAP-directory onder **Toegang > LDAP** mislukt met een van deze:

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Waarom dit gebeurt**

De bind-gebruiker of zijn wachtwoord is onjuist, de server of poort is niet bereikbaar, of, met TLS, het certificaat van de server kan niet
worden geverifieerd tegen de CA-bundel. Sinds 7.3.0 staan deze op de ldap-referentie van de directory, onder **Verbindingen > Inloggegevens**. Een testgebruiker die niet bestaat,
telt nog steeds als geslaagde test, omdat de verbinding en de bind werkten.

**Hoe je het oplost**

Open de referentie die de directory noemt (de standaarddirectory is `main`) onder **Verbindingen > Inloggegevens**, en corrigeer de bind-
DN en het wachtwoord, de servers en de poort (meestal 389, of 636 voor LDAPS). Bij TLS-problemen plak je de CA-bundel die het
certificaat van de LDAP-server heeft ondertekend; de certificaatcontrole overslaan is niet bedoeld voor productie. Zie [LDAP](authentication/ldap.html).

---

## Authenticatie met Azure AD of OIDC mislukt

Een aanmelding via single sign-on keert terug naar de aanmeldpagina met:

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Waarom dit gebeurt**

De identity provider heeft de gebruiker teruggestuurd, maar AnsibleForms kon de aanmelding niet afronden. Gangbare redenen zijn
`azuread login is not enabled` of `oidc login is not enabled` (de provider is uitgeschakeld), en `jwt expired`, omdat
de overdracht vanaf de provider maar 5 minuten geldig is. Een fout tijdens de callback van de provider wordt ook
op de aanmeldpagina getoond, en gelogd.

**Hoe je het oplost**

Schakel de provider in onder **Toegang > SSO**, en registreer de callback-URL in de identity provider precies zoals
AnsibleForms hem gebruikt: `https://<your host>/api/v2/auth/entraid/callback` voor Entra ID (vanaf 7.3.0; `azureadoauth2` werkt nog), of
`https://<your host>/api/v2/auth/oidc/callback` voor OIDC. Een callback-URL met `/api/v1/`, van vóór 7 of vóór
6.1.5, moet worden bijgewerkt: de aanmeldpagina herlaadt dan zonder aan te melden en zonder foutmelding. Probeer de aanmelding opnieuw na
een verlopen overdracht.

---

## Not authenticated, login is not enabled for this user

Een gebruiker met een geldig wachtwoord kan zich niet aanmelden, en krijgt:

```
Not authenticated, login is not enabled for this user.
```

**Waarom dit gebeurt**

Een van de rollen van de gebruiker zet de rol-optie `allowLogin` op `false`. Het log zegt
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**Hoe je het oplost**

Verwijder `allowLogin: false` uit de rol, of haal de gebruiker uit die rol. Zie [Rollen](config/roles.html).

---

## Afgemeld na een herstart of na een dag

Elke gebruiker wordt teruggestuurd naar de aanmeldpagina nadat AnsibleForms herstart, of na een dag gebruik.

**Waarom dit gebeurt**

Als [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) niet is ingesteld, genereert elke start een
nieuwe ondertekeningssleutel, en logt
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
Tokens van vóór de
herstart worden dan niet meer geaccepteerd. Los daarvan eindigt een sessie als het refresh token ervan verloopt
(`Refresh token is expired`), na
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), standaard 24 uur.

**Hoe je het oplost**

Zet `ACCESS_TOKEN_SECRET` op een vaste, geheime waarde. Verhoog `ACCESS_TOKEN_REFRESH_EXPIRATION` als een dag te kort is. Voor
langdurige API-toegang gebruik je een [API-token](profile/api-token.html).

---

## Lege formulieren en jobs na een single sign-on (HTTP 431)

Een gebruiker meldt zich zonder fout aan met Entra ID of OIDC, maar de pagina's met formulieren en jobs blijven leeg. Het netwerktabblad
van de browser toont dat de API-aanroepen worden beantwoord met:

```
431 Request Header Fields Too Large
```

Het serverlog toont niets voor deze aanroepen, en dezelfde gebruiker kan prima werken met een LDAP- of lokaal account.

**Waarom dit gebeurt**

Vóór 7.1.0 bevatte het aanmeldtoken elke groep van de gebruiker, en stonden Entra ID-groepen er twee keer in, op object-id
en op naam. De browser stuurt dat token mee in de header `Authorization` van elk verzoek, dus een gebruiker in ongeveer honderd
groepen of meer krijgt een header van ruim 16 KB. Node.js weigert requestheaders groter dan 16 KB met een 431,
voordat het verzoek AnsibleForms bereikt, en daarom wordt er niets gelogd. Een reverse proxy ervoor kan het
verzoek nog eerder weigeren: Nginx staat standaard 8 KB per headerveld toe
(`large_client_header_buffers 4 8k`), en antwoordt dan 400.

**Hoe je het oplost**

Upgrade naar 7.1.0 of later: het aanmeldtoken bevat de groepen niet meer, dus de grootte ervan hangt niet meer af van in hoeveel
groepen een gebruiker zit, en de interface meldt het als een verzoek met 431 wordt geweigerd in plaats van lege pagina's te tonen.
Tot je kunt upgraden, kun je ofwel:

* een **Groepfilter** instellen op de provider onder **Toegang > SSO**, een reguliere expressie die alleen de groepen houdt die je
  rollen gebruiken, zie [Entra ID](authentication/entra-id.html) of [OIDC](authentication/oidc.html); de gebruiker meldt zich opnieuw aan
  om een kleiner token te krijgen
* of de limiet van Node.js verhogen met de omgevingsvariabele `NODE_OPTIONS=--max-http-header-size=65536`, en
  AnsibleForms herstarten

Vanaf 7.1.0 stelt [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) dezelfde limiet in, standaard 16384
bytes en gelezen bij de start, voor andere grote headers, zoals grote cookies die een single sign-on-gateway ervoor
zet. Verhoog ook de headerlimieten van de proxy, zie [Grootte van requestheaders](production/reverse-proxy.html#request-header-size).

---

## Playbook failed with status

Een Ansible-job eindigt als mislukt, en de laatste regel van de uitvoer is:

```
[ERROR]: Playbook failed with status (<code>)
```

**Waarom dit gebeurt**

`ansible-playbook` is gestopt met een code die niet nul is. De regels erboven bevatten de eigen fout van Ansible: het playbook kon niet worden
gevonden, een host was onbereikbaar, een taak is mislukt, of de inventory klopt niet. Het playbook wordt opgezocht in de repository
waarbij **Gebruiken voor playbooks** aan staat, of in [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH); de logregel
`Running from directory : <path>` toont de map die is gebruikt.

**Hoe je het oplost**

Lees de uitvoer van de job boven de laatste regel. Als het playbook niet wordt gevonden, vergelijk je de `playbook` van het formulier met de
map in `Running from directory`. Zie [Ansible-formulieren](forms/ansible.html).

---

## Playbook was aborted by the main process

Een Ansible-job eindigt als mislukt met:

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Waarom dit gebeurt**

Het proces `ansible-playbook` op de RTE is beëindigd door een signaal, en niemand heeft de job afgebroken. Sinds 7.0.0 veroorzaakt de grootte van de
uitvoer dit niet meer: boven [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (standaard 50 MB per stream)
wordt de rest van de uitvoer niet opgeslagen, toont de job
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`,
en draait het playbook tot het einde. De gebruikelijke oorzaak is nu geheugen: de RTE-container bereikte zijn geheugenlimiet en de
kernel heeft het playbook gestopt, bijvoorbeeld met veel forks of grote facts.

**Hoe je het oplost**

Controleer het geheugen van de RTE-container terwijl het playbook draait (`docker stats`, `kubectl top pod`) en verhoog de limiet, of verlaag
het geheugengebruik van het playbook (minder `forks`, geen onnodig verzamelen van facts). Zie je alleen de waarschuwing over `PROCESS_MAX_BUFFER` en
heb je de hele uitvoer nodig, verhoog dan `PROCESS_MAX_BUFFER` in de omgeving van de RTE-container; die wordt door de RTE gelezen, niet door de app.
---

## Failed to launch awx template

Een AWX-job eindigt als mislukt, met uitvoer die begint met:

```
failed to launch awx template <name>
```

**Waarom dit gebeurt**

De volgende regel geeft de reden. `Request failed with status code 401` betekent dat het token of de gebruikersnaam en het wachtwoord op de
referentie van de AWX-runner worden geweigerd. `could not find job template <name>` betekent dat geen job template en geen workflow job template
precies die naam heeft, of dat de gebruiker van de verbinding hem niet kan zien. Een certificaatfout, zoals
`unable to verify the first certificate`, betekent dat het AWX-certificaat niet wordt vertrouwd.

**Hoe je het oplost**

Gebruik **Verbinding testen** op de runner (**Verbindingen > Runners**), die `Runner connection is OK` antwoordt als het werkt. Sinds
7.3.0 staan het token of de gebruiker en het wachtwoord, het adres en de **CA-bundel** op de referentie van de runner, onder
**Verbindingen > Inloggegevens**: vernieuw daar het token of wachtwoord, en plak bij certificaatfouten de CA in de **CA-bundel** ervan.
Controleer de naam en de rechten van de template. Voer het adres in zonder `/api/v2`: AnsibleForms voegt
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX) zelf toe.
Zie [AWX-formulieren](forms/awx.html).

---

## Een job toont de status abandoned

Een job die draaide, is nu gemarkeerd als `abandoned`, en het log van een node of een RTE toont een van:

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

Een RTE in databasemodus, verouderd, logt zijn eigen meldingen:

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**Waarom dit gebeurt**

Een job hoort bij de container die hem uitvoert of volgt: een playbook bij zijn RTE, elke andere job (een AWX-job, de stappen van een multistep-
formulier) bij de app-node die hem startte. Als die container herstart, beëindigt hij zijn eigen onvoltooide jobs. Als hij verdwijnt, bijvoorbeeld een vervangen
pod, beëindigt de worker zijn jobs zodra hij twee minuten niet heeft geantwoord. Bij een RTE in een socketmodus die terugkomt zonder
een job die hij uitvoerde, bijvoorbeeld een nieuwe container zonder zijn spool, eindigt die job als abandoned. Een RTE die stopt, wacht eerst
[`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) op zijn playbooks. Elk uur worden jobs die al langer
dan een dag draaien ook als abandoned gemarkeerd.

Sinds 7.3.0 loopt een job op AWX, AAP of Ascender door op zijn runner: direct nadat een herstart hem opgeeft, volgt een node hem opnieuw,
als hij in de afgelopen 24 uur is gestart, en eindigt hij met wat daar echt is gebeurd. Het log zegt dan `Following <n> abandoned job(s) again on their runner`.

**Hoe je het oplost**

Start een playbookjob opnieuw. Herstart of upgrade RTE's en app-nodes terwijl er geen job draait, en geef een RTE die stopt genoeg tijd
(zie [Schalen](rte/run.html)). Controleer of het playbook echt is voltooid op de beheerde hosts voordat je
opnieuw start, want het kan gedeeltelijk zijn uitgevoerd.

---

## Een RTE maakt geen verbinding

**Verbinding testen** op een RTE-runner (**Verbindingen > Runners**) mislukt met:

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**Waarom dit gebeurt**

Een RTE in een socketmodus praat met de app over één WebSocket: uitgaand belt hij de app aan, inkomend belt de app hem aan (zie
[Modi](rte/modes.html)). De logs van de app en van de RTE zeggen waarom de socket niet open is:

| Melding | Waar | Wat het betekent |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | De RTE (inkomend) | Het token van de RTE-referentie van de runner is niet het `RTE_TOKEN` van de RTE |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | De app (inkomend) | Hetzelfde, gezien vanaf de app |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | De app, en de RTE die wordt geweigerd (`401`) | De RTE meldt zich aan met een ander token dan het token dat de app voor zijn runner bewaart |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | De RTE (uitgaand) | Hij heeft gevraagd om aan te sluiten en wacht op goedkeuring |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | De RTE (inkomend, met `APP_URL`) | Hetzelfde, voor een inkomende RTE |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | De app, en de RTE die wordt geweigerd (`409`) | De config seed declareert de runner zonder `rte_mode`, dus in databasemodus, en de seed bepaalt zijn modus. Een inkomende RTE krijgt `rte_mode: inbound` en `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | De RTE | Een inkomende RTE die zichzelf registreert, heeft het adres nodig waarop de app hem aanbelt |
| `Runner '<name>': dialing <address>: <reason>` | De app, op niveau `debug` | De app kan de socket niet openen, bijvoorbeeld omdat het certificaat van de RTE niet het certificaat is dat voor zijn runner is gepind |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | De RTE | Hij draait in databasemodus, en opent helemaal geen socket |

**Hoe je het oplost**

* **Een geweigerd token** : geef de RTE het token van de RTE-referentie van zijn runner (**Verbindingen > Inloggegevens**), of andersom
* **Wacht op goedkeuring** : keur hem goed onder **Verbindingen > Runners**, nadat je hebt gecontroleerd dat de vingerafdruk die daar staat dezelfde is als die in zijn
  log (zie [Een RTE goedkeuren](runners/registration.html#approving-an-rte))
* **Beheerd door de config seed in databasemodus** : zet `rte_mode` op de runner in de seed, met een RTE-referentie (voor inkomend met het
  adres ervan), en herstart daarna de RTE
* **Inkomend zonder `RTE_URL`** : zet `RTE_URL` op het adres waarop de app de RTE bereikt, of laat `APP_URL` weg en declareer de
  runner in de seed of onder **Verbindingen > Runners**
* **Een certificaat dat niet het gepinde is** : een inkomende RTE over HTTPS stuurt zijn certificaat mee als hij zich registreert, en de app belt
  hem alleen aan met dat certificaat. Na een nieuw certificaat stuurt de RTE het opnieuw als hij zich registreert; als de CA-bundel van de referentie met de hand
  is ingesteld, houdt de app die en logt hij
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **De waarschuwing [DEPRECATED]** : zet `RTE_MODE` op de RTE, verwijder `DB_*` uit zijn omgeving, en zet zijn runner op die modus (zie
  [Modi](rte/modes.html))

---

## The form data is not valid

Met startvalidatie op `enforce` wordt een start geweigerd met `422` en:

```
The form data is not valid
```

**Waarom dit gebeurt**

De server heeft de veldwaarden gecontroleerd tegen de regels van het formulier en ontbrekende of ongeldige velden gevonden; het antwoord somt
ze op onder `details`. Een start zonder `rawFormData` wordt ook geweigerd. Een formulier dat nog niet kan worden gecontroleerd, zoals een wizard,
wordt geweigerd met `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`.

**Hoe je het oplost**

Corrigeer de velden die de details noemen, of de regels van het formulier als die te streng zijn. Draai eerst onder `log`: dat logt
`Launch validation would refuse form '<name>' ...` zonder iets te weigeren. Zie
[Wat enforce doet](launch-validation/log-and-enforce.html#what-enforce-does) en
[Uitrollen](launch-validation/rolling-it-out.html).

---

## Een clone of pull van een repository is mislukt

Een repository toont een mislukte status, en de uitvoer ervan bevat de fout van git, of het log toont
`Background clone of '<name>' failed : <reason>`.

**Waarom dit gebeurt**

Git kon de remote niet bereiken of zich er niet bij authenticeren. Voor SSH-URL's (`git@host:path`) moet de remote de publieke
sleutel van AnsibleForms accepteren; voor HTTPS moeten de gebruikersnaam en het token geldig zijn. Een pull wordt ook geweigerd als de working tree
wijzigingen heeft, met
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**Hoe je het oplost**

Kopieer voor SSH de publieke sleutel uit het tabblad **Sleutel** van **Verbindingen > SSH** en voeg hem toe als deploy key, of aan een gebruiker met
toegang tot de repository. AnsibleForms voegt de remote host bij een clone toe aan de known hosts; voor andere hosts gebruik je het
tabblad **Known hosts** van dezelfde pagina. Vernieuw voor
HTTPS het token. Zie [Git-repositories](gui/designer-and-git.html#git-repositories) en
[Over repositories](faq.html#about-repositories).

---

## De formulierenrepository is nog niet gecloned

Formulieren opslaan in de designer mislukt met:

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Waarom dit gebeurt**

Een repository waarbij **Gebruiken voor formulieren** aan staat, heeft nog geen working tree, omdat de clone niet heeft gedraaid of is mislukt.

**Hoe je het oplost**

Clone de repository vanuit de instellingen van de repositories. Als de clone mislukt, zie
[Een clone of pull van een repository is mislukt](#a-repository-clone-or-pull-failed).

---

## Een back-up is mislukt

Een back-up mislukt, en er wordt niets aan de lijst met back-ups toegevoegd. De reden is een van:

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Waarom dit gebeurt**

Het dumpcommando, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), is niet geïnstalleerd, kon geen verbinding
maken, of leverde een leeg bestand op. Een grote database kan ook langer duren dan
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), standaard één uur.
Een mislukte back-up laat geen map achter; het log zegt `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**Hoe je het oplost**

Installeer de clienttools van MySQL of MariaDB, of zet `MYSQLDUMP_COMMAND` (en `MYSQL_COMMAND` voor herstel) op een commando
dat op deze host en tegen de versie van je server werkt. Verhoog `BACKUP_COMMAND_TIMEOUT_SECONDS` voor een grote database.
Zie [Back-ups](gui/administration.html#backups).
