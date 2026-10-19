# GUI screenshots

The screenshots in `source/assets/screenshots/` are taken from a throwaway AnsibleForms instance
with a fixed set of example data, so they can be retaken after a release in one command.

| File | What it is |
|---|---|
| `run.sh` | Starts the instance, fills it, takes the screenshots, removes the instance |
| `docker-compose.yml` | The instance: AnsibleForms, its own MySQL and an RTE that runs the playbooks, on port 8444 |
| `data/` | Its persistent folder: `config.yaml` (11 categories), 44 forms, the example playbooks |
| `seed.mjs` | Changes the default admin password, then fills it through the API: jobs, credentials, LDAP, a repository, schedules, backups |
| `capture.mjs` | Takes the 21 screenshots at 1900×940 with Playwright |

Run it from this folder, with Docker and Node.js installed. The version is an image tag of both
`ghcr.io/ansibleforms/ansibleforms` and `ghcr.io/ansibleforms/ansibleforms-rte-full`:

```bash
./run.sh 7.0.0                      # all screenshots, from the 7.0.0 images
./run.sh 7.0.0 dashboard designer   # only these
./run.sh latest-rc                  # from the latest release candidate
```

AnsibleForms 7 runs every playbook on an RTE (runtime environment), so the instance has one: the
config seed (`data/seed.yaml`) declares it as the default runner in inbound mode, the app dials it
with its token, and the seeded jobs run there. The admin starts with the
public default password, which AnsibleForms 7 refuses everything but changing: `seed.mjs` changes
it first, and `capture.mjs` signs in with the new one.

The same run is also a workflow, **Screenshots** (`.github/workflows/screenshots.yml`): run it from the Actions tab
with a version, and the screenshots come back as an artifact, without Docker or a browser on your machine.

All the example data is fictional (`example.com` hosts, example passwords).
