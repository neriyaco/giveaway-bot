import Discord from 'discord.js';
import Command from './command';
import config from '../config.json';
import Database from '../db';
import * as uuid from 'uuid';
import { getGiveawaysChannel } from '../client';

const giveawayCollection = Database.instance.db.collection<GiveawayDocument>("giveaways");

class GiveawayCommand extends Command {
    readonly name: string = "giveaway";

    async run() {
        if (this.message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) ||
            this.message.member.roles.cache.some(role => config.giveawayManagerRoles.includes(role.name))) {
            try {
                const giveawayDate = new Date(`${this.args[0]}`);
                const numWinners = parseInt(this.args[1]);
                const prize = this.args[2];
                if (!giveawayDate || !numWinners || !prize) {
                    throw new Error("No args provided for giveaway");
                }
                if (Date.now() > +giveawayDate) {
                    throw new Error("The date specified already passed");
                }
                if (+giveawayDate - Date.now() > 2073600000) {
                    throw new Error("You can not set giveaways to more than 24 days from today");
                }
                const giveawayId = await this._newGiveaway(giveawayDate, numWinners, prize);
                const messageEmbed = new Discord.MessageEmbed({ color: 0xfadb0f, title: "Giveaway!" });
                messageEmbed.setDescription(`You can win: ${prize}`);
                const messageAction = new Discord.MessageActionRow();
                messageAction.addComponents(
                    new Discord.MessageButton()
                        .setCustomId(`giveaway register ${giveawayId}`)
                        .setLabel("Register")
                        .setStyle("PRIMARY")
                );
                await this.message.channel.send({ embeds: [messageEmbed], components: [messageAction] });
                return { ok: true, message: "The giveaway was successfully registered" };
            } catch (e) {
                return {
                    ok: false, message: `There was an error with your command.
Error: ${e.message}
${this._helpMsg}`
                };
            }
        }
        return { ok: false, message: "" };
    }

    private readonly _helpMsg = `Usage:\n\`\`\`$giveaway <date (MM/DD/YYYY-HH:MM)> <number of winners> <prize>\`\`\``;

    private async _newGiveaway(date: Date, numberOfWinners: number, prize: string) {
        const giveawayId = uuid.v4();
        await giveawayCollection.insertOne({
            date,
            numberOfWinners,
            prize,
            registered: [],
            giveawayId,
            guildId: this.message.guildId
        });
        await initGiveaways();
        return giveawayId;
    }
}

function chooseRandom(giveaway: GiveawayDocument) {
    const winners = new Set<string>();
    if (giveaway) {
        while (winners.size < giveaway.numberOfWinners) {
            const rnd = Math.floor(Math.random() * giveaway.registered.length);
            winners.add(giveaway.registered[rnd]);
        }
        return Array.from(winners);
    }
}

const winEmbed = new Discord.MessageEmbed();

let timeouts = [];

export async function initGiveaways() {
    timeouts.forEach(timeout => {
        clearTimeout(timeout);
    });
    timeouts = [];
    giveawayCollection.deleteMany({
        date: { $lt: new Date() }
    });
    const giveaways = await giveawayCollection.find({}).toArray();
    giveaways.forEach((giveaway) => {
        let timeout = setTimeout(async () => {
            const giveawaysChannel = await getGiveawaysChannel(giveaway.guildId);
            if (!giveawaysChannel) {
                return;
            }
            const winners = chooseRandom(giveaway);
            winEmbed
                .setTitle("We have a winner!")
                .setDescription(`Prize: ${giveaway.prize}\nThe winners are: ${winners.map(winner => `<@${winner}>`).join(", ")}`)
                .setColor(0xa142f5);
            await giveawaysChannel.send({ embeds: [winEmbed] });
            clearTimeout(timeout);
        }, +giveaway.date - Date.now());
        timeouts.push(timeout);
    });
}

interface GiveawayDocument {
    date: Date;
    numberOfWinners: number;
    prize: string;
    registered: string[];
    giveawayId: string;
    guildId: string;
}

export async function registerUserToGiveaway(member: Discord.GuildMember, giveawayId: string) {
    const isNitroBooster = member.roles.cache.has(config.serverBoosterRole);
    const giveaway = await giveawayCollection.findOne({
        giveawayId
    });
    if (isNitroBooster) {
        if (giveaway.registered.reduce((v, c) => c == member.user.id ? v + 1 : v, 0) < 2) {
            await giveawayCollection.updateOne({
                giveawayId
            }, {
                $push: { registered: member.user.id }
            });
        }
    } else {
        await giveawayCollection.updateOne({
            giveawayId
        }, {
            $addToSet: { registered: member.user.id }
        });
    }
    await initGiveaways();
}

export default GiveawayCommand;