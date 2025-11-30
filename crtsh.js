/** @typedef {{ common_name: string, issuer_name: string, not_before: string, not_after: string }} ArchivedRecord */
/** @typedef {ArchivedRecord[]} ArchivedRecords */

export class CrtSHArchiver {
    domains = [
        "letovo.ru",
        "letovo.online",
        "letovojunior.ru",
        "letovokids.ru",
        "letovo.school"
    ];
    url = "https://crt.sh/json?q=";

    async archiveDomains() {
        let res = [];
        for(const domain of this.domains) {
            const f = await fetch(this.url + domain);
            const j = await f.json();
            res = res.concat(j);
        }
        return res;
    }
}