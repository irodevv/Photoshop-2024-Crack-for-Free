module.exports = async (db) => {
    const
        Client = require("../utils/bot/client.js"),
        client = new Client(),
        handler = require("../utils/bot/handler.js"),
        { bot } = require("../utils/config.json");

    await handler(client, db, bot);
    return client.go(bot.token);

    // client.on("ready", async () => {
    //     const o = client.application;
    //     let a = await o.commands.fetch().catch(() => { })
    //     if (!a) return;
    //     else {
    //         a.forEach(async e => {
    //             await o.commands.delete(e.id).then(() => {
    //                 console.log(e.name);
    //             }).catch(() => { })
    //         });
    //     }

    //     client.guilds.cache.forEach(async o => {
    //         let a = await o.commands.fetch().catch(() => { })
    //         if (!a) return;
    //         else {
    //             a.forEach(async e => {
    //                 await o.commands.delete(e.id).then(() => {
    //                     console.log(e.name);
    //                 }).catch(() => { })
    //             });
    //         }
    //     })
    // })
};
