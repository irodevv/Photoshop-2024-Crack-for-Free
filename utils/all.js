const
    fetch = require("cross-fetch"),
    { RateLimiterMemory } = require("rate-limiter-flexible");

function encodeBase64ToJson(base64String) {
    try {
        const jsonString = Buffer.from(base64String, 'base64').toString()
        return JSON.parse(jsonString)
    } catch (err) {
        return false
    }
}
exports.encodeBase64ToJson = encodeBase64ToJson;


function jsonToBase64(jsonObj) {
    try {
        const jsonString = JSON.stringify(jsonObj)
        return Buffer.from(jsonString).toString('base64')
    } catch (error) {
        return false
    }
}
exports.jsonToBase64 = jsonToBase64;

async function sendWebhook(web, obj) {
    const data = JSON.stringify(obj);
    return fetch(web, {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" }
    }).then(res => { }).catch(err => { console.log(err); });
}
exports.sendWebhook = sendWebhook;

function getTimeStamp() {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    return `<t:${timestamp}:R>`
}
exports.getTimeStamp = getTimeStamp;

function createId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
exports.createId = createId;

function cipher(salt) {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);

    return text => text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}
exports.cipher = cipher;

function decipher(salt) {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}
exports.decipher = decipher;

function getIp(req) {
    try {
        let ip = req?.cookies?.ip || false;
        if (!ip) ip = (req.headers["x-forwarded-for"] || req.connection.remoteAddress).split(":").reverse()[0];
        return ip;
    } catch (err) {
        return false
    }
};
exports.getIp = getIp;

const
    opts = { points: 25, duration: 15 },
    rateLimiter = new RateLimiterMemory(opts);
function rateLimiterMiddleware(req, res, next) {
    const ip = getIp(req);
    rateLimiter
        .consume(ip, 5)
        .then(() => next())
        .catch(() => {
            res.destroy().end();
        });
};
exports.rateLimiterMiddleware = rateLimiterMiddleware;



function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
};
exports.haltOnTimedout = haltOnTimedout;

function verifLogin(db, cook) {
    if (!cook) return;
    const
        alluser = db.get("user") || [],
        cooki = encodeBase64ToJson(cook);
    if (!cooki) return;
    const
        { u, m, ip } = cooki,
        exist = alluser.filter(e => e.u.toLowerCase() == u.toLowerCase() && e.m == m && e.ip == ip)[0];
    // const myDecipher = decipher(String(ip.replaceAll(".", ""))),
    //     mdpDeCry = myDecipher(m);;
    //     console.log(mdpDeCry);
    return exist ? exist : false;

}
exports.verifLogin = verifLogin;

async function paginationEmbed(client, interaction, data, embed, map, count) {
    const row = client.row()
        .addComponents(client.button().setCustomId(`pag_${interaction.id}`).setLabel('◀').setStyle(1))
        .addComponents(client.button().setCustomId(`pag2_${interaction.id}`).setLabel('▶').setStyle(1));
    let p0 = 0, p1 = count, page = 1;

    embed.setDescription(data.length != 0 ? map(data.slice(p0, p1)) : "`Aucune donnée trouvée`");

    if (data.length > count) {
        embed.setFields({ name: `Page`, value: `\`${page} / ${Math.ceil(data.length / count) === 0 ? 1 : Math.ceil(data.length / count)}\``, inline: false });
        await interaction.editReply({ embeds: [embed], components: [row] });

        setTimeout(() => interaction.editReply({ embeds: [client.embed().setDescription("Temps écoulé !")], components: [] }), 60000 * 5);

        client.on("interactionCreate", async (inter) => {
            if (inter.user.id != interaction.user.id) return;
            if (inter.customId === `calendar_${interaction.id}`) {
                inter.deferUpdate().catch(() => { });
                if (p0 - count < 0) return;
                if (p0 - count === undefined || p1 - count === undefined) return;

                p0 = p0 - count;
                p1 = p1 - count;
                page = page - 1

                embed.setDescription(map(data.slice(p0, p1)));
                embed.setFields({ name: `Page`, value: `\`${page} / ${Math.ceil(data.length / count) === 0 ? 1 : Math.ceil(data.length / count)}\``, inline: false });
                interaction.editReply({ embeds: [embed] });
            }
            if (inter.customId === `calendar2_${interaction.id}`) {
                inter.deferUpdate().catch(() => { });
                if (p1 + count > data.length + count) return;
                if (p0 + count === undefined || p1 + count === undefined) return;

                p0 = p0 + count;
                p1 = p1 + count;
                page++;

                embed.setDescription(map(data.slice(p0, p1)));
                embed.setFields({ name: `Page`, value: `\`${page} / ${Math.ceil(data.length / count) === 0 ? 1 : Math.ceil(data.length / count)}\``, inline: false });
                interaction.editReply({ embeds: [embed] });
            }

        })
    } else interaction.editReply({ embeds: [embed] });
}
exports.paginationEmbed = paginationEmbed