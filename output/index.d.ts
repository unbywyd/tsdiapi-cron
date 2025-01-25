import "reflect-metadata";
import type { Application } from 'express';
import { Server } from "http";
import type { Container } from 'typedi';
export type PluginOptions = {
    globCronPath: string;
};
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
    logger: any;
}
export interface AppPlugin {
    name: string;
    bootstrapFilesGlobPath?: string;
    appConfig?: Record<string, any>;
    onInit?(ctx: PluginContext): Promise<void> | void;
    beforeStart?(ctx: PluginContext): Promise<void> | void;
    afterStart?(ctx: PluginContext): Promise<void> | void;
}
export type CronTaskOptions = {
    name?: string;
    description?: string;
};
export interface CronTaskMetadata {
    schedule: string;
    target: any;
    methodName: string;
    options?: CronTaskOptions;
}
export interface ManualCronTask {
    id: string;
    schedule: string;
    task: (context: PluginContext) => Promise<void>;
}
/**
 * @CronTask - Decorator for cron tasks
 * @param schedule - cron schedule
 */
export declare function CronTask(schedule: string, options?: CronTaskOptions): MethodDecorator;
export default class App implements AppPlugin {
    name: string;
    config: PluginOptions;
    bootstrapFilesGlobPath: string;
    context: PluginContext;
    cronTasks: CronTaskMetadata[];
    manualCronTasks: Map<string, ManualCronTask>;
    startCronTasks(context: PluginContext): void;
    constructor(config?: PluginOptions);
    onInit(ctx: PluginContext): Promise<void>;
    registerManualCronTask(data: ManualCronTask): Promise<void>;
    afterStart(ctx: PluginContext): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map