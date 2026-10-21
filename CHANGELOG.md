### 3.0.0

- update to @fluent/bundle `^0.19.1` (from 0.13, 2019). This is why this is a major version:
  - @fluent/bundle 0.19 needs Node.js 18 or newer
  - since @fluent/bundle 0.15.1, `NUMBER()` and `DATETIME()` in a message accept only display options. `style: "currency"`, `currency` and `type: "ordinal"` are ignored, so `{ NUMBER($n, type: "ordinal") -> ... }` selects the cardinal forms (`2th` instead of `2nd`) and `{ NUMBER($n, style: "currency", currency: "EUR") }` renders `3` instead of `€3.00`. The README shows a custom function for ordinals.
  - custom `fluentBundleOptions.functions` receive and return @fluent/bundle 0.19 types (`FluentNumber` and `FluentDateTime` take a number), and `transform` only transforms text, not placeables
  - the UMD build (`i18nextFluent.js`) contains @fluent/bundle 0.19, which is compiled to ES2018
- fix: a term or message reference in a fallback language is resolved. Since i18next 23.4.6 passes the current language to `parse`, with `lng: 'en-CA'` and the message in `en`, `{ -brand }` rendered `{-brand}`, as the message was formatted with the bundle of `en-CA`. The message is now formatted with the bundle it came from.
- fix: `t('missing.attr')` and `t('message.missingAttribute')` threw a TypeError, they now return the key (and fall back to the next language like any missing key)
- fix: a language that was not loaded at init (inline `resources` and `changeLanguage`) returned the key, the bundle is now created on first use
- fix: blank lines inside a multiline value are kept, they were removed before the value was parsed
- fix: removed resources (`removeResourceBundle`) are dropped from the bundle
- the bundles are kept in a `Map`, so a language or namespace named `__proto__` can not write to `Object.prototype`
- tests run against i18next 26 (vitest), with more tests for plurals, selectors, terms, attributes and variables; CI on Node.js 20, 22 and 24 replaces Travis
- README: options (`bindI18nStore`, `fluentBundleOptions`), attributes, upgrading from 2.x
- index.d.ts: `fluentBundleOptions` is typed from @fluent/bundle; package.json: add `module` and `types`
- fluent_conv `^3.3.1`: a message with attributes and no value (`login-input =` followed by `.placeholder = ...`) is written as such, before its value was the text `undefined`

### 2.0.0

- update fluent to spec 1.0 [7](https://github.com/i18next/i18next-fluent/pull/7)
- bindI18nextStore was renamed to bindI18nStore

### 1.0.1

- fix serverside usage by loading to fluent by preloaded languages - not current [6](https://github.com/i18next/i18next-fluent/pull/6)

### 1.0.0

- Return undefined when unable to get bundle in getResource [5](https://github.com/i18next/i18next-fluent/pull/5)

### 0.0.4

- Fix using i18next's fallback language support [3](https://github.com/i18next/i18next-fluent/pull/3)

### 0.0.3

- check if bundle exists before getMessage call

### 0.0.2

- support accessing attributes on fluent segment using keys like `login.placeholder`

### 0.0.1

- initial version
