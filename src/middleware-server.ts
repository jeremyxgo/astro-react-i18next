import type { APIContext, MiddlewareNext } from "astro";
import i18n from "i18next";
import { getLocaleConfig, getLocalizedPathname } from "./utils.js";

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const { defaultLocale, locales, domains } = getLocaleConfig();
  const host: string | null = context.request.headers.get("host");

  // detect the locale from the host, pathname, cookie, or header
  const localeFromDomain = domains.find(
    (domain: { domain: string; defaultLocale: string }) =>
      host === domain.domain,
  )?.defaultLocale;
  const localeFromPathname = context.url.pathname.split("/")[1];
  const localeFromCookie = context.cookies.get("i18next")?.value;
  const localeFromHeader = context.preferredLocale;
  const nextLocale = [
    localeFromDomain,
    localeFromPathname,
    localeFromCookie,
    localeFromHeader,
    defaultLocale,
  ].find((locale) => locale && locales.includes(locale));

  // update the locale
  await i18n.changeLanguage(nextLocale);
  context.cookies.set("i18next", nextLocale || "", { path: "/" });

  // get the localized pathname for the new locale
  const { hash, pathname, search } = context.url;
  const nextPathname = getLocalizedPathname(pathname, nextLocale);

  // redirect to the new url if the pathname has changed
  const isDomainMode = domains.length > 0;
  if (nextPathname !== pathname && !isDomainMode) {
    const nextUrl = nextPathname + search + hash;
    return context.redirect(nextUrl);
  }

  return next();
}
