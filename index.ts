addEventListener("fetch", (event: FetchEvent): void => {
  /* Handle available API routes */
  const { pathname } = new URL(event.request.url);

  switch (pathname) {
    case "/api/slack":
      return event.respondWith(handleSlackRequest(event.request));
    default:
      return event.respondWith(
        new Response(JSON.stringify({ error: "Not Found" }, null, 2), {
          status: 404,
        }),
      );
  }
});

async function handleSlackRequest(request: Request): Promise<Response> {
  try {
    const data = await request?.json();

    switch (data?.type) {
      /* Handle Slack URL Verification */
      case "url_verification":
        return new Response(JSON.stringify(data?.challenge));
      /* Handle Slack Event Callbacks */
      case "event_callback":
        if (
          data?.event.type === "emoji_changed" && data?.event.subtype === "add"
        ) {
          fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("SLACK_OAUTH_TOKEN")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
              channel: Deno.env.get("SLACK_CHANNEL"),
              text: `Emoji :${data?.event.name}: appeared!`,
            }),
          }).then(async (response: Response) => console.log(await response.json()))
            .catch(console.error);
        }
      /* falls through */
      default:
        return new Response(null, {
          status: 204,
        });
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Unknown Error Occured" }, null, 2),
      {
        status: 500,
      },
    );
  }
}
