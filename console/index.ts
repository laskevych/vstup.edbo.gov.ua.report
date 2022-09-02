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

class Extractor {
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

        /**
         * Лимиты
         */

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
         * Заявки со статусом "до наказу (бюджет)"
         */
        const STATUS_GOVERMENT: string = 'request-status-14'; //14

        /**
         * Заявки со статусом "рекомендовано (бюджет)"
         */
        const STATUS_RATING: string = 'request-status-9';

        const elements = [
            ...document.getElementsByClassName('request-status-14'),
            ...document.getElementsByClassName('request-status-9')
        ]

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

                score = textContent ? parseFloat(textContent.replace(',', '.')) : -1;
                console.log(score);
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

const extractor = new Extractor();

let message = '';
extractor.getApplicants().forEach((applicant, index, applicants) => {
    const hasGrant = index + 1 <= 52;

    message += `${index + 1}. Score: ${applicant.score}. Title: ${applicant.id}. Scholarship: ${hasGrant ? '✅' : '🚫'}` + '\n';
});

console.log(message);