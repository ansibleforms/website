---
layout: default
title: Directorygebruikers en -groepen
parent: Gebruikers en groepen
nav_order: 4
translated_from: 4798556ab97e1c3567a81681919e13c57d7a5b4f
---

# Directorygebruikers en -groepen
{: .no_toc }

Gebruikers en groepen van LDAP, Entra ID en OIDC, zoals laatst gezien
{: .fs-6 .fw-300 }

Een gebruiker van LDAP, Entra ID of OIDC heeft zijn pagina op `/settings/users/<source>/<name>`, met `ldap`, `azuread` of `oidc`
als bron, zoals `/settings/users/ldap/jdoe`. Die toont wat bij de laatste aanmelding van de gebruiker is vastgelegd, alleen-lezen,
omdat de directory of de identity provider bepaalt wie de gebruiker is en wat zijn groepen zijn.

De tabbladen zijn die van een lokale gebruiker. **Details** heeft de schakelaar **Aanmelden toestaan**, de gebruikersnaam, de bron, de naam,
het e-mailadres, wanneer de gebruiker voor het eerst is gezien en zijn laatste aanmelding. **Groepen** toont de groepen van de laatste aanmelding.
**API-tokens** toont de API-tokens van de gebruiker, en **Intrekken** beëindigt er een meteen.

Rechtsboven meldt **Sessies beëindigen** de gebruiker nu overal af. **Vergeten** verwijdert het record, dat bij de volgende aanmelding
terugkomt; zijn jobs, opgeslagen jobs en planningen blijven bestaan. Een geblokkeerde gebruiker kan niet worden vergeten, omdat hij dan
weer binnen zou komen: de server antwoordt met `409`, dus sta eerst zijn aanmelding toe.

De groepen van dit record zijn ook de groepen waarmee de sessie van de gebruiker werkt, live gelezen. Een aangemelde gebruiker vergeten
laat hem zonder groepen achter, en zonder de rollen die die groepen geven, totdat hij zich opnieuw aanmeldt.

Een directorygroep heeft haar pagina op `/settings/groups/<source>/<name>`, alleen-lezen, met de tabbladen **Details**,
**Gebruikers** (de gebruikers die er bij hun laatste aanmelding in zijn gezien), **Rollen** en **Formulieren**.
