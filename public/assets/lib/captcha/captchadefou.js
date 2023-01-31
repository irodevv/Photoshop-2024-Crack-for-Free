; (function () {
	var opts = {
		imgurl: '',
		clipWidth: 50,
		clipHeight: 50,
		clipBorderColor: '#f1f1f1',
		precision: 5,
		onSuccess: null,
		onError: null,
		eventinfo: {
			flag: false,
			left: 0,
			clipleft: 0,
			currentX: 0
		}
	}

	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}

	function createCaptchaBox(canvas) {
		var captchaBox = document.createElement('div');
		captchaBox.className = "captcha-box";
		captchaBox.style.width = canvas.width + 'px';

		var canvasBox = document.createElement('div');
		canvasBox.className = "canvas-box";
		canvasBox.appendChild(canvas.cloneNode(true));
		canvasBox.appendChild(createResult());

		captchaBox.appendChild(canvasBox);
		captchaBox.appendChild(createDragBar());
		canvas.parentNode.replaceChild(captchaBox, canvas);
		return captchaBox;
	}

	function createDragBar() {
		var dragbar = document.createElement('div');
		dragbar.className = "captcha-dragbar";
		dragbar.innerHTML = `
			<div class="drag-track"></div>
			<div id="drag-slider" class="drag-slider"></div>
			<div class="drag-btn">
				<i id="drag-btn-close" class="close"></i>
				<i id="drag-btn-refresh" class="refresh"></i>
			</div>
		`;
		return dragbar;
	}

	function createResult() {
		var result = document.createElement('div');
		result.id = 'captcha-result';
		result.className = "captcha-result";
		return result;
	}

	function createCanvas(w, h) {
		var canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;
		return canvas;
	}

	function clipPath(ctx, startx, starty) {
		startx = startx + 0.2;
		starty = starty + 0.2;

		var subw = parseInt((opts.clipWidth - 1) / 6),
			subh = parseInt((opts.clipHeight - 1) / 6),
			radius = Math.min(subw, subh),
			clipw = subw * 5 + 0.5,
			cliph = subh * 5 + 0.5;

		ctx.beginPath()
		ctx.moveTo(startx, starty);
		ctx.lineTo(startx + clipw, starty);
		ctx.lineTo(startx + clipw, starty + parseInt(cliph / 2) - radius);
		ctx.arc(startx + clipw, starty + parseInt(cliph / 2), radius, -Math.PI / 2, Math.PI / 2, false);
		ctx.lineTo(startx + clipw, starty + cliph);
		ctx.lineTo(startx + clipw - (parseInt(clipw / 2) - radius), starty + cliph);
		ctx.arc(startx + parseInt(clipw / 2), starty + cliph, radius, 0, Math.PI, false);
		ctx.lineTo(startx, starty + cliph);
		ctx.lineTo(startx, starty);
		ctx.closePath();
	}

	function fillClip(canvas, startx, starty, alpha) {
		var ctx = canvas.getContext('2d')
		clipPath(ctx, startx, starty);

		ctx.fillStyle = "rgba(0,0,0, " + alpha + ")";
		ctx.fill();
	}

	function strokeClip(canvas, startx, starty) {
		var ctx = canvas.getContext('2d');
		clipPath(ctx, startx, starty);

		ctx.strokeStyle = opts.clipBorderColor;
		ctx.stroke();
	}

	function randomNum(min, max) {
		var rangeNum = max - min;
		var num = min + Math.round(Math.random() * rangeNum);
		return num;
	}

	function getStartPoint(w, h) {
		var padding = 0,
			startw = opts.clipWidth + padding,
			starth = opts.clipHeight + padding;
		if (w < startw * 2 || h < starth) return;

		var startPoint = {
			startx: randomNum(startw, w - startw),
			starty: randomNum(padding, h - starth)
		};
		return startPoint;
	}

	function eventInit(startx, obj) {
		var slider = document.getElementById('drag-slider'),
			clipcanvas = document.getElementById('captcha-clipcanvas'),
			result = document.getElementById('captcha-result'),
			refreshbtn = document.querySelector("#drag-btn-refresh"),
			closebtn = document.querySelector("#drag-btn-close"),
			resultClass = result.className;

		opts.eventinfo.left = parseFloat(getComputedStyle(slider, null).getPropertyValue('left'));
		opts.eventinfo.clipleft = parseFloat(getComputedStyle(clipcanvas, null).getPropertyValue('left'));

		var close = function () {

		}
		var reset = function () {
			var boxClassName = window.captchaBox.className;

			window.captchaBox.className += ' shake';

			setTimeout(function () {
				slider.style.left = "10px";
				clipcanvas.style.left = "10px";

				opts.eventinfo.left = 10;
				opts.eventinfo.clipleft = 10;
			}, 500)
			setTimeout(function () {
				result.className = resultClass;
				window.captchaBox.className = boxClassName;
			}, 1500)
		}
		var clearCaptcha = () => {
			clearC(obj.ctx);
			clearC(obj.ctx1);
			clearC(obj.ctx2);
			refreshbtn.removeEventListener("click", (ev) => opts.onBtnRefresh(clearCaptcha));
			closebtn.removeEventListener("click", opts.onBtnClose);
			slider.removeEventListener("touchstart", moveStart);
			slider.removeEventListener("mousedown", moveStart);
			document.removeEventListener("touchmove", move);
			document.removeEventListener("mousemove", move);
			document.removeEventListener('touchend', moveEnd)
			document.removeEventListener('mouseup', moveEnd)

			return window.captchaBox
			function clearC(ctx) {
				ctx.save();
				ctx.globalCompositeOperation = 'copy';
				ctx.strokeStyle = 'transparent';
				ctx.beginPath();
				ctx.lineTo(0, 0);
				ctx.stroke();
				ctx.restore();
			}
		}
		var moveStart = function (e) {
			opts.eventinfo.flag = true;
			if (e.touches) {
				opts.eventinfo.currentX = e.touches[0].clientX;
			} else {
				opts.eventinfo.currentX = e.clientX;
			}
		}
		var move = function (e) {
			if (opts.eventinfo.flag) {
				if (e.touches) {
					var disX = e.touches[0].clientX - opts.eventinfo.currentX;
				} else {
					var disX = e.clientX - opts.eventinfo.currentX;
				}

				var distSliderLeft = opts.eventinfo.left + disX;
				var distClipLeft = opts.eventinfo.clipleft + disX;

				// 判断拼图是否超出画布范围
				if (10 <= distSliderLeft && distSliderLeft <= (opts.canvasWidth - opts.clipWidth)) {
					slider.style.left = distSliderLeft + "px";
					clipcanvas.style.left = distClipLeft + "px";
				}

				if (e.preventDefault) e.preventDefault();
				return false;
			}
		}
		var moveEnd = function (e) {
			if (opts.eventinfo.flag) {
				opts.eventinfo.flag = false;
				opts.eventinfo.left = parseFloat(getComputedStyle(slider, null).getPropertyValue('left'));
				opts.eventinfo.clipleft = parseFloat(getComputedStyle(clipcanvas, null).getPropertyValue('left'));

				if (Math.abs(startx - opts.eventinfo.left) <= opts.precision) {
					result.innerHTML = 'Captcha réussi';
					result.className = resultClass + ' success';
					opts.onSuccess && opts.onSuccess(clearCaptcha);
				} else {
					result.innerHTML = 'Captcha échouer';
					result.className = resultClass + ' fail';

					reset();
					opts.onError && opts.onError();
				}
			}
		}
		

		refreshbtn.addEventListener("click", (ev) => opts.onBtnRefresh(clearCaptcha));
		closebtn.addEventListener("click", opts.onBtnClose);
		slider.addEventListener("touchstart", moveStart);
		slider.addEventListener("mousedown", moveStart);
		document.addEventListener("touchmove", move);
		document.addEventListener("mousemove", move);
		document.addEventListener('touchend', moveEnd)
		document.addEventListener('mouseup', moveEnd)
	}

	var imgCaptcha = function (canvas, options) {
		for (var k in options) {
			if (options.hasOwnProperty(k)) {
				opts[k] = options[k];
			}
		}

		if (!canvas || !opts.imgurl) {
			console.error("verify params is error");
			return;
		}
		if (typeof canvas === 'string') canvas = document.getElementById(canvas);
		if (canvas.tagName !== 'CANVAS') {
			console.error("param canvas must be canvas");
			return;
		}

		window.captchaBox = createCaptchaBox(canvas);
		canvas = captchaBox.children[0].children[0];
		canvas.className += canvas.className + ' captcha-bg';

		var img = new Image();
		img.onload = function () {
			var w = canvas.width,
				h = canvas.height;

			opts['canvasWidth'] = w;
			opts['canvasHeight'] = h;

			var startPoint = getStartPoint(w, h)
			if (!startPoint) {
				console.error("can not get the start point");
				return
			}
			var startx = startPoint.startx,
				starty = startPoint.starty;

			canvas.getContext('2d').drawImage(img, 0, 0, w, h);
			fillClip(canvas, startx, starty, 0.7);

			var sourceCanvas = createCanvas(w, h);
			var sctx = sourceCanvas.getContext('2d');
			sctx.drawImage(img, 0, 0, w, h);
			sctx.globalCompositeOperation = 'destination-in';

			var destCanvas = createCanvas(opts.clipWidth, opts.clipHeight);
			fillClip(destCanvas, 0, 0, 1);

			sctx.drawImage(destCanvas, startx, starty);

			var clipCanvas = createCanvas(opts.clipWidth, opts.clipHeight);
			clipCanvas.id = 'captcha-clipcanvas';
			clipCanvas.className = 'captcha-clipcanvas';
			clipCanvas.getContext('2d').putImageData(sctx.getImageData(startx, starty, opts.clipWidth, opts.clipHeight), 0, 0);

			strokeClip(clipCanvas, 0, 0);

			clipCanvas.style.top = starty + 'px';
			captchaBox.appendChild(clipCanvas);

			const obj = {
				ctx: canvas.getContext('2d'),
				ctx1: sctx,
				ctx2: clipCanvas.getContext('2d'),

				canvas: sourceCanvas,
				canvas1: destCanvas,
				canavs2: clipCanvas
			};
			eventInit(startx, obj);
		}

		opts.imgurl = isArray(opts.imgurl) ? opts.imgurl : [opts.imgurl];

		var urlIndex = Math.floor(Math.random() * opts.imgurl.length);
		img.src = opts.imgurl[urlIndex];
	}


	if (typeof exports == "object") {
		module.exports = imgCaptcha
	} else if (typeof define == "function" && define.amd) {
		define([], function () {
			return imgCaptcha
		})
	} else if (window) {
		window.imgCaptcha = imgCaptcha
	}
})()