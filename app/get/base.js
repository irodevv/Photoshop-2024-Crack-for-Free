const db = require("quick.db");
const ipinfo = require("../../assets/function/web/ipinfo.js");
module.exports = {
    path: "/base",
    go: async (req, res) => {
        const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const r = await ipinfo(ip.replace("::ffff:", ""));
        if (r.status === "success") {
            if (db.has(`user_${ip.replace("::ffff:", "")}`)) {
                return res.sendFile("base.html", { root: "./views/web" })
            } else {
                return res.sendFile(`verif.html`, { root: "./views/web" })
            }
        } else {
            return res.sendFile(`verif.html`, { root: "./views/web" })
        }
    }
}