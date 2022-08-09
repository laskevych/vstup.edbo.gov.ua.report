interface Applicant {
    id: string,
    priority: number,
    score: number,
    hasQuota: boolean
}

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

const QUOTAS_LIMIT = 52;
const TOTAL_LIMIT = 130;
const CONTRACT_LIMIT = 20;

class Index {
    protected applicants: Applicant[];

    constructor() {
        this.applicants = this.extract();
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

console.log(`👋 Quota: ${extractor.getApplicantsByFilter(null, true).length} requests of limit ${QUOTAS_LIMIT}`);
console.log(`\n`);

console.log(`1️⃣ First priority score report`);
let applicantsFirstPriority = extractor.getApplicantsByFilter(PRIORITY.First, null);
console.log(`    MAX: ${extractor.getScoreMetric(
    applicantsFirstPriority, 
    SCORE_METRIC.max 
)}`);

console.log(`    AVG: ${extractor.getScoreMetric(
    applicantsFirstPriority,
    SCORE_METRIC.avg
)}`);

console.log(`    MIN: ${extractor.getScoreMetric(
    applicantsFirstPriority,
    SCORE_METRIC.min
)}`);
console.log(`\n`);

console.log(`💵 Contract score report`);
let applicantsContract = extractor.getApplicantsByFilter(PRIORITY.Contract, null);
console.log(`    MAX: ${extractor.getScoreMetric(
    applicantsContract,
    SCORE_METRIC.max
)}`);

console.log(`    AVG: ${extractor.getScoreMetric(
    applicantsContract,
    SCORE_METRIC.avg
)}`);

console.log(`    MIN: ${extractor.getScoreMetric(
    applicantsContract,
    SCORE_METRIC.min
)}`);
console.log(`\n`);

console.log(`👑 Forecasted rating`);
console.log(`\n`);

let applicantsFirstPriorityQuotas = extractor.getApplicantsByFilter(PRIORITY.First, true);
let applicantsFirstPriorityQuotasPass = applicantsFirstPriorityQuotas.slice(0, QUOTAS_LIMIT);
let applicantsFirstPriorityQuotasNotPass = applicantsFirstPriorityQuotas.slice(QUOTAS_LIMIT + 1);

let applicantsFirstPriorityWithoutQuotas = extractor.getApplicantsByFilter(PRIORITY.First, false);
let applicantsOther =  applicantsFirstPriorityWithoutQuotas.concat(applicantsFirstPriorityQuotasNotPass);
applicantsOther.sort(extractor.sortByScore);


const dataJson = [];

applicantsFirstPriorityQuotasPass.forEach((applicant, index) => {
    console.log(`${index + 1}. ID: ${applicant.id} || ${applicant.score} ${applicant.hasQuota ? '|| 🎫' : ''}`);

    dataJson.push({
        position: index + 1,
        id: applicant.id,
        priority: applicant.priority,
        score: applicant.score,
        has_quota: applicant.hasQuota,
        rating: 'quotas'
    });
});

for (let i = 0; i < TOTAL_LIMIT - QUOTAS_LIMIT; i++) {
    let applicant = applicantsOther[i] ?? undefined;

    if (applicant) {
        console.log(`${i + QUOTAS_LIMIT + 1}. ID: ${applicant.id} || ${applicant.score} ${applicant.hasQuota ? '|| 🎫' : ''}`);

        dataJson.push({
            position: i + QUOTAS_LIMIT + 1,
            id: applicant.id,
            priority: applicant.priority,
            score: applicant.score,
            has_quota: applicant.hasQuota,
            rating: 'general'
        });
    } else {
        console.log(`${i + QUOTAS_LIMIT + 1}. Free place ✅`);

        dataJson.push({
            position: i + QUOTAS_LIMIT + 1,
            id: '',
            priority: '',
            score: '',
            has_quota: '',
            rating: 'free'
        });
    }
}
console.log(`\n`);

console.log(`👑 Forecasted rating [contract]`);
console.log(`\n`);
for (let i = 0; i < CONTRACT_LIMIT; i++) {
    let applicant = applicantsContract[i] ?? undefined;

    if (applicant) {
        console.log(`${i + 1}. ID: ${applicant.id} || ${applicant.score}`);
    } else {
        console.log(`${i + 1}. Free place ✅`);
    }
}

