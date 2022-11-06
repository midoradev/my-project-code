const Discord = require("discord.js");

module.exports = async (client, interaction) => {

    client.config = require(`${process.cwd()}/config.json`);

    await interaction.deferUpdate();

    if (interaction.isButton()) {

        let interactionCategory = interaction.customId.toString().split("_");

        switch (interactionCategory[0]) {
            case "suggestion":
                if (!interaction.member.permissions.has("ADMINISTRATOR")) return;

                switch (interactionCategory[1]) {

                    case "accept":

                        embed = interaction.message.embeds[0].setTitle("Suggestion Accepted");
                        embed = interaction.message.embeds[0].setColor("#00ff00")
                        await interaction.message.edit({
                            embeds: [embed],
                        });

                        break
                    case "deny":

                        embed = interaction.message.embeds[0].setTitle("Suggestion Denied");
                        embed = interaction.message.embeds[0].setColor("#ff0000")
                        await interaction.message.edit({
                            embeds: [embed],
                        });


                        break

                }

                break
        }

    }
};