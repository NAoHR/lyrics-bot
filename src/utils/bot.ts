import { Context, Telegraf, Markup } from "telegraf";
import { SongHandler,IslyricsOrSearch, ErrorOutput, ListData } from "./songHandler";

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
                return "song not found";
            default:
                return "internal error"
        }
    }
    // user related
    sendStartMessage(ctx: Context){
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
        return ctx.replyWithMarkdown(`
*📙 Usage:*
\`<command> <argument>\`

*Example:*
\t\`/sbsong what is love\`
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
            if(arg === ""){
                return ctx.reply("🙅‍♂️ you didn't specify any song")
            }
            const reqData = await this.songHanlder.requestData(this.songHanlder.parseArg(arg, parseType), parseType, ssType);
            if(typeof reqData === "string"){
                let listOfSong = this.songHanlder.searchSongHandler(reqData);

                return ctx.replyWithMarkdown(`
🔍 found ${listOfSong.length} song(s) based on *${arg}*
result:
                `, {
                    reply_markup : {
                        inline_keyboard : this.parseFoundSong(listOfSong)
                    }
                });
            }

            return ctx.reply(this.errorHandler(reqData));

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
            return ctx.reply("❌ lyrics not found");
        }
        return ctx.reply(this.errorHandler(reqLyric))

    }
}