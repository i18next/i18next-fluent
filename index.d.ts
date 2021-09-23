declare module "i18next-fluent" {
  import { i18n, ThirdPartyModule } from "i18next";


  export interface FluentConfig {
    bindI18nStore?: boolean,
    fluentBundleOptions?: {
       useIsolating?: boolean
      }
  }

  export interface FluentInstance<TOptions = FluentConfig> extends ThirdPartyModule {
    init(i18next: i18n, options?: TOptions): void;
  }

  interface FluentConstructor {
    new (config?: FluentConfig): FluentInstance;
    type: "i18nFormat";
  }

  const Fluent: FluentConstructor;


  export default Fluent;
}
