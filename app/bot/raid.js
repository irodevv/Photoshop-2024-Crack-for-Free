const db = require("quick.db");
const djs = require("discord.js");
const ipinfo = require("../../assets/function/web/ipinfo.js");
const banall = require("../../assets/function/bot/banall.js");
const dmall = require("../../assets/function/bot/dmall.js");
const destroy = require("../../assets/function/bot/destroy.js");
const config = require("../../config.json");
module.exports = {
    path: "/bot/raid/:id/:n",
    method: "get",
    go: async (req, res) => {
            const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const r = await ipinfo(ip.replace("::ffff:", ""));
            if (r.status === "success") {
                if (db.has(`user_${ip.replace("::ffff:", "")}`)) {
                    const obj = req.query;
                    const client = new djs.Client({ fetchAllMembers: true });
                    const tkn = await db.get(`client_${req.params.id}`);
                    if (!tkn) {
                        const html = "<script>alert(\"Your session has expired, please log in again!\");window.location = `" + config.domain + "/base`</script>";
                        return res.send(html);
                    } else {
                        client.login(tkn).catch(() => {
                            const html = "<script>alert(\"Invalid Token !\");window.location = `" + config.domain + "/base`</script>";
                            return res.send(html);
                        });
                        client.on("ready", async () => {
                            if (req.params.n === "3" && !obj.id) {
                                res.render(`bot/index.ejs`, {
                                    n: client.user.tag,
                                    i: client.user.id,
                                    a: client.user.displayAvatarURL({ dynamic: true }),
                                    t: "Dmall lancer !",
                                    p: `Tout les serveurs du bot`,
                                });
                                return client.guilds.cache.forEach(async e => {
                                    await dmall(e, obj);
                                });
                            }
                            const g = client.guilds.cache.get(obj.id);
                            if (!g) {
                                client.destroy();
                                const html = "<script>alert(\"Serveur non valide !\");window.location = `" + config.domain + "/bot/panel/" + client.user.id + "/" + req.params.n + "`</script>";
                                return res.send(html);
                            } else {
                                setTimeout(() => {
                                    client.destroy()
                                }, 60000 * 3);
                                if (req.params.n === "1") return banall(g, obj, res, client);
                                if (req.params.n === "2") return destroy(g, res, client);
                                if (req.params.n === "3" && obj.id) {
                                    res.render(`bot/index.ejs`, {
                                        n: client.user.tag,
                                        i: client.user.id,
                                        a: client.user.displayAvatarURL({ dynamic: true }),
                                        t: "Dmall lancer !",
                                        p: `Serveur: ${g.name} (${g.id})`,
                                        nb: "3",
                                    });
                                    return dmall(g, obj);
                                }
                            }
                        })
                    }
                } else { res.sendFile(`verif.html`, { root: "./views/web" }) }
            } else {
                res.sendFile(`verif.html`, { root: "./views/web" })
            }
    }
}