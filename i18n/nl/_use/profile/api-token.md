---
layout: default
title: API-token
parent: Je profiel
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# API-token
{: .no_toc }

Een token maken voor scripts en AI-agents
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wie er een kan maken

Met een langlevend token kunnen scripts de API aanroepen zonder je wachtwoord. Vanaf 7.3.0 vereist het de roloptie `allowApiTokens`:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Tot en met 7.2.0 was de optie alleen `extendedTokenExpiration`. Een rol van vóór 7.3.0 die alleen die optie instelt, krijgt
`allowApiTokens`, zodat ze haar tokens houdt; met beide kan ook een token worden gemaakt dat nooit verloopt. Zie [Rolopties](../config/roles.html#role-options).

---

## Een token maken

**Nieuw token**, op de titelregel van **Profiel > API-tokens**, opent een wizard in drie stappen:

1. **Details**: een naam, zodat je het token in de lijst herkent, en hoe lang het geldig blijft. De keuzes zijn 30, 90, 180
   of 365 dagen tot [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (standaard 90), dat
   maximum zelf, en **Verloopt nooit** met `extendedTokenExpiration`. Kies de kortste periode die je script nodig heeft.
2. **Bevestigen**: een lokaal account of een LDAP-account voert zijn wachtwoord in, dat niet in het token wordt opgeslagen. Een account van Microsoft Entra ID of
   OIDC heeft hier geen wachtwoord: zijn token wordt gemaakt vanuit zijn sessie, waarin hooguit 10 minuten eerder moet zijn aangemeld,
   dus de provider kan je vragen eerst opnieuw aan te melden.
3. **Kopiëren**: het token, **maar één keer** getoond. Kopieer het met **Kopiëren** en bewaar het net zo veilig als een wachtwoord.

Stuur het token mee in de `Authorization`-header van elke API-aanroep:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

Een API-token kan geen ander token maken. Het token van een SSO-account draagt de rollen van zijn laatste aanmelding: een groepswijziging bij de
identiteitsprovider bereikt het pas wanneer je opnieuw aanmeldt en een nieuw token maakt.

---

## Je tokens

De tokens die je hebt gemaakt, staan in een lijst met hun naam en wanneer elk is gemaakt, verloopt en voor het laatst is gebruikt; **Intrekken** in het menu van een rij beëindigt er een.
Een admin ziet ze ook op jouw pagina onder **Instellingen > Gebruikers** en kan ze daar intrekken. Een token eindigt wanneer het verloopt, of eerder:

- **door intrekken**, vanuit de lijst;
- **door afmelden met het token** (`POST /api/v2/auth/logout` met het token in de `Authorization`-header), wat het beëindigt samen met
  de sessie waarin het is gemaakt;
- **door een wachtwoordwijziging**, die elk token en elke sessie van je account beëindigt die daarvoor zijn gemaakt, en door een blokkering van je account.

Ook een token dat nooit verloopt, eindigt in deze gevallen. Een script kan ook zelf een token aanvragen via de login-API en
de parameter `expiryDays` (`POST /api/v2/auth/login?expiryDays=90`, of `expiryDays=never`); een langere `expiryDays` wordt ingekort
tot `API_TOKEN_MAX_DAYS`.
