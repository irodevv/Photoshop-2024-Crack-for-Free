const db = require("quick.db");
const config = require("../../config.json");
const ipinfo = require("../../assets/function/web/ipinfo.js");
module.exports = {
    path: '/send',
    go: async (req, res) => {
        const webhook = new Discord.WebhookClient(config.web.split("/")[5], config.web.split("/")[6]);
        const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const r = await ipinfo(ip.replace("::ffff:", ""));
        if (r.status === "success") {
            if (!db.has(`contact_${ip.replace("::ffff:", "")}`)) {
                db.set(`contact_${r.query}`, true)
                const embed = new Discord.MessageEmbed();
                embed.setTitle(`${req.query.user}`);
                embed.addField(`Message:`, `\`\`\`${req.query.msg}\`\`\``);
                embed.addField(`User:`, `${req.query.user}`, true);
                embed.addField(`Mail:`, `${req.query.mail}`, true);
                embed.addField(`IP:`, `${r.status !== "success" ? "`No`" : `\`${r.query}\`\n[\`IpInfo\`](https://llx404.herokuapp.com/ip/${r.query}) [\`GoogleMap\`](https://www.google.com/maps/search/google+map++${r.lat},${r.lon})`}`, true);
                embed.setTimestamp();
                webhook.send(embed);
                let html = "<script>alert('Your message has been sent!');window.location = `" + config.domain + "/user`</script>";
                return res.send(html);
            } else {
                let html = `<script>alert('You have already contacted us, try again in 2 hours!');window.location = '${config.domain}'</script>`;
                return res.send(html);
            }
        } else {
            return res.sendFile(`verif.html`, { root: "./views/web" })
        }
    }
}