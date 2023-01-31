const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder } = require("discord.js");
class client extends Client {
    constructor() {
        super({
            fetchAllMembers: true,
            restTimeOffset: 0,
            allowedMentions: {
                parse: ["roles", "users", "everyone"],
                repliedUser: false,
            },
            partials: Object.keys(Partials),
            intents: Object.keys(GatewayIntentBits)
        });

        this.bot = require("../config.json").bot;

        this.autoReconnect = true;


        // this.cooldowns = new Collection();
        this.cmds = new Collection();

        this.commandsType = {
            CHAT_INPUT: 1,
            USER: 2,
            MESSAGE: 3,
        };
        this.optionsTypes = {
            SUB_COMMAND: 1,
            SUB_COMMAND_GROUP: 2,
            STRING: 3,
            INTEGER: 4,
            BOOLEAN: 5,
            USER: 6,
            CHANNEL: 7,
            ROLE: 8,
            MENTIONABLE: 9,
            NUMBER: 10,
            ATTACHMENT: 11,
        };
    };

    async go(token) {
        this.login(token).catch(() => {
            throw new Error(`[B0T] => Token invalide ou manque d'intents`)
        })
    };

    embed() {
        const embed = new EmbedBuilder();
        embed.setColor(this.bot.color);
        embed.setFooter({ text: this.bot.footer });
        embed.setTimestamp();
        return embed
    };

    row() {
        const row = new ActionRowBuilder()
        return row
    };

    menu() {
        const menu = new SelectMenuBuilder();
        return menu
    };

    button() {
        const btn = new ButtonBuilder();
        return btn
    };

    modal() {
        const modal = new ModalBuilder();
        return modal
    };

    textInput() {
        const textInput = new TextInputBuilder();
        return textInput
    };
};

module.exports = client
