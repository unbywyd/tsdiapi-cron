# Cron Scheduler Plugin for TSDIAPI-Server

TSDIAPI-Cron is a plugin for the [TSDIAPI-Server](https://github.com/unbywyd/tsdiapi-server) framework, designed to simplify scheduling and managing cron jobs in TypeScript projects. It integrates seamlessly with the framework and utilizes `node-cron` for precise task scheduling.

## Features

- **Declarative Cron Task Definition**: Define cron tasks using a decorator (`@CronTask`).
- **Manual Cron Task Registration**: Dynamically register cron tasks at runtime.
- **Integration with TSDIAPI-Server**: Automatically initialize and manage tasks within the framework's lifecycle.
- **Customizable Options**: Add metadata like names and descriptions for better task management.
- **Scalable Architecture**: Easily handle both predefined and dynamic cron jobs.

---

## Installation

```bash
npm install @tsdiapi/cron
```

or use `@tsdiapi/cli` to add it to your project:

```bash
tsdiapi plugins add cron
```

## Code Generation

| Name   | Description                                       |
| ------ | ----------------------------------------------- |
| `base` | Create a new cron job with a predefined schedule. |

The **TSDIAPI-Cron** plugin includes a generator to streamline cron job creation. Use the `tsdiapi` CLI command to generate cron job files automatically:

```bash
tsdiapi generate cron
```

This command will create a new cron job with the necessary structure, including decorators and scheduling logic. You can specify the schedule and customize the task logic according to your needs.

## Getting Started

### Define a Cron Task

Use the `@CronTask` decorator to define a cron job:

```typescript
import { CronTask } from "@tsdiapi/cron";
import { Service } from "typedi";

@Service()
export class TestCron {
  @CronTask("*/5 * * * * *", {
    name: "testTask",
    description: "Test cron task",
  }) // Every 5 seconds
  async testTask() {
    console.log("Executing test cron task");
  }
}
```

### Register the Plugin

Add the plugin to the `createApp` function of your TSDIAPI-Server application:

```typescript
import { createApp } from "@tsdiapi/server";
import CronPlugin from "@tsdiapi/cron";

createApp({
  plugins: [new CronPlugin()],
});
```

---

## Configuration Options

The plugin supports the following configuration options:

### PluginOptions

| Option             | Type     | Default Value       | Description                           |
| ------------------ | -------- | ------------------- | ------------------------------------- |
| `autoloadGlobPath` | `string` | `"*.cron{.ts,.js}"` | Glob pattern to find cron task files. |

Example usage:

```typescript
import CronPlugin from "@tsdiapi/cron";

createApp({
  plugins: [
    new CronPlugin({
      autoloadGlobPath: "*.cron.ts", // Custom glob pattern
    }),
  ],
});
```

---

### Plugin Lifecycle Integration

TSDIAPI-Cron hooks into the plugin lifecycle to ensure tasks are started and managed efficiently:

- **`onInit`**: Initializes the plugin and loads cron tasks.
- **`afterStart`**: Automatically schedules all defined tasks.
- **`beforeStart`**: Custom pre-start logic can be added here if necessary.

---

## Logs and Debugging

TSDIAPI-Cron logs information about scheduled tasks, including their names and schedules. Ensure your application's logger is properly configured to capture these messages for debugging purposes.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the plugin.

---

## License

This library is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

This documentation provides an overview of the library, how to set it up, and detailed examples for integration and usage. Let me know if you'd like to refine it further!
