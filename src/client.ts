import Discord, { TextChannel } from 'discord.js'

const client = new Discord.Client(
    {
        intents: [
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES
        ]
    }
);

export async function getGiveawaysChannel(guildId: string) {
    const guild = new Discord.Guild(client, { id: guildId, unavailable: true });
    const channels = await guild.channels.fetch();
    const giveawaysChannel = channels.find(channel => channel.name.toLowerCase() == "giveaways" && channel.type == "GUILD_TEXT") as TextChannel;
    if (!giveawaysChannel) {
        await (guild.channels.cache.find(channel => channel.type == "GUILD_TEXT") as TextChannel).send("You need to setup a giveaways channel");
        return;
    }
    return giveawaysChannel;
}

export default client;