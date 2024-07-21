# Plaaaner.com

# Notes

-   The `SessionProvider` wont be needed anymore, we will use `preload` routes with `createAsync` from `@solidjs/router`.
-   Websockets have to be initiated from the `App` Component and passed down to the Provider.
-   Websockets need to be modified on the lambda area, where `/push -> via action` has to be send to AWS and the
    `/pull -> receives payloads`. All in a somewhat typesafe way. Gotta figure out how to make that possible
