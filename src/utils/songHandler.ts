import axios from "axios";
import { load,Element } from "cheerio";

export type IslyricsOrSearch = "lyrics" | "search";
export type ListData = Array<Record<string, string>>;

export class SongHandler {
    readonly lyricsURL = "https://www.azlyrics.com/lyrics/";
    readonly searchURL = "https://search.azlyrics.com/search.php?q="
    x_param: string;

    constructor(x_param:string){
        this.x_param = x_param;
    }


    parseArg(arg: string,type: IslyricsOrSearch):string {
        if(type === "lyrics"){
            return arg.split("_").join("/")
        }
        return arg.split(" ").join("+")
    }

    async requestData(parsedArg: string, type: IslyricsOrSearch, searchOption?: "lyrics" | "songs"): Promise<string | false> {
        try{
            const validateRequests = (dataRes:string)=>{
                // to validate if the request has returned html containing no data
                const $ = load(dataRes);
                if($("div.alert-warning").text() == ""){
                    return true
                }
                return false
            }
            let newLink: string;

            if(type == "lyrics"){
                newLink = this.lyricsURL+parsedArg;
            }else{
                newLink = `${this.searchURL}${parsedArg}&w=${searchOption}&p=1&x=${this.x_param}`
            }

            let data = await axios({
                "url" : newLink,
                "method" : "GET",
                "timeout" : 5000, // you can adjust the amount of this time in ms
            });

            if(validateRequests(data.data)){
                return data.data
            }
            return false

        }catch(e){
            console.log(e);
            return false
        }
    }

    searchSongHandler(data: string,searchOption: "lyrics" | "songs"){
        const $ = load(data);
        // console.log(data);
        let parsedHTML = $("table.table-condensed > tbody").children();
        let list: ListData = [];

        parsedHTML.each((i, el: undefined | Element)=>{
            if($(el).children("td").attr("class") != undefined){
                let seperateIt = $(el).children("td").children("a").text().split(" - ");
                let childElement = $(el).children("td").children("a").attr("href");
                console.log(i,`${seperateIt[0].split("\"").join(" ")} - ${searchOption === "lyrics" ? seperateIt[1].split("\n")[0] : seperateIt[1].split("\n")[0]}`)


                if(childElement){
                    let splitChild = childElement.split("/lyrics/")[1];
                    if(splitChild){
                        childElement = childElement.split("/lyrics/")[1].split("/").join("_")
                        list.push({
                            "song" : `${seperateIt[0].split("\"").join(" ")} - ${searchOption === "lyrics" ? seperateIt[1].split("\n")[0] : seperateIt[1].split("\n")[0]}`,
                            "link" : `${childElement}`
                        })
                    }
                }

            };
        });

        return list;
    }

    async getLyrics(parsedLink: string) {
        try{
            const data = await this.requestData(parsedLink, "lyrics") as string;
            console.log("begin")
            const $ = load(data);
            const base = $("div.col-xs-12.col-lg-8.text-center");
            let dataLyrics = base.children("div:not([class])");
            let dataWriter = base.children("div.smt").children("small");
            let panel = base.children("div.panel.album-panel.noprint");
            let dataPanel: Array<string> = []
            panel.each((i,el)=>{
                console.log(i);
                dataPanel.push($(el).text())
            })
            let lyrics =  dataLyrics.text().split("\n")
            const tobeReturned = {
                "Err" : false,
                "status" : "perfectly fetched",
                "message" : "no-log",
                "content" : {
                    "writer" : dataWriter.text().split("Writer(s):")[1],
                    "lyrics" : lyrics.length == 0 ? false : lyrics,
                    "additional" : dataPanel.length == 0 ? "no data to be displayed" : dataPanel
                }
            }
            console.log(tobeReturned)
            return tobeReturned
        }catch(e){
            console.log(e);
            return false
        }
    }
}