# Introduction

[![Travis](https://img.shields.io/travis/i18next/i18next-fluent/master.svg?style=flat-square)](https://travis-ci.org/i18next/i18next-fluent)
[![Coveralls](https://img.shields.io/coveralls/i18next/i18next-fluent/master.svg?style=flat-square)](https://coveralls.io/github/i18next/i18next-fluent)
[![npm version](https://img.shields.io/npm/v/i18next-fluent.svg?style=flat-square)](https://www.npmjs.com/package/i18next-fluent)
[![David](https://img.shields.io/david/i18next/i18next-fluent.svg?style=flat-square)](https://david-dm.org/i18next/i18next-fluent)

This changes i18n format from i18next json to [fluent](https://projectfluent.org)

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/i18next-fluent) or [downloaded](https://github.com/i18next/i18next-fluent/blob/master/i18nextFluent.min.js) from this repo.

```
# npm package
$ npm install i18next-fluent
```

Wiring up:

```js
import i18next from "i18next";
import Fluent from "i18next-fluent";

i18next.use(Fluent).init(i18nextOptions);
```

- As with all modules you can either pass the constructor function (class) to the i18next.use or a concrete instance.
- If you don't use a module loader it will be added to `window.i18nextFluent`

## Options

```js
{
  bindI18nextStore: true,
  fluentBundleOptions: { useIsolating: false }
}
```

Options can be passed in by setting options.i18nFormat in i18next.init:

```js
import i18next from "i18next";
import Fluent from "i18next-fluent";

i18next.use(Fluent).init({
  i18nFormat: options
});
```

### more complete sample

```js
import i18next from "i18next";
import Fluent from "i18next-fluent";

i18next.use(Fluent).init({
  lng: "en",
  resources: {
    en: {
      translation: {
        hello: "Hello { $name }."
      }
    }
  }
});

i18next.t("hello", { name: "fluent" }); // -> Hello fluent.
```

---

<h3 align="center">Gold Sponsors</h3>

<p align="center">
  <a href="https://locize.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>
