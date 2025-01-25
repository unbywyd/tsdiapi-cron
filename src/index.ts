import "reflect-metadata";
import type { Application } from 'express';
import { Server } from "http";
import type { Container } from 'typedi';

export type PluginOptions = {
    globCronPath: string;
}
const defaultConfig: PluginOptions = {
    globCronPath: "*.cron{.ts,.js}",
}

export interface AppOptions {
    appConfig: any;
    environment: string;
    corsOptions: any;
    swaggerOptions: any;
    [key: string]: any;
}

export interface PluginContext {
    appDir: string;
    app: Application;
    server?: Server;
    plugins: Record<string, AppPlugin>;
    container: typeof Container;
    config: AppOptions;
    logger: any
}
export interface AppPlugin {
    name: string;
    bootstrapFilesGlobPath?: string;
    appConfig?: Record<string, any>;
    onInit?(ctx: PluginContext): Promise<void> | void;
    beforeStart?(ctx: PluginContext): Promise<void> | void;
    afterStart?(ctx: PluginContext): Promise<void> | void;
}


import cron from 'node-cron';

export type CronTaskOptions = {
    name?: string;
    description?: string;
}
export interface CronTaskMetadata {
    schedule: string; // cron schedule
    target: any; // class constructor
    methodName: string; // method name
    options?: CronTaskOptions;
}

export interface ManualCronTask {
    id: string;
    schedule: string;
    task: (context: PluginContext) => Promise<void>;
}

let CRON_TASKS: CronTaskMetadata[] = [];


/**
 * @CronTask - Decorator for cron tasks
 * @param schedule - cron schedule
 */
export function CronTask(schedule: string, options?: CronTaskOptions): MethodDecorator {
    // Пушим в глобальную переменную, но не забываем что она будет переопределена в конструкторе и направлена в this.cronTasks
    return (target, methodName) => {
        CRON_TASKS.push({
            schedule,
            target,
            options,
            methodName: methodName as string,
        });
    };
}


export default class App implements AppPlugin {
    name = 'app';
    config: PluginOptions;
    bootstrapFilesGlobPath: string;
    context: PluginContext;
    cronTasks: CronTaskMetadata[] = [];
    manualCronTasks: Map<string, ManualCronTask> = new Map();
    startCronTasks(context: PluginContext) {
        const container = context.container;
        for (const task of CRON_TASKS) {
            const instance = container.get(task.target.constructor); //  get instance of the class
            cron.schedule(task.schedule, async () => {
                const method = (instance as any)[task.methodName];
                if (typeof method === 'function') {
                    await method.call(instance);
                }
            });
            const name = task.options?.name || task.methodName;
            this.context.logger.info(`Cron task "${name}" scheduled with: ${task.schedule}`);
        }
    }
    constructor(config?: PluginOptions) {
        this.config = { ...config };
        this.bootstrapFilesGlobPath = this.config.globCronPath || defaultConfig.globCronPath;
        CRON_TASKS = this.cronTasks; // Переопределим ссылку в глобал переменной
    }
    async onInit(ctx: PluginContext) {
        this.context = ctx;
    }
    async registerManualCronTask(data: ManualCronTask) {
        const { id, schedule } = data;
        if (this.manualCronTasks.has(id)) {
            console.error(`Manual cron task with id "${id}" already exists`);
            return;
        }
        this.manualCronTasks.set(id, data);
        cron.schedule(schedule, async () => {
            const manualTask = this.manualCronTasks.get(id);
            if (manualTask?.task) {
                await manualTask.task(this.context);
            }
        });
    }
    async afterStart(ctx: PluginContext) {
        this.startCronTasks(ctx);
    }
}