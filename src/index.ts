import "reflect-metadata";
import cron from 'node-cron';
import type { AppContext, AppPlugin } from "@tsdiapi/server";
import { Container } from "typedi";
import type { FastifyInstance } from "fastify";
declare module "fastify" {
    interface FastifyInstance {
        cron: typeof cron;
    }
}
export type PluginOptions = {
}

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
    task: (context: AppContext) => Promise<void>;
}

let CRON_TASKS: CronTaskMetadata[] = [];

/**
 * @CronTask - Decorator for cron tasks
 * @param schedule - cron schedule
 */
export function CronTask(schedule: string, options?: CronTaskOptions): MethodDecorator {
    return (target, methodName) => {
        CRON_TASKS.push({
            schedule,
            target,
            options,
            methodName: methodName as string,
        });
    };
}

class App implements AppPlugin {
    name = 'tsdiapi-cron';
    config: PluginOptions;
    context: AppContext;
    cronTasks: CronTaskMetadata[] = [];
    manualCronTasks: Map<string, ManualCronTask> = new Map();
    startCronTasks(context: AppContext) {
        for (const task of CRON_TASKS) {
            const instance = Container.get(task.target.constructor);
            cron.schedule(task.schedule, async () => {
                try {
                    const method = (instance as any)[task.methodName];
                    if (typeof method === 'function') {
                        await method.call(instance);
                        this.context.fastify.log.info(`Cron task "${task.options?.name || task.methodName}" executed successfully.`);
                    } else {
                        this.context.fastify.log.warn(`Method "${task.methodName}" is not a function.`);
                    }
                } catch (error) {
                    this.context.fastify.log.error(`Error executing cron task "${task.options?.name || task.methodName}": ${error.message}`);
                }
            });
            const name = task.options?.name || task.methodName;
            this.context.fastify.log.info(`Cron task "${name}" scheduled with: ${task.schedule}`);
        }
    }
    constructor(config?: PluginOptions) {
        this.config = { ...config };
        CRON_TASKS = this.cronTasks;
    }
    async onInit(ctx: AppContext) {
        this.context = ctx;
        if (!ctx.fastify.hasDecorator("cron")) {
            ctx.fastify.decorate('cron', cron);
        }
    }
    async addCronTask(data: ManualCronTask) {
        const { id, schedule } = data;
        if (this.manualCronTasks.has(id)) {
            this.context.fastify.log.error(`Manual cron task with id "${id}" already exists.`);
            return;
        }

        this.manualCronTasks.set(id, data);
        cron.schedule(schedule, async () => {
            try {
                const manualTask = this.manualCronTasks.get(id);
                if (manualTask?.task) {
                    await manualTask.task(this.context);
                    this.context.fastify.log.info(`Manual cron task "${id}" executed successfully.`);
                }
            } catch (error) {
                this.context.fastify.log.error(`Error executing manual cron task "${id}": ${error.message}`);
            }
        });
        this.context.fastify.log.info(`Manual cron task "${id}" scheduled with: ${schedule}`);
    }

    async afterStart(ctx: AppContext) {
        this.startCronTasks(ctx);
    }
}

export default function createPlugin(config?: PluginOptions) {
    return new App(config);
}