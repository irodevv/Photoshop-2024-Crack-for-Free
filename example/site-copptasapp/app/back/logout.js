module.exports = {
    path: "/logout",
    method: "get",
    go: async (db, req, res) => {
        res.clearCookie("connexion");
        res.redirect("/connexion")
    }
}