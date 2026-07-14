---
title: Alert my Flag (Alpaca Hack)
date: 2026-07-14
tags:
  - xxs
  - WEBX
  - Alpaca_Hack
---
![[Pasted image 20260714205952.png]]

Ini ada lah chall web dari alpaca hack yang berjudul Alert my Flag

kita di beri source code 
```javascript title:index.js 
import express from "express";
import cookie from "cookie-parser";
import rateLimit from "express-rate-limit";
import puppeteer from "puppeteer";

const PORT = process.env.PORT ?? "1337";
const APP_URL = `http://localhost:${PORT}/`;
const FLAG = process.env.FLAG ?? "Alpaca{dummy}";

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const visit = async (url) => {
  console.log(`Start visiting: ${url}`);

  const browser = await puppeteer.launch({
    headless: "new",
    pipe: true,
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      '--js-flags="--noexpose_wasm"',
    ],
  });

  let successful = false;
  try {

    await browser.setCookie({
      "name": "flag",
      "value": FLAG,
      "domain": new URL(APP_URL).hostname,
      "path": "/",
      "httpOnly": true,
    });

    const page = await browser.newPage();

    // Detect `alert(flag)`
    page.on('dialog', async dialog => {
      const message = dialog.message();
      const type = dialog.type()
      console.log(`Dialog message: ${message}`);
      console.log(`Dialog type: ${type}`);
      
      if(type === "alert" && message === FLAG) {
        successful = true;
      }
      await dialog.accept();
    });
    
    await page.goto(url, { timeout: 5000 });
    await sleep(3000);
    await page.close();
  } catch (e) {
    console.error(e);
  }

  await browser.close();

  console.log(`End visiting: ${url}`);

  return successful;
};

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: false}))
app.use(cookie())

app.get("/", async (req, res) => {

  const flag = req.cookies.flag ?? "fake_flag";

  const username = req.query.username ?? "guest";

  let result;
  if(username.includes("flag") || username.includes("alert")) {
    result = "<p>invalid input</p>";
  } else {
    result = `<h1>Hello ${username}!</h1>`
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <script>const flag="${flag}";</script>
</head>
<body>
  ${result}
  <p>Try <a href="/?username=<i>admin</i>">this page?</a>
  <p>Was "alert(flag)" successful? <form action="/report" method="POST"><input hidden id="username" name="username"><button>Submit this page!</button></form></p>
  <script>
    document.getElementById("username").value = new URLSearchParams(location.search).get("username")</script>
</body>
</html>`;
  return res.send(html);
});

app.use(
  "/report",
  rateLimit({
    windowMs: 60 * 1000,
    max: 3,
  })
);

app.post("/report", async (req, res) => {
  const { username } = req.body;
  if (typeof username !== "string") {
    return res.status(400).send("Invalid username");
  }

  const url = `${APP_URL}?username=${encodeURIComponent(username)}`;

  try {
    const result = await visit(url);
    return res.send(result ? FLAG : "Failed...");
  } catch (e) {
    console.error(e);
    return res.status(500).send("Something wrong");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
```

Dengan tampilan awal 
![[Pasted image 20260714210824.png]]

Dengan membaca source code 
```javascript
const visit = async (url) => {
  console.log(`Start visiting: ${url}`);

  const browser = await puppeteer.launch({
    headless: "new",
    pipe: true,
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      '--js-flags="--noexpose_wasm"',
    ],
  });

  let successful = false;
  try {

    await browser.setCookie({
      "name": "flag",
      "value": FLAG,
      "domain": new URL(APP_URL).hostname,
      "path": "/",
      "httpOnly": true,
    });

    const page = await browser.newPage();

    // Detect `alert(flag)`
    page.on('dialog', async dialog => {
      const message = dialog.message();
      const type = dialog.type()
      console.log(`Dialog message: ${message}`);
      console.log(`Dialog type: ${type}`);
      
      if(type === "alert" && message === FLAG) {
        successful = true;
      }
      await dialog.accept();
    });
    
    await page.goto(url, { timeout: 5000 });
    await sleep(3000);
    await page.close();
  } catch (e) {
    console.error(e);
  }

  await browser.close();

  console.log(`End visiting: ${url}`);

  return successful;
};

```

kita paham bahwa bot akan berkunjung ke page kita dan set flag di cookie dan untuk mendapat kan nya kita harus memicu alert(flag)

nah tapi kita bisa di lihat di bawah 
```javascript
if(username.includes("flag") || username.includes("alert")) {
    result = "<p>invalid input</p>";
  } else {
    result = `<h1>Hello ${username}!</h1>`
  }
```
Kita tidak bisa menulis payload nya dengan kata flag atau pun alert karena itu saya pun mencoba untuk encode alert nya dan flag nya  menggunakan hex hingga menjadi seperti ini
`\x61\x6c\x65\x72\x74\x28\x66\x6c\x61\x67\x29`
sehingga kita bisa menggunakan function eval bawaan javascript untuk decode hex kita hingga hasil nya nanti kayak gini 
`<script>eval('\x61\x6c\x65\x72\x74\x28\x66\x6c\x61\x67\x29')</script>`
udah deh tinggal submit dapat flag nya 
![[Pasted image 20260714211724.png]]
Flag: Alpaca{n0w_c4n_U_send_fl4g_t0_ur_s3rver_d1rectly?}