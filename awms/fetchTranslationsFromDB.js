/* eslint-disable strict */
"use strict";

const axios = require('axios')
const fs = require('fs')
const https = require('https')

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
})

const createQueryString = (select) => {
    let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
        + (select.q === "" ? "" : "&q=" + select.q)
        + (select.f === "" ? "" : "&f=" + select.f)
        + (select.g === "" ? "" : "&g=" + select.g)
        + (select.s === "" ? "" : "&s=" + select.s)
        + (select.sk === "" ? "" : "&sk=" + select.sk)
        + (select.l === 0 ? "" : "&l=" + select.l)
        + (select.all === "" ? "" : "&all=" + select.all)
        + "&isCounts=true"
    return queryS
}

const lang = ["EN", "TH"]

const query_language = {
    queryString: "https://localhost:44316/v2/SelectDataMstAPI/",
    t: "Language",
    // q: '[{ "f": "Language", "c":"=", "v": "EN"}]',
    f: "Code,Messages",
    g: "",
    s: "",
    sk: "",
    l: "",
    all: ""
};

lang.forEach((row) => {
    query_language.q = `[{ "f": "Language", "c":"=", "v": "${row}"}]`
    instance.get(createQueryString(query_language) + "&apikey=FREE01").then((res) => {
        if (res.data.counts > 0) {
            fs.writeFileSync(`public/assets/i18n/translations/${row}.json`, JSON.stringify(res.data, null, 2));
        } else {
            console.log("!!! No Data !!!");
        }
    }).catch((err) => {
        console.log(err);
    });
})