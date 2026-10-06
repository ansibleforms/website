---
layout: default
title: HTTPS and certificates
parent: Running in production
nav_order: 2
---

# HTTPS and certificates
{: .no_toc }

Serve HTTPS from the application itself, and replace the sample certificate
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Where TLS ends

TLS can end in one of three places, and only the first one involves the settings on this page:

* **in AnsibleForms**, with `HTTPS=1` : the application serves HTTPS on [`PORT`](../customization/server.html#env_PORT)
  with the key and certificate described below. This is what the docker-compose project does, on port 443.
* **in a reverse proxy**, with `HTTPS=0` behind it : see [Reverse proxy](reverse-proxy.html).
* **in a Kubernetes ingress** : see the Ingress tab of [Kubernetes installation](../installation/kubernetes.html#6-open-ansibleforms)
  and the chart's README, which covers the backend setting that HTTPS on the server needs.

You can combine the first with the other two to encrypt the hop between the proxy and the application as well.

---

## The settings

Three variables control HTTPS in the application:

| Variable | Default | Meaning |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` serves HTTPS, `0` plain HTTP |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | The private key, PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | The server certificate, PEM |

In the container image the persistent folder is `/app/dist/persistent`, so the default files are
`/app/dist/persistent/certificates/key.pem` and `cert.pem`. With the docker-compose project that is `data/certificates/`
on the host.

---

## The sample certificate

When `HTTPS=1` and either file is missing at startup, AnsibleForms logs `httpsKey or httpsCert not found, copying from
templates` and copies a sample key and certificate from the image to the configured paths. If that copy fails, the
application stops.

That certificate is self-signed for `CN=ansibleforms`, and it is the **same on every installation**: its private key
ships inside the public image. It is fine for a first look, but browsers warn about it and anyone can decrypt traffic
protected by it. Replace it before the instance holds real credentials.

---

## Replacing the certificate

Use a certificate issued for the host name users type, by your CA or an ACME client, in PEM format.
The certificate file can hold the full chain: the server certificate first, then the intermediates.

1. Copy the files into the persistent folder, or anywhere the application can read them:

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. If they live elsewhere, set `HTTPS_KEY` and `HTTPS_CERT` to their paths **inside the container**.

3. Restart the application, which reads both files at startup.

For a quick self-signed certificate of your own (a test instance, or the hop behind a proxy), `openssl` creates one:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Renewing without a restart

Changing `HTTPS_KEY` or `HTTPS_CERT` on the settings pages reloads the key and certificate in the running server.
New connections get the new certificate, open ones keep the old. If the new files cannot be read or do not form a valid
pair, the current certificate stays in place and a warning is logged.

That only works when the settings pages may write the environment ([`ALLOW_ENV_EDIT`](../customization/features.html#env_ALLOW_ENV_EDIT)
is `1`) and the variable is not set in the real environment. When a renewal replaces the files under the same
paths, restart the application.
