/*
 * @Author: Antoine YANG 
 * @Date: 2019-11-15 21:47:38 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-26 00:39:17
 */

const express = require('express');
const app = express();
const fs = require("fs");
const process = require('child_process');


app.get("/", (req, res) => {
    res.send({
        success: true
    });
});

app.get("/video/:url", (req, res) => {
    url = req.params["url"];
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
    process.exec("python ../scripts/requestForDanmaku.py " + url, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            res.send(null);
        } else {
            console.log(stdout);
            fs.readFile("../scripts/cache/danmaku_av" + url + ".bdm", { encoding: 'UTF-8' }, (err, data) => {
                if (err) {
                    console.error(err);
                    res.send(null);
                    return;
                }
                res.send({
                    data: data
                });
            });
        }
    });
});


const server = app.listen(2369, () => {
    const addr = server.address().address;
    const host = addr === "::" ? "127.0.0.1" : addr;
    const port = server.address().port;
    console.log("Back-end server opened at http://" + host + ":" + port);
});
