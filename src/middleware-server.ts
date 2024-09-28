import type { APIContext, MiddlewareNext } from "astro";
import i18n from "i18next";
import { getLocaleConfig, getLocalizedPathname } from "./utils.js";

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const { defaultLocale, locales } = getLocaleConfig();

  // detect the locale from the pathname, cookie, or header
  const localeFromPathname = context.url.pathname.split("/")[1];
  const localeFromCookie = context.cookies.get("i18next")?.value;
  const localeFromHeader = context.preferredLocale;
  const nextLocale = [
    localeFromPathname,
    localeFromCookie,
    localeFromHeader,
    defaultLocale,
  ].find((locale) => locale && locales.includes(locale));

  // update the locale
  await i18n.changeLanguage(nextLocale);
  context.cookies.set("i18next", nextLocale || "", { path: "/" });

  // get the localized pathname for the new locale
  const { hash, origin, pathname, search } = context.url;
  const nextPathname = getLocalizedPathname(pathname, nextLocale);

  // redirect to the new url if the pathname has changed
  if (nextPathname !== pathname) {
    const nextUrl = origin + nextPathname + search + hash;
    return context.redirect(nextUrl);
  }

  return next();
}
