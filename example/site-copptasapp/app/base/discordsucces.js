module.exports = {
    path: "/discord/bot/loginsuccess/:user",
    method: "get",
    go: async (db, req, res) => {
        res.sendFile("discordsuccess.html", { root: "./public" });
    }
}