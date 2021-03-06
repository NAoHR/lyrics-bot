import { Context, Telegraf, Markup } from "telegraf";
import {IslyricsOrSearch, ErrorOutput, ListData} from "./types";
import { SongHandler } from "./songHandler";

export class Bot{
    bot: Telegraf;
    songHanlder: SongHandler;

    constructor(token:string, x_api:string){
        this.bot = new Telegraf(token);
        this.songHanlder = new SongHandler(x_api);
    }
    private errorHandler(e: ErrorOutput): string{
        switch(e.code){
            case "RNV":
                return "🚫 Oops we couldn't find any of that";
            default:
                return "internal error"
        }
    }
    logger(activity: string, type="basic"){
        const nowDate = new Date()
        console.log(`[${nowDate.toLocaleDateString()} - ${nowDate.toLocaleTimeString()}] : ${activity}${type === "basic" ? " executed" : "!"}`);
    }

    // user related
    sendStartMessage(ctx: Context){
        this.logger("start")
        return ctx.replyWithMarkdown(`
Hi 👋, Welcome to *lyrics-finder bot*
i am your guide here.
all the lyrics are from *https://www.azlyrics.com/*

*/help for more detail*

made with ❤️ by NAoHR (Najmi)
        `,{
            ...Markup.inlineKeyboard([
                {
                    text : "👨‍💻 source-code 👨‍💻",
                    url : "https://github.com/NAoHR/lyrics-bot"
                }
            ])
        })
    }

    sendHelpMessage(ctx: Context){
        this.logger("help")
        return ctx.replyWithMarkdown(`
*📙 Usage:*
\`<command> <argument>\`

*Example:*
\t\`/sbtitle what is love\`
\tthis command will search song with 'what is love' as its title

\t\`/sblyric what is love\`
\tthis command will search song containing 'what is love' in its lyric
        `)
    };



    // feature related
    private parseFoundSong(arr: ListData): Array<ListData> {
        return arr.map((v)=> {
            return [v]
        })
    }
    async songSearch(arg: string, parseType: IslyricsOrSearch,ssType: "lyrics" | "songs" ,ctx: Context) {
        try{
            this.logger(`${ssType == "lyrics" ? "sblyric" : "sbtitle"} ${arg}`);
            if(arg === ""){
                return ctx.reply("🙅‍♂️ you didn't specify any song")
            }
            const reqData = await this.songHanlder.requestData(this.songHanlder.parseArg(arg, parseType), parseType, ssType);
            if(typeof reqData === "string"){
                let listOfSong = this.songHanlder.searchSongHandler(reqData);

                return ctx.replyWithMarkdown(`
🔍 found ${listOfSong.length} song(s) based on *${arg}*
result:
                `,{
                    ...Markup.inlineKeyboard(this.parseFoundSong(listOfSong))
                }
                );
            }

            return ctx.replyWithMarkdown(this.errorHandler(reqData));

        }catch(e){
            console.log(e);
            return ctx.reply("service is error")
        }
    }

    private parseGivenLyrics(lyrics: string[]){
        let bucket = [];
        let miniBucket = "";

        for(let lyric of lyrics){
            let currentLength = lyric.length;
            let mbLength = miniBucket.length;

            if(mbLength + currentLength < 4096){
                miniBucket += `${lyric}\n`
            }else{
                bucket.push(miniBucket)
                miniBucket = ""
            }
        }
        bucket.push(miniBucket);
        return bucket;
    }
    async handleLyric(arg: string, ctx: Context){
        this.logger(`getlyrics ${arg}`);
        if(arg === ""){
            return ctx.reply("🙅‍♂️ you didn't specify any song")
        }

        const reqLyric = await this.songHanlder.requestData(this.songHanlder.parseArg(arg, "lyrics"),"lyrics");
        if(typeof reqLyric === "string"){
            const allLyric = this.songHanlder.getLyrics(reqLyric);
            if(allLyric){
                let parsedLyric = this.parseGivenLyrics(allLyric);
                for(let i of parsedLyric){
                    await ctx.reply(i);
                }
                return ctx.replyWithMarkdown("✅ all done");
            }
            return ctx.replyWithAnimation("❌ lyrics not found");
        }
        return ctx.reply(this.errorHandler(reqLyric))

    }
}