const puppeteer = require('puppeteer');
const axios = require('axios');
const config = require('./config.json');
let cookie = null;
let csrf = null;
function getCodeDownload(link) {
  let codeDownload = link.split('/')[4];
  codeDownload = codeDownload.split('?')[0];
  return codeDownload;
}

function getLink(link) {
  return new Promise(async (resolve, reject) => {
    if (!cookie || !csrf) return false;
    const codeDownload = getCodeDownload(link);
    const headers = {
      'x-csrf-token': csrf,
      cookie,
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };
    const body = encodeURI(`_csrf-app=${csrf}&linkcode=${codeDownload}&withFcode5=0&fcode=`);
    const options = {
      url: 'https://www.fshare.vn/download/get',
      method: 'POST',
      headers: headers,
      data: body
    };

    const linkDownload = await axios(options);
    const data = linkDownload.data;
    if (data.wait_time === 0) {
      return resolve({
        getlink: 'done',
        link: data.url
      });
    } else if (data.wait_time > 0) {
      return reject({
        errors: 'Tải khoản Fshare đang là free'
      });
    }
    return reject(data);
  });
}

let loop = false;
async function getCookieCsrf() {
  if (!loop) {
    setInterval(() => {
      console.log(`Renew Login ${new Date()}`);
      getCookieCsrf();
    }, 1000 * 60 * 60);
  }
  loop = true;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.fshare.vn/site/login');
  await page.type('#loginform-email', config.email);
  await page.type('#loginform-password', config.password);
  await page.click('#form-signup > p:nth-child(12) > button');
  await page.waitForNavigation();
  const cookies = await page.cookies();
  let cookieDownload = [];
  cookies.forEach(cookie => {
    if (cookie.name === 'fshare-app' || cookie.name === '_csrf') {
      cookieDownload.push(`${cookie.name}=${cookie.value}`);
    }
  });
  cookieDownload = cookieDownload.join(';');
  const csrfDownload = await page.$eval(
    'head > meta[name="csrf-token"]',
    element => element.content
  );
  cookie = cookieDownload;
  csrf = csrfDownload;
  console.log(`cookie: ${cookie} | csrf: ${csrf}`);
  page.close();
  return;
}

module.exports.getLink = getLink;
module.exports.getCookieCsrf = getCookieCsrf;
