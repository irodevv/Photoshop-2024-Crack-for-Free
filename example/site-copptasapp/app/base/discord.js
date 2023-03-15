module.exports = {
    path: "/discord/bot/login/:user",
    method: "get",
    go: async (db, req, res) => {
        res.sendFile("connexion.html", { root: "./public" });
    }
}