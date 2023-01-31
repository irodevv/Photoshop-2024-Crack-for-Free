module.exports = {
    path: "/inscription",
    method: "get",
    go: async (db, req, res) => {
        res.sendFile("inscription.html", { root: "./public" });
    }
}