const
    { PermissionFlagsBits, InteractionType, } = require("discord.js"),
    { sendWebhook, getTimeStamp } = require("../../../utils/all.js"),
    { webhooks } = require("../../../utils/config.json");
// cooldown = require("../../../utils/bot/cooldown.js");
module.exports = async (client, db, bot, interaction) => {
    if (interaction.isCommand()) {
        const cmd = client.cmds.get(interaction.commandName);
        if (cmd) {
            const args = [];
            for (let option of interaction.options.data) {
                if (option.type === client.optionsTypes.SUB_COMMAND) {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value)
                    })
                } else if (option.value) args.push(option.value)
            };

            interaction.member = interaction.guild?.members.cache.get(interaction.user.id) || interaction.user;
            if (!cmd.dm && !interaction.guildId) return interaction.reply({ embeds: [client.embed().setDescription("`Désoler cette commande n'est pas disponible en message privée.`")], ephemeral: true });
            // else if (cmd.userPermissions && !interaction.member.permissions.has(PermissionFlagsBits[toPascalCase(cmd.userPermissions[0])] || [])) return interaction.reply({ embeds: [client.embed().setDescription("`Vous n'avez pas les permissions nécessaire pour éxecuter cette commande.`")], ephemeral: true });
            // else if (cmd.botPermissions && !interaction.guild.members.me.permissions.has(PermissionFlagsBits[toPascalCase(cmd.botPermissions[0])] || [])) return interaction.reply({ embeds: [client.embed().setDescription("`Je n'est pas les permissions nécessaire pour éxecuter cette commande.`")], ephemeral: true });
            // else if (cmd.cooldown && cooldown(interaction, cmd)) return interaction.reply({ embeds: [client.embed().setDescription(`Merci d'attendre \`${Number(cooldown(interaction, cmd).toFixed() + 1) + 1}s\` avant de refaire cette commande.`)], ephemeral: true });
            else {
                sendWebhook(webhooks.logs.request, {
                    username: "Cop Ta Sapp Logs - Cmd",
                    embeds: [
                        {
                            title: "New Cmd 👀",
                            color: 2201331,
                            fields: [
                                {
                                    name: "`👤` User",
                                    value: `${interaction.member}\n\`\`\`Cmd: /${cmd.name}\`\`\``
                                },
                                {
                                    name: "`📆` Date",
                                    value: getTimeStamp()
                                }
                            ]
                        }
                    ]
                })
                cmd.go(client, db, bot, interaction, args)
            };
        } else return interaction.reply({ embeds: [client.embed().setDescription(`${lang.error.list[3]}`)], ephemeral: true });
    }
};

function toPascalCase(string) {
    const words = string?.match(/[a-z]+/gi);
    if (!words) return "";
    return words
        .map((word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
        .join("");
}
