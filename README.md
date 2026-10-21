# Introduction

[![npm version](https://img.shields.io/npm/v/i18next-fluent.svg?style=flat-square)](https://www.npmjs.com/package/i18next-fluent)

This changes i18n format from i18next json to [fluent](https://projectfluent.org) Spec version 1.0.0

It formats with [@fluent/bundle](https://github.com/projectfluent/fluent.js/tree/main/fluent-bundle) 0.19, which needs Node.js 18 or newer. It is tested with i18next 26.

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

## Advice

When using this module, only the fluent format is respected, this means the i18next format interpolation etc. will not work.
So for example instead of `Hy {{name}}!` it is `Hi {$name}!`

Plurals and selects are written in the message, so i18next's plural and context keys (`key_one`, `key_male`) are not used:

```
emails = { $unreadEmails ->
    [one] You have one unread email.
   *[other] You have { $unreadEmails } unread emails.
}
```

Attributes are read with a dot: `i18next.t("login.placeholder")` returns the `.placeholder` attribute of the `login` message.

## Samples

- [with react and react-i18next](https://github.com/i18next/react-i18next/tree/master/example/react-fluent)

## Options

```js
{
  // rebuild a language's fluent bundle when resources are added or removed in i18next
  bindI18nStore: true,
  // passed to new FluentBundle(lng, fluentBundleOptions): useIsolating, functions, transform
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

### loading .ftl fluent flavored textfiles

You can use the [i18next-fluent-backend](https://github.com/i18next/i18next-fluent-backend) to directly load fluent files in fluent syntax from the server.

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

## Upgrading from 2.x

Version 3 moves from @fluent/bundle 0.13 to 0.19. Since @fluent/bundle 0.15.1, `NUMBER()` and `DATETIME()` in a message accept only display options, so the translation can not change what a value means:

- `NUMBER()` takes `unitDisplay`, `currencyDisplay`, `useGrouping`, `minimumIntegerDigits`, `minimumFractionDigits`, `maximumFractionDigits`, `minimumSignificantDigits` and `maximumSignificantDigits`. Others, such as `style: "currency"`, `currency` or `type: "ordinal"`, are ignored: `{ NUMBER($n, type: "ordinal") -> ... }` now selects the cardinal plural forms.
- `DATETIME()` takes `dateStyle`, `timeStyle`, `fractionalSecondDigits`, `dayPeriod`, `hour12`, `weekday`, `era`, `year`, `month`, `day`, `hour`, `minute`, `second` and `timeZoneName`.

If you need the other options in a message, format the value before passing it to `t`, or pass your own function in `fluentBundleOptions.functions`, for example for ordinals:

```js
i18next.use(Fluent).init({
  i18nFormat: {
    fluentBundleOptions: {
      useIsolating: false,
      functions: {
        // place = { ORDINAL($n) -> [one] {$n}st [two] {$n}nd [few] {$n}rd *[other] {$n}th }
        ORDINAL: ([n]) => new n.constructor(n.valueOf(), { ...n.opts, type: "ordinal" })
      }
    }
  }
});
```

## Managing the translations

[Locize](https://www.locize.com/docs/integration/i18n-formats?utm_source=i18next_fluent_readme&utm_medium=github&utm_campaign=readme) supports Fluent as a project format: the editor highlights the syntax, the AI prompts carry the Fluent rules (keep the default marker `*`, term references like `-brand` and attributes) and the plural forms of the target language, every AI and machine translation is checked against its source before it is stored, and every plural is checked against the plural forms of its language. The details are in the post [AI translations that respect your i18n format](https://www.locize.com/blog/ai-translations-i18n-format?utm_source=i18next_fluent_readme&utm_medium=github&utm_campaign=readme).

---

<h3 align="center">Gold Sponsors</h3>

<p align="center">
  <a href="https://www.locize.com/?utm_source=i18next_fluent_readme&utm_medium=github&utm_campaign=readme" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>
