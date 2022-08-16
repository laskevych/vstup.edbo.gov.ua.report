"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const puppeteer = require('puppeteer-extra');
const puppeteer_vanilla = require('puppeteer');
const stealth_plugin = require("puppeteer-extra-plugin-stealth");
const pagesForExtracting = [
    {
        "speciality": "Інженерія програмного забезпечення (Інноваційний кампус)",
        "speciality_id": "121",
        "url": "https://vstup.edbo.gov.ua/offer/1069038/"
    },
    {
        "speciality": "Комп’ютерні науки",
        "speciality_id": "122",
        "url": "https://vstup.edbo.gov.ua/offer/1069055/"
    },
    {
        "speciality": "Комп'ютерні науки. Моделювання, проектування та комп'ютерна графіка",
        "speciality_id": "122",
        "url": "https://vstup.edbo.gov.ua/offer/1068975/"
    },
    {
        "speciality": "Комп’ютерні науки та інтелектуальні системи (Інноваційний кампус)",
        "speciality_id": "122",
        "url": "https://vstup.edbo.gov.ua/offer/1069048/"
    },
    {
        "speciality": "Сучасне програмування, мобільні пристрої та комп'ютерні ігри (Інноваційний кампус)",
        "speciality_id": "123",
        "url": "https://vstup.edbo.gov.ua/offer/1069060/"
    },
    {
        "speciality": "Прикладна комп'ютерна інженерія",
        "speciality_id": "123",
        "url": "https://vstup.edbo.gov.ua/offer/1069068/"
    },
    {
        "speciality": "Системний аналіз і управління",
        "speciality_id": "124",
        "url": "https://vstup.edbo.gov.ua/offer/1069074/"
    },
    {
        "speciality": "Кібербезпека",
        "speciality_id": "125",
        "url": "https://vstup.edbo.gov.ua/offer/1069080/"
    },
    {
        "speciality": "Програмне забезпечення інформаційних систем (Інноваційний кампус)",
        "speciality_id": "126",
        "url": "https://vstup.edbo.gov.ua/offer/1069087/"
    }
];
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield runDataExtracting();
    }
    catch (error) {
        console.error(`Data extraction was aborted. Error: ${error.message}`);
        process.exit(1);
    }
}))();
function runDataExtracting() {
    return __awaiter(this, void 0, void 0, function* () {
        puppeteer.use(stealth_plugin());
        const browser = yield puppeteer.launch({
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
        const page = yield browser.newPage();
        const data = [];
        for (let pageDetails of pagesForExtracting) {
            yield page.goto(pageDetails.url, {
                waitUntil: ['domcontentloaded', 'load']
            });
            let loadMore = true;
            while (loadMore) {
                try {
                    const loadMoreButton = yield page.waitForSelector('button[id="requests-load"]', { timeout: 5000 });
                    yield loadMoreButton.click({ delay: 3000 });
                }
                catch (error) {
                    loadMore = false;
                }
            }
            const extractedData = yield page.evaluate(dataExtracting);
            if (Array.isArray(extractedData)) {
                extractedData.forEach(item => {
                    item.speciality = pageDetails.speciality;
                    item.speciality_id = pageDetails.speciality_id;
                    data.push(item);
                });
            }
        }
        const csvWriter = require('csv-writer').createObjectCsvWriter({
            path: 'report.csv',
            header: [
                { id: 'speciality_id', title: 'speciality_id' },
                { id: 'speciality', title: 'speciality' },
                { id: 'position', title: 'position' },
                { id: 'id', title: 'id' },
                { id: 'priority', title: 'priority' },
                { id: 'score', title: 'score' },
                { id: 'has_quota', title: 'has_quota' },
                { id: 'rating', title: 'rating' },
                { id: 'type', title: 'type' }
            ]
        });
        yield csvWriter.writeRecords(data);
        console.log('...Done');
        yield browser.close();
    });
}
function dataExtracting() {
    var _a, _b;
    let PRIORITY;
    (function (PRIORITY) {
        PRIORITY[PRIORITY["Error"] = -1] = "Error";
        PRIORITY[PRIORITY["First"] = 1] = "First";
        PRIORITY[PRIORITY["Second"] = 2] = "Second";
        PRIORITY[PRIORITY["Third"] = 3] = "Third";
        PRIORITY[PRIORITY["Fourth"] = 4] = "Fourth";
        PRIORITY[PRIORITY["Fifth"] = 5] = "Fifth";
        PRIORITY[PRIORITY["Contract"] = 6] = "Contract";
    })(PRIORITY || (PRIORITY = {}));
    let SCORE_METRIC;
    (function (SCORE_METRIC) {
        SCORE_METRIC[SCORE_METRIC["min"] = 0] = "min";
        SCORE_METRIC[SCORE_METRIC["avg"] = 1] = "avg";
        SCORE_METRIC[SCORE_METRIC["max"] = 2] = "max";
    })(SCORE_METRIC || (SCORE_METRIC = {}));
    class Index {
        constructor() {
            this.governmentLimit = 0;
            this.contractLimit = 0;
            this.applicants = this.extract();
        }
        getGovernmentLimit() {
            return this.governmentLimit;
        }
        getContractLimit() {
            return this.contractLimit;
        }
        getQuotasLimit() {
            return Math.round(this.governmentLimit * 0.4);
        }
        getApplicantsByFilter(priority, hasQuota) {
            return this.getApplicants().filter(applicant => {
                if (priority && hasQuota === null) {
                    if (applicant.priority === priority) {
                        return applicant;
                    }
                }
                else if (priority === null && hasQuota) {
                    if (applicant.hasQuota === hasQuota) {
                        return applicant;
                    }
                }
                else if (priority !== null && hasQuota !== null) {
                    if (applicant.priority === priority
                        && applicant.hasQuota === hasQuota) {
                        return applicant;
                    }
                }
                else {
                    return applicant;
                }
            });
        }
        getApplicants() {
            let applicants = this.applicants;
            applicants.sort(this.sortByScore);
            return applicants;
        }
        getScoreMetric(applicants, metric) {
            if (applicants.length === 0) {
                throw new Error('Applicants must be > 0.');
            }
            let metricValue = 0;
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
                    let avgScore = 0;
                    applicants.forEach(applicant => {
                        avgScore += applicant.score;
                    });
                    metricValue = avgScore / applicants.length;
                    break;
                default:
                    new Error(`${metric} not found in SCORE_METRIC.`);
            }
            return metricValue;
        }
        sortByScore(a, b) {
            return a.score > b.score ? -1 : 1;
        }
        extract() {
            let idMaxOfferElement = document.getElementsByClassName('offer-max-order');
            if (idMaxOfferElement.length > 0) {
                let textContent = idMaxOfferElement[0].getElementsByTagName('dd')[0].textContent;
                this.governmentLimit = parseInt(textContent !== null && textContent !== void 0 ? textContent : '0');
            }
            let idMaxOfferContractElement = document.getElementsByClassName('offer-order-contract');
            if (idMaxOfferContractElement.length > 0) {
                let textContent = idMaxOfferContractElement[0].getElementsByTagName('dd')[0].textContent;
                this.contractLimit = parseInt(textContent !== null && textContent !== void 0 ? textContent : '0');
            }
            /**
             * Заявки со статусом "Допущенные"
             */
            const STATUS_ADMITTED = 'request-status-6';
            const elements = document.getElementsByClassName(STATUS_ADMITTED);
            const applicants = [];
            for (let i = 0; i < elements.length; i++) {
                let element = elements[i];
                /* Id */
                let id = '(not set)';
                let idElement = element.getElementsByClassName('offer-request-fio');
                if (idElement.length > 0) {
                    let textContent = idElement[0].getElementsByTagName('div')[0].textContent;
                    id = textContent ? textContent : '(not set)';
                }
                /* Score */
                let score = -1;
                let scoreElement = element.getElementsByClassName('offer-request-kv');
                if (scoreElement.length > 0) {
                    let textContent = scoreElement[0].getElementsByTagName('div')[0].textContent;
                    score = textContent ? parseInt(textContent) : -1;
                }
                /* Priority */
                let priority = PRIORITY.Error;
                let priorityElement = element.getElementsByClassName('offer-request-priority');
                if (priorityElement.length > 0) {
                    let paidEducation = priorityElement[0].getElementsByClassName('offer-request-contract');
                    let freeEducation = priorityElement[0].getElementsByClassName('offer-request-other');
                    if (paidEducation.length > 0) {
                        priority = PRIORITY.Contract;
                    }
                    else if (freeEducation.length > 0) {
                        let textContent = freeEducation[0].textContent;
                        priority = textContent ? parseInt(textContent) : PRIORITY.Error;
                    }
                }
                /* Quota */
                let quota = false;
                let quotaElement = element.getElementsByClassName('indicator-q');
                if (quotaElement.length > 0) {
                    quota = true;
                }
                let applicant = {
                    id: id,
                    priority: priority,
                    score: score,
                    hasQuota: quota
                };
                if (applicant.score === PRIORITY.Error || applicant.priority < 0) {
                    new Error(`Error in data. Item: ${applicant}.`);
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
    let applicantsOther = applicantsFirstPriorityWithoutQuotas.concat(applicantsFirstPriorityQuotasNotPass);
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
        let applicant = (_a = applicantsOther[i]) !== null && _a !== void 0 ? _a : undefined;
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
        }
        else {
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
        let applicant = (_b = applicantsContract[i]) !== null && _b !== void 0 ? _b : undefined;
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
        }
        else {
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
    return reportJson.concat(reportContractJson);
}
