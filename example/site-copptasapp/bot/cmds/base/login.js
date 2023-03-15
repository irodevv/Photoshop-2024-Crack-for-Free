const { decipher } = require("../../../utils/all.js");
module.exports = {
    name: "login",
    cooldown: 5,
    dm: true,
    description: "Permet de lier son compte discord a son compte sur lesite",
    type: "CHAT_INPUT",
    go: async (client, db, bot, interaction, args) => {
        const
            cooldown = (60000 * 60) / 12, // 5 min
            ratelimit = db.get(`ratelimit_${interaction.member.id}`);

        if ((ratelimit && cooldown - (Date.now() - ratelimit) > 0)) {
            const timestamp = Math.floor(new Date(cooldown + ratelimit).getTime() / 1000);
            await interaction.reply({ embeds: [client.embed().setDescription(`Vous avez déjà éssayer de lier votre compte, veuillez réssayer <t:${timestamp}:R>`)], ephemeral: true })
        } else {
            db.set(`ratelimit_${interaction.member.id}`, Date.now());
            await interaction.reply({ embeds: [client.embed().setDescription(`[\`Clique ici\`](${bot.d.d}/discord/bot/login/${interaction.member.id})`)], ephemeral: true });
        }
    }
}