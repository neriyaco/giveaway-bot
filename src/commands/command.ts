import Discord from 'discord.js';
import config from '../config.json';

abstract class Command implements ICommand {
    constructor(public readonly message: Discord.Message) {
        this.user = message.author.id;
        this.name = message.content.replace(config.prefix, "").split(/\s+/)[0];
        this.args = message.content.replace(config.prefix + this.name, "").split(/\s+/).filter(Boolean).map(v => v.trim());
    }

    readonly user: string;
    readonly name: string;
    readonly args: any[] = [];

    abstract run(): Provider<RunResult>;

}

export type Provider<T> = T | Promise<T>
export type RunResult = { ok: boolean, message: string | Discord.MessagePayload | Discord.MessageOptions };

export default Command;