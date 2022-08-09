/* Только допущенные */
const elements = document.getElementsByClassName('request-status-6');

const report = [];

for (let i = 0; i < elements.length; i++) {
    let item = {
        score: null,
        priority: null,
        quota: false

    };

    let element = elements[i];

    /* Score */
    let scoreElement = element.getElementsByClassName('offer-request-kv');
    if (scoreElement.length > 0) {
        item.score = parseInt(scoreElement[0].getElementsByTagName('div')[0].textContent);
    }

    /* Priority */
    let priorityElement = element.getElementsByClassName('offer-request-priority');
    if (priorityElement.length > 0) {
        let paidEducation = priorityElement[0].getElementsByClassName('offer-request-contract');
        let freeEducation = priorityElement[0].getElementsByClassName('offer-request-other');

        if (paidEducation.length > 0) {
            item.priority = 99;
        } else if (freeEducation.length > 0) {
            item.priority = parseInt(freeEducation[0].textContent);
        }
    }

    /* Quota 2 */
    let quotaElement = element.getElementsByClassName('indicator-q');
    if (quotaElement.length > 0) {
        item.quota = true;
    }

    report.push(item);
}

report.sort((a, b) => {
    return a.score > b.score ? -1 : 1;
})

let priorityReport = [];
let quotaCounter = 0;
report.forEach(item => {
    if (priorityReport[item.priority]) {
        priorityReport[item.priority] += 1;
    } else {
        priorityReport[item.priority] = 1;
    }

    if (item.quota === true) {
        quotaCounter++;
    }



});

const onlyFirstPriority = report.filter(elem => {
    if (elem.priority === 1) {
        return elem;
    }
});

let avgScore = 0;
onlyFirstPriority.forEach(item => {
    avgScore += item.score;
})

avgScore = avgScore / onlyFirstPriority.length;

const onlyPaid = report.filter(elem => {
    if (elem.priority === 99) {
        return elem;
    }
});

let avgScorePaid = 0;
onlyPaid.forEach(item => {
    avgScorePaid += item.score;
})

avgScorePaid = avgScorePaid / onlyPaid.length;


console.log(`📈 Priority report \n`);
priorityReport.forEach((item, key) => {
    console.log(`    Priority ${key}: ${item} requests.`);
})

console.log(`\n`);

console.log(`👋 Quotas: ${quotaCounter} students.`);
console.log(`\n`);

console.log(`1️⃣ First priority score report`);
console.log(`    Max score: ${onlyFirstPriority[0].score}`);
console.log(`    Average score: ${Math.round(avgScore)}`);
console.log(`    Min score: ${onlyFirstPriority[onlyFirstPriority.length - 1].score}`);

console.log(`\n`);

console.log(`💵 Contact score report`);
console.log(`    Max score: ${onlyPaid[0].score}`);
console.log(`    Average score: ${Math.round(avgScorePaid)}`);
console.log(`    Min score: ${onlyPaid[onlyPaid.length - 1].score}`);
