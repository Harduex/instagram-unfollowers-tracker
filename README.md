# instagram-unfollowers-tracker
Node.js telegram bor for tracking instagram unfollowers

## .env

### In chrome
```
COOKIE=
```
- go to instagram.com
- log in
- click F12
- go to "Application" tab
- extend "cookies" menu intem on the left
- click on the intem inside
- search for "sessionid" cookie and copy it's value 

### In chrome: 
```
SESSION_ID=
```
- go to instagram.com
- log in
- click F12
- go to "Network" tab
- clear results
- go to your profile
- refresh page
- scroll to top in new results
- click on first result
- on the right window, click "Headers"
- scroll to find header named "cookie"
- right click it and "copy value"