// LLX API :=)
const PORT = process.env.PORT || 8080;
process.on("unhandledRejassetsion", (a) => { if (a.message) return; });

const express = require("express");
const app = express();
const cors = require('cors');
const db = require('quick.db');
const config = require("./config.json");
const { readdirSync } = require('fs');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/assets'));

const loadApp = (dir = "./app/") => {
    readdirSync(dir).forEach(dirs => {
        const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
        for (const file of commands) {
            const getFile = require(`${dir}/${dirs}/${file}`);
            if (getFile.method === "get") {
                app.get(getFile.path, async (req, res) => await getFile.go(req, res))
            }
            if (getFile.method === "post") {
                app.post(getFile.path, async (req, res) => await getFile.go(req, res))
            }
            console.log(`=> [${new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getUTCSeconds()}] - app charger {${getFile.path}} [${dirs}]`)
        };
    });
};
loadApp()

app.all('*', (req, res) => res.sendFile("404.html", { root: "./views/web" }));
app.listen(PORT, () => {
    console.log(`=> [${new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getUTCSeconds()}] - API ON`);
    config.wlip.forEach(ip => { db.set(`user_${ip}`, true) });
})
