import type { APIContext, MiddlewareNext } from "astro";
import i18n from "i18next";
import { getLocaleConfig } from "./utils.js";

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const { defaultLocale, locales } = getLocaleConfig();

  // detect the locale from the pathname
  const localeFromPathname = context.url.pathname.split("/")[1];
  const nextLocale = [localeFromPathname, defaultLocale].find(
    (locale) => locale && locales.includes(locale),
  );

  // update the locale
  await i18n.changeLanguage(nextLocale);

  return next();
}
