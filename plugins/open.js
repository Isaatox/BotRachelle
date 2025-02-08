const utils = require("../src/utils");
const threads = require("../src/data/threads");
const { getOrFetchChannel } = require("../src/utils");

module.exports = async ({ bot, knex, config, commands }) => {
    const guild = await bot.guilds.get("829469307518844950")
    await guild.fetchAllMembers()

    commands.addInboxServerCommand("open", "[text$]", async (msg, args, thread) => {
        try {
            if (guild) {
                try {
                    let foundUser = null;

                    guild.members.forEach((member) => {
                        try {
                            if (member.username.toLowerCase().includes(args.text) || member.nick !== null && (member.nick.toLowerCase().includes(args.text))) {
                                foundUser = member;
                            }
                        } catch (error) {
                            console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                        }
                    });

                    if (!foundUser) {
                        console.log(`Utilisateur non trouvé : ${args.text}`);
                        utils.postSystemMessageWithFallback(msg.channel, thread, "User not found!");
                        return;
                    }

                    if (foundUser.user.bot) {
                        utils.postSystemMessageWithFallback(msg.channel, thread, "Can't create a thread for a bot");
                        return;
                    }

                    const existingThread = await threads.findOpenThreadByUserId(foundUser.user.id);
                    if (existingThread) {
                        utils.postSystemMessageWithFallback(msg.channel, thread, `Cannot create a new thread; there is another open thread with this user: <#${existingThread.channel_id}>`);
                        return;
                    }

                    const createdThread = await threads.createNewThreadForUser(foundUser, {
                        quiet: true,
                        ignoreRequirements: true,
                        ignoreHooks: true,
                        source: "command",
                    });

                    createdThread.postSystemMessage(`Thread was opened by ${msg.author.username}#${msg.author.discriminator}`);

                    const channel = await getOrFetchChannel(bot, msg.channel.id);
                    channel.createMessage(`Thread opened: <#${createdThread.channel_id}>`);
                } catch (error) {
                    console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                }
            } else {
                console.error('Serveur introuvable.');
            }
        } catch (error) {
            console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
        }
    }, { aliases: ["opn"], allowSuspended: true });
}