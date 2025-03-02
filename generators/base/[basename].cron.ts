import { CronTask } from "@tsdiapi/cron";
import { Service } from "typedi";

@Service()
export class {{className}}Task {
    @CronTask("{{schedule}}", {
       name: "{{className}} Task",
       description: "This task runs on the defined schedule",
    }) 
    async run() {
       console.log(`{{className}} executed at ${new Date().toISOString()}`);
    }  
}
