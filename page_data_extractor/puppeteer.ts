const puppeteer = require('puppeteer-extra');
const puppeteer_vanilla = require('puppeteer');
const stealth_plugin = require("puppeteer-extra-plugin-stealth");

const pagesForExtracting = [
    {
        "speciality": "Інженерія програмного забезпечення (Інноваційний кампус)",
        "speciality_id": "121",
        "url": "https://vstup.edbo.gov.ua/offer/1069038/"
    },
    // {
    //     "speciality": "Комп’ютерні науки",
    //     "speciality_id": "122",
    //     "url": "https://vstup.edbo.gov.ua/offer/1069055/"
    // },
    // {
    //     "speciality": "Комп'ютерні науки. Моделювання, проектування та комп'ютерна графіка",
    //     "speciality_id": "122",
    //     "url": "https://vstup.edbo.gov.ua/offer/1068975/"
    // },
    // {
    //     "speciality": "Комп’ютерні науки та інтелектуальні системи (Інноваційний кампус)",
    //     "speciality_id": "122",
    //     "url": "https://vstup.edbo.gov.ua/offer/1069048/"
    // },
    // {
    //     "speciality": "Сучасне програмування, мобільні пристрої та комп'ютерні ігри (Інноваційний кампус)",
    //     "speciality_id": "123",
    //     "url": "https://vstup.edbo.gov.ua/offer/1069060/"
    // },
    // {
    //     "speciality": "Прикладна комп'ютерна інженерія",
    //     "speciality_id": "123",
    //     "url": "https://vstup.edbo.gov.ua/offer/1069068/"
    // },
    // {
    //     "speciality": "Системний аналіз і управління",
    //     "speciality_id": "124",
    //     "url": "https://vstup.edbo.gov.ua/offer/1069074/"
    // },
    // {
    //     "speciality": "Кібербезпека",
    //     "speciality_id": "125",
    //     "url": "https://vstup.edbo.gov.ua/offer/1069080/"
    // },
    // {
    //     "speciality": "Програмне забезпечення інформаційних систем (Інноваційний кампус)",
    //     "speciality_id": "126",
    //     "url": "https://vstup.edbo.gov.ua/offer/1069087/"
    // }
    // {
    //     "speciality": "Програмна інженерія бакалавр нормативний",
    //     "speciality_id": "121",
    //     "url": "https://vstup.edbo.gov.ua/offer/978077/"
    // },
    // {
    //     "speciality": "Комп`ютерні науки та технології бакалавр нормативний",
    //     "speciality_id": "122",
    //     "url": "https://vstup.edbo.gov.ua/offer/1005181/"
    // }
];

(async () => {
    try {
        await runDataExtracting();
    } catch (error: any) {
        console.error(`Data extraction was aborted. Error: ${error.message}`);
        process.exit(1);
    }
})();

async function runDataExtracting(): Promise<any> {
    puppeteer.use(stealth_plugin())

    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 500,
        defaultViewport: null,
        executablePath: puppeteer_vanilla.executablePath(),
        args: [
            '--start-maximized',
            '--window-size=1920,1080',
            '--no-sandbox'
        ]
    });

    /** VSTUP EDBO **/
    const page = await browser.newPage();

    const data:{}[] = [];
    for (let pageDetails of pagesForExtracting) {
        await page.goto(pageDetails.url, {
            waitUntil: ['domcontentloaded', 'load']
        });


        let loadMore = true;
        while (loadMore) {
            try {
                const loadMoreButton = await page.waitForSelector('button[id="requests-load"]', {timeout: 5000});
                await loadMoreButton.click({delay: 3000});
            } catch (error: any) {
                loadMore = false;
            }
        }



        const extractedData = await page.evaluate(dataExtracting);
        if (Array.isArray(extractedData)) {
            extractedData.forEach(item => {
                item.speciality = pageDetails.speciality;
                item.speciality_id = pageDetails.speciality_id;

                data.push(item);
            });
        }
    }

    /*const csvWriter = require('csv-writer').createObjectCsvWriter({
        path: 'report.csv',
        header: [
            {id: 'speciality_id', title: 'speciality_id'},
            {id: 'speciality', title: 'speciality'},
            {id: 'position', title: 'position'},
            {id: 'id', title: 'id'},
            {id: 'priority', title: 'priority'},
            {id: 'score', title: 'score'},
            {id: 'has_quota', title: 'has_quota'},
            {id: 'rating', title: 'rating'},
            {id: 'type', title: 'type'}
        ]
    });*/

    const csvWriter = require('csv-writer').createObjectCsvWriter({
        path: 'report.csv',
        header: [
            {id: 'speciality_id', title: 'speciality_id'},
            {id: 'speciality', title: 'speciality'},
            {id: 'id', title: 'id'},
            {id: 'priority', title: 'priority'},
            {id: 'score', title: 'score'},
            {id: 'type', title: 'type'},
            {id: 'limit', title: 'limit'}
        ]
    });

    await csvWriter.writeRecords(data);
    console.log('...Done');

    await browser.close();
}

