"use strict";
var _a, _b;
var PRIORITY;
(function (PRIORITY) {
    PRIORITY[PRIORITY["Error"] = -1] = "Error";
    PRIORITY[PRIORITY["First"] = 1] = "First";
    PRIORITY[PRIORITY["Second"] = 2] = "Second";
    PRIORITY[PRIORITY["Third"] = 3] = "Third";
    PRIORITY[PRIORITY["Fourth"] = 4] = "Fourth";
    PRIORITY[PRIORITY["Fifth"] = 5] = "Fifth";
    PRIORITY[PRIORITY["Contract"] = 6] = "Contract";
})(PRIORITY || (PRIORITY = {}));
var SCORE_METRIC;
(function (SCORE_METRIC) {
    SCORE_METRIC[SCORE_METRIC["min"] = 0] = "min";
    SCORE_METRIC[SCORE_METRIC["avg"] = 1] = "avg";
    SCORE_METRIC[SCORE_METRIC["max"] = 2] = "max";
})(SCORE_METRIC || (SCORE_METRIC = {}));
class Extractor {
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
        /**
         * Лимиты
         */
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
const extractor = new Extractor();
/* Report */
console.log(`🚀️ Priority`);
console.log(`   1️⃣ Priority: ${extractor.getApplicantsByFilter(PRIORITY.First, null).length} requests.`);
console.log(`   2️⃣ Priority: ${extractor.getApplicantsByFilter(PRIORITY.Second, null).length} requests.`);
console.log(`   3️⃣ Priority: ${extractor.getApplicantsByFilter(PRIORITY.Third, null).length} requests.`);
console.log(`   4️⃣ Priority: ${extractor.getApplicantsByFilter(PRIORITY.Fourth, null).length} requests.`);
console.log(`   5️⃣ Priority: ${extractor.getApplicantsByFilter(PRIORITY.Fifth, null).length} requests.`);
console.log(`   💵 Contract: ${extractor.getApplicantsByFilter(PRIORITY.Contract, null).length} requests.`);
console.log(`   ⛔️ Error: ${extractor.getApplicantsByFilter(PRIORITY.Error, null).length} requests.`);
console.log('\n');
console.log(`👋 Quota: ${extractor.getApplicantsByFilter(null, true).length} requests of limit ${extractor.getQuotasLimit()}`);
console.log(`\n`);
console.log(`1️⃣ First priority score report`);
let applicantsFirstPriority = extractor.getApplicantsByFilter(PRIORITY.First, null);
console.log(`    MAX: ${extractor.getScoreMetric(applicantsFirstPriority, SCORE_METRIC.max)}`);
console.log(`    AVG: ${extractor.getScoreMetric(applicantsFirstPriority, SCORE_METRIC.avg)}`);
console.log(`    MIN: ${extractor.getScoreMetric(applicantsFirstPriority, SCORE_METRIC.min)}`);
console.log(`\n`);
console.log(`💵 Contract score report`);
let applicantsContract = extractor.getApplicantsByFilter(PRIORITY.Contract, null);
console.log(`    MAX: ${extractor.getScoreMetric(applicantsContract, SCORE_METRIC.max)}`);
console.log(`    AVG: ${extractor.getScoreMetric(applicantsContract, SCORE_METRIC.avg)}`);
console.log(`    MIN: ${extractor.getScoreMetric(applicantsContract, SCORE_METRIC.min)}`);
console.log(`\n`);
console.log(`👑 Forecasted rating`);
console.log(`\n`);
let applicantsFirstPriorityQuotas = extractor.getApplicantsByFilter(PRIORITY.First, true);
let applicantsFirstPriorityQuotasPass = applicantsFirstPriorityQuotas.slice(0, extractor.getQuotasLimit());
let applicantsFirstPriorityQuotasNotPass = applicantsFirstPriorityQuotas.slice(extractor.getQuotasLimit());
let applicantsFirstPriorityWithoutQuotas = extractor.getApplicantsByFilter(PRIORITY.First, false);
let applicantsOther = applicantsFirstPriorityWithoutQuotas.concat(applicantsFirstPriorityQuotasNotPass);
applicantsOther.sort(extractor.sortByScore);
applicantsFirstPriorityQuotasPass.forEach((applicant, index) => {
    console.log(`${index + 1}. ID: ${applicant.id} || ${applicant.score} ${applicant.hasQuota ? '|| 🎫' : ''}`);
});
for (let i = 0; i < extractor.getGovernmentLimit() - extractor.getQuotasLimit(); i++) {
    let applicant = (_a = applicantsOther[i]) !== null && _a !== void 0 ? _a : undefined;
    if (applicant) {
        console.log(`${i + extractor.getQuotasLimit() + 1}. ID: ${applicant.id} || ${applicant.score} ${applicant.hasQuota ? '|| 🎫' : ''}`);
    }
    else {
        console.log(`${i + extractor.getQuotasLimit() + 1}. Free place ✅`);
    }
}
console.log(`\n`);
console.log(`💵 Forecasted rating list [contract]`);
console.log(`\n`);
for (let i = 0; i < extractor.getContractLimit(); i++) {
    let applicant = (_b = applicantsContract[i]) !== null && _b !== void 0 ? _b : undefined;
    if (applicant) {
        console.log(`${i + 1}. ID: ${applicant.id} || ${applicant.score}`);
    }
    else {
        console.log(`${i + 1}. Free place ✅`);
    }
}
