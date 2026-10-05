# AnsibleForms website

[![CI](https://img.shields.io/github/actions/workflow/status/ansibleforms/website/pages.yml?branch=main&label=CI)](https://github.com/ansibleforms/website/actions/workflows/pages.yml)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-ansibleforms.com-informational)](https://ansibleforms.com)

The source of the [AnsibleForms](https://github.com/ansibleforms/ansibleforms) documentation at
[ansibleforms.com](https://ansibleforms.com), written in Markdown with Jekyll and Just the Docs and deployed
to GitHub Pages on every merge and release.

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

Contributions are welcome. Start with these files:

- [CONTRIBUTING.md](CONTRIBUTING.md): how to preview the site locally and open a pull request
- [SECURITY.md](SECURITY.md): how to report a security issue

## License

[GPL-3.0](LICENSE).
