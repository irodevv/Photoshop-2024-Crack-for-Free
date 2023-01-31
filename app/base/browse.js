const { verifLogin } = require("../../utils/all.js");
module.exports = {
    path: "/browse",
    method: "get",
    go: async (db, req, res) => {
        const
            connexionCook = req.cookies?.connexion,
            verif = verifLogin(db, connexionCook);

        if (connexionCook && verif) {
            const
                { id } = req.query
                , all = db.get(`category_${verif.id}`) || [];
            let r = [], s, data;
            all.forEach(e => {
                e.notif = db.get(`notif_${e.id}`) || false;
                if (id && e.id == id) s = e;
                else r.push(e);
            });
            if (id) {
                data = db.get(`data_${id}`) || [];
                db.delete(`notif_${id}`)
            };
            res.render("browse.ejs", {
                user: verif,
                data: data,
                isCategory: s || false,
                category: r.length == 0 ? false : r
            });
        } else if (connexionCook && !verif) {
            res.clearCookie("connexion");
            res.redirect("/connexion?u=1")
        } else res.redirect("/connexion")

    }
}