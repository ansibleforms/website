# GUI screenshots

The screenshots in `source/assets/screenshots/` are taken from a throwaway AnsibleForms instance
with a fixed set of example data, so they can be retaken after a release in one command.

| File | What it is |
|---|---|
| `run.sh` | Starts the instance, fills it, takes the screenshots, removes the instance |
| `docker-compose.yml` | The instance: AnsibleForms and its own MySQL, on port 8444 |
| `data/` | Its persistent folder: `config.yaml` (11 categories), 44 forms, the example playbooks |
| `seed.mjs` | Fills it through the API: jobs, credentials, LDAP, a repository, schedules, backups |
| `capture.mjs` | Takes the 21 screenshots at 1900×940 with Playwright |

Run it from this folder, with Docker and Node.js installed:

```bash
./run.sh 7.4.0                      # all screenshots, from the 7.4.0 image
./run.sh 7.4.0 dashboard designer   # only these
```

All the example data is fictional (`example.com` hosts, example passwords).
