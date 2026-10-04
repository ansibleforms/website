# Contributing to the AnsibleForms website

Thanks for helping out. This repository is the site at ansibleforms.com — the app itself
lives in [ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).

## Table of contents

- [What lives where](#what-lives-where)
- [Branches and pull requests](#branches-and-pull-requests)
- [Previewing the site](#previewing-the-site)
- [A change in the app that needs a page here](#a-change-in-the-app-that-needs-a-page-here)

---

## What lives where

Most of the site is written here, but two files belong to the app and are pulled in when the site is built.

| File on the site | Comes from | Edit it in |
|---|---|---|
| `changelog.md` | `CHANGELOG.md` of the app | nowhere — release-please writes it on release |
| `v6/changelog.md` | `CHANGELOG.md` on the app's `release/6.x` | nowhere — release-please writes it |
| `_data/help.yaml` | `server/help.yaml` of the app | the app repository |
| everything else | this repository | here |

The 6.x pages under `v6/` are a frozen copy of the maintenance line's docs. Only correct them when
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
mkdir -p _data && cp ../ansibleforms/server/help.yaml _data/help.yaml
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>. `_data/help.yaml` is ignored by git, so the copy never ends up in a commit.

---

## A change in the app that needs a page here

A pull request in the app that changes what users see or configure needs its documentation here too.

Open the pull request here once the app's pull request is up, link the two to each other, and merge
this one when the app's change is released, so the site never describes a version nobody can install.
