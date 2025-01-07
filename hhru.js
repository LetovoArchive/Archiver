// Original code at https://github.com/Milk-Cool/LtvHH

/** @typedef {{ raw: string, id: string }} Address */
/** @typedef {{ requirement: string, responsibility: string }} Snippet */
/** @typedef {{ name: string }} Schedule */
/** @typedef {{ name: string }} Experience */
/** @typedef {{ name: string }} Employment */
/** @typedef {{ from: number | null, to: number | null, currency: string }} Salary */
/** @typedef {{ id: string, name: string, address: Address, salary: null | Salary, snippet: Snippet, schedule: Schedule, experience: Experience, employment: Employment }} Vacancy */
/** @typedef {{ items: Vacancy[] }} HHResponse */

export class HHArchiver {
    /**
     * Constructs an HHArchiver object.
     * 
     * @param {string} email Your e-mail
     * @param {*} appName App ID
     */
    constructor(email, appName = "LetovoArchive") {
        this.appName = appName;
        this.email = email;
    }

    url = "https://api.hh.ru/vacancies?employer_id=2348579&per_page=100";

    /**
     * Archives all Letovo's hh.ru vacancies.
     * 
     * @returns {HHResponse} hh.ru's response
    */
    async archiveVacancies() {
        const f = await fetch(this.url, {
            "headers": {
                "User-Agent": `${this.appName}/1.0 (${this.email})`
            }
        });
        const j = f.json();
        return j;
    }
}