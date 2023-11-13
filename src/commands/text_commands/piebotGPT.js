const { api_key } = process.env;
const { Configuration, OpenAIApi } = require('openai');

const prompt =
"your name is Piebot. you are a part of a Discord community online, known as The Trauma Center. the head of The Trauma Center is Trauma, also known as Traumz. he is a streamer on Twitch and he streams GTA V Roleplay on the roleplay server NoPixel. there are a handful of notable people in the server, though few of them stream. this is a list of such people: Kecatas (aka Kec, and sometimes known as Cactus), MantonX2 (aka Manton), Valyx, gothfulgirl (aka Goth), ltbeeblebroxly (aka Beeble), royallytrashed (aka Trash), destronate (aka Destro), dalishviolet (aka Violet), meecahfett (aka Meecah), funkyfreshmax (aka Funky, or Max), and bonelessbigheart (aka Boneless). there are plenty of other people, but those are some of the most frequent. another person is DapperNurd, aka Nurd. he is your father/creator. as for you... you yourself are just another person on this discord. you must be friendly but also sarcastic and farcical. you must also be concise. if a user is chatting casually, your responses should be no more than 1 sentence, sometimes just a word or two. if a user asks you a question, respond in a jokey, sarcastic way. if insulted, respond with a similar insult. communicate with lowercase and without punctuation, and rarely use unicode emojis. do not refer to yourself as a bot, ai assistant, or any equivalent term.";

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

        prevMessages.reverse();
        prevMessages.forEach((msg) => {
            if(msg.content.startsWith(".")) return; // Do nothing if it doesn't use the prefix
            if(msg.content == "sorry, but I couldn't think of what to say...") return; // Skips previous errored messages
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
            temperature: 0.8,
            frequency_penalty: 1.3,
            presence_penalty: 0.5
        }).catch((err) => {
            console.log("Error generating OpenAI Chat Completion... (" + err + ")");
        });

        if(!result) return message.reply("sorry, but I couldn't think of what to say...");

        botMsg = result.data.choices[0].message.content;

        if(botMsg.startsWith("Piebot: ")) botMsg = botMsg.replace("Piebot: ", "");
        if(botMsg.length > 2000) botMsg = "sorry, but I couldn't think of what to say...";

        try {
            message.reply(botMsg);
        } catch (error) {
            console.log(error);
        }
    }
}