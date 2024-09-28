# astro-react-i18next

Integrates i18next and react-i18next seamlessly into your Astro website to provide robust i18n support for React components.

## Installation

```bash
npx astro add astro-react-i18next
```

Follow the prompts to install the necessary dependencies and add the required configuration to your Astro project.

You will see the following changes in your `astro.config.mjs` file:

```diff
import { defineConfig } from "astro/config";
import reactI18next from "astro-react-i18next";

export default defineConfig({
  // ...
  integrations: [
    // ...
+   reactI18next(),
  ],
});
```

## Configuration

The initialization function accepts an optional configuration object with the following options:

| Option                | Type       | Description                                                                        | Default      |
| --------------------- | ---------- | ---------------------------------------------------------------------------------- | ------------ |
| `defaultLocale`       | `string`   | The default locale to use when no locale is specified.                             | `"en-US"`    |
| `locales`             | `string[]` | An array of locales to support.                                                    | `["en-US"]`  |
| `defaultNamespace`    | `string`   | The default namespace to use when no namespace is specified.                       | `"common"`   |
| `namespaces`          | `string[]` | An array of namespaces to support.                                                 | `["common"]` |
| `prefixDefaultLocale` | `boolean`  | Whether to prefix the default locale with the locale code.                         | `false`      |
| `localesDir`          | `string`   | The directory where the locale files are stored, relative to the public directory. | `"locales"`  |

Here is an example of how to configure the integration:

```diff
import { defineConfig } from "astro/config";
import reactI18next from "astro-react-i18next";

export default defineConfig({
  // ...
  integrations: [
    // ...
-   reactI18next(),
+   reactI18next({
+     defaultLocale: "en-US",
+     locales: ["en-US", "fr-FR", "zh-TW"],
+     defaultNamespace: "app",
+     namespaces: ["app"],
+   }),
  ],
});
```

It also supports `Server (SSR) Mode`, such as using the `@astrojs/node` adapter:

```diff
import { defineConfig } from "astro/config";
+import node from '@astrojs/node';
import reactI18next from "astro-react-i18next";

export default defineConfig({
  // ...
  integrations: [
    // ...
    reactI18next({
      defaultLocale: "en-US",
      locales: ["en-US", "fr-FR", "zh-TW"],
      defaultNamespace: "app",
      namespaces: ["app"],
    }),
  ],
+ output: "server",
+ adapter: node({
+   mode: "standalone",
+ }),
});
```

## Locale Resources

Create locale files for each locale and namespace in the `localesDir` directory.

For example, create the following files:

```text
/
├── public/
│   └── locales/
│       ├── en-US/
│       │   └── common.json
│       ├── fr-FR/
│       │   └── common.json
│       └── zh-TW/
│           └── common.json
├── src/
└── package.json
```

The content of the `locales/en-US/common.json` file should look like this:

```json
{
  "hello_world": "Hello World!"
}
```

## Dynamic Routes for Locales

To manage dynamic routes for each locale, create a root route named `[...locale]` in the `src` directory.

```text
/
├── public/
├── src/
│   └── [...locale]/
│       ├── ...
│       └── index.jsx
└── package.json
```

## Static Paths for Locales

To generate static paths for each locale in `Static (SSG) Mode`, use the `getStaticPaths` function in your Astro page file.

```js
---
import { buildStaticPaths } from "astro-react-i18next/utils";

export function getStaticPaths() {
  return buildStaticPaths();
}
---

<html>
  ...
</html>
```

## Translating Content in Astro Components

Use the i18next instance to translate content in your Astro components.

```js
---
import i18next from "i18next";
---

<html lang={i18next.language}>
  <p>{i18next.t("common:hello_world")}</p>
</html>
```

## Translating Content in React Components

Use the `useTranslation` hook to translate content in your React components.

```js
import { useTranslation } from "react-i18next";

export function MyComponent() {
  const { t } = useTranslation();
  return <p>{t("common:hello_world")}</p>;
}
```

## Utilities

The integration provides utility functions to help manage locales and translations.

All utility functions are available in the `astro-react-i18next/utils` module.

| Function                                           | Description                                              | Returns                                                                      |
| -------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `getLocaleConfig()`                                | Returns the locale configuration object.                 | `{ defaultLocale: string, locales: string[], prefixDefaultLocale: boolean }` |
| `getLocalizedPathname(pathname = "", locale = "")` | Returns the localized pathname for the specified locale. | string                                                                       |
| `buildStaticPaths()`                               | Generates static paths for each locale.                  | `{ params: { locale: string \| undefined; }; }[]`                            |
| `changeLocale(nextLocale = "", shallow = true)`    | Changes the current locale.                              |                                                                              |

## License

Licensed under the [MIT License](https://github.com/jeremyxgo/astro-react-i18next/blob/main/LICENSE).
