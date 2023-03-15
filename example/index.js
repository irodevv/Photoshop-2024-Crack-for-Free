
const
    VintedMoniteur = require("../"),
    moniteur = new VintedMoniteur({
        interval: 5000,
        debug: true,
        // AVEC PROXY
        // proxy: ["ip", "ip:port", "username:password"]
        // ou
        // proxy: "./proxy.txt"
    });


const id = moniteur.watch("https://www.vinted.fr/vetements?search_text=bonnet&order=newest_first", (err, item) => {
    if (err) return console.log(err);
    item
    // -> {ITEM OBJECT}
    // {
    //     id: 2792214400,
    //     url: {
    //       info: 'https://www.vinted.fr/enfants/filles/accessoires/echarpes-and-chales/2792214400-tour-de-cou-et-bonnet',
    //       buy: 'https://www.vinted.fr/transaction/buy/new?source_screen=item&transaction%5Bitem_id%5D=2792214400',
    //       sendmsg: 'https://www.vinted.fr//items/2792214400/want_it/new?button_name=receiver_id=2792214400'
    //     },
    //     title: 'Tour de cou et bonnet ',
    //     pp: 'https://images1.vinted.net/t/02_02097_KYvUwoMYBPV6LADr4TziyfEp/f800/1678891680.jpeg?s=786f51c35ec60bbd05c58e41a263e3e3c89bc574',
    //     color: '#ADAEAA',
    //     prix: '2.0 EUR (2.8)',
    //     taille: 'vide',
    //     marque: 'La Halle',
    //     stats: { favori: 0, vue: 0 },
    //     timestamp: 1678891680,
    //     vendeur: {
    //       name: 'lenadelanie',
    //       pp: 'https://images1.vinted.net/t/01_016c5_AAeqiT314eZWqL4NW9p9YbeN/f800/1673615778.jpeg?s=a2537494cca7b2a69018cbc62b7c20aa5860cad9',
    //       url: 'https://www.vinted.be/member/38419181-lenadelanie'
    //     }
    //   }
})

id
// -> lf9tonmik6dp5p6tehd
// Id or url
moniteur.unWatch(id);