function dataExtracting() {
    enum PRIORITY {
        'Error' = -1,
        'First'= 1,
        'Second',
        'Third',
        'Fourth',
        'Fifth',
        'Contract'
    }

    enum SCORE_METRIC {
        'min',
        'avg',
        'max'
    }

    class Index {
        protected applicants: Applicant[];

        protected governmentLimit: number = 0;
        protected contractLimit: number = 0;

        constructor() {
            this.applicants = this.extract();
        }

        public getGovernmentLimit(): number {
            return this.governmentLimit;
        }

        public getContractLimit(): number {
            return this.contractLimit;
        }

        public getQuotasLimit(): number {
            return Math.round(this.governmentLimit * 0.4);
        }

        public getApplicantsByFilter(priority: PRIORITY | null, hasQuota: boolean | null): Applicant[] {
            return this.getApplicants().filter(applicant => {

                if (priority && hasQuota === null) {
                    if (applicant.priority === priority) {
                        return applicant;
                    }
                } else if (priority === null && hasQuota) {
                    if (applicant.hasQuota === hasQuota) {
                        return applicant;
                    }
                } else if (priority !== null && hasQuota !== null) {
                    if (
                        applicant.priority === priority
                        && applicant.hasQuota === hasQuota
                    ) {
                        return applicant;
                    }
                } else {
                    return applicant;
                }

            });
        }

        public getApplicants(): Applicant[] {
            let applicants = this.applicants;

            applicants.sort(this.sortByScore);

            return applicants;
        }

        public getScoreMetric(applicants: Applicant[], metric: SCORE_METRIC): number {

            if (applicants.length === 0) {
                throw new Error('Applicants must be > 0.');
            }
            let metricValue: number = 0;

            switch (metric) {
                case SCORE_METRIC.min:
                    applicants.sort(this.sortByScore);
                    metricValue = applicants[applicants.length - 1].score;
                    break;
                case SCORE_METRIC.max:
                    applicants.sort(this.sortByScore);
                    metricValue = applicants[0].score;
                    break;
                case SCORE_METRIC.avg:
                    let avgScore: number = 0;
                    applicants.forEach(applicant => {
                        avgScore += applicant.score;
                    });

                    metricValue = avgScore / applicants.length;
                    break;
                default:
                    new Error(`${metric} not found in SCORE_METRIC.`)
            }

            return metricValue;
        }

        public sortByScore(a: Applicant, b: Applicant): number {
            return a.score > b.score ? -1 : 1;
        }

        protected extract(): Applicant[] {

            let idMaxOfferElement = document.getElementsByClassName('offer-max-order');
            if (idMaxOfferElement.length > 0) {
                let textContent = idMaxOfferElement[0].getElementsByTagName('dd')[0].textContent;

                this.governmentLimit = parseInt(textContent ?? '0');
            }

            let idMaxOfferContractElement = document.getElementsByClassName('offer-order-contract');
            if (idMaxOfferContractElement.length > 0) {
                let textContent = idMaxOfferContractElement[0].getElementsByTagName('dd')[0].textContent;

                this.contractLimit = parseInt(textContent ?? '0');
            }

            /**
             * Заявки со статусом "Допущенные"
             */
            const STATUS_ADMITTED: string = 'request-status-6';

            const elements = document.getElementsByClassName(STATUS_ADMITTED);

            const applicants = [];
            for (let i = 0; i < elements.length; i++) {
                let element = elements[i];

                /* Id */
                let id: string = '(not set)';
                let idElement = element.getElementsByClassName('offer-request-fio');
                if (idElement.length > 0) {
                    let textContent = idElement[0].getElementsByTagName('div')[0].textContent;

                    id = textContent ? textContent : '(not set)';
                }

                /* Score */
                let score: number = -1;
                let scoreElement = element.getElementsByClassName('offer-request-kv');
                if (scoreElement.length > 0) {
                    let textContent = scoreElement[0].getElementsByTagName('div')[0].textContent;

                    score = textContent ? parseInt(textContent) : -1;
                }

                /* Priority */
                let priority: PRIORITY = PRIORITY.Error;
                let priorityElement = element.getElementsByClassName('offer-request-priority');
                if (priorityElement.length > 0) {

                    let paidEducation = priorityElement[0].getElementsByClassName('offer-request-contract');
                    let freeEducation = priorityElement[0].getElementsByClassName('offer-request-other');

                    if (paidEducation.length > 0) {
                        priority = PRIORITY.Contract;
                    } else if (freeEducation.length > 0) {
                        let textContent = freeEducation[0].textContent;

                        priority = textContent ? parseInt(textContent) : PRIORITY.Error;
                    }
                }

                /* Quota */
                let quota: boolean = false;
                let quotaElement = element.getElementsByClassName('indicator-q');
                if (quotaElement.length > 0) {
                    quota = true;
                }

                let applicant: Applicant = {
                    id: id,
                    priority: priority,
                    score: score,
                    hasQuota: quota
                }

                if (applicant.score === PRIORITY.Error || applicant.priority < 0) {
                    new Error(`Error in data. Item: ${applicant}.`)
                }

                applicants.push(applicant);
            }

            applicants.sort(this.sortByScore);

            return applicants;
        }
    }

    const extractor = new Index();

    let applicantsFirstPriorityQuotas = extractor.getApplicantsByFilter(PRIORITY.First, true);
    let applicantsFirstPriorityQuotasPass = applicantsFirstPriorityQuotas.slice(0, extractor.getQuotasLimit());
    let applicantsFirstPriorityQuotasNotPass = applicantsFirstPriorityQuotas.slice(extractor.getQuotasLimit());

    let applicantsFirstPriorityWithoutQuotas = extractor.getApplicantsByFilter(PRIORITY.First, false);
    let applicantsOther =  applicantsFirstPriorityWithoutQuotas.concat(applicantsFirstPriorityQuotasNotPass);
    applicantsOther.sort(extractor.sortByScore);


    const reportJson = [];

    applicantsFirstPriorityQuotasPass.forEach((applicant, index) => {
        reportJson.push({
            position: index + 1,
            id: applicant.id,
            priority: applicant.priority,
            score: applicant.score,
            has_quota: applicant.hasQuota,
            rating: 'quotas',
            type: 'government'
        });
    });

    for (let i = 0; i < extractor.getGovernmentLimit() - extractor.getQuotasLimit(); i++) {
        let applicant = applicantsOther[i] ?? undefined;

        if (applicant) {
            reportJson.push({
                position: i + extractor.getQuotasLimit() + 1,
                id: applicant.id,
                priority: applicant.priority,
                score: applicant.score,
                has_quota: applicant.hasQuota,
                rating: 'general',
                type: 'government'
            });
        } else {
            reportJson.push({
                position: i + extractor.getQuotasLimit() + 1,
                id: '',
                priority: '',
                score: '',
                has_quota: '',
                rating: 'free',
                type: 'government'
            });
        }
    }

    let applicantsContract = extractor.getApplicantsByFilter(PRIORITY.Contract, null);
    let reportContractJson = [];
    for (let i = 0; i < extractor.getContractLimit(); i++) {
        let applicant = applicantsContract[i] ?? undefined;

        if (applicant) {
            reportContractJson.push({
                position: i + extractor.getQuotasLimit() + 1,
                id: applicant.id,
                priority: applicant.priority,
                score: applicant.score,
                has_quota: applicant.hasQuota,
                rating: 'general',
                type: 'contract'
            });

        } else {
            reportContractJson.push({
                position: i + extractor.getQuotasLimit() + 1,
                id: '',
                priority: '',
                score: '',
                has_quota: '',
                rating: 'free',
                type: 'contract'
            });
        }
    }

    const result:any = [];
    const applicantsAll = extractor.getApplicants();
    applicantsAll.forEach(applicant => {
        result.push({
            id: applicant.id,
            priority: applicant.priority,
            score: applicant.score,
            type: applicant.priority === 6 ? 'contract' : 'government',
            limit: applicant.priority === 6 ? extractor.getContractLimit() : extractor.getGovernmentLimit() - extractor.getQuotasLimit()
        });
    })

    return result;
}