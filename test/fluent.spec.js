import { beforeAll, describe, expect, it } from 'vitest';
import i18next from 'i18next';
import FluentSrc from '../src';
import FluentDist from '../i18nextFluent.js';
import FluentMin from '../i18nextFluent.min.js';

// the json shape fluent_conv's ftl2js produces from a .ftl file
const en = {
  emails:
    '{ $unreadEmails ->\n [0] You have no unread emails.\n [one] You have one unread email.\n *[other] You have { $unreadEmails } unread emails.\n}',
  '-brand-name': '{\n $case -> *[nominative] Firefox\n  [accusative] Firefoxa\n}',
  'app-title': '{ -brand-name }',
  'restart-app': 'Zrestartuj { -brand-name(case: "accusative") }.',
  login: {
    comment:
      'Note: { $title } is a placeholder for the title of the web page\ncaptured in the screenshot.',
    val: 'Predefined value',
    placeholder: 'example@email.com',
    'aria-label': 'Login input value',
    title: 'Type your login email'
  },
  logout: 'Logout',
  hello: 'Hello { $name }.',
  shared: '{ $gender ->\n [female] { $user } shared her photo.\n [male] { $user } shared his photo.\n *[other] { $user } shared their photo.\n}',
  price: 'Price: { NUMBER($amount, minimumFractionDigits: 2) }',
  greeting: '{ hello } { logout }',
  multiline: 'Line one\n\nLine three'
};

const pl = {
  files: '{ $count ->\n [one] { $count } plik\n [few] { $count } pliki\n *[many] { $count } plików\n}'
};

