import {Bot} from "./utils/bot"
import "dotenv/config";

const botToken = process.env.BOT_TOKEN as string;
const X_TOKEN = process.env.AZLYRICS_X as string;

const bot = new Bot(botToken,X_TOKEN);
const botHandler = bot.bot;

botHandler.start((ctx) => ctx.reply('Welcome'))

botHandler.help((ctx) => ctx.reply('Send me a sticker'))

botHandler.on('text', async (ctx) => {
    try{
        const command = ctx.message.text.split(" ") as Array<string>;

        switch(command[0].slice(1)){
            case "sbsong":
                await bot.songSearch(command.slice(1).join(" "), 'search', "songs", ctx);
                break
            case "sblyric":
                await bot.songSearch(command.slice(1).join(" "), 'search', "lyrics", ctx);
                break
            default:
                break
        }
    }catch(e) {
        ctx.reply("there is an error occured");
    }

});

botHandler.on("callback_query", (ctx) => {
    console.log(ctx);
    ctx.reply("zamn daniel");
})

botHandler.launch()
    .then(() => {
        console.log("bot running");
    })
    .catch((err) => {
        console.log(err)
    });

// Enable graceful stop
process.once('SIGINT', () => botHandler.stop('SIGINT'))
process.once('SIGTERM', () => botHandler.stop('SIGTERM'))