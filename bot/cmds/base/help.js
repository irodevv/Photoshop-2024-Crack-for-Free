module.exports = {
    name: "help",
    cooldown: 5,
    dm: true,
    description: "Retourne toutes les commandes",
    type: "CHAT_INPUT",
    go: async (client, db, bot, interaction, args) => {
        const
            isADMIN = bot.admins.includes(interaction.member.id) ? true : false,
            embed = client.embed(), categories = [], fields = [], category = {
                base: "`👤` Base",
                admin: "`🔰` Admin"
            };

        embed.setTitle(`ALL CMDS${isADMIN ? " (PERM: ADMIN)" : ""}`)
        embed.setThumbnail(client.user.displayAvatarURL());

        client.cmds.forEach(async (command) => {
            if (!categories.includes(command.class)) categories.push(command.class);
        });
        categories.sort().forEach((cat) => {
            const tCommands = client.cmds.filter((cmd) => cmd.class === cat);
            fields.push({
                name: `${category[cat.toLowerCase()]} :`,
                value: tCommands.map((cmd) => "`=> /" + cmd.name + " - " + cmd.description + "`").join(",\n")
            });
        });
        if (fields[0]) embed.addFields(fields);
        else embed.setDescription("`Aucune donnée trouvée`");
        return interaction.reply({ embeds: [embed] });
    }
}