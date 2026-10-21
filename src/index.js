import { FluentBundle, FluentResource } from '@fluent/bundle';
import js2ftl from 'fluent_conv/js2ftl';

function getDefaults() {
  return {
    bindI18nStore: true,
    fluentBundleOptions: { useIsolating: false }
  };
}

// fluent ids and attribute names can not contain a dot, so `login.placeholder` is attribute `placeholder` of `login`
function splitKey(key) {
  const [id, attr] = key.split('.');
  return { id, attr };
}

// a Map, so a language or namespace named __proto__ can not reach Object.prototype
const bundleKey = (lng, ns) => JSON.stringify([lng, ns]);

class BundleStore {
  constructor(i18next, options) {
    this.i18next = i18next;
    this.options = options;
    this.bundles = new Map();
  }

  createBundle(lng, ns, json) {
    const bundle = new FluentBundle(lng, this.options.fluentBundleOptions);
    if (json) bundle.addResource(new FluentResource(js2ftl(json)));

    this.bundles.set(bundleKey(lng, ns), bundle);
    return bundle;
  }

  getBundle(lng, ns) {
    const bundle = this.bundles.get(bundleKey(lng, ns));
    if (bundle || !this.i18next) return bundle;

    // created on first use, so languages that were not loaded at init (changeLanguage, inline resources) work too
    const json = this.i18next.store.getResourceBundle(lng, ns);
    if (!json) return undefined;
    return this.createBundle(lng, ns, json);
  }

  bind() {
    const drop = (lng, ns) => this.bundles.delete(bundleKey(lng, ns));
    this.i18next.store.on('added', drop);
    this.i18next.store.on('removed', drop);
  }
}

class Fluent {
  constructor(options) {
    this.type = 'i18nFormat';
    this.handleAsObject = false;

    this.init(null, options);
  }

  init(i18next, options) {
    this.options = Object.assign(
      getDefaults(),
      this.options,
      options,
      i18next && i18next.options && i18next.options.i18nFormat
    );

    if (i18next) {
      this.store = new BundleStore(i18next, this.options);
      if (this.options.bindI18nStore) this.store.bind();

      i18next.fluent = this;
    } else {
      this.store = new BundleStore(null, this.options);
    }
  }

  parse(res, options, lng, ns, key, info) {
    if (!res) return key;
    // a missing key or a defaultValue arrives as a plain string
    if (typeof res === 'string') return res;

    // format with the bundle the message came from, which is the fallback language if the key was not found in lng
    const resolved = (info && info.resolved) || {};
    const bundle = this.store.getBundle(resolved.usedLng || lng, resolved.usedNS || ns);
    if (!bundle) return key;

    const { attr } = splitKey(key);
    const pattern = attr ? res.attributes[attr] : res.value;
    // with an errors array formatPattern does not throw, it renders what it can, e.g. `{$name}` for a missing variable
    return bundle.formatPattern(pattern, options, []);
  }

  getResource(lng, ns, key, options) {
    const bundle = this.store.getBundle(lng, ns);
    if (!bundle) return undefined;

    const { id, attr } = splitKey(key);
    const message = bundle.getMessage(id);
    if (!message) return undefined;

    // undefined if the message has no such value or attribute, so i18next falls back to the next language
    const pattern = attr ? message.attributes[attr] : message.value;
    if (pattern === undefined || pattern === null) return undefined;
    return message;
  }

  addLookupKeys(finalKeys, key, code, ns, options) {
    // no additional keys needed for select or plural
    // so there is no need to add keys to that finalKeys array
    return finalKeys;
  }
}

Fluent.type = 'i18nFormat';

export default Fluent;
