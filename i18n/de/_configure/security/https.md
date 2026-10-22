---
layout: default
title: HTTPS
parent: Sicherheit
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

HTTPS aus der Anwendung selbst bereitstellen und das Beispielzertifikat ersetzen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wo TLS endet

TLS kann an einer von drei Stellen enden, und nur die erste betrifft die Einstellungen auf dieser Seite:

* **in AnsibleForms**, mit `HTTPS=1` : HTTPS auf [`PORT`](../customization/server.html#env_PORT) mit den Dateien unten, wie es docker-compose auf 443 tut.
* **in einem Reverse Proxy**, mit `HTTPS=0` dahinter : siehe [Reverse Proxy](../production/reverse-proxy.html).
* **in einem Kubernetes-Ingress** : siehe den Tab Ingress unter [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) und das README des Charts.

Sie können die erste mit den beiden anderen kombinieren, um auch den Abschnitt zwischen Proxy und Anwendung zu verschlüsseln.

---

## Die Einstellungen

Drei Variablen steuern HTTPS in der Anwendung:

| Variable | Standard | Bedeutung |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` stellt HTTPS bereit, `0` einfaches HTTP |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | Der private Schlüssel, PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | Das Serverzertifikat, PEM |

Im Container-Image ist der persistente Ordner `/app/dist/persistent`, daher sind die Standarddateien
`/app/dist/persistent/certificates/key.pem` und `cert.pem`. Beim docker-compose-Projekt ist das `data/certificates/`
auf dem Host.

---

## Das Beispielzertifikat

Ist `HTTPS=1` und fehlt beim Start eine der beiden Dateien, protokolliert AnsibleForms `httpsKey or httpsCert not found, copying from
templates` und kopiert einen Beispielschlüssel und ein Beispielzertifikat aus dem Image an die konfigurierten Pfade. Schlägt diese Kopie fehl, hält die
Anwendung an.

Dieses Zertifikat ist für `CN=ansibleforms` selbstsigniert, und es ist **auf jeder Installation dasselbe**: Sein privater Schlüssel
wird im öffentlichen Image mitgeliefert. Für einen ersten Eindruck reicht es, aber Browser warnen davor, und jeder kann damit geschützten Verkehr
entschlüsseln. Ersetzen Sie es, bevor die Instanz echte Anmeldedaten enthält.

---

## Das Zertifikat ersetzen

Verwenden Sie ein Zertifikat, das für den Hostnamen ausgestellt ist, den Benutzer eingeben, von Ihrer CA oder einem ACME-Client, im PEM-Format.
Die Zertifikatsdatei kann die vollständige Kette enthalten: zuerst das Serverzertifikat, dann die Zwischenzertifikate.

1. Kopieren Sie die Dateien in den persistenten Ordner oder an eine beliebige Stelle, die die Anwendung lesen kann:

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. Liegen sie anderswo, setzen Sie `HTTPS_KEY` und `HTTPS_CERT` auf ihre Pfade **im Container**.

3. Starten Sie die Anwendung neu, die beide Dateien beim Start liest.

Für ein schnelles eigenes selbstsigniertes Zertifikat (eine Testinstanz oder den Abschnitt hinter einem Proxy) erstellt `openssl` eines:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Erneuern ohne Neustart

Eine Änderung von `HTTPS_KEY` oder `HTTPS_CERT` auf den Einstellungsseiten lädt Schlüssel und Zertifikat im laufenden Server neu.
Neue Verbindungen erhalten das neue Zertifikat, offene behalten das alte. Lassen sich die neuen Dateien nicht lesen oder bilden sie kein gültiges
Paar, bleibt das aktuelle Zertifikat bestehen, und eine Warnung wird protokolliert.

Das funktioniert nur, wenn die Einstellungsseiten die Umgebung schreiben dürfen ([`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
ist `1`) und die Variable nicht in der echten Umgebung gesetzt ist. Ersetzt eine Erneuerung die Dateien unter denselben
Pfaden, starten Sie die Anwendung neu.
