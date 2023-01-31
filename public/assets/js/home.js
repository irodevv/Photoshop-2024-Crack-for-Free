const
    preload = document.querySelector(".preload"),
    landingpage = document.querySelector(".landingpage");

window.onload = () => {
    landingpage.style.display = "block";
    preload.style.display = "none";
}

const menu = document.querySelector("#menu"),
    nav = document.querySelector("#nav"),
    closeNAv = nav.querySelector(".navCloseIcon");

menu.addEventListener("click", () => {
    nav.classList.add("on");
    document.body.classList.add("noscroll")
});
closeNAv.addEventListener("click", () => {
    nav.classList.remove("on");
    document.body.classList.remove("noscroll")
});


const contact = document.querySelector("#contact");
if (contact) {
    const
        p = document.querySelector("#p"),
        e = document.querySelector("#e"),
        o = document.querySelector("#o"),
        m = document.querySelector("#m");

    contact.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const
            ip = await getIp(),
            datao = {
                p: p.value.trim(),
                e: e.value.trim(),
                o: o.value.trim(),
                m: m.value.trim(),
                ip: ip
            };
        const data = await sendData("/send", datao);
        if (data == "2") {
            new Toast({
                message: `Vous nous avez déjà contacté récemment, veuillez réessayer ultérieurement !`,
                type: 'danger'
            });
        } else if (data == "1") {
            new Toast({
                message: `Message envoyé avec succès, merci d'attendre une réponse dans votre boite mail !`,
                type: 'success'
            });
        } else {
            new Toast({
                message: `Une erreur est survenue.`,
                type: 'danger'
            });
        }
    })
}