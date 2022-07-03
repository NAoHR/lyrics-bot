import { Context, Telegraf } from "telegraf";
import { SongHandler,IslyricsOrSearch } from "./songHandler";

export class Bot{
    bot: Telegraf;
    songHanlder: SongHandler;

    constructor(token:string, x_api:string){
        this.bot = new Telegraf(token);
        this.songHanlder = new SongHandler(x_api);
    }

    async songSearch(arg: string, parseType: IslyricsOrSearch,ssType: "lyrics" | "songs" ,ctx: Context) {
        try{
            const reqData = await this.songHanlder.requestData(this.songHanlder.parseArg(arg, parseType), parseType, ssType);
            if(reqData){
                let listOfSong = this.songHanlder.searchSongHandler(reqData, ssType);
                console.log(listOfSong)
                return ctx.reply("work coyy")
            }
            return ctx.reply("service is not working") // need to be fixed

        }catch(e){
            console.log(e);
            return ctx.reply("service is error")
        }
    }
}