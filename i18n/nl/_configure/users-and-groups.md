---
layout: default
title: Gebruikers en groepen
nav_order: 15
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 8ed4dc089c64e091636c29884af1cd1002eb40aa
---

# Gebruikers en groepen
{: .no_toc }

De lokale gebruikers en groepen, de LDAP- en single sign-on-gebruikers en -groepen ernaast, en een aanmelding blokkeren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: beheer wie zich mag aanmelden onder **Instellingen > Toegang > Gebruikers** en **Groepen**, met de rolinstelling `showSettings`.

De ingebouwde admin, de aanmeldvolgorde en de rolkoppeling van lokale accounts staan op [Lokale accounts](authentication/local.html).

---

## In deze sectie

| Pagina | Wat er aan bod komt |
|---|---|
| [Een lokale gebruiker](users-and-groups/local-user.html) | Een lokale gebruiker toevoegen, en de tabbladen van zijn pagina |
| [Meerdere groepen](users-and-groups/several-groups.html) | Een lokale gebruiker in meerdere groepen, en zijn rollen |
| [Een lokale groep](users-and-groups/local-group.html) | De pagina van een lokale groep en haar tabbladen |
| [Directorygebruikers en -groepen](users-and-groups/directory.html) | Gebruikers en groepen van LDAP, Entra ID en OIDC, zoals laatst gezien |
| [Een aanmelding blokkeren](users-and-groups/blocking-a-sign-in.html) | Aanmelden toestaan: een gebruiker blokkeren zonder iets te verwijderen |


---

## De lijsten

De lijsten **Gebruikers** en **Groepen** tonen de lokale gebruikers en groepen en, daarnaast, die van LDAP en single sign-on.

Een gebruiker of groep van LDAP, Entra ID of OIDC verschijnt in de lijst zodra hij zich heeft aangemeld (of bij een aanmelding is gezien), of zodra een rol hem noemt.
De kolom **Bron** zegt waar elk vandaan komt: Lokaal, LDAP, Microsoft Entra ID of OIDC. Vanaf 7.3.0 heeft de lijst **Gebruikers** ook
een kolom **Laatst aangemeld**, die zegt wanneer elke gebruiker zich voor het laatst heeft aangemeld.

Een rij opent de pagina van de gebruiker of groep. **Gebruiker toevoegen** en **Groep toevoegen** maken een lokale aan.

---

## Accounts die admin geven

De rol admin in config.yaml noemt lokale groepen en gebruikers, dus alleen een admin mag de accounts en groepen wijzigen die hij noemt.

Een gebruiker met `showSettings` maar zonder de rol admin kan een lokaal account dat de rol admin noemt (rechtstreeks of via een van zijn groepen) niet wijzigen,
blokkeren, in andere groepen plaatsen, er het wachtwoord van instellen of het verwijderen. Hij kan ook geen groep aanmaken, hernoemen of verwijderen
die de rol admin noemt, of er een gebruiker in plaatsen. Hetzelfde geldt voor een LDAP- of SSO-gebruiker die aan de rol admin is gekoppeld: hem blokkeren,
zijn sessies beëindigen, hem vergeten en zijn API-tokens intrekken zijn voorbehouden aan een admin. De server beantwoordt zo'n verzoek met `403`.

