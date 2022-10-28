import cron from "node-cron";
import { Context } from "telegraf";
import { checkUnfollowers } from "./unfollowersTrackerService";

export const scheduleMonitoringUnfollowers = (
  cronPeriod: string,
  ctx: Context
) => {
  return cron.schedule(cronPeriod, async () => {
    console.log("Cron service is running.");
    await checkUnfollowers(ctx);
  });
};
