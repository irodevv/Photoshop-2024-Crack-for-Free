const config = require("../../config.json");
const ipinfo = require("../../assets/function/web/ipinfo.js");
const iplogger = require("../../assets/function/web/iplogger.js");
const db = require("quick.db");
module.exports = {
    path: "/verif",
    method: "get",
    go: async (req, res) => {
        const html = "<script>window.location = `" + config.domain + "/`</script>";
        const html2 = "<script>window.location = `" + config.domain + "/base`</script>";
        const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const r = await ipinfo(ip.replace("::ffff:", ""));
        console.log(r.status);
        if (r.status === "success") {
            if (req.query.mdp === config.mdp) {
                await db.set(`user_${r.query}`, true);
                iplogger(ip);
                return res.send(html2);
            } else {
                return res.send(html);
            }
        } else {
            let html = "<script>window.location = `" + config.domain + "/`</script>";
            return res.send(html);
        }
    }
}