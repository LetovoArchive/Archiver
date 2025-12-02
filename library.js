import Parser from "rss-parser";

/** @typedef {{ title: string, identifier: string, link: string }} ArchivedItem */
/** @typedef {ArchivedItem[]} ArchivedItems */

const BRANCHES = ["LET", "LETJR"];
const getURL = (branch, offset) => `https://library.letovo.ru/cgi-bin/koha/opac-search.pl?&limit=branch%3A${branch}&format=rss&sort_by=title_az&offset=${offset}`;
export class LibraryArchiver {
    /**
     * Initializes a LibraryArchiver.
     * @param {string} username Letovo username
     * @param {string} password Letovo password
     */
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    /**
     * Archives all items in the Letovo library.
     * @returns {Promise<ArchivedItems>} All items
     */
    async archiveLibrary() {
        const f1 = await fetch("https://library.letovo.ru");
        const cookie = f1.headers.getSetCookie().find(x => x.startsWith("CGISESSID=")).split(";")[0];
        const f2 = await fetch("https://library.letovo.ru/cgi-bin/koha/opac-main.pl", {
            method: "POST",
            body: new URLSearchParams({
                koha_login_context: "opac",
                userid: this.username,
                password: this.password
            }).toString(),
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                cookie
            }
        });

        const parser = new Parser({
            customFields: {
                item: ["title", "dc:identifier", "link"]
            },
            headers: {
                cookie
            }
        });

        /** @type {ArchivedItems} */
        const items = [];
        for(const branch of BRANCHES) {
            let offset = 0;
            while(true) {
                const feed = await parser.parseURL(getURL(branch, offset));
                if(feed.items.length === 0) break;
                for(const item of feed.items) {
                    items.push({ title: item.title.trim(), identifier: item["dc:identifier"], link: item.link });
                }
                offset += feed.items.length;
            }
        }
        return items.sort((a, b) => ("" + a.title).localeCompare(b.title));
    }
}