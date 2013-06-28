/*
Quark 1.0.0 (build 121)
Licensed under the MIT License.
http://github.com/quark-dev-team/quarkjs
*/


(function(win){

/**
 * Quark不是构造函数。
 * @name Quark
 * @class Quark是QuarkJS框架的全局对象，也是框架内部所有类的全局命名空间。在全局Q未被占用的情况下，也可以使用其缩写Q。
 */
var Quark = win.Quark = win.Quark || 
{
	global: win
};


var emptyConstructor = function() {};
/**
 * Quark框架的继承方法。
 * @param {Function} childClass 子类。
 * @param {Function} parentClass 父类。
 */
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
 * @param {Object} obj Object对象。
 * @param {Object} props 包含要复制到obj对象上的属性或方法的对象。
 * @param {Boolean} strict 指定是否采用严格模式复制。默认为false。
 * @return {Object} 复制后的obj对象。
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
 * @param {Function} func 要改变函数作用域的函数。
 * @param {Object} self 指定func函数的作用对象。
 * @return {Function} 一个作用域为参数self的功能与func相同的新函数。
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
 * @param {String} id DOM对象的id。
 * @return {HTMLElement} DOM对象。
 */
Quark.getDOM = function(id)
{
	return document.getElementById(id);
};

/**
 * 创建一个指定类型type和属性props的DOM对象。
 * @param {String} type 指定DOM的类型。比如canvas，div等。
 * @param {Object} props 指定生成的DOM的属性对象。
 * @return {HTMLElement} 新生成的DOM对象。
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
 * 根据限定名称返回一个命名空间（从global开始）。如：Quark.use('Quark.test')。
 * @param {String} 指定新的命名空间的名称。如Quark.test等。
 * @return {Object} 参数name指定的命名空间对象。
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
 * 获取某个DOM元素在页面中的位置偏移量。格式为:{left: leftValue, top: topValue}。
 * @param {HTMLElement} elem DOM元素。
 * @return {Object} 指定DOM元素在页面中的位置偏移。格式为:{left: leftValue, top: topValue}。
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
 * @param {Object} disObj 一个DisplayObject或类似的对象。
 * @param {Object} imageObj 指定渲染的image及相关设置，如绘制区域rect。
 * @return {HTMLElement} 新创建的DOM对象。
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
 * 角度转弧度常量。
 */
Quark.DEG_TO_RAD = Math.PI / 180;

/**
 * 弧度转角度常量。
 */
Quark.RAD_TO_DEG = 180 / Math.PI;

/**
 * 检测显示对象obj是否与点x，y发生了碰撞。
 * @param {DisplayObject} obj 要检测的显示对象。
 * @param {Number} x 指定碰撞点的x坐标。
 * @param {Number} y 指定碰撞点的y坐标。
 * @param {Boolean} usePolyCollision 指定是否采用多边形碰撞。默认为false。
 * @return {Number} 如果点x，y在对象obj内为1，在外为-1，在边上为0。
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
 * @param {DisplayObject} obj1 要检测的显示对象。
 * @param {DisplayObject} obj2 要检测的显示对象。
 * @param {Boolean} usePolyCollision 指定是否采用多边形碰撞。默认为false。
 * @return {Boolean} 发生碰撞为true，否则为false。
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
 * @private
 * @param {Array} poly1 多边形顶点组成的数组。格式如：[{x:0, y:0}, {x:10, y:0}, {x:10, y:10}, {x:0, y:10}]。
 * @param {Array} poly2 多边形顶点组成的数组。格式与参数poly1相同。
 * @param {Boolean} 发生碰撞为true，否则为false。 
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
 * @return {String} Quark的字符串表示形式。
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



(function(){

var Matrix = Quark.Matrix = function(a, b, c, d, tx, ty)
{
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.tx = tx;
	this.ty = ty;
};

Matrix.prototype.concat = function(mtx)
{
	var a = this.a;
	var c = this.c;
	var tx = this.tx;
	
	this.a = a * mtx.a + this.b * mtx.c;
	this.b = a * mtx.b + this.b * mtx.d;
	this.c = c * mtx.a + this.d * mtx.c;
	this.d = c * mtx.b + this.d * mtx.d;
	this.tx = tx * mtx.a + this.ty * mtx.c + mtx.tx;
	this.ty = tx * mtx.b + this.ty * mtx.d + mtx.ty;
	return this;
};

Matrix.prototype.rotate = function(angle)
{
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	
	var a = this.a;
	var c = this.c;
	var tx = this.tx;
	
	this.a = a * cos - this.b * sin;
	this.b = a * sin + this.b * cos;
	this.c = c * cos - this.d * sin;
	this.d = c * sin + this.d * cos;
	this.tx = tx * cos - this.ty * sin;
	this.ty = tx * sin + this.ty * cos;
	return this;
};

Matrix.prototype.scale = function(sx, sy)
{
	this.a *= sx;
	this.d *= sy;
	this.tx *= sx;
	this.ty *= sy;
	return this;
};

Matrix.prototype.translate = function(dx, dy)
{
	this.tx += dx;
	this.ty += dy;
	return this;
};

Matrix.prototype.identity = function()
{
	this.a = this.d = 1;
	this.b = this.c = this.tx = this.ty = 0;
	return this;
};

Matrix.prototype.invert = function()
{
	var a = this.a;
	var b = this.b;
	var c = this.c;
	var d = this.d;
	var tx = this.tx;
	var i = a * d - b * c;
	
	this.a = d / i;
	this.b = -b / i;
	this.c = -c / i;
	this.d = a / i;
	this.tx = (c * this.ty - d * tx) / i;
	this.ty = -(a * this.ty - b * tx) / i;
	return this;
};

Matrix.prototype.transformPoint = function(point, round, returnNew)
{
	var x = point.x * this.a + point.y * this.c + this.tx;
	var y =	point.x * this.b + point.y * this.d + this.ty;
	if(round)
	{
		x = x + 0.5 >> 0;
		y = y + 0.5 >> 0;
	}
	if(returnNew) return {x:x, y:y};
	point.x = x;
	point.y = y;
	return point;
};

Matrix.prototype.clone = function()
{
	return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

Matrix.prototype.toString = function()
{
	return "(a="+this.a+", b="+this.b+", c="+this.c+", d="+this.d+", tx="+this.tx+", ty="+this.ty+")";
};

})();



(function(){

var Rectangle = Quark.Rectangle = function(x, y, width, height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};

Rectangle.prototype.intersects = function(rect)
{
	return (this.x <= rect.x + rect.width && rect.x <= this.x + this.width &&
			this.y <= rect.y + rect.height && rect.y <= this.y + this.height);
};

Rectangle.prototype.intersection = function(rect)
{
	var x0 = Math.max(this.x, rect.x);
	var x1 = Math.min(this.x + this.width, rect.x + rect.width);

	if(x0 <= x1)
	{
		var y0 = Math.max(this.y, rect.y);
		var y1 = Math.min(this.y + this.height, rect.y + rect.height);

		if(y0 <= y1)
		{
			return new Rectangle(x0, y0, x1 - x0, y1 - y0);
		}
	}
	return null;
};

Rectangle.prototype.union = function(rect, returnNew)
{
 	var right = Math.max(this.x + this.width, rect.x + rect.width);
  	var bottom = Math.max(this.y + this.height, rect.y + rect.height);
	
  	var x = Math.min(this.x, rect.x);
 	var y = Math.min(this.y, rect.y);
  	var width = right - x;
  	var height = bottom - y;
  	if(returnNew) 
  	{
  		return new Rectangle(x, y, width, height);
  	}else
  	{
  		this.x = x;
  		this.y = y;
  		this.width = width;
  		this.height = height;
  	}
};

Rectangle.prototype.containsPoint = function(x, y)
{
	return (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height);
};

Rectangle.prototype.clone = function()
{
	return new Rectangle(this.x, this.y, this.width, this.height);	
};

Rectangle.prototype.toString = function()
{
	return "(x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";	
};

})();



(function(){

/**
 * 按钮Key的code映射表。
 */
Quark.KEY = {

	MOUSE_LEFT : 1,
	MOUSE_MID : 2,
	MOUSE_RIGHT : 3,

	BACKSPACE : 8,
	TAB : 9,
	NUM_CENTER : 12,
	ENTER : 13,
	RETURN : 13,
	SHIFT : 16,
	CTRL : 17,
	ALT : 18,
	PAUSE : 19,
	CAPS_LOCK : 20,
	ESC : 27,
	ESCAPE : 27,
	SPACE : 32,
	PAGE_UP : 33,
	PAGE_DOWN : 34,
	END : 35,
	HOME : 36,
	LEFT : 37,
	UP : 38,
	RIGHT : 39,
	DOWN : 40,
	PRINT_SCREEN : 44,
	INSERT : 45,
	DELETE : 46,

	ZERO : 48,
	ONE : 49,
	TWO : 50,
	THREE : 51,
	FOUR : 52,
	FIVE : 53,
	SIX : 54,
	SEVEN : 55,
	EIGHT : 56,
	NINE : 57,

	A : 65,
	B : 66,
	C : 67,
	D : 68,
	E : 69,
	F : 70,
	G : 71,
	H : 72,
	I : 73,
	J : 74,
	K : 75,
	L : 76,
	M : 77,
	N : 78,
	O : 79,
	P : 80,
	Q : 81,
	R : 82,
	S : 83,
	T : 84,
	U : 85,
	V : 86,
	W : 87,
	X : 88,
	Y : 89,
	Z : 90,

	CONTEXT_MENU : 93,
	NUM_ZERO : 96,
	NUM_ONE : 97,
	NUM_TWO : 98,
	NUM_THREE : 99,
	NUM_FOUR : 100,
	NUM_FIVE : 101,
	NUM_SIX : 102,
	NUM_SEVEN : 103,
	NUM_EIGHT : 104,
	NUM_NINE : 105,
	NUM_MULTIPLY : 106,
	NUM_PLUS : 107,
	NUM_MINUS : 109,
	NUM_PERIOD : 110,
	NUM_DIVISION : 111,
	F1 : 112,
	F2 : 113,
	F3 : 114,
	F4 : 115,
	F5 : 116,
	F6 : 117,
	F7 : 118,
	F8 : 119,
	F9 : 120,
	F10 : 121,
	F11 : 122,
	F12 : 123
};
	
})();



