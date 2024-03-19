import { cache } from "@solidjs/router";
import { getCookie, getEvent, getHeaders } from "vinxi/http";

export const getLocale = cache(async () => {
  "use server";
  const event = getEvent()!;
  const headers = getHeaders(event);
  let language = headers["Accept-Language"];
  const languageFromCookie = getCookie(event, "language");
  if(languageFromCookie) {
    language = languageFromCookie;
  }
  if(!language) language = 'en-US';
  const startOfWeek = 1;
  return { language, startOfWeek };
}, "locale");
