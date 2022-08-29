import { InstagramApiResponse } from "../Interfaces";
import {
  readFile,
  writeFile,
  fileExists,
  sleep,
  getRandomInt,
  logger,
} from "../helpers/general";
import { Context } from "telegraf";

export const checkUnfollowers = async (ctx: Context) => {
  logger(`Checking for unfollowers`, ctx);

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

  logger(`Followers count: ${followersFull.length}`, ctx);

  let followers = [];

  for (let i = 0; i < followersFull.length; i++) {
    followers.push(followersFull[i].username);
  }

  try {
    if (fileExists("data/followers.json")) {
      let oldFollowersData = (await readFile("data/followers.json")) as any;
      const oldFollowers: string[] = JSON.parse(oldFollowersData);
      const unfollowers = oldFollowers.filter((x) => !followers.includes(x));

      if (unfollowers.length > 0) {
        logger(`New unfollowers: ${unfollowers}`, ctx);

        unfollowers.forEach((unfollower) => {
          ctx.replyWithHTML(
            `<a href="https://www.instagram.com/${unfollower}/">${unfollower}</a>`
          );
        });
      } else {
        logger(`No new unfollowers`, ctx);
      }
    }
  } catch (err) {
    console.error(err);
  }

  await writeFile("data/followers.json", JSON.stringify(followers, null, 1));
};
