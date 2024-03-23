import { cache, action } from "@solidjs/router";
import { getCookie, getEvent, getHeaders, setCookie } from "vinxi/http";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import localeData from "dayjs/plugin/localeData";
dayjs.extend(localeData);
dayjs.extend(isoWeek);

export const getLocale = cache(async () => {
  "use server";
  const event = getEvent()!;

  const headers = getHeaders(event);

  let language = headers["Accept-Language"] || headers["accept-language"];

  const languageFromCookie = getCookie(event, "language");

  if (!!languageFromCookie) {
    language = languageFromCookie;
  }

  if (!language) {
    language = "en-US";
  }

  const languageSplit = language.split(",");

  if (languageSplit.length >= 1) {
    language = languageSplit[0];
  }

  dayjs.updateLocale(language, {});

  const ld = dayjs().localeData();

  const startOfWeek = ld.firstDayOfWeek();

  return { language, startOfWeek };
}, "locale");

export const changeLocaleCookie = action(async(l:string) => {
  "use server";
  const event = getEvent()!;
  setCookie(event, "language", l);
  return l;
}, "locale")
