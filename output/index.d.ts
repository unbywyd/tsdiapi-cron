import "reflect-metadata";
import { AppContext, AppPlugin } from "tsdiapi-server";
export type PluginOptions = {
    globCronPath: string;
};
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
    task: (context: AppContext) => Promise<void>;
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
    context: AppContext;
    cronTasks: CronTaskMetadata[];
    manualCronTasks: Map<string, ManualCronTask>;
    startCronTasks(context: AppContext): void;
    constructor(config?: PluginOptions);
    onInit(ctx: AppContext): Promise<void>;
    registerManualCronTask(data: ManualCronTask): Promise<void>;
    afterStart(ctx: AppContext): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map