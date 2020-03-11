import * as utils from './utils.js';
import { FluentBundle } from 'fluent';
import js2ftl from 'fluent_conv/js2ftl';

function getDefaults() {
  return {
    bindI18nextStore: true,
    fluentBundleOptions: { useIsolating: false }
  };
}

function nonBlank(line) {
  return !/^\s*$/.test(line);
}

function countIndent(line) {
  const [indent] = line.match(/^\s*/);
  return indent.length;
}

function ftl(code) {
  const lines = code.split("\n").filter(nonBlank);
  const indents = lines.map(countIndent);
  const common = Math.min(...indents);
  const indent = new RegExp(`^\\s{${common}}`);

  return lines.map(
    line => line.replace(indent, "")
  ).join("\n");
}

class BundleStore {
  constructor(i18next, options) {
    this.i18next = i18next;
    this.options = options;
    this.bundles = {};

    // this.createBundleFromI18next = this.createBundleFromI18next.bind(this);
    // this.createBundle = this.createBundle.bind(this);
    // this.bind = this.bind.bind(this);
  }

  createBundle(lng, ns, json) {
    const ftlStr = json ? js2ftl(json) : "";
    const bundle = new FluentBundle(lng, this.options.fluentBundleOptions);
    const errors = bundle.addMessages(ftl(ftlStr));

    utils.setPath(this.bundles, [lng, ns], bundle);
  }

  createBundleFromI18next(lng, ns) {
    this.createBundle(lng, ns, utils.getPath(this.i18next.store.data, [lng, ns]));
  }

  getBundle(lng, ns) {
    return utils.getPath(this.bundles, [lng, ns])
  }

  bind() {
    this.i18next.store.on('added', (lng, ns) => {
      if (!this.i18next.isInitialized) return;
      this.createBundleFromI18next(lng, ns);
    });

    this.i18next.on('initialized', () => {
      var lngs = this.i18next.languages || [];
      var preload = this.i18next.options.preload || [];

      lngs
        .filter(l => !preload.includes(l))
        .concat(preload)
        .forEach(lng => {
        this.i18next.options.ns.forEach(ns => {
          this.createBundleFromI18next(lng, ns);
        });
      })
    });
  }
}

class Fluent {
  constructor(options) {
    this.type = 'i18nFormat';
    this.handleAsObject = false;

    this.init(null, options);
  }

  init(i18next, options) {
    const i18nextOptions = (i18next && i18next.options && i18next.options.i18nFormat) || {};
    this.options = utils.defaults(i18nextOptions, options, this.options || {}, getDefaults());

    if (i18next) {
      this.store = new BundleStore(i18next, this.options);
      if (this.options.bindI18nextStore) this.store.bind();

      i18next.fluent = this;
    } else {
      this.store = new BundleStore(null, this.options);
    }
  }

  parse(res, options, lng, ns, key, info) {
    const bundle = this.store.getBundle(lng, ns);
    const isAttr = key.indexOf('.') > -1;

    if (!res) return key;

    const useRes = isAttr ? res.attrs[key.split('.')[1]] : res;
    if (!bundle) return key;
    return bundle.format(useRes, options);
  }

  getResource(lng, ns, key, options) {
    let bundle = this.store.getBundle(lng, ns);
    const useKey = key.indexOf('.') > -1 ? key.split('.')[0] : key;

    if (!bundle) return undefined;
    return bundle.getMessage(useKey);
  }

  addLookupKeys(finalKeys, key, code, ns, options) {
    // no additional keys needed for select or plural
    // so there is no need to add keys to that finalKeys array
    return finalKeys;
  }
}

Fluent.type = 'i18nFormat';


export default Fluent;
