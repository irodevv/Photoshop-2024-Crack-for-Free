module.exports = {
    path: "/category/delete/:uid/:id",
    method: "get",
    go: async (db, req, res) => {
        const { uid, id } = req.params;
        if (!uid && !id) return;

        if (id == "all") {
            const allcategory = db.get(`category_${uid}`) || [];
            allcategory.forEach(e => delCat(e.id));
            db.delete(`category_${uid}`);
        } else delCat(id);

        res.redirect("/browse")
        function delCat(id) {
            const
                allcategory = db.get(`category_${uid}`) || [],
                newData = [];
            allcategory.forEach(e => {
                if (e.id == id) { } else newData.push(id);
            });
            db.set(`category_${uid}`, newData);
            db.delete(`data_${id}`);
            db.delete(`notif_${id}`);
        }
    }
}