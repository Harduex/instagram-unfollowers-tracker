const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config();

const { Telegraf } = require('telegraf');

function sleep(a) {
    console.log(`Waiting ${a} ms`);
    return new Promise(b => {
        setTimeout(b, a)
    })
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readFile(srcPath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(srcPath, 'utf8', function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

function writeFile(savPath, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(savPath, data, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

async function checkUnfollowers(ctx, verbose = false) {

    if (verbose) {
        console.log('Checking for unfollowers');
        ctx.reply('Checking for unfollowers')
    }

    const ds_user_id = process.env.DS_USER_ID;
    const cookie = process.env.COOKIE;

    const options = {
        "headers": {
            "accept": "*/*",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-ig-app-id": "936619743392459",
            "cookie": cookie,
            "Referer": "https://www.instagram.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    }

    let max_id = "";
    let url = `https://i.instagram.com/api/v1/friendships/${ds_user_id}/followers/?max_id=${max_id}&search_surface=follow_list_page`;

    let followersFull = [];
    let requestsCount = 0;
    do {
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            // console.log(data);
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
    } while (max_id)

    if (verbose) {
        console.log("Followers count:", followersFull.length);
        ctx.reply(`Followers count: ${followersFull.length}`);
    }

    let followers = [];

    for (let i = 0; i < followersFull.length; i++) {
        followers.push(followersFull[i].username);
    }

    try {
        if (fs.existsSync('followers.json')) {
            let oldFollowers = await readFile('./followers.json');
            oldFollowers = JSON.parse(oldFollowers);
            const unfollowers = oldFollowers.filter(x => !followers.includes(x));

            if (unfollowers.length > 0) {
                console.log("New unfollowers:", unfollowers);
                ctx.reply(`New unfollowers: `);
                unfollowers.forEach(unfollower => {
                    ctx.replyWithHTML(`<a href="https://www.instagram.com/${unfollower}/">${unfollower}</a>`);
                });
            } else {
                if (verbose) {
                    ctx.reply(`No new unfollowers`);
                }
            }

        }
    } catch (err) {
        console.error(err)
    }

    await writeFile('followers.json', JSON.stringify(followers, null, 1));
}

function startTrackingUnfollowers(periodInSeconds, ctx) {
    ctx.reply('Monitoring followers started')
    console.log(`Waiting ${periodInSeconds} seconds`);
    ctx.reply(`Interval of checking: ${periodInSeconds} seconds`)
    return setInterval(() => checkUnfollowers(ctx), periodInSeconds * 1000);
}

// Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('type /unfollowers'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

// Custom commands
bot.command('unfollowers', (ctx) => {
    checkUnfollowers(ctx, true);
})

let monitoringFollowers;
bot.command('monitor', (ctx) => {
    const text = ctx.update.message.text;
    const refreshRateInSeconds = Number(text.split(' ')[1]);
    console.log(refreshRateInSeconds);
    monitoringFollowers = startTrackingUnfollowers(refreshRateInSeconds, ctx);
})

bot.command('/stop_monitoring', (ctx) => {
    ctx.reply('Monitoring followers stopped')
    clearInterval(monitoringFollowers);
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.launch()

// checkUnfollowers();
// startTrackingUnfollowers(30);