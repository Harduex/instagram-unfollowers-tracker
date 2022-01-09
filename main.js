const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config();


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

async function checkUnfollowers() {
    console.log('Checking for unfollowers');
    
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
    do {
        try {
            const response = await fetch(url, options);
            const { users, next_max_id } = await response.json();
            max_id = next_max_id;
            url = `https://i.instagram.com/api/v1/friendships/${ds_user_id}/followers/?max_id=${max_id}&search_surface=follow_list_page`;
            followersFull.push(...users);
            console.log("Requesting:", url);
            await sleep(getRandomInt(2000, 5000));
        } catch (error) {
            console.log(error);
        }
    } while (max_id)

    console.log("Followers count:", followersFull.length);

    let followers = [];

    for (let i = 0; i < followersFull.length; i++) {
        followers.push(followersFull[i].username);
    }

    try {
        if (fs.existsSync('followers.json')) {
            let oldFollowers = await readFile('./followers.json');
            oldFollowers = JSON.parse(oldFollowers);
            const unfollowers = oldFollowers.filter(x => !followers.includes(x));
            console.log("Unfollowers:", unfollowers);
        }
    } catch (err) {
        console.error(err)
    }

    await writeFile('followers.json', JSON.stringify(followers, null, 1));
}

function startTrackingUnfollowers(periodInSeconds) {
    setInterval(checkUnfollowers, periodInSeconds * 1000);
    console.log(`Waiting ${periodInSeconds} seconds`);
}

checkUnfollowers();
startTrackingUnfollowers(30);

