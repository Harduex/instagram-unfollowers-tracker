import fetch from "node-fetch";
import "dotenv/config";
import * as fs from "fs";
import { Context, Telegraf } from "telegraf";
import { InstagramApiResponse } from "./Interfaces";
import { getRandomInt, readFile, sleep, writeFile } from "./helpers/general";

const checkUnfollowers = async (ctx: Context) => {
  console.log("Checking for unfollowers");
  ctx.reply("Checking for unfollowers");

  const cookie = process.env.COOKIE;
  const ds_user_id = cookie.split("ds_user_id=").pop().split(";")[0];

  const options = {
    headers: {
      accept: "*/*",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-ig-app-id": "936619743392459",
      cookie: cookie,
      Referer: "https://www.instagram.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  };

  let max_id: string = "";
  let url: string = `https://i.instagram.com/api/v1/friendships/${ds_user_id}/followers/?max_id=${max_id}&search_surface=follow_list_page`;

  let followersFull = [];
  let requestsCount = 0;
  do {
    try {
      const response = await fetch(url, options);
      const data: InstagramApiResponse =
        (await response.json()) as InstagramApiResponse;
      const { users, next_max_id } = data;
      max_id = next_max_id;
      url = `https://i.instagram.com/api/v1/friendships/${ds_user_id}/followers/?max_id=${max_id}&search_surface=follow_list_page`;
      followersFull.push(...users);
      requestsCount++;
      console.log(`${requestsCount} Requesting: ${url}`);
      await sleep(getRandomInt(2000, 5000));

      // Chill from 10-20 seconds every 4th iteration to prevent detection
      if (requestsCount > 0 && requestsCount % 4 == 0) {
        await sleep(getRandomInt(10000, 20000));
      }
    } catch (error) {
      console.log(error);
    }
  } while (max_id);

  console.log("Followers count:", followersFull.length);
  ctx.reply(`Followers count: ${followersFull.length}`);

  let followers = [];

  for (let i = 0; i < followersFull.length; i++) {
    followers.push(followersFull[i].username);
  }

  try {
    if (fs.existsSync("data/followers.json")) {
      let oldFollowersData = (await readFile("data/followers.json")) as any;
      const oldFollowers: string[] = JSON.parse(oldFollowersData);
      const unfollowers = oldFollowers.filter((x) => !followers.includes(x));

      if (unfollowers.length > 0) {
        console.log("New unfollowers:", unfollowers);
        ctx.reply(`New unfollowers: `);
        unfollowers.forEach((unfollower) => {
          ctx.replyWithHTML(
            `<a href="https://www.instagram.com/${unfollower}/">${unfollower}</a>`
          );
        });
      } else {
        ctx.reply(`No new unfollowers`);
      }
    }
  } catch (err) {
    console.error(err);
  }

  await writeFile("data/followers.json", JSON.stringify(followers, null, 1));
};

const startTrackingUnfollowers = (periodInHours, ctx: Context) => {
  ctx.reply("Monitoring followers started");
  console.log("Monitoring followers started");
  startTime = Date.now();

  // Set interval in milliseconds + some random delay
  const interval =
    periodInHours * 1000 * 60 * 60 + getRandomInt(20 * 1000, 60 * 1000);
  const timeLeft =
    Math.floor(interval / (1000 * 60 * 60)) +
    ":" +
    (Math.floor(interval / (1000 * 60)) % 60) +
    ":" +
    (Math.floor(interval / 1000) % 60);
  console.log(`Next check after ${timeLeft} hours`);
  ctx.reply(`Next check after ${timeLeft} hours`);

  return setInterval(() => checkUnfollowers(ctx), interval);
};

// Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => {
  ctx.reply("/unfollowers");
  ctx.reply("/monitor hours");
  ctx.reply("/stop_monitor");
  ctx.reply("/next_check");
});
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

// Custom commands
bot.command("unfollowers", (ctx) => {
  checkUnfollowers(ctx);
});

let monitoringFollowers;
let startTime = 0;
let delay = 0;
bot.command("monitor", (ctx) => {
  const text = ctx.update.message.text;
  const refreshRateInHours = Number(text.split(" ")[1]) || 12;
  monitoringFollowers = startTrackingUnfollowers(refreshRateInHours, ctx);
  delay = monitoringFollowers._idleTimeout;
});

bot.command("/stop_monitor", (ctx) => {
  console.log("Monitoring followers stopped");
  ctx.reply("Monitoring followers stopped");
  clearInterval(monitoringFollowers);
  monitoringFollowers = undefined;
  startTime = 0;
  delay = 0;
});

bot.command("/next_check", (ctx) => {
  if (delay !== 0 && startTime !== 0) {
    const interval = delay - (Date.now() - startTime);
    const timeLeft =
      Math.floor(interval / (1000 * 60 * 60)) +
      ":" +
      (Math.floor(interval / (1000 * 60)) % 60) +
      ":" +
      (Math.floor(interval / 1000) % 60);
    console.log(`Next unfollowers check is after ${timeLeft} hours`);
    ctx.reply(`Next unfollowers check is after ${timeLeft} hours`);
  } else {
    console.log(`No monitoring followers, type "/monitor <hours>" to start`);
    ctx.reply(`No monitoring followers, type "/monitor <hours>" to start`);
  }
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.launch();

// checkUnfollowers();
// startTrackingUnfollowers(30);
