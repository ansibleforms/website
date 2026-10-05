# AnsibleForms website

[![CI](https://img.shields.io/github/actions/workflow/status/ansibleforms/website/pages.yml?branch=main&label=CI)](https://github.com/ansibleforms/website/actions/workflows/pages.yml)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-ansibleforms.com-informational)](https://ansibleforms.com)

The source of the [AnsibleForms](https://github.com/ansibleforms/ansibleforms) documentation, published at
[ansibleforms.com](https://ansibleforms.com). It is written in Markdown, built with Jekyll and Just the Docs,
and deployed to GitHub Pages on every merge, every AnsibleForms release and every chart release.

## What's in it

The site covers everything a user of AnsibleForms needs, from the first install to writing complex forms.

- Installation, configuration and upgrade guides for every way to run AnsibleForms
- A reference page for every form field type, with examples
- The settings reference, built from the app's own `help.yaml` so it never drifts from the code
- The app's changelog, rebuilt into the site on every release
- The Helm chart repository, served under `/helm-charts/`
- The 6.x documentation, kept alongside under `/v6/`

## Previewing locally

You need Ruby and Bundler. This serves the site on http://localhost:4000 and rebuilds it on every save:

```bash
bundle install
bundle exec jekyll serve --source source
```

## Contributing

Corrections and new pages are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md). Report security issues as [SECURITY.md](SECURITY.md) describes.

## License

[GPL-3.0](LICENSE), the same as AnsibleForms itself.
