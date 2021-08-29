import Discord from 'discord.js';
import config from "../config.json";
import { RunResult } from './command';
import GiveawayCommand from './giveaway';

export async function commandHandler(message: Discord.Message) {
    const command = message.content.split(/\s+/)[0].replace(config.prefix, "");
    let res: RunResult;
    switch (command) {
        case "level":
            break;
        case "giveaway":
            res = await new GiveawayCommand(message).run();
            break;
        default:
            return;
    }
    if (res && res.message) {
        await message.channel.send(res.message);
    }
}
