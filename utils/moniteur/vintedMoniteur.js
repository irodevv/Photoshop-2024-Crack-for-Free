/* 
   * Merci à:
   * https://github.com/Androz2091/vinted-discord-bot
*/

const api = require("./api")

class VintedMoniteur {
    constructor(db, obj) {
        this.db = db;
        this.url = obj.url;
        this.userId = obj.userId;
        this.categoryId = obj.categoryId;
        this.co = obj.co;
        this.ip = obj.ip;
        this.inter = false;
        this.go()
    };

    async go() {
        const db = this.db;
        const entries = db.all().filter((e) => e.ID.startsWith('last_item_ts_'));
        entries.forEach((e) => db.delete(e?.ID));

        if (!db.get(`isfirst_${this.categoryId}`)) db.set(`isfirst_${this.categoryId}`, true);

        this.search();
        this.inter = setInterval(() => this.search(), 5000);
    };

    search() {
        return new Promise(async resolve => {
            try {

                const
                    co = this.co,
                    db = this.db;
                if (!co) {
                    if (this.inter) clearInterval(this.inter);
                    return;
                };
                const search = await api.vintedSearch(this.url, this.ip);
                if (!search || !search?.items || search?.items?.length == 0) return;
                const
                    isFirstSync = db.get(`isfirst_${this.categoryId}`),
                    lastItemTimestamp = db.get(`lastitem_${this.categoryId}`),
                    items = search?.items
                        .sort((a, b) => b?.photo?.high_resolution?.timestamp || 0 - a?.photo?.high_resolution?.timestamp || 0)
                        .filter((item) => !lastItemTimestamp || item?.photo?.high_resolution?.timestamp || 0 > lastItemTimestamp);
                if (!items.length) return void resolve();
                const newLastItemTimestamp = items[0]?.photo?.high_resolution?.timestamp || 0;
                if (!lastItemTimestamp || newLastItemTimestamp > lastItemTimestamp) db.set(`lastitem_${this.categoryId}`, newLastItemTimestamp);
                const itemsToSend = ((lastItemTimestamp && !isFirstSync) ? items.reverse() : [items[0]]);
                for (let item of itemsToSend) {
                    const alldata = db.get(`data_${this.categoryId}`) || [];
                    if (alldata.filter(e => e.id == item.id)[0]) { } else {
                        const obj = {
                            id: item.id,
                            url: item.url,
                            urlbuy: `https://www.vinted.fr/transaction/buy/new?source_screen=item&transaction%5Bitem_id%5D=${item.id}`,
                            urlmsg: `https://www.vinted.fr//items/${item.id}/want_it/new?button_name=receiver_id=${item.id}`,

                            pp: item.photo?.url,
                            prix: `${item.price || 'vide'} ${item.currency || "EUR"} (${item.total_item_price || 'vide'})`,
                            taille: item.size_title || 'vide',
                            title: item.title || "vide",
                            marque: item.brand_title || "vide",
                            status: item.status || 'vide',
                            favoricount: item.favourite_count || 0,
                            vueCount: item.view_count || 0,

                            timestamp: item?.photo?.high_resolution?.timestamp || false,
                            vendeur: item.user?.login || 'vide',
                            vendeurPp: item.user?.photo?.url,
                            vendeurUrl: item.user?.profile_url
                        };
                        db.push(`data_${this.categoryId}`, obj);
                        db.set(`notif_${this.categoryId}`, true);
                        obj.type = "newdata";
                        obj.ip = this.ip;
                        co.send(JSON.stringify(obj));
                    }
                };
                resolve(true);
            } catch (error) {
                return resolve(false)
            }

        })
    }



    getReputationStars(reputationPercent) {
        let reputCalc = Math.round(reputationPercent / 0.2);
        let reputDemiCalc = reputationPercent % 0.2;

        let starsStr = '';

        for (let i = 0; i < reputCalc; i++) {
            starsStr += ':star:';
        }

        if (reputDemiCalc !== 0 && reputCalc < 5) {
            starsStr += '<:half_star:906229706498666546>';
        }

        return starsStr;
    }
}



module.exports = VintedMoniteur;