import { search } from "@navetacandra/ddg";

/** @typedef {{ name: string, originalURL: string, contents: Buffer }} Document */

export class DocsArchiver {
    constructor() {
        this.next = "";
        this.results = [];
    }

    /**
     * Searches DuckDuckGo for public documents and returns them as buffers.
     * Should be called repeatedly until no results are found.
     * 
     * @returns {Document[]} Found documents
     */
    async archiveDocs() {
        const searchResults = await search(Object.assign({
            query: "inurl:letovo.ru/storage filetype:pdf"
        }, this.next ? { next: this.next } : {}), "regular");
        if(!searchResults.hasNext) return [];
        const res = await Promise.all(searchResults.results.map(async result => ({
            name: result.title.slice(result.title.indexOf("</span>") + 8),
            originalURL: result.url,
            contents: Buffer.from(await (await fetch(result.url)).arrayBuffer())
        })));
        this.next = searchResults.next;
        this.results.push(...res);
        return res;
    }
}