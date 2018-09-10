import Fluent from '../src/';
import i18next from 'i18next';

import { FluentBundle, ftl } from 'fluent';

const testJSON = {
  "emails": "{ $unreadEmails ->\n  [one] You have one unread email.\n *[other] You have { $unreadEmails } unread emails.\n}",
  "-brand-name": "{\n *[nominative] Firefox\n  [accusative] Firefoxa\n}",
  "-another-term": "another term",
  "app-title": "{ -brand-name }",
  "restart-app": "Zrestartuj { -brand-name[accusative] }.",
  "login": {
    "comment": "Note: { $title } is a placeholder for the title of the web page\ncaptured in the screenshot. The default, for pages without titles, is\ncreating-page-title-default.",
    "val": "Predefined value",
    "placeholder": "example@email.com",
    "aria-label": "Login input value",
    "title": "Type your login email"
  },
  "logout": "Logout",
  "hello": "Hello { $name }."
};

describe('fluent format', () => {

  describe('basic parse', () => {
    let fluent;

    before(() => {
      fluent = new Fluent({
        bindI18nextStore: false
      });

      fluent.store.createBundle('en', 'translations', testJSON);
    });

    it('should parse', () => {
      const res = fluent.getResource('en', 'translations', 'logout')
      expect(fluent.parse(res, {}, 'en', 'translations')).to.eql('Logout');

      const res2 = fluent.getResource('en', 'translations', 'hello')
      expect(fluent.parse(res2, { name: 'Jan' }, 'en', 'translations')).to.eql('Hello Jan.');

      const res3 = fluent.getResource('en', 'translations', 'restart-app')
      expect(fluent.parse(res3, {}, 'en', 'translations')).to.eql('Zrestartuj Firefoxa.');
    });

  });


  describe('with i18next', () => {

    before(() => {
      i18next
        .use(Fluent)
        .init({
          lng: 'en',
          fallbackLng: 'en',
          resources: {
            en: {
              translation: testJSON
            }
          }
        });
    });

    it('should parse', () => {
      expect(i18next.t('logout')).to.eql('Logout');
      expect(i18next.t('hello', { name: 'Jan' })).to.eql('Hello Jan.');
      expect(i18next.t('restart-app')).to.eql('Zrestartuj Firefoxa.');
    });

  });
});