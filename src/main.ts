import {Bot} from "./utils/bot"
import "dotenv/config";

const botToken = process.env.BOT_TOKEN as string;
const X_TOKEN = process.env.AZLYRICS_X as string;

const bot = new Bot(botToken,X_TOKEN);
const botHandler = bot.bot;

botHandler.start((ctx) => bot.sendStartMessage(ctx))

botHandler.help((ctx) => bot.sendHelpMessage(ctx))

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

botHandler.on("callback_query", async (ctx) => {
    const {data} = ctx.callbackQuery;
    if(typeof data === "string"){

        let splitData = data.split(" ");
        switch(splitData[0]){
            case "getlyrics":
                await bot.handleLyric(splitData[1],ctx);
                break
        }
    }
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