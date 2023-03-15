const Ping = require("../../../utils/bot/ping.js");
module.exports = {
    name: "ping",
    cooldown: 5,
    dm: true,
    description: "Retourne le ping du bot et du site",
    type: "CHAT_INPUT",
    go: async (client, db, bot, interaction, args) => {
        const date = new Date();
        await interaction.reply({ embeds: [client.embed().setDescription("`Chargement...`")] });
        const
            date2 = new Date(),
            embed = client.embed();

        embed.setTitle("Ping");
        embed.setFields(
            { name: `\`🤖\` Bot`, value: `WebSocket: \`${client.ws.ping}ms\`\nAPI: \`${date2 - date}ms\`` },
            { name: `\`🌐\` Site`, value: `\`\`\`Chargement...\`\`\`` },
        );
        interaction.editReply({
            embeds: [embed],
        });

        const
            ping = new Ping({ host: bot.d.h, port: bot.d.p, infinite: false, }),
            data = await ping.go();
        embed.setFields(
            { name: `\`🤖\` Bot`, value: `WebSocket: \`${client.ws.ping}ms\`\nAPI: \`${date2 - date}ms\`` },
            { name: `\`🌐\` Site`, value: `\`\`\`${data.join("\n")}\`\`\`` },
        );
        interaction.editReply({
            embeds: [embed],
        });
    }
}