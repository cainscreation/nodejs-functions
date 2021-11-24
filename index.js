const mjAPI = require("mathjax-node");
const puppeteer = require('puppeteer');
const moment = require('moment');



async function htmltopngconverter(htmltext) {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch();
        var FileName = `${moment().format('YYYY_MM_DD_HH_mm_ss')}.png`;
        const page = await browser.newPage();
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.setViewport({
            width: 400,
            height: pageHeight / 10,
        });
        await page.setContent(htmltext);
        await page.screenshot({
            path: FileName
        });
        await browser.close();
        resolve(FileName);
    })
}

async function ocrTohtml(yourMath) {

    return new Promise((resolve, reject) => {
        mjAPI.config({
            MathJax: {
                displayMessages: false,
                displayErrors: false,
                undefinedCharError: false,
                fontURL: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/fonts/HTML-CSS',
            }
        });

        mjAPI.start();
        mjAPI.typeset({
            math: yourMath,
            format: "AsciiMath", // or "inline-TeX", "MathML"
            speakText: true,
            speakText: true,
            html: true, // or svg:true, or html:true
        }, async function (data) {
            if (!data.errors) {

                resolve(data.html);
            } else {
                reject(data.errors);
            }

        });
    })
}

async function ocrtextTopng(str) {
    return new Promise(async (resolve, reject) => {
        var eng = '';
        var math = '';
        var start = false;
        var result = '';
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (start == false && char == "`") {
                //ascii text started
                start = true;
                result += eng;
                eng = "";

            } else if (start == true && char == "`") {
                //ascii text ended
                start = false;
                result = result +await ocrTohtml(math);
                //resultmath=resultmath+math;
                math = "";
            }

            if (start == true && char != "`") {
                math = math + char;
            } else if (start == false && char != "`") {
                eng = eng + char;
            }
        }
        //resolve(result);
        const rest = await htmltopngconverter(result);
        resolve(rest);
    })
    //console.log("eng  " + result);
}

module.exports = {
    ocrTohtml,
    htmltopngconverter,
    ocrtextTopng
};