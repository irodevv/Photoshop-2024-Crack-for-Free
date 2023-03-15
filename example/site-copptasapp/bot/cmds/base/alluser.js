const { paginationEmbed } = require("../../../utils/all.js");
module.exports = {
    name: "alluser",
    cooldown: 5,
    dm: true,
    description: "Retourne tout les utilisateurs du site",
    type: "CHAT_INPUT",
    go: async (client, db, bot, interaction, args) => {
        const
            isADMIN = bot.admins.includes(interaction.member.id) ? true : false,
            obj = { embeds: [client.embed().setDescription("`Chargement...`")] };
        if (isADMIN) obj.ephemeral = true;
        await interaction.reply(obj);

        const
            alluser = db.get("user") || [],
            map = (a) => { return a.map((e, i) => `${i + 1}) **Pseudo:** \`${e.u}\`\n**ID:** \`${e.id}\`\n**Creation:** ${e.c}\n**Discord:** ${db.get(`userdiscord_${e.id}`) ?`<@${db.get(`userdiscord_${e.id}`).discord}>`:"`Pas lier`" }${isADMIN ? `\n**IP:** \`${e.ip}\`` : ""}`).join("\n") },
            embed = client.embed().setTitle(`ALL USER${isADMIN ? " (PERM: ADMIN)" : ""}`);
        paginationEmbed(client, interaction, alluser, embed, map, 5);
    }
}