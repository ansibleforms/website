# Contributing to the AnsibleForms website

Thanks for helping out. This repository is the site at ansibleforms.com — the app itself
lives in [ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).

## Table of contents

- [What lives where](#what-lives-where)
- [Branches and pull requests](#branches-and-pull-requests)
- [Previewing the site](#previewing-the-site)
- [Translations](#translations)
- [A change in the app that needs a page here](#a-change-in-the-app-that-needs-a-page-here)

---

## What lives where

The site is everything under `source/`. Most of it is written here, but two files belong to the app and are pulled in at build time, and the Helm chart repository is assembled from the `helm-charts` releases.

| File on the site | Comes from | Edit it in |
|---|---|---|
| `source/_reference/changelog.md` | `CHANGELOG.md` of the app | nowhere — release-please writes it on release |
| `source/v6/_reference/changelog.md` | `CHANGELOG.md` on the app's `release/6.x` | nowhere — release-please writes it |
| `source/_data/help.yaml` | `server/help.yaml` of the app | the app repository |
| `/helm-charts/` (the Helm chart repository) | the chart packages of the `ansibleforms/helm-charts` releases, indexed at build time | the `helm-charts` repository |
| everything else in `source/` | this repository | here |

The docs are served under a language prefix (`/en/`, `/es/`), and the language selector in the header lists
every language in `docs_languages` (`source/_config.yml`). Every page that used to live at the root keeps
its address as a redirect, written at build time by `scripts/redirects.sh`, to the reader's language: the
one they last picked, else their browser's, else English. The install script (`/install`) and the Helm chart
repository (`/helm-charts/`) stay at the root, without a redirect. The translations are described in
[Translations](#translations).

The 6.x pages under `source/v6/` are a frozen copy of the maintenance line's docs. Only correct them when
something there is plainly wrong for 6.x users.

---

## Branches and pull requests

`main` is protected: everything reaches it through a pull request, and pull requests are **squash-merged**.

1. Branch from `main`, named `<type>/<short-description>`, for example `docs/ldap-group-filter`.
2. Give the pull request a [Conventional Commits](https://www.conventionalcommits.org/) title,
   for example `docs: explain the ldap group filter`.
3. The **Build** check must pass. Merging to `main` deploys the site.

The branch is deleted automatically once it is merged.

---

## Previewing the site

The site needs Ruby 3.2 and Bundler, plus the two files from the app repository next to it.

```bash
git clone https://github.com/ansibleforms/ansibleforms.git ../ansibleforms
mkdir -p source/_data && cp ../ansibleforms/server/help.yaml source/_data/help.yaml
bundle install
bundle exec jekyll serve --source source
```

Then open <http://localhost:4000>. The preview serves the English docs at the root, without the `/en/` prefix the published site adds. `source/_data/help.yaml` is ignored by git, so the copy never ends up in a commit.

---

## Translations

English is written in `source/`, and every other language lives next to it, built over a copy of the English pages.

| File | What it holds |
|---|---|
| `i18n/<code>/<path>` | the translated page, at the same path as its English page in `source/` |
| `i18n/<code>.yml` | the language's settings: the menu group names, the site title, the version labels |
| `source/_data/ui.yml` | the site's own interface strings (table headings, previous and next, search) per language |
| `source/_includes/flag.html` | the flags, the same drawings as the app's language switcher |

A page that is not translated yet shows in English, so the site never has a gap. Keep the translated page's
headings in the same order as the English ones: the build gives them their English anchors back by position
(`scripts/i18n-anchors.py`), so links and the language selector land on the same section in every language.

Each translated page records which version of its English page it was translated from, in `translated_from:`.
When you change an English page, update its translations in the same pull request and stamp them again:

```bash
scripts/i18n-status.sh es --stamp _configure/runners/registration.md
```

`scripts/i18n-status.sh es` lists every page not translated or out of date. The build prints the same list as warnings.

---

## A change in the app that needs a page here

A pull request in the app that changes what users see or configure needs its documentation here too.

Open the pull request here once the app's pull request is up, link the two to each other, and merge
this one when the app's change is released, so the site never describes a version nobody can install.
