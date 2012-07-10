
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