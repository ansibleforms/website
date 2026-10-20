---
layout: default
title: Assessment FAQ
nav_order: 6
---

# Assessment FAQ
{: .no_toc }

Short answers to the questions security questionnaires ask most
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Data and hosting

Where the data lives, and who can reach it:

| Question | Answer |
|---|---|
| Where is our data stored? | In the MySQL or MariaDB database you run, and in the persistent folder of your instance. AnsibleForms is self-hosted, with no cloud service behind it. |
| Does it send data to its makers? | No. There is no telemetry, no usage reporting and no update check. |
| What does it connect to? | Only the systems an administrator configures: see [Outbound connections](measures.html#outbound-connections). |
| Does it use AI or send data to a model provider? | Only with the [chat assistant](../chat/) on, which is off by default. It then sends form definitions and the values being filled in to the provider you configure. |
| Can it run without internet access? | Yes. The application needs no internet access; the playbooks need whatever their tasks reach. |

---

## Encryption

What is encrypted, and with which keys:

| Question | Answer |
|---|---|
| Is data encrypted in transit? | With [HTTPS](../security/https.html), served by the application or by your reverse proxy, and `wss://` between the application and its runtime environments. |
| Is data encrypted at rest? | Every stored secret is encrypted by the application with AES-256. Jobs and their output are stored as they are: use the database's own encryption at rest. See [Stored secrets](measures.html#stored-secrets). |
| Who holds the keys? | You do: the [`ENCRYPTION_SECRET`](../security/secrets.html) is set by you, kept out of backups, and can be rotated. |
| Can secrets stay in our vault? | Yes: [HashiCorp Vault and CyberArk](../secret-stores/) are read when a job needs them. |

---

## Access and accountability

Who can sign in, what they can do, and what is recorded:

| Question | Answer |
|---|---|
| Does it support single sign-on? | Yes: LDAP / Active Directory, OpenID Connect and Entra ID. See [Authentication](../authentication/). |
| Does it support multi-factor authentication? | Through single sign-on: your identity provider's MFA applies. Local accounts have none of their own. |
| How are permissions managed? | With roles mapped to groups, checked by the server on every request. See [Permissions](measures.html#permissions). |
| Is there an audit log? | Yes: every change and every refused attempt, kept 365 days by default and forwardable to syslog. See [Audit trail](measures.html#audit-trail). |
| Is there a default password? | The first admin account has a public default password, which must be changed at the first sign-in. See [The admin account](../security/hardening.html#the-admin-account). |

---

## Vulnerabilities and updates

How problems are found, fixed and announced:

| Question | Answer |
|---|---|
| Have vulnerabilities been found? | Yes. Every published one is listed in [Security advisories](advisories.html), with the version that fixed it. |
| How do we report one? | Privately, through GitHub: see [Reporting a vulnerability](reporting.html). |
| How is the code checked? | CodeQL static analysis and dependency review on every pull request, automated tests, and Dependabot updates. See [Secure development](development.html). |
| Which versions get security fixes? | 7.x and 6.5.x. See [Supported versions](development.html#supported-versions). |
| How do we hear of a new advisory? | Watch the repository's security alerts on GitHub. See [Being told of new advisories](advisories.html#being-told-of-new-advisories). |
| Has it been penetration tested? | No third-party penetration test report is published. The code is public, so your own team or tester can assess it, and findings are reported as above. |

---

## Images and supply chain

Where the images come from, and how to check them:

| Question | Answer |
|---|---|
| Where are the images published? | On the GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, built by public GitHub Actions workflows. See [Releases and images](development.html#releases-and-images). |
| Do the containers run as root? | No: as the unprivileged `node` user. |
| Are the images signed? | Not yet. Pull them by digest (`@sha256:...`) to be sure you run the image you reviewed. |
| Is there an SBOM? | None is published with the images yet. A scanner such as Trivy or Syft builds one from the image. |
| Are the images scanned for vulnerabilities? | Not in the release pipeline. Their base images are pinned by digest and kept current by Dependabot; scan the images in your own registry to apply your own policy. |
| What license is it under? | GPL-3.0, open source, without warranty. |
