import { CronTask } from "@tsdiapi/cron";
import { Service } from "typedi";

@Service()
export class {{classname}}Task {
    @CronTask("{{schedule}}", {
       name: "{{classname}} Task",
       description: "This task runs on the defined schedule",
    }) 
    async run() {
       console.log(`{{classname}} executed at ${new Date().toISOString()}`);
    }  
}
