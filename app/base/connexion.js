module.exports = {
    path: "/connexion",
    method: "get",
    go: async (db, req, res) => {
        res.sendFile("connexion.html", { root: "./public" });
    }
}