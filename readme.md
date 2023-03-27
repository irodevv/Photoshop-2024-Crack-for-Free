## VintedMoniteur

[![vinted-moniteur on npm](https://img.shields.io/npm/v/vinted-moniteur.svg)](https://www.npmjs.com/package/vinted-moniteur)

## Installation

```python
npm i vinted-moniteur
```

## Example

```js

const VintedMoniteur = require("vinted-moniteur");

const moniteur = new VintedMoniteur({
    url: "https://www.vinted.fr/vetements?search_text=bonnet&order=newest_first",
    interval: 5000,
    debug: true,
    // AVEC PROXY
    // proxy: ["ip", "ip:port", "username:password"]
    // ou
    // proxy: "./proxy.txt"
});

moniteur.on("error", (err) => console.log(err));
moniteur.on("item", (data) => {
    console.log(data);
    // -> OBJECT
    // {
    //     id: 2838672149,
    //     url: {
    //       info: 'https://www.vinted.fr/hommes/vetements/vetements-de-sport-and-accessoires/accessoires-de-sports/bonnets/2838672149-bonnet-nike',
    //       buy: 'https://www.vinted.fr/transaction/buy/new?source_screen=item&transaction%5Bitem_id%5D=2838672149',
    //       sendmsg: 'https://www.vinted.fr//items/2838672149/want_it/new?button_name=receiver_id=2838672149'
    //     },
    //     title: 'bonnet nike ',
    //     pp: 'https://images1.vinted.net/t/01_01e6f_tyNQCq2Zi6gjebQ6ycgqffSb/f800/1679945160.jpeg?s=93ab40d56d5376fc556ff32be240e2aace80ff1c',
    //     thumbnails: [
    //       'https://images1.vinted.net/t/01_01e6f_tyNQCq2Zi6gjebQ6ycgqffSb/70x100/1679945160.jpeg?s=64b32ac3aac939db1083c36c29e1d41dd5ff45cc',
    //       'https://images1.vinted.net/t/01_01e6f_tyNQCq2Zi6gjebQ6ycgqffSb/150x210/1679945160.jpeg?s=d255bce698a607b4b87666f3144246e4223b54f3',
    //       'https://images1.vinted.net/t/01_01e6f_tyNQCq2Zi6gjebQ6ycgqffSb/310x430/1679945160.jpeg?s=3a1d65b1f9e8846cb10e85fb6141c051651f60ab',
    //       'https://images1.vinted.net/t/01_01e6f_tyNQCq2Zi6gjebQ6ycgqffSb/f800/1679945160.jpeg?s=93ab40d56d5376fc556ff32be240e2aace80ff1c',
    //       'https://images1.vinted.net/t/01_01e6f_tyNQCq2Zi6gjebQ6ycgqffSb/f800/1679945160.jpeg?s=93ab40d56d5376fc556ff32be240e2aace80ff1c',
    //       'https://images1.vinted.net/t/01_01e6f_tyNQCq2Zi6gjebQ6ycgqffSb/f800/1679945160.jpeg?s=93ab40d56d5376fc556ff32be240e2aace80ff1c'
    //     ],
    //     color: '#20232C',
    //     prix: '4.0 EUR (4.9)',
    //     taille: 'vide',
    //     marque: 'Nike',
    //     stats: { favori: 0, vue: 0 },
    //     timestamp: 1679945160,
    //     vendeur: {
    //       name: 'juu1_ee',
    //       pp: 'https://images1.vinted.net/t/01_01590_iBqUekQU9c9vyNoqAVzG6fQn/f800/1652021442.jpeg?s=81e3c8b5c0293455fef869b99b37d544cf9ffe2a',
    //       url: 'https://www.vinted.be/member/13276203-juu1ee'
    //     }
    //   }
})
```