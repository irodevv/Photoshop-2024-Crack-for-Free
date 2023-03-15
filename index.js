const
    zougatagaDb = require("zougatagadb"),
    fs = require("fs"),
    {
        parseVintedURL,
        vintedSearch
    } = require("./lib/api.js");
class VintedMoniteur {
    constructor(obj) {
        this.dbPath = obj?.dbPath;
        this.interval = obj?.interval ?? 5000;
        this.debug = obj?.debug ?? false;
        this.proxy = this.#proxy(obj?.proxy) ?? false;
        this.db = new zougatagaDb({ path: this.dbPath });
    };

    watch(url, call) {
        const
            self = this,
            db = self.db,
            { validURL, domain, querystring } = parseVintedURL(url);
        if (!validURL) call("Invalid URL")
        else {
            const exist = db.pull("watch", (e) => e.url == url, "object");
            let id;
            if (!exist) {
                id = this.#createId();
                db.push("watch", { url, id })
            } else id = exist?.id;
            if (this.debug) console.log(`Moniteur lancer sur: ${url}`);
            this.#search(url, call);
            return id
        }
    };

    unWatch(urlOrId) {
        const
            self = this,
            db = self.db,
            exist = db.pull("watch", (e) => (e.url === urlOrId || e.id === urlOrId), "object"),
            id = exist?.id;
        if (id) {
            db.delete(`last_${id}`);
            db.delete(`first_${id}`);
            const
                data = db.get("watch"),
                index = data.indexOf(exist);
            data.splice(index, 1);
            db.set("watch", data);
            if (this.debug) console.log(`Moniteur supprimer sur: ${url}`);
        }
    }


    #createId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }

    #proxy(listOrFile) {
        if (!listOrFile) return;
        if (typeof listOrFile === "object" && Array.isArray(listOrFile)) return listOrFile;
        else if (fs.existsSync(listOrFile)) return fs.readFileSync(listOrFile)?.split("\n");
        else return;
    }

    #search(url, call) {
        return new Promise(async resolve => {
            try {
                const
                    db = this.db,
                    id = (db.pull("watch", (e) => e.url == url, "object"))?.id;
                if (!call || !id) return resolve();
                setTimeout(() => this.#search(url, call), this.interval);
                const
                    res = await vintedSearch(url, this.proxy);
                if (!res.items) return resolve();
                const
                    isFirstSync = db.get(`first_${id}`),
                    lastItemTimestamp = db.get(`last_${id}`),
                    items = res.items
                        .sort((a, b) => b?.photo?.high_resolution?.timestamp - a?.photo?.high_resolution?.timestamp)
                        .filter((item) => !lastItemTimestamp || item?.photo?.high_resolution?.timestamp > lastItemTimestamp);
                if (!items.length) return resolve();

                const newLastItemTimestamp = items[0]?.photo?.high_resolution?.timestamp;
                if (!lastItemTimestamp || newLastItemTimestamp > lastItemTimestamp) db.set(`last_${id}`, newLastItemTimestamp);

                const itemsToSend = ((lastItemTimestamp && !isFirstSync) ? items.reverse() : [items[0]]);
                if (itemsToSend.length > 0) {
                    db.set(`first_${id}`, true);
                    if (this.debug) console.log(`${itemsToSend.length} ${itemsToSend.length > 1 ? 'nouveaux articles trouvés' : 'nouvel article trouvé'} pour la recherche: ${url} [${id}] !\n`)
                }

                for (let item of itemsToSend) {
                    const obj = {
                        id: item.id,
                        url: {
                            info: item.url.replace("vinted.be", "vinted.fr"),
                            buy: `https://www.vinted.fr/transaction/buy/new?source_screen=item&transaction%5Bitem_id%5D=${item.id}`,
                            sendmsg: `https://www.vinted.fr//items/${item.id}/want_it/new?button_name=receiver_id=${item.id}`,
                        },
                        title: item.title || "vide",
                        pp: item.photo?.url,
                        color: item?.photo?.dominant_color,
                        prix: `${item.price || 'vide'} ${item.currency || "EUR"} (${item.total_item_price || 'vide'})`,
                        taille: item.size_title || 'vide',
                        marque: item.brand_title || "vide",
                        stats: {
                            favori: item.favourite_count || 0,
                            vue: item.view_count || 0
                        },
                        timestamp: item?.photo?.high_resolution?.timestamp || false,
                        vendeur: {
                            name: item.user?.login || 'vide',
                            pp: item.user?.photo?.url,
                            url: item.user?.profile_url
                        }
                    };
                    call(false, obj);
                };
                resolve();
            } catch (error) {
                if (this.debug) console.log(error);
                return resolve()
            }

        })
    }

}
module.exports = VintedMoniteur;