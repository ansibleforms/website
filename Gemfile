source 'https://rubygems.org'

gem "jekyll", "~> 4.3"

# The theme. Dependabot proposes its updates like any other gem's
gem "just-the-docs", "~> 0.8"

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1", :platforms => [:windows]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Plugins
group :jekyll_plugins do
  gem "jekyll-seo-tag", "~> 2.9"
  gem "jekyll-include-cache", "~> 0.3"
  gem "jekyll-redirect-from", "~> 0.16"
end
