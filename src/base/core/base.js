
(function(win){

var Quark = win.Quark = win.Quark || 
{
	version: "1.0.0",
	global: win
};

/**
 * Quark框架的继承方法。
 */
var emptyConstructor = function() {};
Quark.inherit = function(childClass, parentClass) 
{
  	emptyConstructor.prototype = parentClass.prototype;
  	childClass.superClass = parentClass.prototype;
  	childClass.prototype = new emptyConstructor();
  	childClass.prototype.constructor = childClass;
  	//Quark.merge(childClass.prototype, parentClass.prototype);
};

/**
 * 把props参数指定的属性或方法复制到obj对象上。
 */
Quark.merge = function(obj, props, strict)
{
	for(var key in props)
	{
		if(!strict || obj.hasOwnProperty(key)) obj[key] = props[key];
	}
	return obj;
};

/**
 * 改变func函数的作用域scope，即this的指向。
 */
Quark.delegate = function(func, self)
{
	var context = self || win;
  	if (arguments.length > 2) 
  	{
    	var args = Array.prototype.slice.call(arguments, 2);    	
    	return function() 
    	{
      		var newArgs = Array.prototype.concat.apply(args, arguments);
      		return func.apply(context, newArgs);
    	};
  	}else 
  	{
    	return function() {return func.apply(context, arguments);};
  	}
};

/**
 * 根据id获得DOM对象。
 */
Quark.getDOM = function(id)
{
	return document.getElementById(id);
};

/**
 * 创建一个指定类型type和属性props的DOM对象。
 */
Quark.createDOM = function(type, props)
{
	var dom = document.createElement(type);
	for(var p in props) 
	{
		var val = props[p];
		if(p == "style")
		{
			for(var s in val) dom.style[s] = val[s];
		}else
		{
			dom[p] = val;
		}
	}
	return dom;
};

/**
 * 根据限定名称返回一个命名空间（从global开始）。如：Quark.use('quark.test')。
 */
Quark.use = function(name)
{
	var parts = name.split("."), obj = win;
	for(var i = 0; i < parts.length; i++)
	{
		var p = parts[i];
		obj = obj[p] || (obj[p] = {});
	}
	return obj;
};
		
/**
 * 浏览器的特性的简单检测，并非精确判断。
 */
function detectBrowser(ns)
{
	var ua = ns.ua = navigator.userAgent;		
	ns.isWebKit = (/webkit/i).test(ua);
	ns.isMozilla = (/mozilla/i).test(ua);	
	ns.isIE = (/msie/i).test(ua);
	ns.isFirefox = (/firefox/i).test(ua);
	ns.isChrome = (/chrome/i).test(ua);
	ns.isSafari = (/safari/i).test(ua) && !this.isChrome;
	ns.isMobile = (/mobile/i).test(ua);
	ns.isOpera = (/opera/i).test(ua);
	ns.isIOS = (/ios/i).test(ua);
	ns.isIpad = (/ipad/i).test(ua);
	ns.isIpod = (/ipod/i).test(ua);
	ns.isIphone = (/iphone/i).test(ua) && !this.isIpod;
	ns.isAndroid = (/android/i).test(ua);
	ns.supportStorage = "localStorage" in win;
	ns.supportOrientation = "orientation" in win;
	ns.supportDeviceMotion = "ondevicemotion" in win;
	ns.supportTouch = "ontouchstart" in win;
	ns.cssPrefix = ns.isWebKit ? "webkit" : ns.isFirefox ? "Moz" : ns.isOpera ? "O" : ns.isIE ? "ms" : "";
};

detectBrowser(Quark);

/**
 * 获取某个DOM元素在页面中的位置偏移量。
 */
Quark.getElementOffset = function(elem)
{
	var left = elem.offsetLeft, top = elem.offsetTop;
	while((elem = elem.offsetParent) && elem != document.body && elem != document)
	{
		left += elem.offsetLeft;
		top += elem.offsetTop;
	}
	return {left:left, top:top};
};

/**
 * 创建一个可渲染的DOM，可指定tagName，如canvas或div。
 * disObj是一个DisplayObject或类似的对象，imageObj指定渲染的image及相关设置，如绘制区域rect。
 */
Quark.createDOMDrawable = function(disObj, imageObj)
{
	var tag = disObj.tagName || "div";
	var img = imageObj.image;
	var w = disObj.width || (img && img.width);
	var h =  disObj.height || (img && img.height);

	var elem = Quark.createDOM(tag);
	if(disObj.id) elem.id = disObj.id;
	elem.style.position = "absolute";
	elem.style.left = (disObj.left || 0) + "px";
	elem.style.top = (disObj.top || 0) + "px";
	elem.style.width = w + "px";
	elem.style.height = h + "px";

	if(tag == "canvas")
	{
		elem.width = w;
		elem.height = h;
		if(img)
		{
			var ctx = elem.getContext("2d");
			var rect = imageObj.rect || [0, 0, w, h];		
			ctx.drawImage(img, rect[0], rect[1], rect[2], rect[3], 
						 (disObj.x || 0), (disObj.y || 0), 
						 (disObj.width || rect[2]), 
						 (disObj.height || rect[3]));
		}
	}else
	{
		elem.style.opacity = disObj.alpha != undefined ? disObj.alpha : 1;
		elem.style.overflow = "hidden";
		if(img && img.src)
		{
			elem.style.backgroundImage = "url(" + img.src + ")";
			var bgX = disObj.rectX || 0, bgY = disObj.rectY || 0;
			elem.style.backgroundPosition = (-bgX) + "px " + (-bgY) + "px";
		}
	}
	return elem;
};

/**
 * 返回Quark的字符串表示形式。
 */
Quark.toString = function()
{
	return "Quark";
};

/**
 * 简单的log方法，同console.log作用相同。
 */
Quark.trace = function()
{
	var logs = Array.prototype.slice.call(arguments);
	if(typeof(console) != "undefined" && typeof(console.log) != "undefined") console.log(logs.join(" "));
};

/**
 * 默认的全局namespace为Quark或Q（当Q没有被占据的情况下）。
 */
if(win.Q == undefined) win.Q = Quark;
if(win.trace == undefined) win.trace = Quark.trace;
	
})(window);