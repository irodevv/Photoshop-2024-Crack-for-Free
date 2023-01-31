const { decipher } = require("../../../utils/all.js");
module.exports = {
    name: "user",
    cooldown: 5,
    dm: true,
    description: "Retourne des informations sur un utilisateur du site",
    type: "CHAT_INPUT",
    options: [
        {
            name: "user",
            description: "Utilisateur pseudo ou id",
            type: "STRING",
            required: true,
        }
    ],
    go: async (client, db, bot, interaction, args) => {
        const
            isADMIN = bot.admins.includes(interaction.member.id) ? true : false,
            obj = { embeds: [client.embed().setDescription("`Chargement...`")] },
            user = args[0],
            alluser = db.get("user") || [],
            exist = alluser.filter(e => e.u.toLowerCase() == user.toLowerCase() || e.id == user)[0];

        if (isADMIN) obj.ephemeral = true;
        await interaction.reply(obj);
        if (!exist) return interaction.editReply({ embeds: [client.embed().setDescription("`Aucun utilisateur trouvée pour: " + user + "`")] });
        else {
            const
                { u, m, ip, c, id } = exist,
                fields = [
                    { name: `\`👤\` Pseudo`, value: `\`${u}\`` },
                    { name: `\`🤖\` ID`, value: `\`${id}\`` },
                    { name: `\`📆\` Creation`, value: c },
                    { name: `\`📨\` Nombre de category`, value: `\`${db.get(`category_${id}`)?.length || 0 }\``},
                    { name: `\`👀\` Discord`, value: `${db.get(`userdiscord_${id}`) ?`<@${db.get(`userdiscord_${id}`).discord}>`:"`Pas lier`" }`},
                ],
                components = [];

            if (isADMIN) {
                fields.push({ name: `\`🔐\` Mdp`, value: `\`${decipher(String(ip.replaceAll(".", "")))(m)} (${m})\`` });
                fields.push({ name: `\`🌐\` Ip`, value: `\`${ip}\`` });

                const row = client.row()
                    .addComponents(client.button().setCustomId(`deleteuser_${interaction.id}`).setLabel('❌ Delete User').setStyle(4));
                components.push(row)
            };
            const embed = client.embed()
                .setTitle(`USER INFO${isADMIN ? " (PERM: ADMIN)" : ""}`)
                .addFields(fields);
            interaction.editReply({ embeds: [embed], components: components })

            if (components.length != 0) {
                client.on("interactionCreate", async (inter) => {
                    if (inter.user.id != interaction.user.id) return;
                    if (inter.customId === `deleteuser_${interaction.id}`) {
                        inter.deferUpdate().catch(() => { });
                        delUser(id)
                        interaction.editReply({ embeds: [client.embed().setDescription("`Utilisateur supprimé !`")], components: [] });
                    }
                })
            }
        }


        function delUser(uid) {
            const allcategory = db.get(`category_${uid}`) || [];
            allcategory.forEach(e => delCat(uid, e.id));
            db.delete(`category_${uid}`);
            const
                alluser = db.get(`user`) || [],
                newData = [];
            alluser.forEach(e => {
                if (e.id == uid) { } else newData.push(e);
            });
            db.set("user", newData)
        }
        function delCat(uid, id) {
            const
                allcategory = db.get(`category_${uid}`) || [],
                newData = [];
            allcategory.forEach(e => {
                if (e.id == id) { } else newData.push(id);
            });
            db.set(`category_${uid}`, newData);
            db.delete(`data_${id}`);
            db.delete(`notif_${id}`);
        }

    }
}