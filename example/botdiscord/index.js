const
    { Client, Intents, MessageActionRow, MessageEmbed, MessageButton } = require("discord.js"),
    client = new Client({
        intents: Object.keys(Intents.FLAGS),
        restTimeOffset: 0,
        partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"]
    }),
    { token, moniteur } = require("./config"),
    VintedMoniteur = require("vinted-moniteur");


client
    .on("ready", () => {
        console.log(`Bot login on ${client.user.tag}`);
        for (const urlObj of moniteur.urls) {
            const salon = client.channels.cache.get(urlObj?.salon);
            if (salon) {
                const moni = new VintedMoniteur({
                    url: urlObj?.url,
                    interval: moniteur?.interval,
                    debug: moniteur?.debug,
                    // AVEC PROXY
                    // proxy: ["ip", "ip:port", "username:password"]
                    // ou
                    // proxy: "./proxy.txt"
                });
                moni.on("error", (err) => console.log(err));
                moni.on("item", (item) => {
                    console.log(item, salon.id);
                    try {
                        const
                            row = new MessageActionRow()
                                .addComponents(new MessageButton().setEmoji('➕').setLabel("Plus d'info").setURL(item.url.info).setStyle("LINK"))
                                .addComponents(new MessageButton().setEmoji('💬').setLabel("Envoyer un message").setURL(item.url.sendmsg).setStyle("LINK"))
                                .addComponents(new MessageButton().setEmoji('💸').setLabel("Acheter").setURL(item.url.buy).setStyle("LINK")),
                            embed = new MessageEmbed()
                                .setAuthor({ name: item.vendeur.name, iconURL: item.vendeur.pp, url: item.vendeur.url })
                                .setTitle(item.title)
                                .setURL(item.url.info)
                                .setImage(item.pp)
                                .setFooter({ text: "✌ By https://githb.com/zougataga" })
                                .setColor(item.color)
                                .addFields(
                                    { name: '`💸` Prix', value: `\`${item.prix}\``, inline: true },
                                    { name: '`🏷️` Marque', value: `\`${item.marque}\``, inline: true },
                                    { name: '`📏` Taille', value: `\`${item.taille}\``, inline: true },
                                    // { name: 'Stats', value: `Favori: ${item.stats.favori}\nVue: \`${item.stats.vue}\``, inline: true },
                                    { name: '`📆` Date du post', value: `<t:${item.timestamp}:R>`, inline: true },
                                );
                        salon.send({
                            embeds: [embed],
                            components: [row]
                        });
                    } catch (error) {
                        console.log(error);
                    }
                })
            }
        }


    })
    .login(token)   
