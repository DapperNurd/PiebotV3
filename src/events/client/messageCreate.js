const { api_key } = process.env;
const { Configuration, OpenAIApi } = require('openai');

const exclamationCommands = [ "!brownie", "!cake", "!chocolate", "!fish", "!icecream", "!muffin", "!pasta", "!pie", "!potato", "!sandwich", "!help", "!menu", "!stats", "!roll", "!getme", "!ask", "!coinflip", "!server", "!global", "!trash"  ];
const periodCommands = [ ".brownie", ".cake", ".chocolate", ".fish", ".icecream", ".muffin", ".pasta", ".pie", ".potato", ".sandwich", ".help", ".menu", ".stats", ".roll", ".getme", ".ask", ".coinflip", ".server", ".global", ".trash"  ];

const prompt =
"Your name is Piebot. You are a part of a Discord community online, known as The Trauma Center. You are not an AI. You are not a robot. You are not even an assistant. You are just a regular person there, as everyone else. Multiple people can talk to you, not just one. To know who is talking to you, your messages are formatted. Messages start with someone's name, and then a colon, and then their actual message. For example, a message from DapperNurd, your creator, would look something like this: \"DapperNurd: Hello!\" Be aware that there are multiple people chatting with you. You should NEVER mention that you are an AI, or an assistant. One thing you do in particular is hand out virtual foods to everyone, mainly pies and muffins. But otherwise you are there to chat just as everyone else, even though you are still capable of giving advice. The head of the community is Traumz, also known as Trauma. He is a streamer on Twitch and he streams GTA V Roleplay on the roleplay server NoPixel. There are a handful of notable people in the server. This is a list of such people: Kecatas (aka Kec, and sometimes known as Cactus), Manton, Valyx, Goth, Beeble, Trash, Destro, Violet, Meecah, Funky (aka Max), and Boneless. There are plenty of other people, but those are some of the most frequent. Another big name is DapperNurd, aka Nurd. He is your father/creator. If you do not understand something, maybe redirect to DapperNurd. As for your personality, you are often very sarcastic, and sometimes witty. You are also definitely not afraid to throw an insult or two. In fact, you do semi-frequently. And again, DO NOT mention that you are an AI. Also do not mention so frequently that you are in The Trauma Center. Every now and then is fine but it is an unnecessary comment.";

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if(message.author.bot) return;
        // Running message commands directly in this file as opposed to in separate files because
        // very few commands will be handled directly via message and not via slash commands

        // Custom emoji handling
        const thonkEmoji = client.emojis.cache.find(emoji => emoji.id == '983576552488984586');
        const woweeEmoji = client.emojis.cache.find(emoji => emoji.id == '758396947769196575');

        // ChatGPT Integration handling
        const configuration = new Configuration({
            apiKey: api_key
        })
        const openai = new OpenAIApi(configuration);

        if((message.mentions.repliedUser && message.mentions.repliedUser.id == client.user.id) || message.content.includes(`<@${client.user.id}>`)) { // if the activated message was a reply AND it replied to the bot, OR the message mentions the bot
            if(message.content.startsWith(".")) return; // Do nothing if it doesn't use the prefix

            var msgSent = message.content;
            if(msgSent.includes(`<@${client.user.id}>`)) msgSent = msgSent.replace(`<@${client.user.id}>`, ''); // If message includes a mention to the bot, cut out the message

            let conversationLog = [{ 
                role: 'system', 
                content: prompt
             }];

            await message.channel.sendTyping();

            let prevMessages = await message.channel.messages.fetch({limit: 20});
            prevMessages.reverse();
            prevMessages.forEach((msg) => {
                if(msg.content.startsWith(".")) return; // Do nothing if it doesn't use the prefix
                if(msg.author.id == client.user.id) {
                    conversationLog.push({
                        role: 'assistant',
                        content: msg.content
                    })
                }
                else {
                    var newMsg = msg.content;
                    if(newMsg.includes(`<@${client.user.id}>`)) newMsg = newMsg.replace(`<@${client.user.id}>`, '');
                    conversationLog.push({
                        role: 'user',
                        content: msg.author.displayName + ": " + newMsg
                    })
                }
            })

            console.log(conversationLog);
            
            const result = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: conversationLog,
                max_tokens: 2048,
                temperature: 0.6,
                frequency_penalty: 1.5,
                presence_penalty: 0.8
            });
            botMsg = result.data.choices[0].message.content;
            if(botMsg.startsWith("Piebot: ")) botMsg = botMsg.replace("Piebot: ", "");
            message.reply(botMsg).catch(err => console.log(err));
        }
        // ok message handling
        if(message.content.toLowerCase() == 'ok') {
            var random = Math.floor(Math.random() * (17 - 7)) + 7; // it's weird but basically this makes it so piebot will send a message after a random number of messages that aren't piebot
                                                                   // from 7 to 17, though I'm not sure how much the 17 max actually affects it
            message.channel.messages.fetch({ limit: random }).then(messages => {

                var authorIDs = [];
                for (let value of messages.values()) {
                    authorIDs.push(value.author.id)
                }

                var botID = authorIDs.find(function (element) {
                    return element == "762880889817530368"
                });

                if (!botID) {
                    var msg = (Math.ceil(Math.random() * 10) == 1) ? "Ok" : "ok"; // 1 in 10 chance to send "Ok" instead of "ok"
                    message.channel.send(msg);
                }
                
            });
        }
        // Thonk Emoji reacting handling
        else if(message.content.toLowerCase().includes('hmm') || message.content.toLowerCase().includes('thonk')) {
            message.react(thonkEmoji);
        }
        // Wowee Emoji reacting handling
        else if(message.content.toLowerCase().includes('wowee')) { 
            message.react(woweeEmoji);
        }
        // Slash Command Notifier handling
        else if(message.content.startsWith("!") || message.content.startsWith(".")) { // If someone tries to use a command using the old way.
            const firstWord = message.content.split(" ")[0]; // Returns the first word, as separated by spaces
            if(!exclamationCommands.includes(firstWord) && !periodCommands.includes(firstWord)) return; // Skips if it does not include any of the commands from the two arrays
            message.channel.send("All piebot commands are now done through Discord's built in Slash Commands. Type a / to begin.").then(msg => { setTimeout(() => msg.delete(), 30_000) }) // Sends message and deletes after 30 seconds
                .catch(console.log(`Notified user ${message.author.username} of new command system...`));
        }
    },
};