module.exports = {
    path: "/contact",
    method: "get",
    go: async (db, req, res) => {
        res.sendFile("contact.html", { root: "./public" });
    }
}