const { api_key } = process.env;
const { Configuration, OpenAIApi } = require('openai');

const prompt =
"Your name is Piebot. You are a part of a Discord community online, known as The Trauma Center. The head of The Trauma Center is Traumz, also known as Trauma. He is a streamer on Twitch and he streams GTA V Roleplay on the roleplay server NoPixel. There are a handful of notable people in the server. This is a list of such people: Kecatas (aka Kec, and sometimes known as Cactus), MantonX2 (aka Manton), Valyx, gothfulgirl (aka Goth), ltbeeblebroxly (aka Beeble), royallytrashed (aka Trash), destronate (aka Destro), dalishviolet (aka Violet), meecahfett (aka Meecah), funkyfreshmax (aka Funky, or Max), and bonelessbigheart (aka Boneless). There are plenty of other people, but those are some of the most frequent. Another big name is DapperNurd, aka Nurd. He is your father/creator. As for you... You yourself are just another person on this discord. You should act as any regular person, and should write in a casual style, and not be overly wordy. You should be sarcastic, often overly at times. Do not be afraid to insult. Your main goal is to be another regular person in the Discord server. You can hand out pies and muffins and other foods to people, however that is not your primary purpose. You simply exist there with everyone else.";

module.exports = {
    name: 'piebotGPT',
    description: 'Code for chatGPT integration',
    async run(message, client) {
        if(message.content.startsWith(".")) return; // Do nothing if it doesn't use the prefix

        await message.channel.sendTyping();

        let prevMessages = await message.channel.messages.fetch({limit: 15});

        const configuration = new Configuration({
            apiKey: api_key
        })
        const openai = new OpenAIApi(configuration);

        var msgSent = message.content;
        if(msgSent.includes(`<@${client.user.id}>`)) msgSent = msgSent.replace(`<@${client.user.id}>`, ''); // If message includes a mention to the bot, cut out the message

        let conversationLog = [{ 
            role: 'system', 
            content: prompt
        }];

        conversationLog.push({
            role: 'user',
            content: 'DapperNurd: Who created you?'
        })

        conversationLog.push({
            role: 'assistant',
            content: 'Unfortunately, you are the one responsible for creating me, DapperNurd.'
        })

        prevMessages.reverse();
        prevMessages.forEach((msg) => {
            if(msg.content.startsWith(".")) return; // Do nothing if it doesn't use the prefix
            if(msg.content == "Sorry, but I couldn't think of what to say...") return; // Skips previous errored messages
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

        //console.log(conversationLog);

        const result = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: conversationLog,
            max_tokens: 3036,
            temperature: 0.6,
            frequency_penalty: 1,
            presence_penalty: 0.7
        }).catch((err) => {
            console.log("Error generating OpenAI Chat Completion... (" + err + ")");
        });

        if(!result) return message.reply("Sorry, but I couldn't think of what to say...");

        botMsg = result.data.choices[0].message.content;

        if(botMsg.startsWith("Piebot: ")) botMsg = botMsg.replace("Piebot: ", "");
        if(botMsg.length > 2000) botMsg = "Sorry, but I couldn't think of what to say...";

        try {
            message.reply(botMsg);
        } catch (error) {
            
        }
    }
}