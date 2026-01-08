# Page and Component Plugin Template - My Account Components
This project contains an example of creating plugins of type component. Components are just React components. What it does and how it is
implemented depends on the project requirements.

Just for the purpose of demonstrating how to implement component plugins, this example project will implement a couple of components to
replace the BizConsole's Personal Info component.

Let's assume we don't like the BizConsole's Personal Info component that are displayed in the My Account page. We want to separate the
user's personal info and user preference as 2 different components. Therefore, we created this plugin that implements 2 components to
display the logged in user's info and preference.

## Development

This sample plugin uses Module Federation 2.0 which allows developers to test the plugin in development mode instead of production mode. This mean
developers can make changes to the plugin and preview the changes right away without having to rebuild the plugin. Here is the steps to test
the plugin.

### 1. Start the plugin in development mode
```shell
npm run dev
```
  Vite will start a web server for the project at port 5001, based on the config in `vite.config.ts`. Once the server is started, the plugin can
  be accessed from these URLs http://localhost:5001/myAccountComponentsManifest.json or http://localhost:5001/myAccountComponents.js

### 2. Configure BizConsole to use the plugin from localhost.
Add the plugin to the project. [See the instruction here](../README.md#test-the-plugin). Please use one of the plugin URLs mentioned in Step 1.

### 3. Verify the changes to the plugin from BizConsole
Go to BizConsole and go to the custom page defined in the App Settings where the components is used and you should see the component. This page is
the page you set up in Step 2.

### 4. Make changes to the component and review the changes
Each time you make changes to the component, you can just save the file and Vite will rebuild the plugin automatically. Then you can go back
to the custom page on BizConsole where the component is used, reload the app, and you should see the changes you just made.
