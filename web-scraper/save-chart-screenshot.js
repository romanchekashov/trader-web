const puppeteer = require("puppeteer");
const http = require("http");
const moment = require("moment");
const fs = require("fs");

const URL_API = "http://localhost:3001/api/v1/";
const URL_UI = "http://localhost:3000/";
const UPLOAD_PATH = "C:/ideaWorkspace/trader/build/images/";

function getPromise(secId) {
    return new Promise((resolve, reject) => {
        http.get(URL_API + "securities/" + secId, (resp) => {
            let data = "";
            // A chunk of data has been recieved.
            resp.on("data", (chunk) => {
                data += chunk;
            });
            // The whole response has been received. Print out the result.
            resp.on("end", () => {
                resolve(JSON.parse(data));
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

// async function to make http request
async function makeSynchronousRequest(secId) {
    try {
        let http_promise = getPromise(secId);
        let response_body = await http_promise;

        // holds response from server that is passed when Promise is resolved
        return response_body;
    } catch (error) {
        // Promise rejected
        console.log(error);
    }
}

async function getPic() {
    const secId = process.argv[2];
    if (!fs.existsSync(UPLOAD_PATH))
        throw new Error(UPLOAD_PATH + " doesn't exists");
    if (!secId) throw new Error("SecId isn't provided");

    // const resp = await makeSynchronousRequest(secId);
    // const fileName = resp.shortName.replace(" ", "") + "_" + resp.secCode + "_" +  moment().format("DD-MM-YYYY_HH-mm") + '_id'+ secId + '.png'
    // console.log(fileName)
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL_UI + "trading-charts/" + secId);
    await page.setViewport({ width: 1920, height: 1300 });
    await page.waitForTimeout(6000);
    await page.screenshot({
        path: UPLOAD_PATH + "trading-charts-" + secId + ".png",
    });

    await browser.close();
}

getPic();
