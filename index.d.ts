declare module "i18next-fluent" {
  import { i18n, ThirdPartyModule } from "i18next";
  import { FluentBundle } from "@fluent/bundle";

  export interface FluentConfig {
    bindI18nStore?: boolean,
    /** passed to `new FluentBundle(lng, fluentBundleOptions)`: `useIsolating`, `functions`, `transform` */
    fluentBundleOptions?: ConstructorParameters<typeof FluentBundle>[1]
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
