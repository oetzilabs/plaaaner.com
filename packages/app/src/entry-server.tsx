import { StartServer, createHandler, renderAsync } from "solid-start/entry-server";

export default createHandler(
  ({ forward }) => {
    return async (event) => {
      // your own logic here
      const request = event.request;
      // maybe you want to get the cookie? or block this ip?
      const cookie = request.headers.get("cookie");
      const ip = request.headers.get("x-real-ip");
      console.log("cookie", cookie);
      console.log("ip", ip);

      return forward(event); // next
    };
  },
  renderAsync((event) => <StartServer event={event} />),
);
