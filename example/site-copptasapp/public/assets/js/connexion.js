const
    go = document.querySelector("#go"),
    pseudo = document.querySelector("#pseudo"),
    mdp = document.querySelector("#mdp"),

    myModal = document.querySelector("#myModal"),
    canvasp = myModal.querySelector("p"),
    loadingSpin = document.querySelector(".loading");


let loginyes, discord, img, captchaon;

if (window.location.href.includes("/connexion")) loginyes = true;
if (window.location.href.includes("/discord/bot")) {
    discord = window.location.href.split("/login/")[1];
    loginyes = true
};
console.log(discord);
if (loginyes) {
    const expire = window.location.href.split("?u=")[1];
    if (expire) {
        new Toast({
            message: "Votre session a expirée, veuillez vous re-connectez.",
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
};

img = imgBase64("https://unsplash.it/1800/1200?random");

go.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (!captchaon && img) {
        newCaptcha();
        captchaon = true
    };
    myModal.style.display = "flex";
})

window.onclick = function (event) {
    if (event.target == myModal) {
        myModal.style.display = "none";
    }
}
function newCaptcha() {
    // loadingSpin.style.display = "none";
    img.then(e => {
        const captchaYES = imgCaptcha('canvas', {
            imgurl: [e],
            onSuccess: async function (clearCaptcha) {
                goo(clearCaptcha);
            },
            onError: function () {
                console.log("error");
            },
            onBtnRefresh: function (clearCaptcha) {
                // loadingSpin.style.display = "flex";
                img = imgBase64("https://unsplash.it/1800/1200?random");
                const c = clearCaptcha();
                canvasp.innerHTML = `<canvas id="canvas"></canvas>`;
                setTimeout(() => {
                    newCaptcha();
                }, 500);
            },
            onBtnClose: function () {
                myModal.style.display = "none";
            }
        });
    });

}
async function goo(clearCaptcha) {
    let
        u = "/connexion",
        m = "Aucun compte trouvé, vérifier le pseudo ou le mot de passe !";
    if (!loginyes) {
        u = "/inscription";
        m = "Vous avez déjà un compte de crée !";
    };
    const
        ip = await getIp(),
        datao = {
            discord: discord,
            u: pseudo.value.trim(),
            m: mdp.value.trim(),
            ip: ip
        };
    const resetC = () => {
        img = imgBase64("https://unsplash.it/1800/1200?random");
        const c = clearCaptcha();
        canvasp.innerHTML = `<canvas id="canvas"></canvas>`;
        setTimeout(() => {
            newCaptcha();
        }, 500);
    };
    const data = await sendData(u, datao);
    if (data == "2") {
        myModal.style.display = "none";
        new Toast({
            message: m,
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
        resetC()
    } else if (data == "1") {
        if (discord) window.location.href = `/discord/bot/loginsuccess/${discord}`;
        else window.location.href = "/browse"
    } else {
        myModal.style.display = "none";
        new Toast({
            message: `Une erreur est survenue. [${data}]`,
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
        resetC()
    }
}

function imgBase64(url) {
    return new Promise(resolve => {
        toDataURL(url, {
            callback: function (err, data) {
                resolve(!err ? data : `data:image/png;base64,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`)

                // > data:image/png;base64,iVBORw0KGgo...
            }
        })
    });
    function clean() {
        var i, len;
        var args = [].slice.call(arguments, 0);
        for (i = 0, len = args.length; i < len; i++) {
            args[i] = null;
        }
    }

    function once(func) {
        var ran, result;
        return function () {
            if (ran) {
                return result;
            }
            ran = true;
            result = func.apply(this, arguments);
            func = null;
            return result;
        };
    }

    function cors(img) {
        img.crossOrigin = 'anonymous';
    }

    function isImage(value) {
        return value && (value.nodeName || '').toLowerCase() === 'img' || false;
    }

    function createImage(src, callback) {
        var img = new Image();
        var cb = once(callback);
        img.onload = function () {
            return cb(null, img);
        };
        img.onerror = function () {
            return cb(new Error('fail to load image file'));
        };
        cors(img);
        img.src = src;
        if (img.complete) {
            return cb(null, img);
        }
    }

    function convert(elem, width, height) {
        var canvas, context, result;
        width = width || elem.width;
        height = height || elem.height;
        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        context.drawImage(elem, 0, 0, width, height);
        result = canvas.toDataURL();
        clean(canvas, context);
        return result;
    }

    function purify(str) {
        return str.replace(/^data:image\/(png|jpg);base64,/, '');
    }

    /**
     * toDataURL
     * @param  {Image|String} image
     * @param  {Object} options
     * @return {null|String}
     *
     * Options:
     *   
     *   - `width` {Number=0}
     *   - `height` {Number=0}
     *   - `purify` {Boolean=false}
     *   - `callback` {Function}
     *
     * Callback:
     *
     *   - `err`
     *   - `data`
     * 
     */
    function toDataURL(image, options) {
        var src = '';
        var async, callback;

        options = options || {};

        async = typeof options.callback === 'function';

        callback = async ? options.callback : function (err, data) {
            if (err) {
                throw err;
            }
            return data;
        };

        function _convert(err, img) {
            if (err) {
                return callback(err);
            }
            var result;
            cors(img);
            result = convert(img, options.width, options.height);
            return callback(null, (options.purify ? purify(result) : result));
        }

        if (isImage(image)) {
            src = image.src || '';
        } else if (typeof image === 'string') {
            if (!async) {
                return callback(new Error('the url mode should be called with a callback'));
            }
            src = image;
        } else {
            return callback(new Error('image should be an Image Object or a string'));
        }

        return async ? createImage(src, _convert) : _convert(null, image);
    }


}