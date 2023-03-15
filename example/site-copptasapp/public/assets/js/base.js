
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function getIp() {
    const ip = getCookie("ip");
    if (ip) return ip;
    else return new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open('GET', `https://api.ipify.org?format=json`, true);
        request.responseType = 'json';
        request.onload = async function () {
            const status = request.status;
            setCookie("ip", request?.response?.ip);
            resolve(status === 200 ? request?.response?.ip : false);
        };
        request.send();
    })
}

function encodeBase64ToJson(base64String) {
    try {
        const jsonString = Buffer.from(base64String, 'base64').toString()
        return JSON.parse(jsonString)
    } catch (err) {
        return false
    }
}

function sendData(url, data) {
    return new Promise(resolve => {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        }).then(response => response.text()).then(html => resolve(html));
    })
}


// function getTime(id, mode) {
//     const locale = getLang();
//     const date = new Date(Number(id) * 1000);
//     const el = `timestamp_${id}-${mode}-${Date.now()}`;
//     const result = getDate();
//     setInterval(() => {
//       if (result.r != getDate().r) {
//         const e = document.querySelector(`#${el}`);
//         if (!e) return;
//         e.innerHTML = getDate().r
//       }
//     }, 1000);
//     return `<div class="tooltip"><span id="${el}" class="timestamp">${result.r}</span><div class="tooltip-text black top">${result.l}</div></div>`

//     function getLang() {
//       if (navigator.languages) return navigator.languages[0];
//       else return "fr-FR";

//     }
//     function getDate() {
//       let r;
//       const long = date.toLocaleDateString(locale, { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' }) + " " + date.toLocaleString(locale, { hour: 'numeric', minute: 'numeric', hour12: true }).replaceAll(" PM", "").replaceAll(" AM", ""),
//         short = date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) + " " + date.toLocaleString(locale, { hour: 'numeric', minute: 'numeric', hour12: true }).replaceAll(" PM", "").replaceAll(" AM", "");
//       r = short;
//       if (mode) {
//         if (mode === "R") r = modeR();
//         else if (mode === "t") r = date.toLocaleString(locale, { hour: 'numeric', minute: 'numeric', hour12: true });
//         else if (mode === "T") r = date.toLocaleTimeString(locale);
//         else if (mode === "d") r = date.toLocaleDateString(locale);
//         else if (mode === "D") r = date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
//         // else if (mode === "f") r = short;
//         else if (mode === "F") r = long;
//       };
//       return {
//         r: r.replaceAll(" PM", "").replaceAll(" AM", ""),
//         l: long
//       }
//     }
//     function modeR() {
//       const msPerMinute = 60 * 1000, msPerHour = msPerMinute * 60, msPerDay = msPerHour * 24, msPerMonth = msPerDay * 30, msPerYear = msPerDay * 365;
//       let timeSince = Date.now() - date.getTime();
//       if (timeSince < 0) {
//         timeSince = timeSince * -1;
//         if (timeSince < msPerMinute) {
//           if (timeSince / 1000 == 1) { return "dans une seconde"; }
//           return 'dans ' + Math.round(timeSince / 1000) + ' secondes';
//         } else if (timeSince < msPerHour) {
//           if (timeSince / msPerMinute == 1) { return "dans une minute"; }
//           return 'dans ' + Math.round(timeSince / msPerMinute) + ' minutes';
//         } else if (timeSince < msPerDay) {
//           if (timeSince / msPerHour == 1) { return "dans une heure"; }
//           return 'dans ' + Math.round(timeSince / msPerHour) + ' heures';
//         } else if (timeSince < msPerMonth) {
//           if (timeSince / msPerDay == 1) { return "dans un jour"; }
//           return 'dans ' + Math.round(timeSince / msPerDay) + ' jours';
//         } else if (timeSince < msPerYear) {
//           if (timeSince / msPerMonth == 1) { return "dans un mois"; }
//           return 'dans ' + Math.round(timeSince / msPerMonth) + ' moos';
//         } else {
//           if (timeSince / msPerYear == 1) { return "dans un an"; }
//           return 'dans ' + Math.round(timeSince / msPerYear) + ' ans';
//         }
//       } else {
//         if (timeSince < msPerMinute) {
//           if (timeSince / 1000 == 1) { return "il y a une seconde"; }
//           return "il y a " + Math.round(timeSince / 1000) + ' secondes';
//         } else if (timeSince < msPerHour) {
//           if (timeSince / msPerMinute == 1) { return "il y a une minute"; }
//           return "il y a " + Math.round(timeSince / msPerMinute) + ' minutes';
//         } else if (timeSince < msPerDay) {
//           if (timeSince / msPerHour == 1) { return "il y a une heure"; }
//           return "il y a " + Math.round(timeSince / msPerHour) + ' heures';
//         } else if (timeSince < msPerMonth) {
//           if (timeSince / msPerDay == 1) { return "il y a un jour"; }
//           return "il y a " + Math.round(timeSince / msPerDay) + ' jours';
//         } else if (timeSince < msPerYear) {
//           if (timeSince / msPerMonth == 1) { return "il y a un mois"; }
//           return "il y a " + Math.round(timeSince / msPerMonth) + ' mois';
//         } else {
//           if (timeSince / msPerYear == 1) { return "il y a un an"; }
//           return "il y a " + Math.round(timeSince / msPerYear) + ' ans';
//         }
//       }
//     }
//   }