import "reflect-metadata";
import cron from 'node-cron';
const defaultConfig = {
    autoloadGlobPath: "*.cron{.ts,.js}",
};
let CRON_TASKS = [];
/**
 * @CronTask - Decorator for cron tasks
 * @param schedule - cron schedule
 */
export function CronTask(schedule, options) {
    return (target, methodName) => {
        CRON_TASKS.push({
            schedule,
            target,
            options,
            methodName: methodName,
        });
    };
}
class App {
    name = 'tsdiapi-cron';
    config;
    bootstrapFilesGlobPath;
    context;
    cronTasks = [];
    manualCronTasks = new Map();
    startCronTasks(context) {
        const container = context.container;
        for (const task of CRON_TASKS) {
            const instance = container.get(task.target.constructor);
            cron.schedule(task.schedule, async () => {
                try {
                    const method = instance[task.methodName];
                    if (typeof method === 'function') {
                        await method.call(instance);
                        this.context.logger.info(`Cron task "${task.options?.name || task.methodName}" executed successfully.`);
                    }
                    else {
                        this.context.logger.warn(`Method "${task.methodName}" is not a function.`);
                    }
                }
                catch (error) {
                    this.context.logger.error(`Error executing cron task "${task.options?.name || task.methodName}": ${error.message}`);
                }
            });
            const name = task.options?.name || task.methodName;
            this.context.logger.info(`Cron task "${name}" scheduled with: ${task.schedule}`);
        }
    }
    constructor(config) {
        this.config = { ...config };
        this.bootstrapFilesGlobPath = this.config.autoloadGlobPath || defaultConfig.autoloadGlobPath;
        CRON_TASKS = this.cronTasks;
    }
    async onInit(ctx) {
        this.context = ctx;
    }
    async registerManualCronTask(data) {
        const { id, schedule } = data;
        if (this.manualCronTasks.has(id)) {
            this.context.logger.error(`Manual cron task with id "${id}" already exists.`);
            return;
        }
        this.manualCronTasks.set(id, data);
        cron.schedule(schedule, async () => {
            try {
                const manualTask = this.manualCronTasks.get(id);
                if (manualTask?.task) {
                    await manualTask.task(this.context);
                    this.context.logger.info(`Manual cron task "${id}" executed successfully.`);
                }
            }
            catch (error) {
                this.context.logger.error(`Error executing manual cron task "${id}": ${error.message}`);
            }
        });
        this.context.logger.info(`Manual cron task "${id}" scheduled with: ${schedule}`);
    }
    async afterStart(ctx) {
        this.startCronTasks(ctx);
    }
}
export default function createPlugin(config) {
    return new App(config);
}
//# sourceMappingURL=index.js.map