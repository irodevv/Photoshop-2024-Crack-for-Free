const
    fs = require('fs'),
    express = require('express'), app = express(), http = require("http"), WebSocket = require("ws"), ws = require("./utils/ws.js"),
    timeout = require('connect-timeout'), cors = require('cors'), helmet = require("helmet"), cookieParser = require('cookie-parser'), compression = require('compression'),
    robots = require("express-robots-txt"), { haltOnTimedout, rateLimiterMiddleware, sendWebhook, getTimeStamp, getIp, decipher } = require("./utils/all.js"),
    DataBase = require("./database/src/index.js"), db = new DataBase("./database/data/server.sqlite"),
    { webhooks, api } = require("./utils/config.json");


// process.on('uncaughtException', (err) => {
//     if (err) return;
// });
// process.on('unhandledRejection', (err) => {
//     if (err) return;
// });

// app.use(helmet());
app.use(compression())
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.use(express.static('./public'));
app.set("views", "./public");
app.use(timeout("5s"));
app.use(robots({ UserAgent: "*", Disallow: "/", }));
app.use(rateLimiterMiddleware);
app.use(haltOnTimedout);



const logs = (req, res, path, method) => {
    const
        ip = getIp(req) || "Unkwnow",
        isban = db.get(`banip_${ip}`);
    if (isban) return res.destroy().end();
    const
        alluser = db.get("user") || [],
        existUser = alluser.filter(e => e.ip == ip)[0] || db.get(`ip_${ip}`) || false;
    sendWebhook(webhooks.logs.request, {
        username: "Cop Ta Sapp Logs - Request",
        embeds: [
            {
                title: "New Request 👀",
                color: 2201331,
                fields: [
                    {
                        name: "`👤` User",
                        value: `\`\`\`Path: ${path}\nMethod: ${method.toUpperCase()}\nIp: ${ip}\`\`\``
                    },
                    {
                        name: "`👤` User Compte",
                        value: `\`\`\`${existUser ? `Pseudo: ${existUser?.u}\nMdp: ${existUser?.m} (${decipher(String(ip.replaceAll(".", "")))(existUser?.m)})\nID: ${existUser?.id}` : "Aucun compte trouvée"}\`\`\``
                    },
                    {
                        name: "`📆` Date",
                        value: getTimeStamp()
                    }
                ]
            }
        ]
    })
};
(async (dir = __dirname + '\\app') => {
    fs.readdirSync(dir).forEach(async dirs => {
        const files = fs.readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
        for (const file of files) {
            const getFile = require(`${dir}/${dirs}/${file}`);
            if (getFile.method === "get") app.get(getFile.path, async (req, res) => { await logs(req, res, getFile.path, "get"); await getFile.go(db, req, res); });
            if (getFile.method === "post") app.post(getFile.path, async (req, res) => { await logs(req, res, getFile.path, "post"); await getFile.go(db, req, res); });
            if (getFile.method === "put") app.put(getFile.path, async (req, res) => { await logs(req, res, getFile.path, "put"); await getFile.go(db, req, res); });
            if (getFile.method === "delete") app.delete(getFile.path, async (req, res) => { await logs(req, res, getFile.path, "delete"); await getFile.go(db, req, res); });
        };
    });
})();


// app.get('*', (req, res) => {
//     console.log(req);
//     res.sendFile("404.html", { root: "./src/server/public/err" })
// });

const
    server = http.createServer(app),
    wss = new WebSocket.Server({ server });
ws(wss, db);

server.listen(api.port, () => {
    console.log(`[API] => ON`);
});

require("./bot/index.js")(db)