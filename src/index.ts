import type { AstroIntegration } from "astro";
import path from "pathe";

const INTEGRATION_NAME = "astro-react-i18next";

const DEFAULT_OPTIONS = {
  defaultLocale: "en-US",
  locales: ["en-US"],
  defaultNamespace: "common",
  namespaces: ["common"],
  prefixDefaultLocale: false,
  localesDir: "locales",
  domains: [],
  reservedRoutes: ["/api"],
};

interface AstroReactI18nextOptions {
  defaultLocale?: string;
  locales?: string[];
  defaultNamespace?: string;
  namespaces?: string[];
  prefixDefaultLocale?: boolean;
  localesDir?: string;
  domains?: {
    domain: string;
    defaultLocale: string;
  }[];
  reservedRoutes?: string[];
}

type MergedAstroReactI18nextOptions = {
  [key in keyof AstroReactI18nextOptions]-?: AstroReactI18nextOptions[key];
};

declare module "i18next" {
  interface InitOptions {
    astroReactI18next: Pick<
      MergedAstroReactI18nextOptions,
      | "defaultLocale"
      | "locales"
      | "prefixDefaultLocale"
      | "domains"
      | "reservedRoutes"
    >;
  }
}

function buildI18nextInitScript({
  backendType,
  basePath,
  mergedOptions,
}: {
  backendType: "http" | "fs";
  basePath: string;
  mergedOptions: AstroReactI18nextOptions;
}) {
  let imports = "";
  let i18nextPlugins = "";
  let i18nextOptions = "";

  if (backendType === "fs") {
    imports = `
      import Backend from "i18next-fs-backend";
    `;
    i18nextOptions = `
      initAsync: false,
    `;
  }

  if (backendType === "http") {
    imports = `
      import Backend from "i18next-http-backend";
      import LanguageDetector from "i18next-browser-languagedetector";
    `;
    i18nextPlugins = `
      .use(LanguageDetector)
    `;
    i18nextOptions = `
      detection: {
        caches: ["cookie", "localStorage"],
        order: ["cookie", "localStorage"],
        lookupCookie: 'i18next',
        lookupLocalStorage: 'i18next',
      },
    `;
  }

  return `
    import i18n from "i18next";
    import { initReactI18next } from "react-i18next";
    ${imports}

    i18n
      .use(Backend)
      .use(initReactI18next)
      ${i18nextPlugins}
      .init({
        fallbackLng: "${mergedOptions.defaultLocale}",
        supportedLngs: ${JSON.stringify(mergedOptions.locales)},
        defaultNS: "${mergedOptions.defaultNamespace}",
        ns: ${JSON.stringify(mergedOptions.namespaces)},
        interpolation: {
          escapeValue: false,
        },
        backend: {
          loadPath: "${path.resolve(path.join(basePath, mergedOptions.localesDir || ""))}/{{lng}}/{{ns}}.json",
        },
        astroReactI18next: ${JSON.stringify({
          defaultLocale: mergedOptions.defaultLocale,
          locales: mergedOptions.locales,
          prefixDefaultLocale: mergedOptions.prefixDefaultLocale,
          domains: mergedOptions.domains,
          reservedRoutes: mergedOptions.reservedRoutes,
        })},
        ${i18nextOptions}
      });
  `;
}

function buildLocaleRestorationScript(
  mergedOptions: MergedAstroReactI18nextOptions,
) {
  return `
    window.addEventListener("DOMContentLoaded", () => {
      const defaultLocale = "${mergedOptions.defaultLocale}";
      const locales = ${JSON.stringify(mergedOptions.locales)};
      const reservedRoutes = ${JSON.stringify(mergedOptions.reservedRoutes)};
      const pathname = window.location.pathname;

      if (
        reservedRoutes.some(
          (route) =>
            pathname === route ||
            pathname.startsWith(route + "/"),
        )
      ) {
        return;
      }

      let detectedLocale = pathname.split("/")[1];

      if (!locales.includes(detectedLocale)) {
        detectedLocale = defaultLocale;
      }

      i18n.changeLanguage(detectedLocale);
    });
  `;
}

export default function AstroReactI18nextIntegration(
  options?: AstroReactI18nextOptions,
): AstroIntegration {
  // merge the user-provided options with the default options
  const mergedOptions: MergedAstroReactI18nextOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // return the integration object
  return {
    name: INTEGRATION_NAME,
    hooks: {
      "astro:config:setup": ({
        config,
        addMiddleware,
        injectScript,
        updateConfig,
      }) => {
        const middlewareEntrypoint =
          config.output === "server"
            ? `${INTEGRATION_NAME}/middleware/server`
            : `${INTEGRATION_NAME}/middleware/static`;

        const clientI18nextInitScript = buildI18nextInitScript({
          backendType: "http",
          basePath: "/",
          mergedOptions,
        });

        const serverI18nextInitScript = buildI18nextInitScript({
          backendType: "fs",
          basePath: config.publicDir.pathname,
          mergedOptions,
        });

        const localeRestorationScript =
          buildLocaleRestorationScript(mergedOptions);

        addMiddleware({
          entrypoint: middlewareEntrypoint,
          order: "post",
        });

        injectScript("page-ssr", serverI18nextInitScript);

        injectScript("before-hydration", clientI18nextInitScript);
        injectScript("page", clientI18nextInitScript);

        if (mergedOptions.domains.length === 0) {
          injectScript("before-hydration", localeRestorationScript);
          injectScript("page", localeRestorationScript);
        }

        updateConfig({
          i18n: {
            locales: mergedOptions.locales,
            defaultLocale: mergedOptions.defaultLocale,
            routing: {
              prefixDefaultLocale: false,
              redirectToDefaultLocale: false,
              fallbackType: "redirect",
            },
          },
        });
      },
    },
  };
}
