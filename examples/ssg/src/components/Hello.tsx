import { useTranslation } from "react-i18next";

export function Hello() {
  const { t } = useTranslation();
  return <p>{t("hello_world")}</p>;
}
