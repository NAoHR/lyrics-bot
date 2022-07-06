export type IslyricsOrSearch = "lyrics" | "search";
export type ListData = Array<Record<"text" | "callback_data", string>>;
export interface ErrorOutput {
    "code" : string
}