// //let offer = {"usid":1069080,"usn":"Кібербезпека","ustn":"Відкрита","uid":104,"un":"Національний технічний університет \"Харківський політехнічний інститут\"","ufn":"Навчально-науковий інститут комп’ютерних наук та інформаційних технологій","rk":"1.07","qid":"1","qn":"Бакалавр","ebid":40,"ebn":"Повна загальна середня освіта","efid":1,"efn":"Денна","cid":1,"ssc":"125","ssn":"Кібербезпека","etrm":"12.09.2022 &ndash; 30.06.2026 (3р 10м)","rtrm":"29.07.2022 &ndash; 23.08.2022","price":"30470","up":1,"spn":"Кібербезпека","ox":25,"ol":75,"oc":50,"rr":1,"osn":{"1":{"n":"1","i":[689215]},"2":{"n":"2","i":[696671]},"3":{"n":"3","i":[695617]},"4":{"n":"4","i":[975796]},"5":{"n":"5","i":[975804]},"6":{"n":"6","i":[975807,975811,975816,975820,975824,975830]},"12":{"i":[836994]}},"os":{"689215":{"sn":"Українська мова","k":0.3,"efid":3,"t":"Сертифікат НМТ","icon":"3n","ch":0,"mv":100},"696671":{"sn":"Математика","k":0.5,"efid":3,"t":"Сертифікат НМТ","icon":"3n","ch":0,"mv":100},"695617":{"sn":"Історія України","k":0.2,"efid":3,"t":"Сертифікат НМТ","icon":"3n","ch":0,"mv":100},"975796":{"sn":"Українська мова","k":0.2,"efid":3,"t":"Сертифікат ЗНО 2019-2021 року","icon":"3","ch":0,"mv":100},"975804":{"sn":"Математика","k":0.5,"efid":3,"t":"Сертифікат ЗНО 2019-2021 року","icon":"3","ch":0,"mv":100},"975807":{"sn":"Іноземна мова","k":0.2,"efid":3,"t":"Сертифікат ЗНО 2019-2021 року","icon":"3","ch":1,"mv":100},"975811":{"sn":"Історія України","k":0.2,"efid":3,"t":"Сертифікат ЗНО 2019-2021 року","icon":"3","ch":1,"mv":100},"975816":{"sn":"Біологія","k":0.2,"efid":3,"t":"Сертифікат ЗНО 2019-2021 року","icon":"3","ch":1,"mv":100},"975820":{"sn":"Географія","k":0.2,"efid":3,"t":"Сертифікат ЗНО 2019-2021 року","icon":"3","ch":1,"mv":100},"975824":{"sn":"Фізика","k":0.2,"efid":3,"t":"Сертифікат ЗНО 2019-2021 року","icon":"3","ch":1,"mv":100},"975830":{"sn":"Хімія","k":0.2,"efid":3,"t":"Сертифікат ЗНО 2019-2021 року","icon":"3","ch":1,"mv":100},"836994":{"sn":"Мотиваційний лист","k":0,"efid":100,"t":"","icon":100,"ch":0}},"st":{"c":{"t":197,"a":182,"b":170,"ka":177.5,"km":136.2,"kx":200,"r":0,"ob":0,"oc":0,"rm":null,"obm":null,"ocm":null}},"shf":1,"hr":0}
//
//
// /*
// (async() => {
//
//     const params = new URLSearchParams();
//
//     params.append('id', '1069038');
//     params.append('last', '0');
//
//     axios.post('https://vstup.edbo.gov.ua/offer-requests/', params,
//         {
//             headers: {
//                 'Referer': 'https://vstup.edbo.gov.ua/offer/1069038/',
//                 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
//             }
//         })
//         .then(function (response) {
//             console.log(response.data.requests.length);
//         })
//         .catch(function (error) {
//             console.log(error);
//         });
// })()*/
//
// import {Axios, AxiosError} from "axios";
//
// interface Request {
//     priorityId: number, //prid
//     priorityNumber: number, //p
//     status: Status, //prsid
//     personTitle: string, //fio
//     score: number, //kv
//     hasQuota: boolean //rss
//     /**
//      *  rss: [
//      *     { kv: '+56.100', f: '187 x 0.3', id: 697173 },
//      *     { kv: '+100.000', f: '200 x 0.5', id: 695610 },
//      *     { kv: '+38.400', f: '192 x 0.2', id: 696665 },
//      *     { kv: 'x1.07', t: 'rk' },
//      *     { kv: '', t: 'q', sn: 'Квота 2' }
//      *   ]
//      */
// }
//
//
// interface Status {
//     id: number,
//     name: string
// }
//
// class RequestStatuses {
//     protected statuses: Status[] = [];
//
//     constructor() {
//         this.parseStatuses();
//     }
//
//     protected parseStatuses(): void {
//         const rawStatuses = {
//             "1":"заява надійшла з сайту",
//             "2":"затримано",
//             "3":"скасовано вступником",
//             "4":"скасовано (втрата пріор.)",
//             "5":"зареєстровано",
//             "6":"допущено",
//             "7":"відмова",
//             "8":"скасовано ЗО",
//             "9":"рекомендовано (бюджет)",
//             "10":"відхилено (бюджет)",
//             "11":"допущено (контракт, за ріш. ПК)",
//             "12":"рекомендовано (контракт)",
//             "13":"відхилено (контракт)",
//             "14":"до наказу",
//             "15":"відраховано",
//             "16":"скасовано (зарах. на бюджет)"
//         }
//
//         for (const rawStatus of Object.entries(rawStatuses)) {
//
//             const status: Status = {
//                 id: parseInt(rawStatus[0]),
//                 name: rawStatus[1],
//             }
//
//             this.statuses.push(status);
//         }
//     }
//
//     public getStatusById(id: number): Status | null {
//         const status = this.statuses.find(status => {
//             return status.id === id;
//         });
//
//         return status ?? null;
//     }
// }
//
// class ApiEDBO {
//     protected axios: Axios;
//
//     protected OFFER_ENDPOINT = 'https://vstup.edbo.gov.ua/offer-requests/';
//
//     protected OFFER_HEADERS = {
//         'Referer': 'https://vstup.edbo.gov.ua/offer/',
//         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//         'Accept': 'application/json, text/javascript, */*; q=0.01',
//         'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
//         'Connection': 'keep-alive',
//         'Origin': 'https://vstup.edbo.gov.ua',
//         'Sec-Fetch-Dest': 'empty',
//         'Sec-Fetch-Mode': 'cors',
//         'Sec-Fetch-Site': 'same-origin',
//         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
//         'X-Requested-With': 'XMLHttpRequest',
//         'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
//         'sec-ch-ua-mobile': "?0",
//         'sec-ch-ua-platform': "macOS"
//     }
//
//     constructor() {
//         this.axios = require('axios').default;
//     }
//
//     async getRequestsByOfferId(offedId: number): Promise<[]> {
//         const params = new URLSearchParams();
//
//         params.append('id', offedId.toString());
//         params.append('last', '0');
//
//         this.OFFER_HEADERS.Referer += offedId + '/';
//
//         try {
//             return await this.axios.post(this.OFFER_ENDPOINT, params,
//                 {
//                     headers: this.OFFER_HEADERS
//                 });
//
//         } catch (error: AxiosError) {
//
//         }
//     }
// }