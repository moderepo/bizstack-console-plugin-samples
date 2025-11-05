# Page and Component Plugin Template - My Account Components

This project contains an example of creating plugins of type component. Components are just React components. What it does and how it is
implemented depends on the project requirements.

Just for the purpose of demonstrating how to implement component plugins, this example project will implement a couple of components to
replace the BizConsole's Personal Info component.

Let's assume we don't like the BizConsole's Personal Info component that are displayed in the My Account page. We want to separate the
user's personal info and user preference as 2 different components. Therefore, we created this plugin that implements 2 components to
display the logged in user's info and preference.

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
and open `http://localhost:5001/projects/{projectId}/custom/my_custom_page` to begin development.

```shell
pnpm run dev
```

### Verifying as a BizConsole Plugin

Run the command below to build and start the server as a BizConsole Plugin.
Because it performs a full build, it may take several seconds before the server is ready.

```shell
pnpm run build:watch
```

## Adding a New Page in the Self-Hosted Environment

In the self-hosted environment, routes do not reference BizStack Console Configs,
instead they use `src/dev/routes/BizConsoleRoutes.tsx`.
To add a new page, update the bizConsoleRoutes in BizConsoleRoutes.tsx.