(function(){

/**
 * 构造函数.
 * @name EventManager
 * @class EventManager是一个简单的系统事件管理器。
 */
var EventManager = Quark.EventManager = function()
{
	this.keyState = {};
	this._evtHandlers = {};
};

/**
 * 注册Quark.Stage事件侦听，使得Stage能够接收和处理指定的事件。
 * @param stage Quark.Stage舞台对象。
 * @param events 要注册的事件类型数组。
 */
EventManager.prototype.registerStage = function(stage, events, preventDefault, stopPropagation)
{
	this.register(stage.context.canvas, events, {host:stage, func:stage.dispatchEvent}, preventDefault, stopPropagation);
};

/**
 * 删除Quark.Stage事件侦听。
 * @param stage Quark.Stage舞台对象。
 * @param events 要删除的事件类型数组。
 */
EventManager.prototype.unregisterStage = function(stage, events)
{
	this.unregister(stage.context.canvas, events, stage.dispatchEvent);
};

/**
 * 注册DOM事件侦听，当事件触发时调用callback函数。
 * @param target 事件目标DOM对象。
 * @param events 要注册事件类型数组。
 */
EventManager.prototype.register = function(target, events, callback, preventDefault, stopPropagation)
{
	if(callback == null || (typeof callback == "function")) callback = {host:null, func:callback};
	var params = {prevent:preventDefault, stop:stopPropagation};
	
	var me = this, handler = function(e){me._onEvent(e, params, callback);};
	
	for(var i = 0; i < events.length; i++)
	{
		var type = events[i], list = this._evtHandlers[type] || (this._evtHandlers[type] = []);
		for(var j = 0, has = false; j < list.length; j++)
		{
			var li = list[j];
			if(li.target == target && li.callback.func == callback.func) 
			{
				trace("duplicate callback");
				has = true;
				break;
			}
		}
		if(!has)
		{
			list.push({target:target, callback:callback, handler:handler});
			target.addEventListener(type, handler, false);
		}
	}
};

/**
 * 删除对象事件侦听。
 * @param target 事件目标DOM对象。
 * @param events 要删除的事件类型数组。
 */
EventManager.prototype.unregister = function(target, events, callback)
{
	for(var i = 0; i < events.length; i++)
	{
		var type = events[i], list = this._evtHandlers[type];
		for(var j = 0; j < list.length; j++)
		{
			var li = list[j];
			if(li.target == target && (li.callback.func == callback || callback == null))
			{
				target.removeEventListener(type, li.handler);
				list.splice(j, 1);
				break;
			}
		}
	}
};

/**
 * 内部事件处理器。
 * @private
 */
EventManager.prototype._onEvent = function(e, params, callback)
{	
	//correct touch events
    var ne = e, type = e.type, isTouch = e.type.indexOf("touch") == 0;
    if(isTouch)
    {
        ne = (e.touches && e.touches.length > 0) ? e.touches[0] : 
            (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : e;
        ne.type = type;
        ne.rawEvent = e;
    }
	
	if(type == "keydown" || type == "keyup" || type == "keypress")
	{
		this.keyState[e.keyCode] = type;
	}
	
	//e.eventTime = Date.now();
	
	if(callback.func != null) callback.func.call(callback.host, ne);
	
	EventManager.stop(e, !params.prevent, !params.stop);
};

/**
 * 停止事件。
 * @param e 要停止的事件对象。
 * @param continueDefault 是否继续事件的默认行为。
 * @param continuePropagation 是否继续事件的冒泡。
 */
EventManager.stop = function(e, continueDefault, continuePropagation)
{
	if(!continueDefault) e.preventDefault();
	if(!continuePropagation)
	{
		e.stopPropagation();
		if(e.stopImmediatePropagation) e.stopImmediatePropagation();
	}
};
	
})();



(function(){

/**
 * 构造函数.
 * @name EventDispatcher
 * @class EventDispatcher类是可调度事件的类的基类，它允许显示列表上的任何对象都是一个事件目标。
 */
var EventDispatcher = Quark.EventDispatcher = function()
{
	//事件映射表，格式为：{type1:[listener1, listener2], type2:[listener3, listener4]}
	this._eventMap = {};
};

/**
 * 注册事件侦听器对象，以使侦听器能够接收事件通知。
 */
EventDispatcher.prototype.addEventListener = function(type, listener)
{
	var map = this._eventMap[type];
    if(map == null) map = this._eventMap[type] = [];
    
    if(map.indexOf(listener) == -1)
    {
    	map.push(listener);
    	return true;
    }
    return false;
};

/**
 * 删除事件侦听器。
 */
EventDispatcher.prototype.removeEventListener = function(type, listener)
{
	if(arguments.length == 1) return this.removeEventListenerByType(type);

	var map = this._eventMap[type];
	if(map == null) return false;

	for(var i = 0; i < map.length; i++)
	{
		var li = map[i];
		if(li === listener)
		{
			map.splice(i, 1);
			if(map.length == 0) delete this._eventMap[type];
			return true;
		}
	}
	return false;
};

/**
 * 删除指定类型的所有事件侦听器。
 */
EventDispatcher.prototype.removeEventListenerByType = function(type)
{
	var map = this._eventMap[type];
    if(map != null)
	{
		delete this._eventMap[type];
		return true;
	}
	return false;
};

/**
 * 删除所有事件侦听器。
 */
EventDispatcher.prototype.removeAllEventListeners = function()
{	
	this._eventMap = {};
};

/**
 * 派发事件，调用事件侦听器。
 */
EventDispatcher.prototype.dispatchEvent = function(event)
{
	var map = this._eventMap[event.type];
	if(map == null) return false;	
	if(!event.target) event.target = this;
    map = map.slice();

	for(var i = 0; i < map.length; i++)
	{
		var listener = map[i];
		if(typeof(listener) == "function")
		{
			listener.call(this, event);
		}
	}
	return true;
};

/**
 * 检查是否为指定事件类型注册了任何侦听器。
 */
EventDispatcher.prototype.hasEventListener = function(type)
{
	var map = this._eventMap[type];
	return map != null && map.length > 0;
};

//添加若干的常用的快捷缩写方法
EventDispatcher.prototype.on = EventDispatcher.prototype.addEventListener;
EventDispatcher.prototype.un = EventDispatcher.prototype.removeEventListener;
EventDispatcher.prototype.fire = EventDispatcher.prototype.dispatchEvent;

})();



(function(){

/**
 * 构造函数.
 * @name Context
 * @class Context是Quark框架中显示对象结构的上下文，实现显示对象结构的渲染。此类为抽象类。
 * @param {Object} props 一个对象。包含以下属性：
 * <p>canvas - 渲染上下文所对应的画布。</p>
 */
var Context = Quark.Context = function(props)
{	
	if(props.canvas == null) throw "Quark.Context Error: canvas is required.";
	
	this.canvas = null;
	Quark.merge(this, props);
};

/**
 * 为开始绘制显示对象做准备，需要子类来实现。
 */
Context.prototype.startDraw = function(){ };

/**
 * 绘制显示对象，需要子类来实现。
 */
Context.prototype.draw = function(){ };

/**
 * 完成绘制显示对象后的处理方法，需要子类来实现。
 */
Context.prototype.endDraw = function(){ };

/**
 * 对显示对象进行变换，需要子类来实现。
 */
Context.prototype.transform = function(){ };

/**
 * 从画布中删除显示对象，需要子类来实现。
 * @param {DisplayObject} target 要删除的显示对象。
 */
Context.prototype.remove = function(target){ };

})();



(function(){

/**
 * 构造函数.
 * @name CanvasContext
 * @augments Context
 * @class CanvasContext是Canvas渲染上下文，将显示对象渲染到指定的Canvas上。
 * @param {Object} props 一个对象。包含以下属性：
 * <p>canvas - 渲染上下文所对应的canvas，HTMLCanvasElement对象。</p>
 */
var CanvasContext = Quark.CanvasContext = function(props)
{
	CanvasContext.superClass.constructor.call(this, props);
	this.context = this.canvas.getContext("2d");
};
Quark.inherit(CanvasContext, Quark.Context);

/**
 * 准备绘制，保存当前上下文。
 */
CanvasContext.prototype.startDraw = function()
{
	this.context.save();
};

/**
 * 绘制指定的显示对象到Canvas上。
 * @param {DisplayObject} target 要绘制的显示对象。
 */
CanvasContext.prototype.draw = function(target)
{
	//ignore children drawing if the parent has a mask.
	if(target.parent != null && target.parent.mask != null) return;
	
	if(target.mask != null)
	{
		//we implements the mask function by using 'source-in' composite operation.
		//so can't draw objects with masks into this canvas directly.
		var w = target.width, h = target.height;
		var context = Q._helpContext, canvas = context.canvas, ctx = context.context;
		canvas.width = 0;
		canvas.width = w;
		canvas.height = h;
		context.startDraw();
		target.mask._render(context);
		ctx.globalCompositeOperation = 'source-in';
		
		//this is a trick for ignoring mask drawing during object drawing.
		var mask = target.mask;
		target.mask = null;
		if(target instanceof Quark.DisplayObjectContainer)
		{
			//container's children should draw at once in 'source-in' mode.
			var cache = target._cache || Quark.cacheObject(target);
			ctx.drawImage(cache, 0, 0, w, h, 0, 0, w, h);
		}else
		{
			target.render(context);
		}
		context.endDraw();
		target.mask = mask;

		arguments[0] = canvas;
		this.context.drawImage.apply(this.context, arguments);
	}else if(target._cache != null)
	{
		//draw cache if exist
		this.context.drawImage(target._cache, 0, 0);
	}else if(target instanceof Quark.Graphics || target instanceof Quark.Text)
	{
		//special drawing
		target._draw(this.context);
	}else
	{
		//normal draw
		var img = target.getDrawable(this);
		if(img != null)
		{
			arguments[0] = img;
			this.context.drawImage.apply(this.context, arguments);	
		}
	}
};

/**
 * 绘制完毕，恢复上下文。
 */
CanvasContext.prototype.endDraw = function()
{
	this.context.restore();	
};

/**
 * 对指定的显示对象进行context属性设置或变换。
 * @param {DisplayObject} target 要进行属性设置或变换的显示对象。
 */
CanvasContext.prototype.transform = function(target)
{
	var ctx = this.context;
	
	if(target instanceof Q.Stage)
	{
		//Use style for stage scaling
		if(target._scaleX != target.scaleX)
		{
			target._scaleX = target.scaleX;
			this.canvas.style.width = target._scaleX * target.width + "px";
		}
		if(target._scaleY != target.scaleY)
		{
			target._scaleY = target.scaleY;
			this.canvas.style.height = target._scaleY * target.height + "px";
		}
	}else
	{
		if(target.x != 0 || target.y != 0) ctx.translate(target.x, target.y);
		if(target.rotation%360 != 0) ctx.rotate(target.rotation%360*Quark.DEG_TO_RAD);
		if(target.scaleX != 1 || target.scaleY != 1) ctx.scale(target.scaleX, target.scaleY);
		if(target.regX != 0 || target.regY != 0) ctx.translate(-target.regX, -target.regY);
	}
	
	if(target.alpha > 0) ctx.globalAlpha *= target.alpha;
};

/**
 * 清除画布上的指定区域内容。
 * @param {Number} x 指定区域的x轴坐标。
 * @param {Number} y 指定区域的y轴坐标。
 * @param {Number} width 指定区域的宽度。
 * @param {Number} height 指定区域的高度。
 */
CanvasContext.prototype.clear = function(x, y, width, height)
{
	this.context.clearRect(x, y, width, height);
	//this.canvas.width = this.canvas.width;
};

})();



(function(){

/**
 * 检测浏览器是否支持transform或transform3D。
 */
var testElem = document.createElement("div");
var supportTransform = testElem.style[Quark.cssPrefix + "Transform"] != undefined;
var supportTransform3D = testElem.style[Quark.cssPrefix + "Perspective"] != undefined;
var docElem = document.documentElement;
if(supportTransform3D && 'webkitPerspective' in docElem.style)
{		
	testElem.id = 'test3d';
	var st = document.createElement('style');
	st.textContent = '@media (-webkit-transform-3d){#test3d{height:3px}}';
	document.head.appendChild(st);
	docElem.appendChild(testElem);
	
	supportTransform3D = testElem.offsetHeight === 3;
	
	st.parentNode.removeChild(st);
	testElem.parentNode.removeChild(testElem);
};
Quark.supportTransform = supportTransform;
Quark.supportTransform3D = supportTransform3D;
if(!supportTransform)
{
	trace("Warn: DOMContext requires css transfrom support.");
	return;
}

/**
 * 构造函数.
 * @name DOMContext
 * @augments Context
 * @class DOMContext是DOM渲染上下文，将显示对象以dom方式渲染到舞台上。
 * @param {Object} props 一个对象。包含以下属性：
 * <p>canvas - 渲染上下文所对应的画布，HTMLDivElement对象。</p>
 */
var DOMContext = Quark.DOMContext = function(props)
{
	DOMContext.superClass.constructor.call(this, props);
};
Quark.inherit(DOMContext, Quark.Context);

/**
 * 绘制指定对象的DOM到舞台上。
 * @param {DisplayObject} target 要绘制的显示对象。
 */
DOMContext.prototype.draw = function(target)
{
	if(!target._addedToDOM)
	{
		var parent = target.parent;
		var targetDOM = target.getDrawable(this);
		if(parent != null)
		{
			var parentDOM = parent.getDrawable(this);
			if(targetDOM.parentNode != parentDOM) parentDOM.appendChild(targetDOM);
			if(parentDOM.parentNode == null && parent instanceof Quark.Stage) 
			{
				this.canvas.appendChild(parentDOM);
				parent._addedToDOM = true;
			}
			target._addedToDOM = true;
		}
	}
};

/**
 * 对指定的显示对象的DOM进行css属性设置或变换。
 * @param {DisplayObject} target 要进行属性设置或变换的显示对象。
 */
DOMContext.prototype.transform = function(target)
{	
	var image = target.getDrawable(this);
	//优化：可以对那些添加到DOM后就不再需要变换的显示对象设置transformEnabled=false。
	if(!target.transformEnabled && target._addedToDOM) return;
	
	var prefix = Quark.cssPrefix, 
		origin = prefix + "TransformOrigin", 
		transform = prefix + "Transform",
		style = image.style;
	
	if(!style.display || target.propChanged("visible", "alpha"))
	{
		style.display = (!target.visible || target.alpha <= 0) ? "none" : "";
	}
	if(!style.opacity || target.propChanged("alpha"))
	{
		style.opacity = target.alpha;
	}
	if(!style.backgroundPosition || target.propChanged("rectX", "rectY"))
	{
		style.backgroundPosition = (-target.rectX) + "px " + (-target.rectY) + "px";
	}
	if(!style.width || target.propChanged("width", "height"))
	{
		style.width = target.width + "px";
		style.height = target.height + "px";
	}
	if(!style[origin] || target.propChanged("regX", "regY"))
	{
		style[origin] = target.regX + "px " + target.regY + "px";
	}	
	if(!style[transform] || target.propChanged("x", "y", "regX", "regY", "scaleX", "scaleY", "rotation"))
	{
		var css = Quark.supportTransform3D ? getTransformCSS(target, true) : getTransformCSS(target, false);
		style[transform] = css;
	}
	if(!style.zIndex || target.propChanged("_depth"))
	{
		style.zIndex = target._depth;
	}
	if(target.mask != null)
	{
		style[Q.cssPrefix + "MaskImage"] = target.mask.getDrawable(this).style.backgroundImage;
		style[Q.cssPrefix + "MaskRepeat"] = "no-repeat";
		style[Q.cssPrefix + "MaskPosition"] = target.mask.x + "px " + target.mask.y + "px";
	}
	style.pointerEvents = target.eventEnabled ? "auto" : "none";
};

/**
 * 根据指定对象生成css变换的样式。
 * @param {DisplayObject} target 显示对象。
 * @param {Boolean} useTransform3D 是否采用transform—3d变换。在支持transform—3d的浏览器中推荐使用。默认为false。
 * @return {String} 生成的css样式。
 */
function getTransformCSS(target, useTransform3D)
{
	var css = "";

	if(useTransform3D)
	{
		css += "translate3d(" + (target.x-target.regX) + "px, " + (target.y-target.regY) + "px, 0px)"
			+ "rotate3d(0, 0, 1, " + target.rotation + "deg)"
			+ "scale3d(" + target.scaleX + ", " + target.scaleY + ", 1)";			
	}else
	{
		css += "translate(" + (target.x-target.regX) + "px, " + (target.y-target.regY) + "px)"
			+ "rotate(" + target.rotation + "deg)"
			+ "scale(" + target.scaleX + ", " + target.scaleY + ")";
	}
	return css;
};

/**
 * 隐藏指定对象渲染的dom节点，用于当显示对象visible=0或alpha=0等情况，由显示对象内部方法调用。
 * @param {DisplayObject} target 要隐藏的显示对象。
 */
DOMContext.prototype.hide = function(target)
{
	target.getDrawable(this).style.display = "none";
};

/**
 * 删除指定显示对象渲染的dom节点，由显示对象内部方法调用。
 * @param {DisplayObject} target 要删除的显示对象。
 */
DOMContext.prototype.remove = function(target)
{
	var targetDOM = target.getDrawable(this);
	var parentNode = targetDOM.parentNode;
	if(parentNode != null) parentNode.removeChild(targetDOM);
	target._addedToDOM = false;
};

})();



(function(){

/**
 * UIDUtil用来生成一个全局唯一的ID。
 * @private
 */
var UIDUtil = Quark.UIDUtil = { _counter:0 };

/**
 * 根据指定名字生成一个全局唯一的ID，如Stage1，Bitmap2等。
 */
UIDUtil.createUID = function(name)
{
	var charCode = name.charCodeAt(name.length - 1);
    if (charCode >= 48 && charCode <= 57) name += "_";
    return name + this._counter++;
};

/**
 * 为指定的displayObject显示对象生成一个包含路径的字符串表示形式。如Stage1.Container2.Bitmap3。
 */
UIDUtil.displayObjectToString = function(displayObject)
{
	var result;
	for(var o = displayObject; o != null; o = o.parent)
	{
        var s = o.id != null ? o.id : o.name;
        result = result == null ? s : (s + "." + result);
        if (o == o.parent) break;
	}
	return result;
};

})();



(function(){

/**
 * 获取URL参数。
 * @return {Object} 包含URL参数的键值对对象。
 */
Quark.getUrlParams = function()
{
	var params = {};
	var url = window.location.href;
	var idx = url.indexOf("?");
	if(idx > 0)
	{
		var queryStr = url.substring(idx + 1);
		var args = queryStr.split("&");
		for(var i = 0, a, nv; a = args[i]; i++)
		{
			nv = args[i] = a.split("=");
			params[nv[0]] = nv.length > 1 ? nv[1] : true;
		}
	}
	return params;
};

var head = document.getElementsByTagName("head")[0];
var metas = head.getElementsByTagName("meta");
var metaAfterNode = metas.length > 0 ? metas[metas.length-1].nextSibling : head.childNodes[0];

/**
 * 动态添加meta到head中。
 * @param {Object} props 要添加的meta的属性. 格式如：{name:'viewport', content:'width=device-width'}。
 */
Quark.addMeta = function(props)
{
	var meta = document.createElement("meta");
	for(var p in props) meta.setAttribute(p, props[p]);
	head.insertBefore(meta, metaAfterNode);
};

/**
 * 显示或关闭舞台上所有显示对象的外包围矩形。此方法主要用于调试物体碰撞区域等。
 * @param {Stage} stage 要调试的舞台对象。
 */
Quark.toggleDebugRect = function(stage)
{
	stage.debug = !stage.debug;	
	if(stage.debug)
	{
		stage._render = function(context)
		{
			if(context.clear != null) context.clear(0, 0, stage.width, stage.height);
			Quark.Stage.superClass._render.call(stage, context);
			
			var ctx = stage.context.context;
			if(ctx != null)
			{
				ctx.save();
				ctx.lineWidth = 1;
				ctx.strokeStyle = "#f00";
				ctx.globalAlpha = 0.5;
			}
			drawObjectRect(stage, ctx);
			if(ctx != null) ctx.restore();
		};
	}else
	{
		stage._render = function(context)
		{
			if(context.clear != null) context.clear(0, 0, stage.width, stage.height);
			Quark.Stage.superClass._render.call(stage, context);
		};
	}
};

/**
 * 绘制显示对象的外包围矩形。
 * @private
 */
function drawObjectRect(obj, ctx)
{
	for(var i = 0; i < obj.children.length; i++)
	{
		var child = obj.children[i];
		if(child.children)
		{
			drawObjectRect(child, ctx);
		}else
		{
			if(ctx != null)
			{
				var b = child.getBounds();
								
				ctx.globalAlpha = 0.2;
				ctx.beginPath();
				var p0 = b[0];
				ctx.moveTo(p0.x-0.5, p0.y-0.5);						
				for(var j = 1; j < b.length; j++)
				{
					var p = b[j];					
					ctx.lineTo(p.x-0.5, p.y-0.5);	
				}
				ctx.lineTo(p0.x-0.5, p0.y-0.5);
				ctx.stroke();
				ctx.closePath();
				ctx.globalAlpha = 0.5;
				
				ctx.beginPath();
				ctx.rect((b.x>>0)-0.5, (b.y>>0)-0.5, b.width>>0, b.height>>0);
				ctx.stroke();
				ctx.closePath();
			}else
			{
				if(child.drawable.domDrawable) child.drawable.domDrawable.style.border = "1px solid #f00";
			}	
		}
	}
};

/**
 * 把DisplayObject对象绘制到一个新的画布上。可作为缓存使用，也可转换成dataURL格式的位图。
 * @param {DisplayObject} obj 要缓存的显示对象。
 * @param {Boolean} toImage 指定是否把缓存转为DataURL格式的。默认为false。
 * @param {String} type 指定转换为DataURL格式的图片mime类型。默认为"image/png"。
 * @return {Object} 显示对象的缓存结果。根据参数toImage不同而返回Canvas或Image对象。
 */
Quark.cacheObject = function(obj, toImage, type)
{
	var w = obj.width, h = obj.height, mask = obj.mask;
	var canvas = Quark.createDOM("canvas", {width:w, height:h});
	var context = new Quark.CanvasContext({canvas:canvas});
	obj.mask = null;
	obj.render(context);
	obj.mask = mask;
	
	if(toImage)
	{
		var img = new Image();
		img.width = w;
		img.height = h;
		img.src = canvas.toDataURL(type || "image/png");
		return img;
	}
	return canvas;
};


/**
 * 用于Quark内部实现的一个上下文。
 * @private
 */
Quark._helpContext = new Quark.CanvasContext({canvas:Quark.createDOM("canvas")});

})();



(function(){

/**
 * 构造函数.
 * @name Timer
 * @class Timer是一个计时器。它能按指定的时间序列运行代码。
 * @param interval 计时器的时间间隔。以毫秒为单位。
 */
var Timer = Quark.Timer = function(interval)
{	
	this.interval = interval || 50;
	this.paused = false;	
	this.info = {lastTime:0, currentTime:0, deltaTime:0, realDeltaTime:0};

	this._startTime = 0;
	this._intervalID = null;
	this._listeners = [];
};

/**
 * 启动计时器。
 */
Timer.prototype.start = function()
{
	if(this._intervalID != null) return;
	this._startTime = this.info.lastTime = this.info.currentTime = Date.now();
	var me = this;
	var run = function(){me._intervalID = setTimeout(run, me.interval);me._run();};
	run();
};

/**
 * 停止计时器。
 */
Timer.prototype.stop = function()
{
	clearTimeout(this._intervalID);
	this._intervalID = null;
	this._startTime = 0;
};

/**
 * 暂停计时器。
 */
Timer.prototype.pause = function()
{
	this.paused = true;
};

/**
 * 恢复计时器。
 */
Timer.prototype.resume = function()
{
	this.paused = false;
};

/**
 * 计时器的运行回调。当达到执行条件时，调用所有侦听器的step方法。
 * @private
 */
Timer.prototype._run = function()
{
	if(this.paused) return;
	
	var info = this.info;
	var time = info.currentTime = Date.now();
	info.deltaTime = info.realDeltaTime = time - info.lastTime;
	
	for(var i = 0, len = this._listeners.length, obj, runTime; i < len; i++)
	{
		obj = this._listeners[i];
		runTime = obj.__runTime || 0;
		if(runTime == 0)
		{
			obj.step(this.info);
		}else if(time > runTime)
		{
			obj.step(this.info);
			this._listeners.splice(i, 1);
			i--;
			len--;
		}
	}
	
	info.lastTime = time;
};

/**
 * 延迟一定时间time调用callback方法。
 * @param callback 调用的方法。
 * @param time 延迟的时间，以毫秒为单位。
 */
Timer.prototype.delay = function(callback, time)
{
	var obj = {step:callback, __runTime:Date.now() + time};
	this.addListener(obj);
};

/**
 * 添加侦听器对象，计时器会按照指定的时间间隔来调用侦听器的step方法。即listner必需有step方法。
 * @param obj 侦听器对象。
 **/
Timer.prototype.addListener = function(obj)
{
	if(obj == null || typeof(obj.step) != "function") throw "Timer Error: The listener object must implement a step() method!";
	this._listeners.push(obj);
};

/**
 * 删除侦听器。
 */
Timer.prototype.removeListener = function(obj)
{
	var index = this._listeners.indexOf(obj);
	if(index > -1)
	{
		this._listeners.splice(index, 1);
	}
};

})();



(function(){

/**
 * 构造函数.
 * @name ImageLoader
 * @augments EventDispatcher
 * @class ImageLoader类是一个图片加载器，用于动态加载图片资源。
 * @param source 要加载的图片资源，可以是一个单独资源或多个资源的数组。图片资源格式为：{src:$url, id:$id, size:$size}。
 */
var ImageLoader = Quark.ImageLoader = function(source)
{
	ImageLoader.superClass.constructor.call(this);	
	
	this.loading = false; //ready-only
	
	this._index = -1;
	this._loaded = 0;
	this._images = {};
	this._totalSize = 0;
	this._loadHandler = Quark.delegate(this._loadHandler, this);
	
	this._addSource(source);
};
Quark.inherit(ImageLoader, Quark.EventDispatcher);

/**
 * 开始顺序加载图片资源。
 * @param source 要加载的图片资源，可以是一个单独资源或多个资源的数组。
 */
ImageLoader.prototype.load = function(source)
{
	this._addSource(source);
	if(!this.loading) this._loadNext();
};

/**
 * 添加图片资源。
 * @private 
 */
ImageLoader.prototype._addSource = function(source)
{
	if(!source) return;
	source = (source instanceof Array) ? source : [source];
	for(var i = 0; i < source.length; i++)
	{
		this._totalSize+= source[i].size || 0;
	}
	if(!this._source) this._source = source;
	else this._source = this._source.concat(source);
};

/**
 * 加载下一个图片资源。
 * @private
 */
ImageLoader.prototype._loadNext = function()
{
	this._index++;
	if(this._index >= this._source.length)
	{
		this.dispatchEvent({type:"complete", target:this, images:this._images});
		this._source = [];
		this.loading = false;
		this._index = -1;
		return;
	}
	
	var img = new Image();
	img.onload = this._loadHandler;
	img.src = this._source[this._index].src;
	this.loading = true;
};

/**
 * 图片加载处理器。
 * @private
 */
ImageLoader.prototype._loadHandler = function(e)
{	
	this._loaded++;
	var image = this._source[this._index];
	image.image = e.target;
	var id = image.id || image.src;
	this._images[id] = image;
	this.dispatchEvent({type:"loaded", target:this, image:image});	
	this._loadNext();
};

/**
 * 返回已加载图片资源的数目。
 */
ImageLoader.prototype.getLoaded = function()
{
	return this._loaded;
};

/**
 * 返回所有图片资源的总数。
 */
ImageLoader.prototype.getTotal = function()
{
	return this._source.length;
};

/**
 * 返回已加载的图片资源的大小之和（在图片资源的大小size已指定的情况下）。
 */
ImageLoader.prototype.getLoadedSize = function()
{
	var size = 0;
	for(var id in this._images)
	{
		var item = this._images[id];
		size += item.size || 0;
	}
	return size;
};

/**
 * 返回所有图片资源的大小之和（在图片资源的大小size已指定的情况下）。
 */
ImageLoader.prototype.getTotalSize = function()
{
	return this._totalSize;
};

})();



(function(){

/**
 * 构造函数.
 * @name Tween
 * @class Tween类是一个缓动动画类。使用它能实现移动、改变大小、淡入淡出等效果。
 * @param target 实现缓动动画的目标对象。
 * @param newProps 设置目标对象的新的属性。
 * @param params 设置缓动动画类的参数。
 */
var Tween = Quark.Tween = function(target, newProps, params)
{
	this.target = target;
	this.time = 0;
	this.delay = 0;
	this.paused = false;
	this.loop = false;
	this.reverse = false;
	this.interval = 0;
	this.ease = Easing.Linear.EaseNone;
	this.next = null;
	
	this.onStart = null;
	this.onUpdate = null;
	this.onComplete = null;
	
	this._oldProps = {};
	this._newProps = {};
	this._deltaProps = {};
	this._startTime = 0;
	this._lastTime = 0;
	this._pausedTime = 0;
	this._pausedStartTime = 0;
	this._reverseFlag = 1;
	this._frameTotal = 0;
	this._frameCount = 0;

	for(var p in newProps)
	{		
		var oldVal = target[p], newVal = newProps[p];
		if(oldVal !== undefined)
		{
			if(typeof(oldVal) == "number" && typeof(newVal) == "number")
			{
				this._oldProps[p] = oldVal;
				this._newProps[p] = newVal;
				this._deltaProps[p] = newVal - oldVal;
			}
		}
	}

	for(var p in params)
	{
		this[p] = params[p];
	}
};

/**
 * 设置缓动对象的初始和目标属性。
 * @param oldProps 缓动对象的初始属性。
 * @param newProps 缓动对象的目标属性。
 */
Tween.prototype.setProps = function(oldProps, newProps)
{
	for(var p in oldProps)
	{
		this.target[p] = this._oldProps[p] = oldProps[p];
	}
	for(var p in newProps)
	{
		this._newProps[p] = newProps[p];
		this._deltaProps[p] = newProps[p] - this.target[p];
	}
};

/**
 * 初始化Tween类。
 * @private
 */
Tween.prototype._init = function()
{
	this._startTime = Date.now() + this.delay;
	this._pausedTime = 0;
	if(this.interval > 0) this._frameTotal = Math.round(this.time / this.interval);
	Tween.add(this);
};

/**
 * 启动缓动动画的播放。
 */
Tween.prototype.start = function()
{	
	this._init();
	this.paused = false;
};

/**
 * 停止缓动动画的播放。
 */
Tween.prototype.stop = function()
{
	Tween.remove(this);
};

/**
 * 暂停缓动动画的播放。
 */
Tween.prototype.pause = function()
{	
	this.paused = true;
	this._pausedStartTime = Date.now();
};

/**
 * 恢复缓动动画的播放。
 */
Tween.prototype.resume = function()
{	
	this.paused = false;
	this._pausedTime += Date.now() - this._pausedStartTime;
};

/**
 * Tween类的内部更新方法。
 * @private
 */
Tween.prototype._update = function()
{
	if(this.paused) return;
	var now = Date.now();
	var elapsed = now - this._startTime - this._pausedTime;
	if(elapsed < 0) return;
	
	if(this._lastTime == 0 && this.onStart != null) this.onStart(this);
	this._lastTime = now;
	
	var ratio = this._frameTotal > 0 ? (++this._frameCount / this._frameTotal) : (elapsed / this.time);
	if(ratio > 1) ratio = 1;
	var value = this.ease(ratio);

	for(var p in this._oldProps)
	{
		this.target[p] = this._oldProps[p] + this._deltaProps[p] * this._reverseFlag * value;
	}
	
	if(this.onUpdate != null) this.onUpdate(this, value);

	if(ratio >= 1)
	{	
		if(this.reverse)
		{
			var tmp = this._oldProps;
			this._oldProps = this._newProps;
			this._newProps = tmp;
			this._startTime = Date.now();
			this._frameCount = 0;
			this._reverseFlag *= -1;
			if(!this.loop) this.reverse = false;
		}else if(this.loop)
		{
			for(var p in this._oldProps) this.target[p] = this._oldProps[p];
			this._startTime = Date.now();
			this._frameCount = 0;
		}else
		{
			Tween.remove(this);
			var next = this.next, nextTween;
			if(next != null)
			{
				if(next instanceof Tween)
				{
					nextTween = next;
					next = null;
				}else
				{
					nextTween = next.shift();
				}
				if(nextTween != null)
				{
					nextTween.next = next;
					nextTween.start();
				}
			}
		}
		if(this.onComplete != null) this.onComplete(this);	
	}
};

/**
 * 保存所有Tween类的实例。
 * @static
 */
Tween._tweens = [];

/**
 * 更新所有Tween实例，一般由Quark.Timer类自动调用。
 * @static
 */
Tween.step = function()
{
	var tweens = this._tweens, i = tweens.length;
	while(--i >= 0) tweens[i]._update();
};

/**
 * 添加Tween实例。
 * @static
 */
Tween.add = function(tween)
{
	if(this._tweens.indexOf(tween) == -1) this._tweens.push(tween);
	return this;
};

/**
 * 删除Tween实例。
 * @staitc
 */
Tween.remove = function(tween)
{
	var tweens = this._tweens, index = tweens.indexOf(tween);
	if(index > -1) tweens.splice(index, 1);
	return this;
};

/**
 * 创建一个缓动动画，让目标对象从当前属性变换到目标属性。
 * @param target 缓动目标对象
 * @param toProps 缓动目标对象的目标属性。
 * @param params 缓动动画的参数。
 */
Tween.to = function(target, toProps, params)
{
	var tween = new Tween(target, toProps, params);
	tween._init();
	return tween;
};

/**
 * 创建一个缓动动画，让目标对象从指定的起始属性变换到当前属性。
 * @param target 缓动目标对象
 * @param toProps 缓动目标对象的起始属性。
 * @param params 缓动动画的参数。
 */
Tween.from = function(target, fromProps, params)
{
	var tween = new Tween(target, fromProps, params);
	var tmp = tween._oldProps;
	tween._oldProps = tween._newProps;
	tween._newProps = tmp;
	tween._reverseFlag = -1;

	for(var p in tween._oldProps) target[p] = tween._oldProps[p];

	tween._init();
	return tween;
};

/**
 * 缓动函数集合。
 */
var Easing = Quark.Easing = 
{
	Linear: {}, 
	Quadratic: {}, 
	Cubic: {}, 
	Quartic: {}, 
	Quintic: {}, 
	Sinusoidal: {}, 
	Exponential: {}, 
	Circular: {}, 
	Elastic: {}, 
	Back: {}, 
	Bounce: {}
};

Easing.Linear.EaseNone = function(k)
{
	return k;
};

Easing.Quadratic.EaseIn = function(k)
{
	return k * k;
};

Easing.Quadratic.EaseOut = function(k) 
{
	return - k * (k - 2);
};

Easing.Quadratic.EaseInOut = function(k)
{
	if((k *= 2) < 1) return 0.5 * k * k;
	return -0.5 * (--k * (k - 2) - 1);
};

Easing.Cubic.EaseIn = function(k) 
{
	return k * k * k;
};

Easing.Cubic.EaseOut = function(k)
{
	return --k * k * k + 1;
};

Easing.Cubic.EaseInOut = function(k) 
{
	if((k *= 2) < 1) return 0.5 * k * k * k;
	return 0.5 * ((k -= 2) * k * k + 2);
};

Easing.Quartic.EaseIn = function(k) 
{
	return k * k * k * k;
};

Easing.Quartic.EaseOut = function(k)
{
	return -(--k * k * k * k - 1);
}

Easing.Quartic.EaseInOut = function(k)
{
	if((k *= 2) < 1) return 0.5 * k * k * k * k;
	return - 0.5 * ((k -= 2) * k * k * k - 2);
};

Easing.Quintic.EaseIn = function(k)
{
	return k * k * k * k * k;
};

Easing.Quintic.EaseOut = function(k) 
{
	return (k = k - 1) * k * k * k * k + 1;
};

Easing.Quintic.EaseInOut = function(k)
{
	if((k *= 2) < 1) return 0.5 * k * k * k * k * k;
	return 0.5 * ((k -= 2) * k * k * k * k + 2);
};

Easing.Sinusoidal.EaseIn = function(k) 
{
	return -Math.cos(k * Math.PI / 2) + 1;
};

Easing.Sinusoidal.EaseOut = function(k)
{
	return Math.sin(k * Math.PI / 2);
};

Easing.Sinusoidal.EaseInOut = function(k)
{
	return -0.5 * (Math.cos(Math.PI * k) - 1);
};

Easing.Exponential.EaseIn = function(k) 
{
	return k == 0 ? 0 : Math.pow(2, 10 * (k - 1));
};

Easing.Exponential.EaseOut = function(k) 
{
	return k == 1 ? 1 : -Math.pow(2, -10 * k) + 1;
};

Easing.Exponential.EaseInOut = function(k)
{
	if(k == 0) return 0;
	if(k == 1) return 1;
    if((k *= 2) < 1) return 0.5 * Math.pow(2, 10 * (k - 1));
	return 0.5 * (-Math.pow(2, - 10 * (k - 1)) + 2);
};

Easing.Circular.EaseIn = function(k) 
{
	return -(Math.sqrt(1 - k * k) - 1);
};

Easing.Circular.EaseOut = function(k) 
{
	return Math.sqrt(1 - --k * k);
};

Easing.Circular.EaseInOut = function(k)
{
	if((k /= 0.5) < 1) return - 0.5 * (Math.sqrt(1 - k * k) - 1);
	return 0.5 * ( Math.sqrt(1 - (k -= 2) * k) + 1);
};

Easing.Elastic.EaseIn = function(k) 
{
	var s, a = 0.1, p = 0.4;
	if (k == 0) return 0; 
	else if (k == 1) return 1;
	else if (!p) p = 0.3;
	if(!a || a < 1) { a = 1; s = p / 4; }
	else s = p / (2 * Math.PI) * Math.asin(1 / a);
	return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
};

Easing.Elastic.EaseOut = function(k) 
{
	var s, a = 0.1, p = 0.4;
	if(k == 0) return 0; 
	else if (k == 1) return 1; 
	else if (!p) p = 0.3;
	if(!a || a < 1) { a = 1; s = p / 4; }
	else s = p / (2 * Math.PI) * Math.asin(1 / a);
	return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
};

Easing.Elastic.EaseInOut = function(k) 
{
	var s, a = 0.1, p = 0.4;
	if (k == 0) return 0; 
	else if (k == 1) return 1; 
	else if (!p) p = 0.3;
	if(!a || a < 1) { a = 1; s = p / 4; }
	else s = p / (2 * Math.PI) * Math.asin(1 / a);
	if ((k *= 2 ) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
	return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

};

Easing.Back.EaseIn = function(k) 
{
	var s = 1.70158;
	return k * k * ((s + 1) * k - s);
};

Easing.Back.EaseOut = function(k)
{
	var s = 1.70158;
	return (k = k - 1) * k * (( s + 1) * k + s) + 1;
};

Easing.Back.EaseInOut = function(k) 
{
	var s = 1.70158 * 1.525;
	if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
	return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
};

Easing.Bounce.EaseIn = function(k) 
{
	return 1 - Easing.Bounce.EaseOut(1 - k);
};

Easing.Bounce.EaseOut = function(k)
{
	if(( k /= 1) < (1 / 2.75))
	{
		return 7.5625 * k * k;
	}else if(k < (2 / 2.75))
	{
		return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
	}else if(k < (2.5 / 2.75)) 
	{
		return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
	}else
	{
		return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
	}
};

Easing.Bounce.EaseInOut = function(k) 
{
	if(k < 0.5) return Easing.Bounce.EaseIn(k * 2) * 0.5;
	return Easing.Bounce.EaseOut(k * 2 - 1) * 0.5 + 0.5;
};

})();



(function(){

/**
 * 构造函数.
 * @name Audio
 * @class Audio类是原生Audio的封装。
 * @param src 要加载的声音的地址。
 * @param preload 指示是否自动加载，在某些浏览器下无效，如IOS上的Safari。
 * @param autoPlay 指示是否自动播放，在某些浏览器下无效，如IOS上的Safari。
 * @param loop 指示是否循环播放。
 */
var Audio = Quark.Audio = function(src, preload, autoPlay, loop)
{	
    Audio.superClass.constructor.call(this);
    
    this.src = src;
	this.autoPlay = preload && autoPlay;
	this.loop = loop;
	
	this._loaded = false;
    this._playing = false;
	this._evtHandler = Quark.delegate(this._evtHandler, this);
	
	this._element = document.createElement('audio');
	this._element.preload = preload;
	this._element.src = src;
	if(preload) this.load();
};
Quark.inherit(Audio, Quark.EventDispatcher);

/**
 * 开始加载声音文件。
 */
Audio.prototype.load = function()
{	
	this._element.addEventListener("progress", this._evtHandler, false);
	this._element.addEventListener("ended", this._evtHandler, false);
	this._element.addEventListener("error", this._evtHandler, false);
    try{
        this._element.load();
    }catch(e){trace(e);};
	
};

/**
 * 内部的声音事件处理。
 * @private
 */
Audio.prototype._evtHandler = function(e)
{
	if(e.type == "progress")
	{
		var i = 0, buffered = 0, ranges = e.target.buffered;
		if(ranges && ranges.length > 0)
		{
			for (i = ranges.length - 1; i >= 0; i--)
			{
	          buffered = (ranges.end(i) - ranges.start(i));
	        }
		}
		var percent = buffered / e.target.duration;
		if(percent >= 1)
		{
			this._element.removeEventListener("progress", this._evtHandler);
			this._element.removeEventListener("error", this._evtHandler);
			this._loaded = true;
			this.dispatchEvent({type:"loaded", target:this});
			if(this.autoPlay) this.play();
		}
	}else if(e.type == "ended")
	{
		this.dispatchEvent({type:"ended", target:this});
		if(this.loop) this.play();
		else this._playing = false;
	}else if(e.type == "error")
	{
		trace("Quark.Audio Error: " + e.target.src);
	}
};

/**
 * 开始播放。
 */
Audio.prototype.play = function()
{
	if (this._loaded)
	{
        this._element.play();
        this._playing = true;
    }else
	{
		this.autoPlay = true;
		this.load();
	}
};

/**
 * 停止播放。
 */
Audio.prototype.stop = function()
{
    if(this._playing)
	{
        this._element.pause();
        this._playing = false;
    }
};

/**
 * 指示声音文件是否已被加载。
 */
Audio.prototype.loaded = function()
{
    return this._loaded;
};

/**
 * 指示声音是正在播放。
 */
Audio.prototype.playing = function()
{
    return this._playing;
};

})();



(function(){

/**
 * 构造函数.
 * @name Drawable
 * @class Drawable是可绘制图像或DOM的包装。当封装的是HTMLImageElement、HTMLCanvasElement或HTMLVideoElement对象时，可同时支持canvas和dom两种渲染方式，而如果封装的是dom时，则不支持canvas方式。
 * @param drawable 一个可绘制对象。
 * @param {Boolean} isDOM 指定参数drawable是否为一个DOM对象。默认为false。
 */
var Drawable = Quark.Drawable = function(drawable, isDOM)
{	
	this.rawDrawable = null;
	this.domDrawable = null;	
	this.set(drawable, isDOM);
};

/**
 * 根据context上下文获取不同的Drawable包装的对象。
 * @param {DisplayObject} obj 指定的显示对象。
 * @param {Context} context 指定的渲染上下文。
 * @return 返回包装的可绘制对象。
 */
Drawable.prototype.get = function(obj, context)
{
	if(context == null || context.canvas.getContext != null)
	{
		return this.rawDrawable;
	}else
	{
        if(this.domDrawable == null)
		{
			this.domDrawable = Quark.createDOMDrawable(obj, {image:this.rawDrawable});
		}
		return this.domDrawable;
	}
};

/**
 * 设置Drawable对象。
 * @param drawable 一个可绘制对象。
 * @param {Boolean} isDOM 指定参数drawable是否为一个DOM对象。默认为false。
 */
Drawable.prototype.set = function(drawable, isDOM)
{
	if(isDrawable(drawable)) this.rawDrawable = drawable;
	if(isDOM === true)
	{
		this.domDrawable = drawable;
	}else if(this.domDrawable)
	{
		this.domDrawable.style.backgroundImage = "url(" + this.rawDrawable.src + ")";
	}
};

function isDrawable(elem)
{
	if(elem == null) return false;
	return (elem instanceof HTMLImageElement) || 
	  	   (elem instanceof HTMLCanvasElement) ||
	   	   (elem instanceof HTMLVideoElement);
};

})();



(function(){

/**
 * 构造函数.
 * @name DisplayObject
 * @class DisplayObject类是可放在舞台上的所有显示对象的基类。DisplayObject类定义了若干显示对象的基本属性。渲染一个DisplayObject其实是进行若干变换后再渲染其drawable对象。
 * @augments EventDispatcher
 * @property id DisplayObject对象唯一标识符id。
 * @property name DisplayObject对象的名称。
 * @property x DisplayObject对象相对父容器的x轴坐标。
 * @property y DisplayObject对象相对父容器的y轴坐标。
 * @property regX DisplayObject对象的注册点（中心点）的x轴坐标。
 * @property regY DisplayObject对象的注册点（中心点）的y轴坐标。
 * @property width DisplayObject对象的宽。
 * @property height DisplayObject对象的高。
 * @property alpha DisplayObject对象的透明度。取值范围为0-1，默认为1。
 * @property scaleX DisplayObject对象在x轴上的缩放值。取值范围为0-1。
 * @property scaleY DisplayObject对象在y轴上的缩放值。取值范围为0-1。
 * @property rotation DisplayObject对象的旋转角度。默认为0。
 * @property visible 指示DisplayObject对象是否可见。默认为true。
 * @property eventEnabled 指示DisplayObject对象是否接受交互事件，如mousedown，touchstart等。默认为true。
 * @property transformEnabled 指示DisplayObject对象是否执行变换。默认为false。
 * @property useHandCursor 指示DisplayObject对象是否支持手型的鼠标光标。默认为false。
 * @property polyArea 指示DisplayObject对象的多边形碰撞区域。默认为null，即使用对象的外包围矩形。
 * @property mask 指示DisplayObject对象的遮罩对象。当上下文为DOMContext时暂时只支持webkit内核浏览器。默认为null。
 * @property parent DisplayObject对象的父容器。只读属性。
 */	
var DisplayObject = Quark.DisplayObject = function(props)
{
	this.id = Quark.UIDUtil.createUID("DisplayObject");
	
	this.name = null;
	this.x = 0;
	this.y = 0;
	this.regX = 0;
	this.regY = 0;
	this.width = 0;
	this.height = 0;
	this.alpha = 1;
	this.scaleX = 1;
	this.scaleY = 1;
	this.rotation = 0;
	this.visible = true;
	this.eventEnabled = true;
	this.transformEnabled = true;
	this.useHandCursor = false;
	this.polyArea = null;
	this.mask = null;

	this.drawable = null;
	this.parent = null;	
	this.context = null;
	
	this._depth = 0;
	this._lastState = {};
	this._stateList = ["x", "y", "regX", "regY", "width", "height", "alpha", "scaleX", "scaleY", "rotation", "visible", "_depth"];

	Quark.merge(this, props, true);
	if(props.mixin) Quark.merge(this, props.mixin, false);

	DisplayObject.superClass.constructor.call(this, props);
};
Quark.inherit(DisplayObject, Quark.EventDispatcher);

/**
 * 设置可绘制对象，默认是一个Image对象，可通过覆盖此方法进行DOM绘制。
 * @param {Object} drawable 要设置的可绘制对象。一般是一个Image对象。
 */
DisplayObject.prototype.setDrawable = function(drawable)
{ 
	if(this.drawable == null)
	{
		this.drawable = new Quark.Drawable(drawable);
	}else if(this.drawable.rawDrawable != drawable)
	{
		this.drawable.set(drawable);
	}
};

/**
 * 获得可绘制对象实体，如Image或Canvas等其他DOM对象。
 * @param {Context} context 渲染上下文。
 */
DisplayObject.prototype.getDrawable = function(context)
{
	//context = context || this.context || this.getStage().context;
	return this._cache || this.drawable && this.drawable.get(this, context);
};

/**
 * 对象数据更新接口，仅供框架内部或组件开发者使用。用户通常应该重写update方法。
 * @protected
 */
DisplayObject.prototype._update = function(timeInfo)
{ 
	this.update(timeInfo);
};

/**
 * 对象数据更新接口，可通过覆盖此方法实现对象的数据更新。
 * @param {Object} timeInfo 对象更新所需的时间信息。
 * @return {Boolean} 更新成功返回true，否则为false。
 */
DisplayObject.prototype.update = function(timeInfo){ return true; };

/**
 * 对象渲染接口，仅供框架内部或组件开发者使用。用户通常应该重写render方法。
 * @protected
 */
DisplayObject.prototype._render = function(context)
{
	var ctx = this.context || context;
	if(!this.visible || this.alpha <= 0) 
	{
		if(ctx.hide != null) ctx.hide(this);
		this.saveState(["visible", "alpha"]);
		return;
	}
	
	ctx.startDraw();
	ctx.transform(this);
	this.render(ctx);
	ctx.endDraw();
	this.saveState();
};

/**
 * DisplayObject对象渲染接口，可通过覆盖此方法实现对象的渲染。
 * @param {Context} context 渲染上下文。
 */
DisplayObject.prototype.render = function(context)
{
	context.draw(this, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
};

/**
 * 保存DisplayObject对象的状态列表中的各种属性状态。
 * @param {Array} list 要保存的属性名称列表。默认为null。
 */
DisplayObject.prototype.saveState = function(list)
{
	list = list || this._stateList;
	var state = this._lastState;
	for(var i = 0, len = list.length; i < len; i++)
	{
		var p = list[i];
		state["last" + p] = this[p];
	}
};

/**
 * 获得DisplayObject对象保存的状态列表中的指定的属性状态。
 * @param {String} propName 要获取的属性状态名称。
 * @return 返回指定属性的最后一次保存状态值。
 */
DisplayObject.prototype.getState = function(propName)
{
	return this._lastState["last" + propName];
};

/**
 * 比较DisplayObject对象的当前状态和最近一次保存的状态，返回指定属性中是否发生改变。
 * @param prop 可以是单个或多个属性参数。
 * @return 属性改变返回true，否则返回false。
 */
DisplayObject.prototype.propChanged = function(prop)
{
	var list = arguments.length > 0 ? arguments : this._stateList;
	for(var i = 0, len = list.length; i < len; i++)
	{
		var p = list[i];
		if(this._lastState["last" + p] != this[p]) return true;
	}
	return false;
};

/**
 * 计算DisplayObject对象的包围矩形，以确定由x和y参数指定的点是否在其包围矩形之内。
 * @param {Number} x 指定碰撞点的x坐标。
 * @param {Number} y 指定碰撞点的y坐标。
 * @param {Boolean} usePolyCollision 指定是否采用多边形碰撞。默认为false。
 * @return {Number} 在包围矩形之内返回1，在边界上返回0，否则返回-1。
 */
DisplayObject.prototype.hitTestPoint = function(x, y, usePolyCollision)
{
	return Quark.hitTestPoint(this, x, y, usePolyCollision);
};

/**
 * 计算DisplayObject对象的包围矩形，以确定由object参数指定的显示对象是否与其相交。
 * @param {DisplayObject} object 指定检测碰撞的显示对象。
 * @param {Boolean} usePolyCollision 指定是否采用多边形碰撞。默认为false。
 * @return {Boolean} 相交返回true，否则返回false。
 */
DisplayObject.prototype.hitTestObject = function(object, usePolyCollision)
{
	return Quark.hitTestObject(this, object, usePolyCollision);
};

/**
 * 将x和y指定的点从显示对象的（本地）坐标转换为舞台（全局）坐标。
 * @param {Number} x 显示对象的本地x轴坐标。
 * @param {Number} y 显示对象的本地y轴坐标。
 * @return {Object} 返回转换后的全局坐标对象。格式如：{x:10, y:10}。
 */
DisplayObject.prototype.localToGlobal = function(x, y)
{
	var cm = this.getConcatenatedMatrix();
	return {x:cm.tx+x, y:cm.ty+y};
};

/**
 * 将x和y指定的点从舞台（全局）坐标转换为显示对象的（本地）坐标。
 * @param {Number} x 显示对象的全局x轴坐标。
 * @param {Number} y 显示对象的全局y轴坐标。
 * @return {Object} 返回转换后的本地坐标对象。格式如：{x:10, y:10}。
 */
DisplayObject.prototype.globalToLocal = function(x, y) 
{
	var cm = this.getConcatenatedMatrix().invert();
	return {x:cm.tx+x, y:cm.ty+y};
};

/**
 * 将x和y指定的点从显示对象的（本地）坐标转换为指定对象的坐标系里坐标。
 * @param {Number} x 显示对象的本地x轴坐标。
 * @param {Number} y 显示对象的本地y轴坐标。
 * @return {Object} 返回转换后指定对象的本地坐标对象。格式如：{x:10, y:10}。
 */
DisplayObject.prototype.localToTarget = function(x, y, target) 
{
	var p = this.localToGlobal(x, y);
	return target.globalToLocal(p.x, p.y);
};

/**
 * 获得一个对象相对于其某个祖先（默认即舞台）的连接矩阵。
 * @private
 */
DisplayObject.prototype.getConcatenatedMatrix = function(ancestor) 
{	
	var mtx = new Quark.Matrix(1, 0, 0, 1, 0, 0);
	if(ancestor == this) return mtx;
	for(var o = this; o.parent != null && o.parent != ancestor; o = o.parent)
	{		
		var cos = 1, sin = 0;
		if(o.rotation%360 != 0)
		{
			var r = o.rotation * Quark.DEG_TO_RAD;
			cos = Math.cos(r);
			sin = Math.sin(r);
		}
		
		if(o.regX != 0) mtx.tx -= o.regX;
		if(o.regY != 0) mtx.ty -= o.regY;
		
		mtx.concat(new Quark.Matrix(cos*o.scaleX, sin*o.scaleX, -sin*o.scaleY, cos*o.scaleY, o.x, o.y));
	}
	return mtx;
};

/**
 * 返回DisplayObject对象在舞台全局坐标系内的矩形区域以及所有顶点。
 * @return {Object} 返回显示对象的矩形区域。
 */
DisplayObject.prototype.getBounds = function()
{	
	var w = this.width, h = this.height;
	var mtx = this.getConcatenatedMatrix();
	
	var poly = this.polyArea || [{x:0, y:0}, {x:w, y:0}, {x:w, y:h}, {x:0, y:h}];
	
	var vertexs = [], len = poly.length, v, minX, maxX, minY, maxY;	
	v = mtx.transformPoint(poly[0], true, true);
	minX = maxX = v.x;
	minY = maxY = v.y;
	vertexs[0] = v;
	
	for(var i = 1; i < len; i++)
	{
		var v = mtx.transformPoint(poly[i], true, true);
		if(minX > v.x) minX = v.x;
		else if(maxX < v.x) maxX = v.x;
		if(minY > v.y) minY = v.y;
		else if(maxY < v.y) maxY = v.y;
		vertexs[i] = v;
	}
	
	vertexs.x = minX;
	vertexs.y = minY;
	vertexs.width = maxX - minX;
	vertexs.height = maxY - minY;
	return vertexs;
};

/**
 * 获得DisplayObject对象变形后的宽度。
 * @return {Number} 返回对象变形后的宽度。
 */
DisplayObject.prototype.getCurrentWidth = function()
{
	return Math.abs(this.width * this.scaleX);
};

/**
 * 获得DisplayObject对象变形后的高度。
 * @return {Number} 返回对象变形后的高度。
 */
DisplayObject.prototype.getCurrentHeight = function()
{
	return Math.abs(this.height * this.scaleY);
};

/**
 * 获得DisplayObject对象的舞台引用。如未被添加到舞台，则返回null。
 * @return {Stage} 返回对象的舞台。
 */
DisplayObject.prototype.getStage = function()
{
	var obj = this;
	while(obj.parent) obj = obj.parent;
	if(obj instanceof Quark.Stage) return obj;
	return null;
};

/**
 * 把DisplayObject对象缓存到一个新的canvas，对于包含复杂内容且不经常改变的对象使用缓存，可以提高渲染速度。
 * @param {Boolean} toImage 指定是否把缓存转为DataURL格式的。默认为false。
 * @param {String} type 指定转换为DataURL格式的图片mime类型。默认为"image/png"。
 * @return {Object} 显示对象的缓存结果。根据参数toImage不同而返回Canvas或Image对象。
 */
Quark.DisplayObject.prototype.cache  = function(toImage, type)
{
	return this._cache = Quark.cacheObject(this, toImage, type);
};

/**
 * 清除缓存。
 */
Quark.DisplayObject.prototype.uncache = function()
{
	this._cache = null;
};

/**
 * 把DisplayObject对象转换成dataURL格式的位图。
 * @param {String} type 指定转换为DataURL格式的图片mime类型。默认为"image/png"。
 */
Quark.DisplayObject.prototype.toImage = function(type)
{	
	return Quark.cacheObject(this, true, type);
};

/**
 * 返回DisplayObject对象的全路径的字符串表示形式，方便debug。如Stage1.Container2.Bitmap3。
 * @return {String} 返回对象的全路径的字符串表示形式。如Stage1.Container2.Bitmap3。
 */
DisplayObject.prototype.toString = function()
{
	return Quark.UIDUtil.displayObjectToString(this);
};

})();



(function(){

/**
 * 构造函数.
 * @name DisplayObjectContainer
 * @augments DisplayObject
 * @class DisplayObjectContainer类继承自DisplayObject，是显示列表中显示对象容器的基类。每个DisplayObjectContainer对象都有自己的子级列表children，用于组织对象的Z轴顺序。注意：DisplayObjectContainer对象的宽高默认为0，在autoSize=false的情况下，需要手动设置宽高。
 * @property eventChildren 指示DisplayObjectContainer的子元素是否接受交互事件，如mousedown，touchstart等。默认为true。
 * @property autoSize 指示DisplayObjectContainer是否随子元素自动设置大小。默认为false。
 */
var DisplayObjectContainer = Quark.DisplayObjectContainer = function(props)
{
	this.eventChildren = true;
	this.autoSize = false;
	this.children = [];

	props = props || {};
	DisplayObjectContainer.superClass.constructor.call(this, props);		
	this.id = props.id || Quark.UIDUtil.createUID("DisplayObjectContainer");

	this.setDrawable(props.drawable || props.image || null);
	
	if(props.children)
	{
		for(var i = 0; i < props.children.length; i++)
		{
			this.addChild(props.children[i]);
		}
	}
};
Quark.inherit(DisplayObjectContainer, Quark.DisplayObject);

/**
 * 将一个DisplayObject子实例添加到该DisplayObjectContainer实例的子级列表中的指定位置。
 * @param {DisplayObject} child 要添加的显示对象。
 * @param {Integer} index 指定显示对象要被添加到的索引位置。
 * @return {DisplayObjectContainer} 返回显示容器本身。
 */
DisplayObjectContainer.prototype.addChildAt = function(child, index)
{
	if(index < 0) index = 0;
	else if(index > this.children.length) index = this.children.length;
	
	var childIndex = this.getChildIndex(child);
	if(childIndex != -1)
	{
		if(childIndex == index) return this;
		this.children.splice(childIndex, 1);
	}else if(child.parent)
	{
		child.parent.removeChild(child);
	}

	this.children.splice(index, 0, child);
	child.parent = this;
	
	if(this.autoSize)
	{		
		var rect = new Quark.Rectangle(0, 0, this.rectWidth || this.width, this.rectHeight || this.height);
		var childRect = new Quark.Rectangle(child.x, child.y, child.rectWidth || child.width, child.rectHeight || child.height);
		rect.union(childRect);
		this.width = rect.width;
		this.height = rect.height;
	}
	
	return this;
};

/**
 * 将一个DisplayObject子实例添加到该DisplayObjectContainer实例的子级列表中。
 * @param {DisplayObject} child 要添加的显示对象。
 * @return {DisplayObjectContainer} 返回显示容器本身。
 */
DisplayObjectContainer.prototype.addChild = function(child)
{	
	var start = this.children.length;
	for(var i = 0; i < arguments.length; i++)
	{
		var child = arguments[i];
		this.addChildAt(child, start + i);
	}
	return this;
};

/**
 * 从DisplayObjectContainer的子级列表中指定索引处删除子对象。
 * @param {Integer} index 指定要删除的显示对象的索引位置。
 * @return {Boolean} 删除成功返回true，否则返回false。
 */
DisplayObjectContainer.prototype.removeChildAt = function(index)
{
	if (index < 0 || index >= this.children.length) return false;
	var child = this.children[index];
	if (child != null) 
	{
		var stage = this.getStage();
		if(stage != null) stage.context.remove(child);
		child.parent = null;
	}
	this.children.splice(index, 1);
	return true;
};

/**
 * 从DisplayObjectContainer的子级列表中删除指定子对象。
 * @param {DisplayObject} child 指定要删除的显示对象。
 * @return {Boolean} 删除成功返回true，否则返回false。
 */
DisplayObjectContainer.prototype.removeChild = function(child)
{
	return this.removeChildAt(this.children.indexOf(child));
};

/**
 * 删除DisplayObjectContainer的所有子对象。
 */
DisplayObjectContainer.prototype.removeAllChildren = function()
{
	while(this.children.length > 0) this.removeChildAt(0);
};

/**
 * 返回DisplayObjectContainer的位于指定索引处的子显示对象。
 * @param {Integer} index 指定子显示对象的索引位置。
 * @return {DisplayObject} 返回指定的子显示对象。
 */
DisplayObjectContainer.prototype.getChildAt = function(index)
{
	if (index < 0 || index >= this.children.length) return null;
	return this.children[index];
};

/**
 * 返回指定对象在DisplayObjectContainer的子级列表中的索引位置。
 * @param {Integer} child 指定子显示对象。
 * @return {Integer} 返回指定子显示对象的索引位置。
 */
DisplayObjectContainer.prototype.getChildIndex = function(child)
{
	return this.children.indexOf(child);
};

/**
 * 设置指定对象在DisplayObjectContainer的子级列表中的索引位置。
 * @param {DisplayObject} child 指定子显示对象。
 * @param {Integer} index 指定子显示对象新的索引位置。
 */
DisplayObjectContainer.prototype.setChildIndex = function(child, index)
{
	if(child.parent != this) return;
	var oldIndex = this.children.indexOf(child);
	if(index == oldIndex) return;
	this.children.splice(oldIndex, 1);
	this.children.splice(index, 0, child);
};

/**
 * 交换在DisplayObjectContainer的子级列表中的两个子对象的索引位置。
 * @param {DisplayObject} child1 指定交换索引位置的子显示对象1。
 * @param {DisplayObject} child2 指定交换索引位置的子显示对象2。
 */
DisplayObjectContainer.prototype.swapChildren = function(child1, child2)
{
	var index1 = this.getChildIndex(child1), index2 = this.getChildIndex(child2);
	this.children[index1] = child2;
	this.children[index2] = child1;
};

/**
 * 交换在DisplayObjectContainer的子级列表中的指定索引位置的两个子对象。
 * @param {Integer} index1 指定交换索引位置1。
 * @param {Integer} index2 指定交换索引位置2。
 */
DisplayObjectContainer.prototype.swapChildrenAt = function(index1, index2)
{
	var child1 = this.getChildAt(index1), child2 = this.getChildAt(index2);
	this.children[index1] = child2;
	this.children[index2] = child1;
};

/**
 * 返回DisplayObjectContainer中指定id的子显示对象。
 * @param {String} 指定子显示对象的id。
 * @return {DisplayObject} 返回指定id的子显示对象。
 */
DisplayObjectContainer.prototype.getChildById = function(id)
{
	for(var i = 0, len = this.children.length; i < len; i++)
	{
		var child = this.children[i];
		if(child.id == id) return child;
	}
	return null;
};

/**
 * 删除并返回DisplayObjectContainer中指定id的子显示对象。
 * @param {String} 指定子显示对象的id。
 * @return {DisplayObject} 返回删除的指定id的子显示对象。
 */
DisplayObjectContainer.prototype.removeChildById = function(id)
{	
	for(var i = 0, len = this.children.length; i < len; i++)
	{
		if(this.children[i].id == id) 
		{
			return this.removeChildAt(i);
		}
	}
	return null;
};

/**
 * 根据参数keyOrFunction指定的子元素键值或自定义函数对DisplayObjectContainer的子元素进行排序。
 * @param keyOrFunction 指定排序的子元素的键值或自定义函数。
 */
DisplayObjectContainer.prototype.sortChildren = function(keyOrFunction)
{
	var f = keyOrFunction;
	if(typeof(f) == "string")
	{
		var key = f;
		f = function(a, b)
		{
			return b[key] - a[key];
		};
	}
	this.children.sort(f);
};

/**
 * 确定指定对象是否为DisplayObjectContainer的子显示对象。
 * @param {DisplayObject} child 指定的显示对象。
 * @return {Boolean} 指定对象为DisplayObjectContainer的子显示对象返回true，否则返回false。
 */
DisplayObjectContainer.prototype.contains = function(child)
{
	return this.getChildIndex(child) != -1;
};

/**
 * 返回DisplayObjectContainer的子显示对象的数量。
 * @return {Integer} 返回子显示对象的数量。
 */
DisplayObjectContainer.prototype.getNumChildren = function()
{
	return this.children.length;
};

/**
 * 覆盖父类DisplayObject的_update方法，更新所有子显示对象的深度。
 * @protected
 */
DisplayObjectContainer.prototype._update = function(timeInfo)
{
	//先更新容器本身的数据，再更新子元素的数据
	var result = true;
	if(this.update != null) result = this.update(timeInfo);
	if(result === false) return;
	
	var copy = this.children.slice(0);
	for(var i = 0, len = copy.length; i < len; i++)
	{
		var child = copy[i];
		child._depth = i + 1;
		child._update(timeInfo);
	}
};

/**
 * 渲染DisplayObjectContainer本身及其所有子显示对象。
 * @param {Context} 渲染上下文。
 */
DisplayObjectContainer.prototype.render = function(context)
{
	DisplayObjectContainer.superClass.render.call(this, context);
	
	for(var i = 0, len = this.children.length; i < len; i++)
	{
		var child = this.children[i];
		child._render(context);
	}
};

/**
 * 返回x和y指定点下的DisplayObjectContainer的子项（或孙子项，依此类推）的数组集合。默认只返回最先加入的子显示对象。
 * @param {Number} x 指定点的x轴坐标。
 * @param {Number} y 指定点的y轴坐标。
 * @param {Boolean} usePolyCollision 指定是否采用多边形碰撞检测。默认为false。
 * @param {Boolean} returnAll 指定是否返回指定点下的所有显示对象。默认为false。
 * @return 返回指定点下的显示对象集合，当然returnAll为false时只返回最先加入的子显示对象。
 */
DisplayObjectContainer.prototype.getObjectUnderPoint = function(x, y, usePolyCollision, returnAll)
{
	if(returnAll) var result = [];
	
	for(var i = this.children.length - 1; i >= 0; i--)
	{
		var child = this.children[i];
		if(child == null || (!child.eventEnabled && child.children == undefined) || !child.visible || child.alpha <= 0) continue;
		
		if(child.children != undefined && child.eventChildren && child.getNumChildren() > 0)
		{			
			var obj = child.getObjectUnderPoint(x, y, usePolyCollision, returnAll);
			if(obj)
			{
				if(returnAll) {if(obj.length > 0) result = result.concat(obj);}
				else return obj;
			}else if(child.hitTestPoint(x, y, usePolyCollision) >= 0)
			{
				if(returnAll) result.push(child);
				else return child;
			}
		}else
		{
			if(child.hitTestPoint(x, y, usePolyCollision) >= 0) 
			{
				if(returnAll) result.push(child);
				else return child;
			}
		}
	}
	if(returnAll) return result;
	return null;
};
	
})();



(function(){

/**
 * 构造函数.
 * @name Stage
 * @augments DisplayObjectContainer
 * @class 舞台是显示对象的根，所有显示对象都会被添加到舞台上，必须传入一个context使得舞台能被渲染。舞台是一种特殊显示对象容器，可以容纳子显示对象。
 * @property stageX 舞台在页面中的X偏移量，即offsetLeft。只读属性。可通过调用updatePosition()方法更新。
 * @property stageY 舞台在页面中的Y偏移量，即offsetTop。只读属性。可通过调用updatePosition()方法更新。
 * @property paused 指示舞台更新和渲染是否暂停。默认为false。
 * @argument props 参数JSON格式为：{context:context} context上下文必须指定。
 */
var Stage = Quark.Stage = function(props)
{
	this.stageX = 0;
	this.stageY = 0;
	this.paused = false;
	  
	this._eventTarget = null;
	
	props = props || {};
	Stage.superClass.constructor.call(this, props);
	this.id = props.id || Quark.UIDUtil.createUID("Stage");
	if(this.context == null) throw "Quark.Stage Error: context is required.";
	
	this.updatePosition();
};
Quark.inherit(Stage, Quark.DisplayObjectContainer);

/**
 * 更新舞台Stage上的所有显示对象。可被Quark.Timer对象注册调用。
 */
Stage.prototype.step = function(timeInfo)
{
	if(this.paused) return;
	this._update(timeInfo);
	this._render(this.context);
};

/**
 * 更新舞台Stage上所有显示对象的数据。
 */
Stage.prototype._update = function(timeInfo)
{	
	//Stage作为根容器，先更新所有子对象，再调用update方法。
	var copy = this.children.slice(0);
	for(var i = 0, len = copy.length; i < len; i++)
	{
		var child = copy[i];
		child._depth = i + 1;
		child._update(timeInfo);
	}
	//update方法提供渲染前更新舞台对象的数据的最后机会。
	if(this.update != null) this.update(timeInfo);
};

/**
 * 渲染舞台Stage上的所有显示对象。
 */
Stage.prototype._render = function(context)
{
	//在canvas渲染方式下，先清除整个画布。
	if(context.clear != null) context.clear(0, 0, this.width, this.height);
	Stage.superClass._render.call(this, context);
};

/**
 * 舞台Stage默认的事件处理器。
 */
Stage.prototype.dispatchEvent = function(e)
{	
	var x = e.pageX || e.clientX, y = e.pageY || e.clientY;
	x = (x - this.stageX) / this.scaleX;
	y = (y - this.stageY) / this.scaleY;
	var obj = this.getObjectUnderPoint(x, y, true), target = this._eventTarget;
	
	e.eventX = x;
	e.eventY = y;
	
	var leave = e.type == "mouseout" && !this.context.canvas.contains(e.relatedTarget);	
	if(target != null && (target != obj || leave))
	{
		e.lastEventTarget = target;
		//派发移开事件mouseout或touchout到上一个事件对象
		var outEvent = (leave || obj == null || e.type == "mousemove") ? "mouseout" : e.type == "touchmove" ? "touchout" : null;
		if(outEvent) target.dispatchEvent({type:outEvent});
		this._eventTarget = null;
	}
	
	//派发事件到目标对象
	if(obj!= null && obj.eventEnabled && e.type != "mouseout")
	{
		e.eventTarget = target = this._eventTarget = obj;
		obj.dispatchEvent(e);
	}
	
	//设置光标状态
	if(!Quark.supportTouch)
	{
		var cursor = (target && target.useHandCursor && target.eventEnabled) ? "pointer" : "";
		this.context.canvas.style.cursor = cursor;
	}
	
	if(leave || e.type != "mouseout") Stage.superClass.dispatchEvent.call(this, e);
};

/**
 * 更新舞台Stage在页面中的偏移位置，即stageX/stageY。
 */
Stage.prototype.updatePosition = function()
{
	var offset = Quark.getElementOffset(this.context.canvas);
	this.stageX = offset.left;
	this.stageY = offset.top;
};

})();



(function(){

/**
 * 构造函数.
 * @name Bitmap
 * @augments DisplayObject
 * @class Bitmap位图类，表示位图图像的显示对象，简单说它就是Image对象的某个区域的抽象表示。
 * @argument {Object} props 一个对象，包含以下属性：
 * <p>image - Image对象。</p>
 * <p>rect - Image对象的矩形区域。格式为：[0,0,100,100]</p>
 */
var Bitmap = Quark.Bitmap = function(props)
{	
	this.image = null;
	this.rectX = 0; //ready-only
	this.rectY = 0; //ready-only
	this.rectWidth = 0; //ready-only
	this.rectHeight = 0; //ready-only
	
	props = props || {};
	Bitmap.superClass.constructor.call(this, props);
	this.id = props.id || Quark.UIDUtil.createUID("Bitmap");
	
	this.setRect(props.rect || [0, 0, this.image.width, this.image.height]);	
	this.setDrawable(this.image);
	this._stateList.push("rectX", "rectY", "rectWidth", "rectHeight");
};
Quark.inherit(Bitmap, Quark.DisplayObject);

/**
 * 设置Bitmap对象的image的显示区域。
 * @param {Array} rect 要设置的显示区域数组。格式为：[rectX, rectY, rectWidth, rectHeight]。
 */
Bitmap.prototype.setRect = function(rect)
{
	this.rectX = rect[0];
	this.rectY = rect[1];
	this.rectWidth = this.width = rect[2];
	this.rectHeight = this.height = rect[3];
};

/**
 * 覆盖父类的渲染方法。渲染image指定的显示区域。
 * @param {Context} context 渲染上下文。
 */
Bitmap.prototype.render = function(context)
{
	context.draw(this, this.rectX, this.rectY, this.rectWidth, this.rectHeight, 0, 0, this.width, this.height);
};

})();



(function(){

/**
 * 构造函数.
 * @name MovieClip
 * @augments Bitmap
 * @class MovieClip影片剪辑类，表示一组动画片段。MovieClip是由Image对象的若干矩形区域组成的集合序列，并按照一定规则顺序播放。帧frame的定义格式为：{rect:*required*, label:"", interval:0, stop:0, jump:-1}。
 */
var MovieClip = Quark.MovieClip = function(props)
{	
	this.interval = 0;	
	this.paused = false;
	this.useFrames = false;
	this.currentFrame = 0; //read-only
	
	this._frames = [];
	this._frameLabels = {};	
	this._frameDisObj = null;
	this._displayedCount = 0;
	
	props = props || {};
	MovieClip.superClass.constructor.call(this, props);
	this.id = props.id || Quark.UIDUtil.createUID("MovieClip");

	if(props.frames) this.addFrame(props.frames);
};
Quark.inherit(MovieClip, Quark.Bitmap);

/**
 * 向MovieClip中添加帧frame，可以是单个帧或多帧的数组。
 */
MovieClip.prototype.addFrame = function(frame)
{
	var start = this._frames.length;
	if(frame instanceof Array)
	{
		 for(var i = 0; i < frame.length; i++) this.setFrame(frame[i], start + i);
	}else
	{
		this.setFrame(frame, start);
	}
	return this;
};

/**
 * 指定帧frame在MovieClip的播放序列中的位置（从0开始）。
 */
MovieClip.prototype.setFrame = function(frame, index)
{
	if(index == undefined || index > this._frames.length) index = this._frames.length;
	else if(index < 0) index = 0;
	
	this._frames[index] = frame;
	if(frame.label) this._frameLabels[frame.label] = frame;
	if(frame.interval == undefined) frame.interval = this.interval;
	if(index == 0 && this.currentFrame == 0) this.setRect(frame.rect);
};

/**
 * 获得指定位置或标签的帧frame。
 */
MovieClip.prototype.getFrame = function(indexOrLabel)
{
	if(typeof(indexOrLabel) == "number") return this._frames[indexOrLabel];
	return this._frameLabels[indexOrLabel];
};

/**
 * 从当前位置开始播放动画序列。
 */
MovieClip.prototype.play = function()
{
	this.paused = false;
};

/**
 * 停止播放动画序列。
 */
MovieClip.prototype.stop = function()
{
	this.paused = true;
};

/**
 * 跳转到指定位置或标签的帧，并停止播放动画序列。
 */
MovieClip.prototype.gotoAndStop = function(indexOrLabel)
{	
	this.currentFrame = this.getFrameIndex(indexOrLabel);
	this.paused = true;
};

/**
 * 跳转到指定位置或标签的帧，并继续播放动画序列。
 */
MovieClip.prototype.gotoAndPlay = function(indexOrLabel)
{
	this.currentFrame = this.getFrameIndex(indexOrLabel);
	this.paused = false;
};

/**
 * 获得指定参数对应的帧的位置。
 */
MovieClip.prototype.getFrameIndex = function(indexOrLabel)
{
	if(typeof(indexOrLabel) == "number") return indexOrLabel;
	var frame = this._frameLabels[indexOrLabel], frames = this._frames;	
	for(var i = 0; i < frames.length; i++)
	{
		if(frame == frames[i]) return i;
	}
	return -1;
};

/**
 * 播放动画序列的下一帧。
 */
MovieClip.prototype.nextFrame = function(displayedDelta)
{	
	var frame = this._frames[this.currentFrame];
	
	if(frame.interval > 0)
	{
		var count = this._displayedCount + displayedDelta;
		this._displayedCount = frame.interval > count ? count : 0;
	}
	
	if(frame.jump >= 0 || typeof(frame.jump) == "string") 
	{
		if(this._displayedCount == 0 || !frame.interval)
		{
			return this.currentFrame = this.getFrameIndex(frame.jump);
		}
	}
	
	if(frame.interval > 0 && this._displayedCount > 0) return this.currentFrame;
	else if(this.currentFrame >= this._frames.length - 1) return this.currentFrame = 0;
	else return ++this.currentFrame;
};

/**
 * 返回MovieClip的帧数。
 */
MovieClip.prototype.getNumFrames = function()
{
	return this._frames.length;
};

/**
 * 更新MovieClip对象的属性。
 */
MovieClip.prototype._update = function(timeInfo)
{
	var frame = this._frames[this.currentFrame];
	if(frame.stop)
	{
		this.stop();
		return;
	}
	
	if(!this.paused) 
	{
		var delta = this.useFrames ? 1 : timeInfo && timeInfo.deltaTime;
		frame = this._frames[this.nextFrame(delta)];
	}
	this.setRect(frame.rect);
	
	MovieClip.superClass._update.call(this, timeInfo);
};

/**
 * 渲染当前帧到舞台。
 */
MovieClip.prototype.render = function(context)
{
	var frame = this._frames[this.currentFrame], rect = frame.rect;
	context.draw(this, rect[0], rect[1], rect[2], rect[3], 0, 0, this.width, this.height);
};

})();



(function(){

/**
 * 构造函数.
 * @name Button
 * @augments DisplayObjectContainer
 * @class Button类继承自DisplayObjectContainer，是Quark中的简单按钮实现。
 * @argument {Object} props 一个对象，包含以下属性：
 * <p>image - Image对象。</p>
 * <p>up - 按钮弹起状态下的显示帧数组对象。如：[0,0,50,50]。
 * <p>over - 按钮经过状态下的显示帧数组对象。如：[50,0,50,50]。
 * <p>down - 按钮按下状态下的显示帧数组对象。如：[100,0,50,50]。
 * <p>disabled - 按钮不可用状态下的显示帧数组对象。如：[150,0,50,50]。
 */
var Button = Quark.Button = function(props)
{
	this.state = Button.UP;
	this.enabled = true;
    
	props = props || {};
	Button.superClass.constructor.call(this, props);
	this.id = props.id || Quark.UIDUtil.createUID("Button");

	this._skin = new Quark.MovieClip({id:"skin", image:props.image});
	this.addChild(this._skin);
	this._skin.stop();

	this.eventChildren = false;
	if(props.useHandCursor === undefined) this.useHandCursor = true;
	if(props.up) this.setUpState(props.up);
	if(props.over) this.setOverState(props.over);
	if(props.down) this.setDownState(props.down);
	if(props.disabled) this.setDisabledState(props.disabled);
};
Quark.inherit(Button, Quark.DisplayObjectContainer);

/**
 * 按钮的弹起状态。常量值。
 */
Button.UP = "up";
/**
 * 按钮的经过状态。常量值。
 */
Button.OVER = "over";
/**
 * 按钮的按下状态。常量值。
 */
Button.DOWN = "down";
/**
 * 按钮的不可用状态。常量值。
 */
Button.DISABLED = "disabled";

/**
 * 设置按钮弹起状态的显示帧。
 * @param {Array} upState 弹起状态的显示帧。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setUpState = function(upState)
{
	upState.label = Button.UP;
	this._skin.setFrame(upState, 0);
	this.upState = upState;
	return this;
};

/**
 * 设置按钮经过状态的显示帧。
 * @param {Array} overState 经过状态的显示帧。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setOverState = function(overState)
{
	overState.label = Button.OVER;
	this._skin.setFrame(overState, 1);
	this.overState = overState;
	return this;
};

/**
 * 设置按钮按下状态的显示帧。
 * @param {Array} downState 点击状态的显示帧。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setDownState = function(downState)
{
	downState.label = Button.DOWN;
	this._skin.setFrame(downState, 2);
	this.downState = downState;
	return this;
};

/**
 * 设置按钮不可用状态的显示帧。
 * @param {Array} disabledState 不可用状态的显示帧。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setDisabledState = function(disabledState)
{
	disabledState.label = Button.DISABLED;
	this._skin.setFrame(disabledState, 3);
	this.disabledState = disabledState;
	return this;
};

/**
 * 设置按钮是否启用。
 * @param {Boolean} enabled 指定按钮是否启用。默认为false。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setEnabled = function(enabled)
{
	if(this.enabled == enabled) return this;
	this.eventEnabled = this.enabled = enabled;	 
	if(!enabled)
	{
		if(this.disabledState) this._skin.gotoAndStop(Button.DISABLED);
		else this._skin.gotoAndStop(Button.UP);
	}else
	{
		if(this._skin.currentFrame == 3) this._skin.gotoAndStop(Button.UP);
	}
	return this;
};

/**
 * 改变按钮的显示状态。
 * @param {String} state 指定按钮的显示状态。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.changeState = function(state)
{
	if(this.state == state) return;
	this.state = state;

	switch(state)
	{
		case Button.OVER:
		case Button.DOWN:
		case Button.UP:
			if(!this.enabled) this.eventEnabled = this.enabled = true;
			this._skin.gotoAndStop(state);
			break;
		case Button.DISABLED:
			this.setEnabled(false);
			break;
	}
	return this;
};

/**
 * 按钮的默认事件处理行为。
 * @private
 */
Button.prototype.dispatchEvent = function(e)
{
	if(!this.enabled) return;
	
	switch(e.type)
	{
		case "mousemove":
			if(this.overState) this.changeState(Button.OVER);		
			break;
		case "mousedown":
		case "touchstart":
		case "touchmove":
			if(this.downState) this.changeState(Button.DOWN);
			break;
		case "mouseup":
			if(this.overState) this.changeState(Button.OVER);
			else this.changeState(Button.UP);
			break;
		case "mouseout":
		case "touchout":
		case "touchend":
			if(this.upState) this.changeState(Button.UP);
			break;
	}
	Button.superClass.dispatchEvent.call(this, e);
};

/**
 * 把Button的drawable置空，否则传入image参数时会绘制成Button的背景。
 * @private
 */
Button.prototype.setDrawable = function(drawable)
{
	Button.superClass.setDrawable.call(this, null);
};

})();



(function(){

/**
 * 构造函数.
 * @name Graphics
 * @augments DisplayObject
 * @class Graphics类包含一组创建矢量图形的方法。
 */ 
var Graphics = Quark.Graphics = function(props)
{	
	this.lineWidth = 1;
	this.strokeStyle = "0";
	this.lineAlpha = 1;
	this.lineCap = null; //"butt", "round", "square"
	this.lineJoin = null; //"miter", "round", "bevel"
	this.miterLimit = 10;
	
	this.hasStroke = false;
	this.hasFill = false;
	
	this.fillStyle = "0";
	this.fillAlpha = 1;
	
	props = props || {};
	Graphics.superClass.constructor.call(this, props);
	this.id = Quark.UIDUtil.createUID("Graphics");
	
	this._actions = [];
	this._cache = null;
};
Quark.inherit(Graphics, Quark.DisplayObject);

/**
 * 指定绘制图形的线条样式。
 */
Graphics.prototype.lineStyle = function(thickness, lineColor, alpha, lineCap, lineJoin, miterLimit)
{	
	this._addAction(["lineWidth", (this.lineWidth = thickness || 1)]);
	this._addAction(["strokeStyle", (this.strokeStyle = lineColor || "0")]);
	this._addAction(["lineAlpha", (this.lineAlpha = alpha || 1)]);
	if(lineCap != undefined) this._addAction(["lineCap", (this.lineCap = lineCap)]);
	if(lineJoin != undefined) this._addAction(["lineJoin", (this.lineJoin = lineJoin)]);
	if(miterLimit != undefined) this._addAction(["miterLimit", (this.miterLimit = miterLimit)]);
	this.hasStroke = true;
	return this;
};

/**
 * 指定绘制图形的填充样式和透明度。
 */
Graphics.prototype.beginFill = function(fill, alpha)
{
	this._addAction(["fillStyle", (this.fillStyle = fill)]);
	this._addAction(["fillAlpha", (this.fillAlpha = alpha || 1)]);
	this.hasFill = true;
	return this;
};

/**
 * 应用并结束笔画的绘制和图形样式的填充。
 */
Graphics.prototype.endFill = function()
{
	if(this.hasStroke) this._addAction(["stroke"]);
	if(this.hasFill) this._addAction(["fill"]);
	return this;
};

/**
 * 指定绘制图形的线性渐变填充样式。
 */
Graphics.prototype.beginLinearGradientFill = function(x0, y0, x1, y1, colors, ratios)
{
	var gradient = Graphics._getContext().createLinearGradient(x0, y0, x1, y1);
	for (var i = 0, len = colors.length; i < len; i++)
	{
		gradient.addColorStop(ratios[i], colors[i]);
	}
	this.hasFill = true;
	return this._addAction(["fillStyle", (this.fillStyle = gradient)]);
};

/**
 * 指定绘制图形的放射性渐变填充样式。
 */
Graphics.prototype.beginRadialGradientFill = function(x0, y0, r0, x1, y1, r1, colors, ratios)
{
	var gradient = Graphics._getContext().createRadialGradient(x0, y0, r0, x1, y1, r1);
	for (var i = 0, len = colors.length; i < len; i++)
	{
		gradient.addColorStop(ratios[i], colors[i]);
	}
	this.hasFill = true;
	return this._addAction(["fillStyle", (this.fillStyle = gradient)]);
};

/**
 * 开始一个位图填充样式。
 * @param {HTMLImageElement} image 指定填充的Image对象。
 * @param {String} repetition 指定填充的重复设置参数。它可以是以下任意一个值：repeat, repeat-x, repeat-y, no-repeat。默认为""。
 */
Graphics.prototype.beginBitmapFill = function(image, repetition)
{
	var pattern = Graphics._getContext().createPattern(image, repetition || "");
	this.hasFill = true;
	return this._addAction(["fillStyle", (this.fillStyle = pattern)]);
};

/**
 * 开始一个新的路径。
 */
Graphics.prototype.beginPath = function()
{
	return this._addAction(["beginPath"]);
};

/**
 * 关闭当前的路径。
 */
Graphics.prototype.closePath = function()
{
	return this._addAction(["closePath"]);
};

/**
 * 绘制一个矩形。
 */
Graphics.prototype.drawRect = function(x, y, width, height)
{
	return this._addAction(["rect", x, y, width, height]);
};

/**
 * 绘制一个复杂的圆角矩形。
 */
Graphics.prototype.drawRoundRectComplex = function(x, y, width, height, cornerTL, cornerTR, cornerBR, cornerBL)
{
	this._addAction(["moveTo", x + cornerTL, y]);
	this._addAction(["lineTo", x + width - cornerTR, y]);
	this._addAction(["arc", x + width - cornerTR, y + cornerTR, cornerTR, -Math.PI/2, 0, false]);
	this._addAction(["lineTo", x + width, y + height - cornerBR]);
	this._addAction(["arc", x + width - cornerBR, y + height - cornerBR, cornerBR, 0, Math.PI/2, false]);
	this._addAction(["lineTo", x + cornerBL, y + height]);
	this._addAction(["arc", x + cornerBL, y + height - cornerBL, cornerBL, Math.PI/2, Math.PI, false]);
	this._addAction(["lineTo", x, y + cornerTL]);
	this._addAction(["arc", x + cornerTL, y + cornerTL, cornerTL, Math.PI, Math.PI*3/2, false]);
	return this;
};

/**
 * 绘制一个圆角矩形。
 */
Graphics.prototype.drawRoundRect = function(x, y, width, height, cornerSize)
{
	return this.drawRoundRectComplex(x, y, width, height, cornerSize, cornerSize, cornerSize, cornerSize);
};

/**
 * 绘制一个圆。
 */
Graphics.prototype.drawCircle = function(x, y, radius)
{
	return this._addAction(["arc", x + radius, y + radius, radius, 0, Math.PI * 2, 0]);
};

/**
 * 绘制一个椭圆。
 */
Graphics.prototype.drawEllipse = function(x, y, width, height)
{
	if(width == height) return this.drawCircle(x, y, width);
	
	var w = width / 2, h = height / 2, C = 0.5522847498307933, cx = C * w, cy = C * h;
	x = x + w;
	y = y + h;
	
	this._addAction(["moveTo", x + w, y]);
	this._addAction(["bezierCurveTo", x + w, y - cy, x + cx, y - h, x, y - h]);
	this._addAction(["bezierCurveTo", x - cx, y - h, x - w, y - cy, x - w, y]);
	this._addAction(["bezierCurveTo", x - w, y + cy, x - cx, y + h, x, y + h]);
	this._addAction(["bezierCurveTo", x + cx, y + h, x + w, y + cy, x + w, y]);
	return this;
};

/**
 * 根据参数指定的SVG数据绘制一条路径。
 * 代码示例: 
 * <p>var path = "M250 150 L150 350 L350 350 Z";</p>
 * <p>var shape = new Quark.Graphics({width:500, height:500});</p>
 * <p>shape.drawSVGPath(path).beginFill("#0ff").endFill();</p>
 */
Graphics.prototype.drawSVGPath = function(pathData)
{
	var path = pathData.split(/,| (?=[a-zA-Z])/);
	
	this._addAction(["beginPath"]);
	for(var i = 0, len = path.length; i < len; i++)
	{
		var str = path[i], cmd = str[0].toUpperCase(), p = str.substring(1).split(/,| /);
		if(p[0].length == 0) p.shift();

		switch(cmd)
		{
			case "M":
				this._addAction(["moveTo", p[0], p[1]]);
				break;
			case "L":
				this._addAction(["lineTo", p[0], p[1]]);
				break;
			case "C":
				this._addAction(["bezierCurveTo", p[0], p[1], p[2], p[3], p[4], p[5]]);
				break;
			case "Z":
				this._addAction(["closePath"]);
				break;
			default:
				break;
		}
	}
	return this;
};

/**
 * 执行全部绘制动作。内部私有方法。
 * @private
 */
Graphics.prototype._draw = function(context)
{	
	context.beginPath();
	for(var i = 0, len = this._actions.length; i < len; i++)
	{
		var action = this._actions[i], 
			f = action[0], 
			args = action.length > 1 ? action.slice(1) : null;
		
		if(typeof(context[f]) == "function") context[f].apply(context, args);
		else context[f] = action[1];
	}
};

/**
 * Override method.
 * @private
 */
Graphics.prototype.getDrawable = function(context)
{
	//for DOMContext drawing only
	if(this.drawable == null) this.setDrawable(this.toImage());
	return this.drawable.get(this, context);
};

/**
 * 缓存graphics到一个canvas或image。可用来提高渲染效率。
 */
Graphics.prototype.cache = function(toImage)
{
	var canvas = Quark.createDOM("canvas", {width:this.width, height:this.height});
	this._draw(canvas.getContext("2d"));
	
	this._cache = canvas;
	if(toImage) this._cache = this.toImage();
	return this._cache;
};

/**
 * 清除缓存。
 */
Graphics.prototype.uncache = function()
{
	this._cache = null;
};

/**
 * 把Graphics对象转换成dataURL格式的位图。
 * @param {String} type 指定转换为DataURL格式的图片mime类型。默认为"image/png"。
 */
Graphics.prototype.toImage = function(type)
{
	var cache = this._cache || this.cache(true);
	if(cache instanceof HTMLImageElement) return cache;
	
	var img = new Image();
	img.src = cache.toDataURL(type || "image/png");
	img.width = this.width;
	img.height = this.height;
	return img;
};

/**
 * 清除所有绘制动作并复原所有初始状态。
 */
Graphics.prototype.clear = function()
{
	this._actions.length = 0;
	this._cache = null;
	
	this.lineWidth = 1;
	this.strokeStyle = "0";
	this.lineAlpha = 1;
	this.lineCap = null;
	this.lineJoin = null;
	this.miterLimit = 10;
	this.hasStroke = false;
	
	this.fillStyle = "0";
	this.fillAlpha = 1;
};

/** 
 * 添加一个绘制动作。内部私有方法。
 * @private
 */
Graphics.prototype._addAction = function(action)
{
	this._actions.push(action);
	return this;
};

/**
 * @private
 */
Graphics._getContext = function()
{
	var ctx = Quark.createDOM("canvas").getContext("2d");
	this._getContext = function()
	{
		return ctx;
	};
	return ctx;
};
	
})();



(function(){

/**
 * 构造函数。
 * @name Text
 * @augments DisplayObject
 * @class Text类提供简单的文字显示功能。
 * @property text 指定要显示的文本内容。
 * @property font 指定使用的字体样式。
 * @property color 指定使用的字体颜色。
 * @property textAlign 指定文本的对齐方式。可以是以下任意一个值："start", "end", "left", "right", and "center"。
 * @property outline 指定文本是绘制边框还是填充。
 * @property maxWidth 指定文本绘制的最大宽度。仅在canvas中使用。
 * @property lineWidth 指定文本行的最大宽度。
 * @property lineSpacing 指定文本的行距。单位为像素。
 * @property fontMetrics 指定字体的度量对象。一般可忽略此属性，可用于提高性能。
 */
var Text = Quark.Text = function(props)
{
	this.text = "";
	this.font = "12px arial";
	this.color = "#000";
	this.textAlign = "start";
	this.outline = false;
	this.maxWidth = 10000;
	this.lineWidth = null;
	this.lineSpacing = 0;
	this.fontMetrics = null;

	props = props || {};
	Text.superClass.constructor.call(this, props);
	this.id = Quark.UIDUtil.createUID("Text");

	if(this.fontMetrics == null) this.fontMetrics = Text.getFontMetrics(this.font);
}
Quark.inherit(Text, Quark.DisplayObject);


/**
 * 在指定的渲染上下文上绘制文本。
 * @private
 */
Text.prototype._draw = function(context)
{
	if(!this.text || this.text.length == 0) return;

	//set drawing style
	context.font = this.font;
	context.textAlign = this.textAlign;
	context.textBaseline = "top";
	if(this.outline) context.strokeStyle = this.color;
	else context.fillStyle = this.color;

	//find and draw all explicit lines
	var lines = this.text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
	var y = 0, lineHeight = this.fontMetrics.height + this.lineSpacing;
	this.width = this.lineWidth || 0;

	for(var i = 0, len = lines.length; i < len; i++)
	{
		var line = lines[i], width = context.measureText(line).width;

		//check if the line need to split
		if(this.lineWidth == null || width < this.lineWidth)
		{
			if(width > this.width) this.width = width;
			this._drawTextLine(context, line, y);
			y += lineHeight;
			continue;
		}

		//split the line by each single word, loop to find the break
		//TODO: optimize the regular expression
		var words = line.split(/([^\x00-\xff]|\b)/), str = words[0];
		for(var j = 1, wlen = words.length; j < wlen; j++)
		{
			var word = words[j];
			if(!word || word.length == 0) continue;

			var newWidth = context.measureText(str + word).width;
			if(newWidth > this.lineWidth)
			{
				this._drawTextLine(context, str, y);
				y += lineHeight;
				str = word;
			}else
			{
				str += word;
			}
		}

		//draw remaining string
		this._drawTextLine(context, str, y);
		y += lineHeight;
	}

	this.height = y;
};

/**
 * 在指定的渲染上下文上绘制一行文本。
 * @private
 */
Text.prototype._drawTextLine = function(context, text, y)
{
	var x = 0;
	switch(this.textAlign)
	{
		case "center":
			x = this.width*0.5;
			break;
		case "right":
		case "end":
			x = this.width;
			break;
	};
	if(this.outline) context.strokeText(text, x, y, this.maxWidth);
	else context.fillText(text, x, y, this.maxWidth);
};

/**
 * 指定渲染文本的字体样式。
 */
Text.prototype.setFont = function(font, ignoreFontMetrics)
{
	if(this.font == font) return;
	this.font = font;
	if(!ignoreFontMetrics) this.fontMetrics = Text.getFontMetrics(this.font);
};

/**
 * Overrideed.
 * @private
 */
Text.prototype.render = function(context)
{
	if(context instanceof Quark.DOMContext)
	{
		var dom = this.getDrawable(context), style = dom.style;
		style.font = this.font;
		style.textAlign = this.textAlign;
		style.color = this.color;
		//Notice: be care of width/height might be 0.
		style.width = this.width + "px";
		style.height = this.height + "px";
		style.lineHeight = (this.fontMetrics.height + this.lineSpacing) + "px";
		dom.innerHTML = this.text;
	}
	Text.superClass.render.call(this, context);
};

/**
 * Overrideed.
 * @private
 */
Text.prototype.getDrawable = function(context)
{
	//for DOMContext drawing only
	if(this.drawable == null) this.setDrawable(Quark.createDOM("div"), true);
	return this.drawable.get(this, context);
};

/**
 * 此方法可帮助我们得到指定字体的行高、基准线等度量信息。
 * @method getFontMetrics
 * @return {Object} 返回字体的度量信息，包括height、ascent、descent等。
 */
Text.getFontMetrics = function(font)
{
	var metrics = { };
	var elem = Quark.createDOM("div", {style:{font:font, position:"absolute"}, innerHTML:"M"});
	document.body.appendChild(elem);
	//the line height of the specific font style.
	metrics.height = elem.offsetHeight;

	//trick: calculate baseline shift by creating 1px height element that will be aligned to baseline.
	elem.innerHTML = '<div style="display:inline-block; width:1px; height:1px;"></div>';
	var baseline = elem.childNodes[0];
	//the ascent value is the length from the baseline to the top of the line height.
	metrics.ascent = baseline.offsetTop + baseline.offsetHeight;
	//the descent value is the length from the baseline to the bottom of the line height.
	metrics.descent = metrics.height - metrics.ascent;
	
	document.body.removeChild(elem);
	return metrics;
};


})();


