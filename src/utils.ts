import i18n from "i18next";

export function getLocaleConfig() {
  const { defaultLocale, locales, prefixDefaultLocale, domains } =
    i18n.options.astroReactI18next;
  return {
    defaultLocale,
    locales,
    prefixDefaultLocale,
    domains,
  };
}

export function getLocalizedPathname(pathname = "", locale = "") {
  const { defaultLocale, locales, prefixDefaultLocale } = getLocaleConfig();
  const localeFromPathname = pathname.split("/")[1];
  let localizedPathname = pathname;

  // remove existing locale from the pathname
  if (locales.includes(localeFromPathname)) {
    localizedPathname =
      localizedPathname.replace("/" + localeFromPathname, "") || "/";
  }

  // add the locale to the pathname
  if (
    locales.includes(locale) &&
    (locale !== defaultLocale || prefixDefaultLocale)
  ) {
    localizedPathname = "/" + locale + localizedPathname.replace(/^\/$/, "");
  }

  return localizedPathname;
}

export function buildStaticPaths() {
  const { defaultLocale, locales, prefixDefaultLocale } = getLocaleConfig();
  return locales.map((locale) => ({
    params: {
      locale:
        locale !== defaultLocale || prefixDefaultLocale ? locale : undefined,
    },
  }));
}

export function changeLocale(nextLocale = "", shallow = true) {
  const { locales } = getLocaleConfig();

  // ignore the request if the locale is not supported
  if (!locales.includes(nextLocale)) {
    return;
  }

  // update the locale
  i18n.changeLanguage(nextLocale);

  // get the localized pathname for the new locale
  const { hash, pathname, search } = window.location;
  const nextPathname = getLocalizedPathname(pathname, nextLocale);

  // update the url if the pathname has changed
  if (nextPathname !== pathname) {
    const nextUrl = nextPathname + search + hash;

    if (shallow) {
      window.history.replaceState(null, "", nextUrl);
    } else {
      window.location.replace(nextUrl);
    }
  }
}
