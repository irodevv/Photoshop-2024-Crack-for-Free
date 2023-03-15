const
    { createId } = require("./all.js"),
    VintedMoniteur = require("./moniteur/vintedMoniteur.js"),
    { parseVintedURL } = require("./moniteur/api.js");
const ws = async (wss, db) => {
    wss.on('connection', (co) => {
        co.on('message', (message) => {
            const data = JSON.parse(message);
            if (data.type == "startmoni") {
                data.type = undefined;
                data.co = co;
                new VintedMoniteur(db, data)
            } else if (data.type == "createcat") {
                const
                    { userId, n, u } = data,
                    allCat = db.get(`category_${userId}`) || [],
                    exist = allCat.filter(e => e.u == u)[0],
                    id = createId();
                const { validURL } = parseVintedURL(u);
                if (exist) {
                    data.m = 2;
                    data.e = exist;
                    co.send(JSON.stringify(data))
                // } if (!allCat.length >= 15) {
                //     data.m = 4;
                //     co.send(JSON.stringify(data))
                } if (!validURL) {
                    data.m = 3;
                    co.send(JSON.stringify(data))
                } else {
                    const cat = {
                        id: id,
                        n: n,
                        u: u
                    };
                    db.push(`category_${userId}`, cat);
                    data.m = 1;
                    data.id = id;
                    co.send(JSON.stringify(data))
                }
            }
        });

        co.send(JSON.stringify({ msg: "on" }));
    });
};
module.exports = ws;