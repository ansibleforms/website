---
layout: default
title: HTTPS
parent: Segurança
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

Sirva HTTPS a partir da própria aplicação, e substitua o certificado de exemplo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Onde termina o TLS

O TLS pode terminar num de três sítios, e só o primeiro envolve as definições desta página:

* **no AnsibleForms**, com `HTTPS=1` : HTTPS na [`PORT`](../customization/server.html#env_PORT) com os ficheiros abaixo, como o docker-compose faz na 443.
* **num reverse proxy**, com `HTTPS=0` atrás dele : consulte [Reverse proxy](../production/reverse-proxy.html).
* **num ingress do Kubernetes** : consulte o separador Ingress de [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) e o README do chart.

Pode combinar o primeiro com os outros dois para cifrar também o troço entre o proxy e a aplicação.

---

## As definições

Três variáveis controlam o HTTPS na aplicação:

| Variável | Predefinição | Significado |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` serve HTTPS, `0` HTTP simples |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | A chave privada, PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | O certificado do servidor, PEM |

Na imagem do contentor, a pasta persistente é `/app/dist/persistent`, por isso os ficheiros predefinidos são
`/app/dist/persistent/certificates/key.pem` e `cert.pem`. Com o projeto docker-compose, isso corresponde a `data/certificates/`
no host.

---

## O certificado de exemplo

Quando `HTTPS=1` e um dos ficheiros falta no arranque, o AnsibleForms regista `httpsKey or httpsCert not found, copying from
templates` e copia uma chave e um certificado de exemplo da imagem para os caminhos configurados. Se essa cópia falhar, a
aplicação para.

Esse certificado é autoassinado para `CN=ansibleforms`, e é **o mesmo em todas as instalações**: a sua chave privada
vem dentro da imagem pública. Serve para uma primeira experiência, mas os navegadores avisam sobre ele e qualquer pessoa pode decifrar o tráfego
que ele protege. Substitua-o antes de a instância conter credenciais reais.

---

## Substituir o certificado

Use um certificado emitido para o nome de host que os utilizadores escrevem, pela sua CA ou por um cliente ACME, em formato PEM.
O ficheiro do certificado pode conter a cadeia completa: o certificado do servidor primeiro, depois os intermédios.

1. Copie os ficheiros para a pasta persistente, ou para qualquer sítio onde a aplicação os possa ler:

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. Se estiverem noutro sítio, defina `HTTPS_KEY` e `HTTPS_CERT` com os seus caminhos **dentro do contentor**.

3. Reinicie a aplicação, que lê ambos os ficheiros no arranque.

Para um certificado autoassinado rápido seu (uma instância de teste, ou o troço atrás de um proxy), o `openssl` cria um:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Renovar sem reiniciar

Alterar `HTTPS_KEY` ou `HTTPS_CERT` nas páginas de definições recarrega a chave e o certificado no servidor em execução.
As ligações novas recebem o certificado novo, as abertas mantêm o antigo. Se os ficheiros novos não puderem ser lidos ou não formarem um par
válido, o certificado atual mantém-se e é registado um aviso.

Isto só funciona quando as páginas de definições podem escrever o ambiente ([`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
é `1`) e a variável não está definida no ambiente real. Quando uma renovação substitui os ficheiros nos mesmos
caminhos, reinicie a aplicação.
