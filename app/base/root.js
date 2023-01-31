const {getIp } = require("../../utils/all");
module.exports = {
    path: "/",
    method: "get",
    go: async (db, req, res) => {
        console.log(1);
        // console.log(getIp(req));
        res.sendFile("index.html", { root: "./public" });
    }
}