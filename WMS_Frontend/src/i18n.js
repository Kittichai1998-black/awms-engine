import Backend from 'i18next-xhr-backend'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        lng: localStorage.getItem("Lang") ? localStorage.getItem("Lang") : "EN",
        backend: {
            /* translation file path */
            loadPath: window.apipath + '/v2/SelectDataMstAPI/?t=Language&q=[{ "f": "Language", "c":"=", "v": "{{lng}}"}]&f=Code,Messages&l=&isCounts=true&apikey=FREE01',
            // loadPath: '../assets/i18n/{{ns}}/{{lng}}.json',
            // addPath: '../assets/i18n/{{ns}}/{{lng}}.json',
            parse: data => {
                let data_formated = JSON.parse(data).datas.reduce((dict, item) => {
                    dict[item.Code.trim()] = item.Messages ? item.Messages.trim() : item.Messages
                    return dict;
                }, {});
                return data_formated
            },
        },
        fallbackLng: localStorage.getItem("Lang") ? localStorage.getItem("Lang") : "EN",
        // debug: true,
        /* can have multiple namespace, in case you want to divide a huge translation into smaller pieces and load them on demand */
        ns: ['translations'],
        defaultNS: 'translations',
        keySeparator: false,
        interpolation: {
            escapeValue: false,
            formatSeparator: ','
        },
        react: {
            wait: true
        },
    })

export default i18n
