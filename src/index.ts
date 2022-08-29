import "dotenv/config";
import { ScheduledTask } from "node-cron";
import { Telegraf } from "telegraf";
import { logger } from "./helpers/general";
import { scheduleMonitoringUnfollowers } from "./services/cronService";
import { checkUnfollowers } from "./services/unfollowersTrackerService";

// Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => {
  ctx.reply("/unfollowers");
  ctx.reply("/start_monitoring hour_of_the_day");
  ctx.reply("/stop_monitoring");
  ctx.reply("/next_check");
});

bot.hears("hi", (ctx) => ctx.reply("Hey there"));

// Custom commands
bot.command("unfollowers", (ctx) => {
  checkUnfollowers(ctx);
});

let monitoringUnfollowersTask: ScheduledTask | null = null;
let monitoringHour: number | null = null;

bot.command("start_monitoring", (ctx) => {
  const text = ctx.update.message.text;
  monitoringHour = Number(text.split(" ")[1]) || 12;
  // run cron every day at the hour that user entered
  const cronPeriod = `0 ${monitoringHour} * * *`;
  monitoringUnfollowersTask = scheduleMonitoringUnfollowers(cronPeriod, ctx);
  logger(
    `Monitoring followers started, every day at ${monitoringHour}:00`,
    ctx
  );
});

bot.command("/stop_monitoring", (ctx) => {
  if (monitoringUnfollowersTask !== null) {
    console.log("Monitoring followers stopped");
    ctx.reply("Monitoring followers stopped");
    monitoringUnfollowersTask.stop();
    monitoringHour = null;
  } else {
    console.log("Monitoring task not found");
    ctx.reply("Monitoring task not found");
  }
});

bot.command("/next_check", (ctx) => {
  if (monitoringHour !== null) {
    logger(`Next unfollowers check is at: ${monitoringHour}:00`, ctx);
  } else {
    logger(`There is no scheduled unfollowers check`, ctx);
  }
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Start bot server
(async () => {
  bot.launch().then(() => {
    console.log(
      "Instagram unfollowers tracker started. Send /help from your telegram bot for help."
    );
  });
})();
