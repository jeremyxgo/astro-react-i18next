import type { APIContext, MiddlewareNext } from "astro";
import i18n from "i18next";
import { getLocaleConfig, getLocalizedPathname } from "./utils.js";

const ASTRO_RESERVED_ROUTES = ["/_astro", "/_actions", "/_server-islands"];

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const { defaultLocale, locales, domains, reservedRoutes } = getLocaleConfig();

  // skip the locale handling for reserved routes
  if (
    [...ASTRO_RESERVED_ROUTES, ...reservedRoutes].some(
      (route) =>
        context.url.pathname === route ||
        context.url.pathname.startsWith(route + "/"),
    )
  ) {
    return next();
  }

  const localesByDomain = Object.fromEntries(
    domains.map((domain) => [domain.domain, domain.defaultLocale]),
  );

  // detect the locale from the host, pathname, cookie, or header
  const localeFromDomain = localesByDomain[context.url.host];
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
  if (nextPathname !== pathname && domains.length === 0) {
    const nextUrl = nextPathname + search + hash;
    return context.redirect(nextUrl);
  }

  return next();
}
