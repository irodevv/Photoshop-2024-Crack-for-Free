const { paginationEmbed } = require("../../../utils/all.js");
module.exports = {
    name: "banip",
    cooldown: 5,
    dm: true,
    description: "Donne accès à un panel pour gérer les ip banni du site",
    type: "CHAT_INPUT",
    go: async (client, db, bot, interaction, args) => {
        const isADMIN = bot.admins.includes(interaction.member.id) ? true : false;
        await interaction.reply({ embeds: [client.embed().setDescription("`Chargement...`")], ephemeral: true });
        if (!isADMIN) return interaction.editReply({ embeds: [client.embed().setDescription("`👀...`")] });

        const
            rowbase = client.row()
                .addComponents(client.button().setCustomId(`add_${interaction.id}`).setEmoji('➕').setStyle(4))
                .addComponents(client.button().setCustomId(`list_${interaction.id}`).setEmoji('📃').setStyle(1))
                .addComponents(client.button().setCustomId(`remove_${interaction.id}`).setEmoji('➖').setStyle(3));

        const embed = client.embed()
            .setTitle(`BAN IP`);

        await interaction.editReply({ embeds: [embed], components: [rowbase] });
        client.on("interactionCreate", async (inter) => {
            if (inter.customId === `add_${interaction.id}`) {
                const modal = client.modal()
                    .setCustomId("banipmodal_" + interaction.id)
                    .setTitle("Bannir une ip");
                const ip = client.textInput()
                    .setCustomId("ipsalat_" + interaction.id)
                    .setLabel(`🌐 Ip (noverif)`)
                    .setPlaceholder(`1.1.1.1`)
                    .setStyle(1)
                    .setRequired(true);
                modal.addComponents(client.row().addComponents(ip));
                inter.showModal(modal);
            };
            if (inter.customId === `banipmodal_${interaction.id}`) {
                const ip = inter.fields.getTextInputValue("ipsalat_" + interaction.id);
                db.push(`banip`, ip);
                inter.reply({ embeds: [client.embed().setDescription("`Ip banni !`")], ephemeral: true });
            };

            if (inter.customId === `remove_${interaction.id}`) {
                const data = db.get("banip") || [];
                let menu = [];
                data.forEach(e => menu.push({ label: e, value: e }));
                const
                    row = client.row()
                        .addComponents(client.menu()
                            .setCustomId(`selectip_${interaction.id}`)
                            .setMinValues(1).setMaxValues(1)
                            .setPlaceholder("Fais un choix")
                            .addOptions(menu)),
                    embed = client.embed().setTitle("Select Ip");
                inter.reply({ embeds: [embed], components: [row], ephemeral: true });
            };

            if (inter.customId === `selectip_${interaction.id}`) {
                await inter.deferUpdate({ ephemeral: true });
                const
                    id = inter.values[0],
                    data = db.get("banip") || [],
                    newdata = [];
                data.forEach(e => {
                    if (e == id) { } else newdata.push(e)
                });
                db.set("banip", newdata);
                inter.editReply({ embeds: [client.embed().setDescription("`Ip debanni !`")], components: [] });
            };


            if (inter.customId === `list_${interaction.id}`) {
                // inter.deferUpdate().catch(() => { });
                await inter.reply({ embeds: [client.embed().setDescription("`Chargement...`")], ephemeral: true });
                const
                    data = db.get("banip") || [],
                    map = (a) => { return a.map((e, i) => `${i + 1}) \`${e}\``).join("\n") },
                    embed = client.embed().setTitle(`BANIP LIST`);
                paginationEmbed(client, inter, data, embed, map, 5);
            };
        });


    }
}