---
layout: default
title: Secure development
nav_order: 3
---

# Secure development
{: .no_toc }

How changes are checked and released, and what is supported
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The source code

AnsibleForms is open source, so everything on this page can be checked in the repository itself:

* The code, its history and its build pipelines are public on [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* The [license](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) is GPL-3.0.
* The [changelog](../changelog.html) lists every change of every release, security fixes included.

---

## How a change is merged

Every change reaches `main` through a pull request, under a ruleset that nobody can bypass:

| Rule | What it means |
|---|---|
| Pull request required | Nothing is pushed to `main` directly |
| Required checks | The pull request merges only when every check below passes |
| No force push, no deletion | The history of `main` cannot be rewritten or removed |
| Linear history | Every pull request becomes one commit, so each change can be traced and reverted on its own |

The checks a pull request must pass:

| Check | What it does |
|---|---|
| Client, Server | The unit tests of the web interface and of the server |
| CodeQL | GitHub's static analysis of the JavaScript and TypeScript code, for injection, cross-site scripting and other weaknesses |
| Public schema is up to date | The database schema the code expects matches the one it ships |
| Title, Branch | The pull request follows the naming rules, so the changelog stays accurate |

Two more run on every pull request and report on it:

* **Database** tests the server on MySQL and MariaDB, and **Browser** drives the interface in a browser.
* **Dependency review** blocks a new dependency with a known high or critical vulnerability.

---

## Code analysis and dependencies

The code and what it depends on are checked again after they merge:

* **CodeQL** also analyses every push to `main` and to the release branches, and the whole code base every week:
  a new CodeQL rule then also checks the code merged before it.
* **Dependabot** opens a pull request for each new version of a dependency: the npm packages of the server and the
  interface, the Python packages of the runtime environment, and the GitHub Actions of the pipelines every week, and
  the base images of the containers every day.
* The base images are pinned by digest (`node:26-trixie-slim@sha256:...`), so a build uses exactly the reviewed image.
  Dependabot moves the digest when the image is rebuilt upstream.

---

## Releases and images

A release is built and published by GitHub Actions only, never from a developer's machine:

* A release is cut from `main` (or `release/6.x`), with a changelog built from its pull requests.
* The images are built by the [Publish workflow](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  and pushed to the GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, with the runtime environment images
  next to it. The workflow and its logs are public, so anyone can see what went into an image.
* The application and runtime environment images run as the unprivileged `node` user (uid 1000), never as root.

---

## Supported versions

Security fixes go into the newest release of each supported line:

| Version | Receives security fixes |
|---|---|
| 7.x | Yes |
| 6.5.x | Yes |
| Older than 6.5 | No: upgrading is the fix |

The [upgrade guide](../upgrading/) covers moving to a newer release, and [Upgrading to v7](../upgrade-7.html) the move from 6.5.