for (const [name, Fluent] of Object.entries(
  process.env.CI ? { src: FluentSrc, dist: FluentDist, min: FluentMin } : { src: FluentSrc }
)) {
  describe(`fluent format ${name}`, () => {
    describe('basic parse', () => {
      let fluent;
      const t = (key, options) => fluent.parse(fluent.getResource('en', 'translation', key), options, 'en', 'translation', key);

      beforeAll(() => {
        fluent = new Fluent({ bindI18nStore: false });
        fluent.store.createBundle('en', 'translation', en);
      });

      it('formats variables', () => {
        expect(t('logout', {})).toBe('Logout');
        expect(t('hello', { name: 'Jan' })).toBe('Hello Jan.');
        expect(t('price', { amount: 3 })).toBe('Price: 3.00');
      });

      it('renders a missing variable as its placeholder instead of throwing', () => {
        expect(t('hello', {})).toBe('Hello {$name}.');
      });

      it('selects plural variants, exact numbers first', () => {
        expect(t('emails', { unreadEmails: 0 })).toBe('You have no unread emails.');
        expect(t('emails', { unreadEmails: 1 })).toBe('You have one unread email.');
        expect(t('emails', { unreadEmails: 10 })).toBe('You have 10 unread emails.');
      });

      it('selects string variants and falls back to the default variant', () => {
        expect(t('shared', { user: 'Anna', gender: 'female' })).toBe('Anna shared her photo.');
        expect(t('shared', { user: 'Jan', gender: 'male' })).toBe('Jan shared his photo.');
        expect(t('shared', { user: 'Kim' })).toBe('Kim shared their photo.');
      });

      it('resolves terms with parameters and message references', () => {
        expect(t('app-title', {})).toBe('Firefox');
        expect(t('restart-app', {})).toBe('Zrestartuj Firefoxa.');
        expect(t('greeting', { name: 'Jan' })).toBe('Hello Jan. Logout');
      });

      it('reads attributes with a dot', () => {
        expect(t('login', {})).toBe('Predefined value');
        expect(t('login.placeholder', {})).toBe('example@email.com');
        expect(t('login.aria-label', {})).toBe('Login input value');
      });

      it('keeps blank lines inside a multiline value', () => {
        expect(t('multiline', {})).toBe('Line one\n\nLine three');
      });

      it('returns undefined for a missing message or attribute', () => {
        expect(fluent.getResource('en', 'translation', 'nope')).toBeUndefined();
        expect(fluent.getResource('en', 'translation', 'login.nope')).toBeUndefined();
        expect(fluent.getResource('en', 'translation', 'logout.nope')).toBeUndefined();
        expect(fluent.getResource('de', 'translation', 'logout')).toBeUndefined();
      });
    });

    describe('with i18next', () => {
      let i18n;

      beforeAll(async () => {
        i18n = i18next.createInstance();
        await i18n.use(Fluent).init({
          lng: 'en-CA',
          fallbackLng: 'en',
          resources: { en: { translation: { ...en } }, pl: { translation: { ...pl } } }
        });
      });

      it('sets i18next.fluent', () => {
        expect(i18n.fluent).toBeInstanceOf(Fluent);
      });

      it('translates from the fallback language, terms included', () => {
        expect(i18n.t('emails', { unreadEmails: 10 })).toBe('You have 10 unread emails.');
        expect(i18n.t('emails', { unreadEmails: 0 })).toBe('You have no unread emails.');
        expect(i18n.t('logout')).toBe('Logout');
        expect(i18n.t('hello', { name: 'Jan' })).toBe('Hello Jan.');
        expect(i18n.t('restart-app')).toBe('Zrestartuj Firefoxa.');
        expect(i18n.t('shared', { user: 'Anna', gender: 'female' })).toBe('Anna shared her photo.');
        expect(i18n.t('login.placeholder')).toBe('example@email.com');
        expect(i18n.t('login.title')).toBe('Type your login email');
      });

      it('returns the key for a missing message or attribute, or the defaultValue', () => {
        expect(i18n.t('nope')).toBe('nope');
        expect(i18n.t('nope.attr')).toBe('nope.attr');
        expect(i18n.t('login.nope')).toBe('login.nope');
        expect(i18n.t('nope', { defaultValue: 'Default' })).toBe('Default');
      });

      it('uses the plural rules of the language', () => {
        const t = i18n.getFixedT('pl');
        expect(t('files', { count: 1 })).toBe('1 plik');
        expect(t('files', { count: 3 })).toBe('3 pliki');
        expect(t('files', { count: 5 })).toBe('5 plików');
      });

      it('formats a language that was not loaded at init', async () => {
        await i18n.changeLanguage('pl');
        expect(i18n.t('files', { count: 22 })).toBe('22 pliki');
        await i18n.changeLanguage('en-CA');
      });

      it('picks up resources added after init', () => {
        i18n.addResourceBundle('en', 'translation', { logout: 'Sign out' }, true, true);
        expect(i18n.t('logout')).toBe('Sign out');
        expect(i18n.t('hello', { name: 'Jan' })).toBe('Hello Jan.');
      });

      it('drops removed resources', () => {
        const t = i18n.getFixedT('pl');
        expect(t('files', { count: 1 })).toBe('1 plik');
        i18n.removeResourceBundle('pl', 'translation');
        expect(t('files', { count: 1 })).toBe('files');
      });
    });

    describe('options', () => {
      it('passes fluentBundleOptions to the bundle', async () => {
        const i18n = i18next.createInstance();
        await i18n.use(Fluent).init({
          lng: 'en',
          resources: { en: { translation: { ...en } } },
          i18nFormat: { fluentBundleOptions: { useIsolating: true } }
        });
        expect(i18n.t('hello', { name: 'Jan' })).toBe('Hello ⁨Jan⁩.');
      });

      it('runs custom functions, e.g. ordinals, which NUMBER() no longer selects', async () => {
        const i18n = i18next.createInstance();
        await i18n.use(Fluent).init({
          lng: 'en',
          resources: {
            en: {
              translation: {
                place: '{ ORDINAL($n) ->\n [one] {$n}st\n [two] {$n}nd\n [few] {$n}rd\n *[other] {$n}th\n}',
                number: '{ NUMBER($n, type: "ordinal") ->\n [two] {$n}nd\n *[other] {$n}th\n}'
              }
            }
          },
          i18nFormat: {
            fluentBundleOptions: {
              useIsolating: false,
              functions: {
                ORDINAL: ([n]) => new n.constructor(n.valueOf(), { ...n.opts, type: 'ordinal' })
              }
            }
          }
        });
        expect([1, 2, 3, 4, 22].map((n) => i18n.t('place', { n }))).toEqual(['1st', '2nd', '3rd', '4th', '22nd']);
        expect(i18n.t('number', { n: 2 })).toBe('2th');
      });
    });
  });
}
