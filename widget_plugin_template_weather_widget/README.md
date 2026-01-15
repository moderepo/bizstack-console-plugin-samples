# Dashboard Widget Plugin Template - Weather Widget
This project contains an example of creating plugins of type dashboard widget. There are many types of dashboard widgets. There are widgets
that display static data and do not require making API calls. There are widgets that display dynamic data such as metrics, logs, alerts,
etc... which require making API calls to MODE's backend to fetch data. And there are widgets that display dynamic data and require making API
calls but to external server instead of MODE backend. This project contains example of a widget that display external data.

## Development

This sample plugin uses Module Federation 2.0 which allows developers to test the plugin in development mode instead of production mode. This mean
developers can make changes to the plugin and preview the changes right away without having to rebuild the plugin. Here is the steps to test
the plugin.

### 1. Start the plugin in development mode
```shell
npm run dev
```
  Vite will start a web server for the project at port 5000, based on the config in `vite.config.ts`. Once the server is started, the plugin can
  be accessed from these URLs http://localhost:5000/weatherWidgetsManifest.json or http://localhost:5000/weatherWidgets.js

### 2. Configure BizConsole to use the plugin from localhost.
Add the plugin to the project. [See the instruction here](../README.md#test-the-plugin). Please use one of the plugin URLs mentioned in Step 1.

### 3. Verify the changes to the plugin from BizConsole
Go to any of the dashboard on BizConsole. Go into `Edit` mode and create a widget. The `Temperature widget` and `Humidity Widget` will show up
on the list of widgets. Select the widget you want to test and add it to the dashboard.

### 4. Make changes to the widget and review the changes
Each time you make changes to the widget, you can just save the file and Vite will rebuild the plugin automatically. Then you can go back
to the same dashboard, reload the app, and you should see the changes you just made.
