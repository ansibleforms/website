---
layout: default
title: File uploads
parent: Launch validation
nav_order: 4
---

# File uploads
{: .no_toc }

How file fields are validated
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

A file field never trusts what the launch request says about a file. Launch validation checks the file itself, on the
server's disk.

---

## How an upload reaches a job

A file is uploaded before the form is launched, in two steps:

1. The browser uploads the file with `POST /api/v2/job/upload`. The server stores it in `UPLOAD_PATH`.
2. The launch request describes that upload in its `files` part.

Launch validation then checks the description against the disk:

* The file must exist inside `UPLOAD_PATH`.
* Its path and size are read from the disk, never from the request.

---

## What is accepted

A file field only gets a value from a verified upload. Anything else is dropped:

* A path the caller writes into `rawFormData` or `extravars` is ignored.
* A required file field without a real upload is reported as `missing`.

---

## File rules

The rules of a file field are checked against the real upload, with sizes in bytes:

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` and `maxSize` compare the file's real size, and `regex` its file name. Independently of any form,
`UPLOAD_MAX_GB` caps the size of a single upload (10 GB by default).
