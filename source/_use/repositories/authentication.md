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

For a private HTTPS remote, pick a **Credential** whose user is the git user and whose password is a personal access token
(or the password).

From 7.3.0 git signs in through `GIT_ASKPASS`: the user and token go to each git command that talks to the server, never into
the URL, so they are not kept in the clone's `.git/config` and a changed token is used on the next pull or push. The token needs
read access to pull, and write access to push. A public remote needs no credential.

Up to 7.2.0 both were inserted into the URL, as `https://<user>:<token>@git.example.com/team/forms.git`. A clone made then keeps
that URL until its next pull or push, which sets its remote back to the repository's own **Uri**.

### SSH with the generated key

For an SSH remote, AnsibleForms authenticates with its own key pair, which it generates at the first start.

1. Open **Settings > Connections > SSH**, on its **Key** tab, and copy the **Public Key**.
2. Add it on the git server, as a deploy key of the repository (with write access if you push), or to a user with access.
3. Add the repository with an SSH **Uri**, for example `git@git.example.com:team/forms.git`, and pick no credential.

The key pair lives in `.ssh/id_rsa` under [`HOME_PATH`](../customization/paths.html#env_HOME_PATH), so keep that folder on
persistent storage, or the key changes when the container is recreated.

On a clone with a `user@host:path` Uri, AnsibleForms first runs `ssh-keyscan` on the host and adds its key to the
known hosts. For other remotes, add the host on the **Known hosts** tab of **Settings > Connections > SSH** before the
first clone.

### Custom git commands

The clone, pull and push commands can be replaced, for example to add git options, with three settings.

| Setting | Default | What AnsibleForms adds |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, the Uri and the name |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

From 7.3.0 these commands run without a shell: quotes work, but a shell operator such as `;`, `|`, `&&` or `>` is refused.
