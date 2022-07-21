const db = require("quick.db");
const djs = require("discord.js");
const ipinfo = require("../../assets/function/web/ipinfo.js");
const config = require("../../config.json");
module.exports = {
    path: "/bot/panel/:id/:n",
    method: "get",
    go: async (req, res) => {
        const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const r = await ipinfo(ip.replace("::ffff:", ""));
        if (r.status === "success") {
            if (db.has(`user_${ip.replace("::ffff:", "")}`)) {
                const client = new djs.Client({ fetchAllMembers: true });
                const tkn = await db.get(`client_${req.params.id}`);
                if (!tkn) {
                    const html = "<script>alert(`Your session has expired, please log in again!`);window.location = `" + config.domain + "/base`</script>";
                    return res.send(html);
                } else {
                    client.login(tkn).catch(() => {
                        const html = "<script>alert(`Invalid Token !`);window.location = `" + config.domain + "/base`</script>";
                        return res.send(html);
                    });
                    client.on("ready", async () => {
                        res.render(`bot/raid/${req.params.n}.ejs`, {
                            n: client.user.tag,
                            i: client.user.id,
                            a: client.user.displayAvatarURL({ dynamic: true }),
                        });
                        setTimeout(() => {
                            client.destroy()
                        }, 5000);
                    })
                }
            } else { return res.sendFile(`verif.html`, { root: "./views/web" }) }
        } else {
           return res.sendFile(`verif.html`, { root: "./views/web" })
        }
    }
}