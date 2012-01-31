
(function(win){

/**
 * @name Quark
 * @class QuarkJS框架的全局对象，也是框架内部所有类的命名空间。
 */
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
		if(!strict || obj.hasOwnProperty(key) || obj[key] !== undefined) obj[key] = props[key];
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
	ns.supportCanvas = document.createElement("canvas").getContext != null;
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
 * Constants
 */
Quark.DEG_TO_RAD = Math.PI / 180;
Quark.RAD_TO_DEG = 180 / Math.PI;

/**
 * 检测显示对象obj是否与点x，y发生了碰撞。
 */
Quark.hitTestPoint = function(obj, x, y, usePolyCollision)
{
	var b = obj.getBounds(), len = b.length;
	var hit = x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
	
	if(hit && usePolyCollision)
	{
		var cross = 0, onBorder = false, minX, maxX, minY, maxY;		
		for(var i = 0; i < len; i++)
		{
			var p1 = b[i], p2 = b[(i+1)%len];			
			
			if(p1.y == p2.y && y == p1.y)
			{
				p1.x > p2.x ? (minX = p2.x, maxX = p1.x) : (minX = p1.x, maxX = p2.x);
				if(x >= minX && x <= maxX)
				{
					onBorder = true;
					continue;
				}
			}
			
			p1.y > p2.y ? (minY = p2.y, maxY = p1.y) : (minY = p1.y, maxY = p2.y);
			if(y < minY || y > maxY) continue;
			
			var nx = (y - p1.y)*(p2.x - p1.x) / (p2.y - p1.y) + p1.x;
			if(nx > x) cross++;
			else if(nx == x) onBorder = true;			
		}
		
		if(onBorder) return 0;
		else if(cross % 2 == 1) return 1;
		return -1;
	}
	return hit ? 1 : -1;
};

/**
 * 检测显示对象obj1和obj2是否发生了碰撞。
 */
Quark.hitTestObject = function(obj1, obj2, usePolyCollision)
{
	var b1 = obj1.getBounds(), b2 = obj2.getBounds();
	var hit = b1.x <= b2.x + b2.width && b2.x <= b1.x + b1.width && 
				   b1.y <= b2.y + b2.height && b2.y <= b1.y + b1.height;
	
	if(hit && usePolyCollision)
	{
		hit = Quark.polygonCollision(b2, b2);
		return hit !== false;
	}
	return hit;
};

/**
 * 采用Separating Axis Theorem(SAT)的多边形碰撞检测方法。
 * poly1,poly2是多边形顶点组成的数组。如[{x:0, y:0}, {x:10, y:0}, {x:10, y:10}, {x:0, y:10}]
 */
Quark.polygonCollision = function(poly1, poly2)
{	
	var result = doSATCheck(poly1, poly2, {overlap:-Infinity, normal:{x:0, y:0}});
	if(result) return doSATCheck(poly2, poly1, result);
	return false;
};

function doSATCheck(poly1, poly2, result)
{
	var len1 = poly1.length, len2 = poly2.length, currentPoint, nextPoint, distance, min1, max1, min2, max2, dot, overlap, normal = {x:0, y:0};
	
	for(var i = 0; i < len1; i++)
	{
		currentPoint = poly1[i];
		nextPoint = poly1[(i < len1-1 ? i+1 : 0)];
		
		normal.x = currentPoint.y - nextPoint.y;
		normal.y = nextPoint.x - currentPoint.x;
		
		distance = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
		normal.x /= distance;
		normal.y /= distance;
		
		min1 = max1 = poly1[0].x * normal.x + poly1[0].y * normal.y;		
		for(var j = 1; j < len1; j++)
		{
			dot = poly1[j].x * normal.x + poly1[j].y * normal.y;
			if(dot > max1) max1 = dot;
			else if(dot < min1) min1 = dot;
		}
		
		min2 = max2 = poly2[0].x * normal.x + poly2[0].y * normal.y;		
		for(j = 1; j < len2; j++)
		{
			dot = poly2[j].x * normal.x + poly2[j].y * normal.y;
			if(dot > max2) max2 = dot;
			else if(dot < min2) min2 = dot;
		}
		
		if(min1 < min2)
		{
			overlap = min2 - max1;
			normal.x = -normal.x;
			normal.y = -normal.y;
		}else
		{
			overlap = min1 - max2;
		}
		
		if(overlap >= 0)
		{
			return false;
		}else if(overlap > result.overlap)
		{
			result.overlap = overlap;
			result.normal.x = normal.x;
			result.normal.y = normal.y;
		}
	}
	
	return result;
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