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
	cm = new Quark.Matrix(1, 0, 0, 1, x, y).concat(cm);
	return {x:cm.tx, y:cm.ty};
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
