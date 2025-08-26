import puppeteer from "puppeteer";

export class WebArchiver {
    /**
     * @param {string[]} allowedHosts Allowed hostst
     */
    constructor(allowedHosts) {
        this.allowedHosts = allowedHosts ?? ["letovo.ru", "letovo.site", "letovo.school", "letovo-schedule.ru"];
    }

    /**
     * Initializes the object.
     */
    async init() {
        this.browser = await puppeteer.launch();
    }

    /**
     * Archives a page
     * 
     * @param {string} url The URL
     * @returns {null | string} MHTML
     */
    async archiveToMHTML(url) {
        const urlParsed = new URL(url);
        if(!this.allowedHosts.includes(
            urlParsed.host.split(".").reverse().slice(0, 2).reverse().join(".")
        )) return null;
        let data = null, page;
        try {
            page = await this.browser.newPage();
            await page.goto(url);
            await page.waitForNetworkIdle();

            const client = await page.createCDPSession();
            ({ data } = await client.send("Page.captureSnapshot", {}));
        } catch(e) {
            console.error(e);
        } finally {
            await page?.close();
            return data;
        }
    }

    /**
     * Deinitializes the object.
     */
    async deinit() {
        await this.browser.close();
    }
};