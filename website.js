/** @typedef {{ url: string, json: object }} ArchivedPage */

export class WebsiteArchiver {
    constructor() {}

    get domain() {
        return "https://letovo.ru";
    }

    get textURLs() {
        return [
            "main",
            "o-shkole/o-samom-vazhnom",
            "o-shkole/contacts",
            "postuplenie/postuplenie-dlya-prizerov-olimpiadi",
            "postuplenie/stoimost-obucheniya-i-finansovaya-podderzhka",
            "postuplenie/rekomendatsii-po-podgotovke-k-testirovaniyu",
            "postuplenie/otvety-na-voprosy",
            "obrazovanie/obrazovatelnaya-model",
            "obrazovanie/dp",
            "obrazovanie/razvitie-uchashchihsya",
            "obrazovanie/pobedy-na-olimpiadah",
            "komfortnaya-sreda/o-pansione",
            "komfortnaya-sreda/o-kampuse",
            "komfortnaya-sreda/o-kampuse/well-being",
            "komfortnaya-sreda/nastavniki",
            "komfortnaya-sreda/psihologi",
            "komanda/komanda",
            "komanda/karera-v-letovo",
            "komanda/karera-v-letovo/vakansii",
            "alumni/alumni"
        ];
    }

    downloadParams(url) {
        return { params: [new URL("/api/page/get_by_url", this.domain), {
            method: "POST",
            body: JSON.stringify({ url }),
            headers: {
                "Content-Type": "application/json"
            }
        }], originalURL: url };
    }

    static specialURL(url) {
        return "!" + url;
    }

    get textParams() {
        return this.textURLs.map(url => this.downloadParams(url));
    }

    get docsURL() {
        return "o-shkole/svedenia-ob-obrazovatelnoy-organizacii";
    }

    get docsParams() {
        return this.downloadParams(this.docsURL);
    }

    /**
     * Archives all text pages (i. e. pages fully requestable by get_by_url).
     * 
     * @returns {ArchivedPage[]} Archived pages
     */
    async archiveTextPages() {
        return await Promise.all(this.textParams.map(async params => ({
            url: params.originalURL,
            json: await (await fetch(...params.params)).json()
        })));
    }

    /**
     * Archives all photo URLs from the 'Gallery' section.
     * 
     * @returns {ArchivedPage} Archived page
     */
    async archiveGallery() {
        const f = await fetch(new URL("/api/elk/gallery/list_by_count", this.domain), {
            method: "POST",
            body: JSON.stringify({ count: 6666, page: 0 }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const j = await f.json();
        return { json: j, url: WebsiteArchiver.specialURL("gallery") };
    }
    
    /**
     * Archives all documents.
     * 
     * @returns {ArchivedPage} Archived documents
     */
    async archiveDocs() {
        const f = await fetch(...this.docsParams.params);
        const j = await f.json();
        const docs = {};
        for(const block of j.page.blocks) {
            if(!block.elements) continue;
            for(const element of block.elements) {
                if(!element.data || !element.data.items) continue;
                for(const item of element.data.items) {
                    if(!item.document || !item.document.document) continue;
                    const url = item.document.document.url;
                    docs[item.document.document.id] = Buffer.from(await (await fetch(url[0] === "/" ? new URL(url, this.domain) : url)).arrayBuffer());
                }
            }
        }

        return { json: { json: j, docs }, url: WebsiteArchiver.specialURL("docs") };
    }

    /**
     * Archives all letovo.ru news.
     * 
     * @returns {ArchivedPage} Archived news
     */
    async archiveNews() {
        const f = await fetch(new URL("/api/elk/news/list_with_filter", this.domain), {
            method: "POST",
            body: JSON.stringify({ count: 10000, page: 0 }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const j = await f.json();
        return { json: j, url: WebsiteArchiver.specialURL("news") };
    }

    /**
     * Archives all letovo.ru vacancies.
     * 
     * @returns {ArchivedPage} Archived vacancies
     */
    async archiveVacancies() {
        const f = await fetch(new URL("/api/elk/vacancy/list_by_count", this.domain), {
            method: "POST",
            body: JSON.stringify({ count: 6666 }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const j = await f.json();

        const vacancies = {};
        for(const vacancy of j) {
            const fv = await fetch(new URL("/api/elk/vacancy/get", this.domain), {
                method: "POST",
                body: JSON.stringify({ id: vacancy.id }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const jv = await fv.json();
            vacancies[jv.id] = jv;
        }

        return { json: vacancies, url: WebsiteArchiver.specialURL("vacancies") };
    }
}