---
layout: default
title: Authentication
parent: Git repositories
nav_order: 2
---

# Authentication
{: .no_toc }

HTTPS with a token, SSH with the generated key, and custom git commands
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Authentication

How AnsibleForms authenticates depends on the form of the **Uri**.

### HTTPS with a token

For a private HTTPS remote, fill in **Username** and put a personal access token (or a password) in **Password**.

AnsibleForms inserts both into the URL when it runs git, as `https://<user>:<token>@git.example.com/team/forms.git`, so
the token needs read access to pull, and write access for **Push to repo**. The token is masked in the output and the
logs. A public remote needs neither field.

### SSH with the generated key

For an SSH remote, AnsibleForms authenticates with its own key pair, which it generates at the first start.

1. Open **Settings > Connections > SSH** and copy the **Public Key**.
2. Add it on the git server, as a deploy key of the repository (with write access if you push), or to a user with access.
3. Add the repository with an SSH **Uri**, for example `git@git.example.com:team/forms.git`, and leave **Password** empty.

The key pair lives in `.ssh/id_rsa` under [`HOME_PATH`](../customization/paths.html#env_HOME_PATH), so keep that folder on
persistent storage, or the key changes when the container is recreated.

On a clone with a `user@host:path` Uri, AnsibleForms first runs `ssh-keyscan` on the host and adds its key to the
known hosts. For other remotes, add the host under **Settings > Connections > Known Hosts** before the first clone.

### Custom git commands

The clone, pull and push commands can be replaced, for example to add git options, with three settings.

| Setting | Default | What AnsibleForms adds |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, the Uri and the name |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |
