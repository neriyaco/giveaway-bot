import Discord from "discord.js";
import config from "./config.json";
import Database from "./db";
import client from './client';
import express from 'express';

client.on("ready", async () => {
    console.log(`[BOT] Logged in as ${client.user.tag}`);
});

const messageEmbed = new Discord.MessageEmbed({ color: 0x20c200, title: "Level Up" });

Database.connect().then(async () => {

    const { commandHandler } = await import("./commands");
    const { addExp } = await import("./exp");
    const { registerUserToGiveaway, initGiveaways } = await import("./commands/giveaway");

    await initGiveaways();

    client.on("messageCreate", async (message) => {

        if (message.author.bot) return; // Not handling bot messages

        const newUserLevel = await addExp(message.author.id);
        if (newUserLevel) {
            messageEmbed.setDescription(`${message.author.username} is now level ${newUserLevel}!`);
            await message.channel.send({ embeds: [messageEmbed] });
            if (!config.commandGainExp) {
                return;
            }
        }

        if (!message.content.startsWith(config.prefix)) return; // Not a command

        await commandHandler(message);

    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;
        const giveawayId = interaction.customId.replace("giveaway register", "").trim();
        await registerUserToGiveaway(interaction.member as Discord.GuildMember, giveawayId);
        await interaction.update({
            components: [
                new Discord.MessageActionRow(
                    { components: [(interaction.component as Discord.MessageButton).setDisabled(true)] }
                )
            ]
        });
    });

    client.login(config.token);
});

// For heroku
const app = express();
app.use('*', (req, res) => {
    res.sendStatus(404);
});
app.listen(process.env.PORT || 3000);