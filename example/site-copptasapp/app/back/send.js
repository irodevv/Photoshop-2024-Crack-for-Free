const { webhooks } = require("../../utils/config.json"),
    {
        sendWebhook,
        getTimeStamp,
    } = require("../../utils/all.js");
module.exports = {
    path: "/send",
    method: "post",
    go: async (db, req, res) => {
        const
            { p, e, o, m, ip } = req.body,
            cooldown = (60000 * 60) * 2, // 2 heures
            ratelimit = db.get(`ratelimit_${ip}`);

        if (ip && (ratelimit && cooldown - (Date.now() - ratelimit) > 0)) res.send("2");
        else {
            sendWebhook(webhooks.contact, {
                username: "Cop Ta Sapp - Contact",
                embeds: [
                    {
                        title: "New Message 👀",
                        description: `**Object: \`${o}\`**\n\`\`\`${m}\`\`\``,
                        color: 2201331,
                        fields: [
                            {
                                name: "`👤` User",
                                value: `\`\`\`Pseudo: ${p}\nEmail: ${e}\nIp: ${ip}\`\`\``
                            },
                            {
                                name: "`📆` Date",
                                value: getTimeStamp()
                            }
                        ]
                    }
                ]
            });
            db.set(`ratelimit_${ip}`, Date.now());
            res.send("1")
        }
    }
}