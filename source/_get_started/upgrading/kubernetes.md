---
layout: default
title: Kubernetes
parent: Upgrading
nav_order: 4
---

# Kubernetes
{: .no_toc }

Upgrade an installation made with the Helm chart
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Each chart version deploys one AnsibleForms release. An upgrade installs a newer chart version with your existing values;
the data on the persistent volumes is preserved. An upgrade that changes nothing leaves the pods untouched.

---

## Before you upgrade

Prepare the upgrade so that you can go back if something goes wrong:

* **Take a backup** under **Settings → Backups**. The new release upgrades the database schema at its first start.
* **Read the [changelog](../changelog)** for the releases between your version and the new one.
* **Moving to a new major version?** Follow [Upgrading to v7](../upgrade-7.html) first.
* **Read the chart's [changelog](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md)** for changes to the values.
* **With generated credentials** (`secrets.generate`), back up the `<release>-secrets` Secret: `ENCRYPTION_SECRET` cannot be recovered.

---

## 1. Find the new chart version

Refresh the chart repository and list the available chart versions:

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Upgrade the release

Run the same `helm upgrade` command as at installation, with your values file and the new chart version:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

With the OCI registry, use `oci://ghcr.io/ansibleforms/charts/ansibleforms` as the chart.

---

## 3. Check the upgrade

Wait for the new pods, then run the chart's test, which checks both the web server and the database connection:

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

In AnsibleForms, **Help → About** shows the version that is running, and **Settings → Status** shows the health of the
database, the schema and the other systems AnsibleForms depends on.

---

## Roll back

Helm keeps the history of the release. To go back to the previous revision:

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

If it does not start on the upgraded database, restore your backup (see the chart's [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms)).
