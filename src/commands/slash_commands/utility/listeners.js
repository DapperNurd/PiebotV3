const { SlashCommandBuilder, ChannelType, userMention } = require('discord.js');
const { GetRandomInt } = require("../../../extra.js");
const axios = require('axios');
const { youtubeAPI } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listener')
        .setDescription('Create a listener for Piebot to listen to and notify for.')
        .addSubcommandGroup(commandGroup => commandGroup
            .setName('youtube')
            .setDescription('Listen for new Youtube videos!')
            .addSubcommand(command => command
                .setName('create')
                .setDescription('Roll a custom die!')
                .addStringOption(option =>
                    option.setName('youtube')
                        .setDescription('The youtube channel ID to listen to for new videos.')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName('discord')
                        .setDescription('The discord channel to send the notification to.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The message to be sent alongside the notifaction.')
                        .setMaxLength(500)
                )
            )
            .addSubcommand(command => command
                .setName('remove')
                .setDescription('Remove an existing listener for a youtube channel.')
                .addStringOption(option =>
                    option.setName('youtube')
                        .setDescription('The youtube channel ID to listen to for new videos.')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName('discord')
                        .setDescription('The discord channel to send the notification to.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
            )
            .addSubcommand(command => command
                .setName('list')
                .setDescription('List all existing listeners for youtube channels you have created.')
            ),
        ),
    async execute(interaction, client, promisePool) {

        if(!interaction.member.roles.cache.has('320264951597891586') && !interaction.member.roles.cache.has('560348438026387457')) return interaction.reply({ content:`You cannot use this command!`, ephemeral: true }); // Does not have Moderator or Nurdiest roles

        const subCommandGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand();
        
        if(subCommandGroup == "youtube") {
            if(subCommand == "create") {
                let [rows, fields] = await promisePool.execute('SELECT * FROM Global.youtube_listeners WHERE created_by = ?', [interaction.user.id]);
                if(rows.length >= 5) {
                    return await interaction.reply({ content: "You can only have up to 5 youtube listeners.", ephemeral: true });
                }

                const youtubeChannelID = interaction.options.getString('youtube');
                const discordChannelID = interaction.options.getChannel('discord').id;
                const sendMessage = interaction.options.getString('message') ?? "";

                const response = await axios
                    .get(`https://www.googleapis.com/youtube/v3/channels?key=${youtubeAPI}&part=contentDetails,snippet&id=${youtubeChannelID}`)
                    .catch((err => { console.log("Error fetching youtube feed: " + err); return; })); // Returns if there is an error
                    
                if(!response || !response.data) { // Returns if there is no response or data
                    return await interaction.reply({ content: "There was an error fetching the youtube channel. Please check the channel ID and try again.", ephemeral: true });
                };

                if( response.data.pageInfo.totalResults <= 0 ) {
                    return await interaction.reply({ content: "This channel ID does not exist or is invalid. Please check your spelling and try again.", ephemeral: true });
                }

                // Check if the channelID already exists for this user
                let [existingRows, existingFields] = await promisePool.execute('SELECT * FROM Global.youtube_listeners WHERE youtube_channel_id = ? AND discord_channel_id = ?', [youtubeChannelID, discordChannelID]);
                if(existingRows.length > 0) {
                    return await interaction.reply({ content: "You already have created this listener.", ephemeral: true });
                }

                // Insert the new listener into the database
                await promisePool
                    .execute('INSERT INTO Global.youtube_listeners (youtube_channel_id, uploads_playlist_id, discord_channel_id, send_message, channel_img, created_by) VALUES (?, ?, ?, ?, ?, ?)', [youtubeChannelID, response.data.items[0].contentDetails.relatedPlaylists.uploads, discordChannelID, sendMessage, response.data.items[0].snippet.thumbnails.high.url, interaction.user.id])
                    .catch(err => { console.error("Error inserting youtube listener: ", err); });
                
                return await interaction.reply({ content: `You have successfully created a youtube listener for channel: https://www.youtube.com/channel/${youtubeChannelID} in <#${discordChannelID}>.`, ephemeral: true });
            }
            else if(subCommand == "remove") {
                const youtubeChannelID = interaction.options.getString('youtube');
                const discordChannelID = interaction.options.getChannel('discord').id;

                // Check if the listener exists for this user
                let [existingRows, existingFields] = await promisePool.execute('SELECT * FROM Global.youtube_listeners WHERE youtube_channel_id = ? AND discord_channel_id = ? AND created_by = ?', [youtubeChannelID, discordChannelID, interaction.user.id]);
                if(existingRows.length === 0) {
                    return await interaction.reply({ content: "You do not have this listener created. Make sure everything is spelled correctly.", ephemeral: true });
                }
                // Remove the listener from the database
                await promisePool
                    .execute('DELETE FROM Global.youtube_listeners WHERE youtube_channel_id = ? AND discord_channel_id = ? AND created_by = ?', [youtubeChannelID, discordChannelID, interaction.user.id])
                    .catch(err => { console.error("Error deleting youtube listener: ", err); });

                return await interaction.reply({ content: `You have successfully removed the youtube listener for channel: https://www.youtube.com/channel/${youtubeChannelID} in <#${discordChannelID}>.`, ephemeral: true });
            }
            else if(subCommand == "list") {
                // List all existing listeners for youtube channels you have created.
                let [rows, fields] = await promisePool.execute('SELECT * FROM Global.youtube_listeners WHERE created_by = ?', [interaction.user.id]);
                
                if(rows.length === 0) {
                    return await interaction.reply({ content: "You have no existing youtube listeners.", ephemeral: true });
                }

                let response = "Your existing youtube listeners:\n";
                rows.forEach(row => {
                    response += `- Channel: https://www.youtube.com/channel/${row.youtube_channel_id} | Discord Channel: <#${row.discord_channel_id}>\n`;
                });

                return await interaction.reply({ content: response, ephemeral: true });
            }
        }
        else {
            return await interaction.reply({ content: "Invalid subcommand group.", ephemeral: true });
        }
    }
}