const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const chalk = require('chalk');
const { piebotColor } = require('../../../extra.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Set a reminder for yourself!')
        .addSubcommandGroup(commandGroup => commandGroup
            .setName('set')
            .setDescription('Set a reminder!')
            .addSubcommand((command) => command
                .setName('from-now')
                .setDescription('Set the reminder to go off in a specified amount of time from now.')
                .addStringOption(option =>
                    option.setName('reminder')
                        .setDescription('What do you want to be reminded of?')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('How many minutes from now?')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(59)
                )
                .addIntegerOption(option =>
                    option.setName('hours')
                        .setDescription('How many hours from now?')
                        .setMinValue(1)
                        .setMaxValue(23)
                )
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('How many days from now?')
                        .setMinValue(1)
                        .setMaxValue(31)
                )
            )
            // .addSubcommand((command) => command // new Date(year, monthIndex, day, hours, minutes)... THIS DOES NOT APPLY TO LOCAL TIME ZONES WITHOUT A LARGE FIX NEEDED
            //     .setName('time-date')
            //     .setDescription('Specify a date and time for the reminder.')
            //     .addStringOption(option =>
            //         option.setName('reminder')
            //             .setDescription('What do you want to be reminded of?')
            //             .setRequired(true)
            //     )
            //     .addIntegerOption(option =>
            //         option.setName('year')
            //             .setDescription('How many minutes from now?')
            //             .setRequired(true)
            //             .setMinValue(0)
            //             .setMaxValue(59)
            //     )
            //     .addIntegerOption(option =>
            //         option.setName('month')
            //             .setDescription('How many hours from now?')
            //             .setMinValue(1)
            //             .setMaxValue(23)
            //     )
            //     .addIntegerOption(option =>
            //         option.setName('day')
            //             .setDescription('How many days from now?')
            //             .setMinValue(1)
            //             .setMaxValue(31)
            //     )
            //     .addIntegerOption(option =>
            //         option.setName('hour')
            //             .setDescription('How many hours from now?')
            //             .setMinValue(1)
            //             .setMaxValue(23)
            //     )
            //     .addIntegerOption(option =>
            //         option.setName('minute')
            //             .setDescription('How many days from now?')
            //             .setMinValue(1)
            //             .setMaxValue(31)
            //     )
            // )
        )
        .addSubcommand(command => command
            .setName('list')
            .setDescription('View current reminders!')
        ),
    async execute(interaction, client, promisePool) {
            
        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        if(interaction.options.getSubcommand() == 'list') {

            const namePossesive = (interaction.user.displayName.endsWith('s')) ? interaction.user.displayName+ "'" : interaction.user.displayName + "'s" // Proper spelling for when a user's displayName ends with an s... (Kecatas' instead of Kecatas's)

            const remindersEmbed = new EmbedBuilder()
                .setColor(piebotColor)
                .setAuthor({
                    iconURL: client.user.displayAvatarURL(),
                    name: `${client.user.displayName} Reminders`
                })
                .setTitle(`${namePossesive} Active Reminders`)
                .setTimestamp()
                .setFooter({
                    iconURL: author.displayAvatarURL(),
                    text: `PiebotV3 by ${author.username}`
                });

            let [rows, fields] = await promisePool.execute(`SELECT * FROM Global.reminders where userID = '${interaction.user.id}'`);

            if(rows.length <= 0) remindersEmbed.setDescription('You do not have any active reminders...'); // If there are no user rows in the Discord.banned_user table
            else {
                rows.forEach(async reminder => { remindersEmbed.addFields([ { name: reminder.reminder, value: `<t:${Math.floor(reminder.time/1000)}:F> (<t:${Math.floor(reminder.time/1000)}:R>)` } ]); });
            }

            return await interaction.reply({
                embeds: [remindersEmbed],
                ephemeral: true
            });
        }

        // Button building
        const cancelButton = new ButtonBuilder().setCustomId('x').setLabel('Cancel Reminder').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(cancelButton);

        // Input parameter fetching
        const reminder = interaction.options.getString("reminder");
        const minutes = interaction.options.getInteger("minutes") ?? 0;
        const hours = interaction.options.getInteger("hours") ?? 0;
        const days = interaction.options.getInteger("days") ?? 0;

        // Time formatting by input
        let time = Date.now() + (minutes * 60_000) + (hours * 3_600_000) + (days * 86_400_000 ); // Multiplying to get the right values for each type... Condensed the multiplication to reduce amount of times to use multiply operation

        // Database handling
        promisePool.execute(`INSERT INTO Global.reminders (userID, userName, reminder, time) VALUES ('${interaction.user.id}', '${interaction.user.displayName}', '${reminder}', '${time}')`);

        // Embed building for confirmation message
        const embed = new EmbedBuilder()
            .setColor(piebotColor)
            .setTitle(`I will remind you "${reminder}" on <t:${Math.floor(time/1000)}:F> (<t:${Math.floor(time/1000)}:R>)`)
            .setDescription("***[NOTE]** Cancel Button only available for 10 minutes after reminder creation...*")
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Reminders`
            })
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        // Message in console for myself
        console.log(chalk.hex("#ae34eb")(`[Bot Reminders]: ${interaction.user.username} made a reminder: "${reminder}"`));

        // Sending the confirmation message
        const confirmMsg = await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

        // Collection handling
        const collector = confirmMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600_000 }); // Creating the collector for the buttons
        collector.on('collect', async i => { // Collector on collect function
            if(i.customId == 'x') { // On cancel button

                const cancelEmbed = new EmbedBuilder() // Builds the new embed for the cancelled msg
                    .setColor(piebotColor)
                    .setDescription(`Successfully cancelled reminder "${reminder}"`)
                    .setAuthor({
                        iconURL: client.user.displayAvatarURL(),
                        name: `${client.user.displayName} Reminders`
                    })
                    .setTimestamp()
                    .setFooter({
                        iconURL: author.displayAvatarURL(),
                        text: `PiebotV3 by ${author.username}`
                    });

                await promisePool.execute(`DELETE FROM Global.reminders WHERE reminder = '${reminder.reminder}'`);

                collector.stop();
                await confirmMsg.edit({
                    embeds: [cancelEmbed],
                    components: []
                });
            }
            else {
                console.log("ERROR: Code missing for button on remind command!");
            }
        });
 
        collector.on('end', () => { // Collector on end function
            confirmMsg.edit({
                embeds: [embed],
                components: []
            });
        });
    }
}