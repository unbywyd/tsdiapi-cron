"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronTask = CronTask;
require("reflect-metadata");
const node_cron_1 = __importDefault(require("node-cron"));
const defaultConfig = {
    globCronPath: "*.cron{.ts,.js}",
};
let CRON_TASKS = [];
/**
 * @CronTask - Decorator for cron tasks
 * @param schedule - cron schedule
 */
function CronTask(schedule, options) {
    // Пушим в глобальную переменную, но не забываем что она будет переопределена в конструкторе и направлена в this.cronTasks
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
            const instance = container.get(task.target.constructor); //  get instance of the class
            node_cron_1.default.schedule(task.schedule, async () => {
                const method = instance[task.methodName];
                if (typeof method === 'function') {
                    await method.call(instance);
                }
            });
            const name = task.options?.name || task.methodName;
            this.context.logger.info(`Cron task "${name}" scheduled with: ${task.schedule}`);
        }
    }
    constructor(config) {
        this.config = { ...config };
        this.bootstrapFilesGlobPath = this.config.globCronPath || defaultConfig.globCronPath;
        CRON_TASKS = this.cronTasks; // Переопределим ссылку в глобал переменной
    }
    async onInit(ctx) {
        this.context = ctx;
    }
    async registerManualCronTask(data) {
        const { id, schedule } = data;
        if (this.manualCronTasks.has(id)) {
            console.error(`Manual cron task with id "${id}" already exists`);
            return;
        }
        this.manualCronTasks.set(id, data);
        node_cron_1.default.schedule(schedule, async () => {
            const manualTask = this.manualCronTasks.get(id);
            if (manualTask?.task) {
                await manualTask.task(this.context);
            }
        });
    }
    async afterStart(ctx) {
        this.startCronTasks(ctx);
    }
}
exports.default = App;
//# sourceMappingURL=index.js.map