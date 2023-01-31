
const
    { readdirSync } = require("fs"),
    appRoot = require('app-root-path').path;
const go = async (client, db, bot) => {
    client.rest.on('rateLimited', (info) => console.log(`[BOT] => Rate Limited:` + info));

    let count = 0;
    const dir = `${appRoot}\\bot\\events`;
    readdirSync(dir).forEach(dirs => {
        const events = readdirSync(`${dir}\\${dirs}\\`).filter(files => files.endsWith(".js"));
        for (const event of events) {
            const evt = require(`${dir}\\${dirs}\\${event}`);
            const evtName = event.split(".")[0];
            client.on(evtName, evt.bind(null, client, db, bot));
            count++
        }
    });

    try {
        let allCommands = [];
        const dir = `${appRoot}\\bot\\cmds`;
        readdirSync(dir).forEach(dirs => {
            const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
            for (const file of commands) {
                const cmd = require(`${dir}/${dirs}/${file}`);
                cmd.class = dirs;
                // cmd.description = desc;

                if (!cmd.name) {
                    console.log(`[BOT] => Chargement impossible {${dir}/${dirs}/${file}}`)
                    continue;
                } else {
                    switch (cmd.type) {
                        case "CHAT_INPUT": { cmd.type = client.commandsType.CHAT_INPUT } break;
                        case "MESSAGE": { cmd.type = client.commandsType.MESSAGE } break;
                        case "USER": { cmd.type = client.commandsType.USER } break;
                        default: break;
                    }
                    if (cmd.options) {
                        cmd.options.forEach((option) => {
                            // option.description = desc;
                            switch (option.type) {
                                case "STRING": { option.type = client.optionsTypes.STRING } break;
                                case "NUMBER": { option.type = client.optionsTypes.NUMBER } break;
                                case "INTEGER": { option.type = client.optionsTypes.INTEGER } break;
                                case "BOOLEAN": { option.type = client.optionsTypes.BOOLEAN } break;
                                case "USER": { option.type = client.optionsTypes.USER } break;
                                case "ROLE": { option.type = client.optionsTypes.ROLE } break;
                                case "CHANNEL": { option.type = client.optionsTypes.CHANNEL } break;
                                case "MENTIONABLE": { option.type = client.optionsTypes.MENTIONABLE } break;
                                case "ATTACHMENT": { option.type = client.optionsTypes.ATTACHMENT } break;
                                case "SUB_COMMAND": { option.type = client.optionsTypes.SUB_COMMAND } break;
                                case "SUB_COMMAND_GROUP": { option.type = client.optionsTypes.SUB_COMMAND_GROUP } break;
                                default: break;
                            }
                        })
                    };
                    client.cmds.set(cmd.name, cmd);
                    allCommands.push(cmd)
                }
            }
        });

        await client.on("ready", async () => {
            await client.application.commands.set(allCommands);
            console.log(`[B0T] => ${client.cmds.size} Slash Command${client.cmds.size <= 1 ? "" : "s"} ont été chargé !`);
        })
    } catch (e) {
        throw new Error(`[BOT] => ${e.message}`)
    }
};

module.exports = go