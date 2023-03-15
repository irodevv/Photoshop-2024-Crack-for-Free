const menu = document.querySelector("#menu"),
    nav = document.querySelector("#nav"),
    closeNAv = nav.querySelector(".navCloseIcon");

menu.addEventListener("click", () => nav.classList.toggle("on"));
closeNAv.addEventListener("click", () => nav.classList.remove("on"));

const
    chatLogWrapper = document.querySelectorAll('.chatLogWrapper'),

    allcat = document.querySelectorAll('#allcat'),
    myModal = document.querySelector("#myModal"),
    closeModal = myModal.querySelector("span.close"),

    allnewcat = document.querySelectorAll("#newcat"),
    go = document.querySelector("#go"),
    nameEl = go.querySelector("#name"),
    urlEl = go.querySelector("#url"),
    allData = document.querySelector('#allData');


let edit;

const co = new WebSocket('ws://localhost');
co.onopen = async function (e) {
    console.log('ws on');
    if (isCat != "false") {
        const parse = JSON.parse(isCat);
        const ip = await getIp();
        const datao = {
            type: "startmoni",
            userId: userId,
            ip: ip,
            url: parse.u,
            categoryId: parse.id
        };
        co.send(JSON.stringify(datao));
        setCookie("lastCat", parse.id);
    }

    if (!Notification) return;
    if (Notification.permission !== 'granted') Notification.requestPermission();

};
co.onclose = function (message) {
    console.log('ws off');
    new Toast({
        message: "Connexion au serveur fermer, essayez de relancer la page !",
        type: 'danger',
        customButtons: [
            {
                text: 'Nous contacter',
                onClick: function () {
                    window.location.href = "/contact";
                }
            }
        ]
    });
};
co.onerror = function (error) {
    console.log('ws err');
    new Toast({
        message: `Une erreur est survenue [${error}]`,
        type: 'danger',
        customButtons: [
            {
                text: 'Nous contacter',
                onClick: function () {
                    window.location.href = "/contact";
                }
            }
        ]
    });
};
window.onload = () => {
    setTimeout(() => {
        if (allData) goBottom();
    }, 300);
}
function notif(data) {
    if (Notification.permission !== 'granted') return;
    const notification = new Notification('Cop ta Sapp - New Post 👀', {
        icon: data.pp,
        body: `${data.title}\nTaille: ${data.taille} | Marque: ${data.marque} | Prix: ${data.prix}`,
        image: data.pp,
    });
    notification.onclick = function () {
        window.open(data.url);
    };
}
co.onmessage = async function (message) {
    const data = JSON.parse(message.data);
    if (data.type == "newdata") {
        console.log(data);
        if (!allData) return window.location.href = window.location.href;
        allData.innerHTML += `
        <div class="grid">
        <img src="${data.pp}">
        <div class="grid__body">
            <div class="relative">
                <a class="grid__link" target="_blank" href="${data.url}"></a>
                <h1 class="grid__title">${data.title}</h1>
                <p class="grid__author">${data.prix}</p>
            </div>
            <div class="mt-auto">
            <button onclick="window.open('${data.urlbuy}','_blank')" class="grid__tag">Acheter</button>
            <button onclick="window.open('${data.urlmsg}','_blank')" class="grid__tag">Send Msg</button>
            <button onclick="window.open('${data.url}','_blank')" class="grid__tag">Plus d'info</button>
            </div>
        </div>
    </div>
        `;
        notif(data);
        setTimeout(() => {
            if (allData) goBottom();
        }, 100);
    } else if (data.type == "createcat") {
        console.log(data);
        if (data.m == 2) {
            new Toast({
                message: `Une category avec ce lien existe déjà:<br> <a href="/browse?id=${data?.e?.id}">${data?.e?.n} (${data?.e?.id})</a>`,
                type: 'danger',
                customButtons: [
                    {
                        text: 'Nous contacter',
                        onClick: function () {
                            window.location.href = "/contact";
                        }
                    }
                ]
            });
            // } else if (data.m == 4) {
            //     new Toast({
            //         message: `Vous avez atteint la limite de création de category`,
            //         type: 'danger',
            //         customButtons: [
            //             {
            //                 text: 'Nous contacter',
            //                 onClick: function () {
            //                     window.location.href = "/contact";
            //                 }
            //             }
            //         ]
            //     });
        } else if (data.m == 3) {
            new Toast({
                message: `Ce lien n'est pas un lien vinted valide où il n'est pas accepter !`,
                type: 'danger',
                customButtons: [
                    {
                        text: 'Nous contacter',
                        onClick: function () {
                            window.location.href = "/contact";
                        }
                    }
                ]
            });
        } else if (data.m == 1) {
            console.log(data);
            window.location.href = "/browse?id=" + data.id;
            //             allcat.forEach(e => {
            //                 e.innerHTML += `
            //     <a href="/browse?id=${data.id}" id="category ${data.id}" title="Vinted: ${data.u}">
            //     <div class="navPrompt2">
            //         <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24"
            //             stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
            //             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            //         </svg>
            //         <p>${data.n.length <= 10 ? data.n : data.n.slice(0, 10) + "..."}</p>
            //                 <div class="opts">
            //                     <button id="editcat ${data.id}"><svg stroke="currentColor" fill="none" stroke-width="2"
            //                             viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"
            //                             class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            //                             <path d="M12 20h9"></path>
            //                             <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            //                         </svg></button>
            //                     <button id="delete ${data.id}"><svg stroke="currentColor" fill="none" stroke-width="2"
            //                             viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"
            //                             class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            //                             <polyline points="3 6 5 6 21 6"></polyline>
            //                             <path
            //                                 d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
            //                             </path>
            //                             <line x1="10" y1="11" x2="10" y2="17"></line>
            //                             <line x1="14" y1="11" x2="14" y2="17"></line>
            //                         </svg></button>
            //                 </div>
            //     </div>
            // </a>
            //     `;
            //             })
            //             new Toast({
            //                 message: `Category crée avec succès !`,
            //                 type: 'success',
            //                 customButtons: [
            //                     {
            //                         text: 'Nous contacter',
            //                         onClick: function () {
            //                             window.location.href = "/contact";
            //                         }
            //                     }
            //                 ]
            //             })
        } else {
            new Toast({
                message: `Une erreur est survenue`,
                type: 'danger',
                customButtons: [
                    {
                        text: 'Nous contacter',
                        onClick: function () {
                            window.location.href = "/contact";
                        }
                    }
                ]
            });
        }
    }
}

const firstCo = getCookie("firstCo");
if (!firstCo) {
    new Toast({
        message: `Bienvenue sur <u>Cop Ta Sapp</u> <strong>${pseudo}</strong>, oublie pas de te connecter à ton vinted sur ton navigateur pour être le plus rapide possible !<br><br>⚠️ ATTENTION ! Le moniteur vinted est actf que quand vous êtes sur la category !`,
        type: '',
        customButtons: [
            {
                text: 'Nous contacter',
                onClick: function () {
                    window.location.href = "/contact";
                }
            }
        ]
    });
    setCookie("firstCo", true)
};




go.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const ip = await getIp();
    const datao = {
        type: "createcat",
        userId: userId,
        n: nameEl.value.trim(),
        u: urlEl.value.trim(),
        ip: ip
    };
    co.send(JSON.stringify(datao));
    myModal.style.display = "none";
})


allnewcat.forEach(e => {
    e.addEventListener("click", () => {
        myModal.style.display = "flex"
    })
});
closeModal.addEventListener("click", () => myModal.style.display = "none");
window.onclick = function (event) {
    if (event.target == myModal) myModal.style.display = "none"
};

