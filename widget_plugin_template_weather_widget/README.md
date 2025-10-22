# Dashboard Widget Plugin Template - Weather Widget

This project contains an example of creating plugins of type dashboard widget. There are many types of dashboard widgets. There are widgets
that display static data and do not require making API calls. There are widgets that display dynamic data such as metrics, logs, alerts,
etc... which require making API calls to MODE's backend to fetch data. And there are widgets that display dynamic data and require making API
calls but to external server instead of MODE backend. This project contains example of a widget that display external data.

## Development Methods

This plugin offers two development approaches.
Use the self-hosted environment (1) during regular development,
then integrate into BizConsole to confirm behavior once things are complete.

1. Develop in a self-hosted environment with Vite and HMR enabled
2. Integrate it into BizConsole as a Plugin and verify (full build required whenever you change code)

### Developing in a Self-Hosted Environment

1. First, install [pnpm](https://pnpm.io/installation).
2. Next, run the following to install packages:

```shell
pnpm install --frozen-lockfile
```

Then create `src/dev/.env.local` with the content below.
Copy the User API Key from the browser after logging into BizConsole and set it as the value of VITE_USER_AUTH_TOKEN.

```shell
VITE_USER_AUTH_TOKEN="v1.dXN8...."
VITE_PROJECT_ALIAS="your-project-alias"
```

Finally, start the server with the command below,
and open `http://localhost:5000/projects/{projectId}/custom/widget1` to begin development.

```shell
pnpm run dev
```
