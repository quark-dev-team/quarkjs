
(function(){

/**
 * Constructor.
 * @name DisplayObject
 * @class DisplayObject类是可放在舞台上的所有显示对象的基类。DisplayObject类定义了若干显示对象的基本属性。渲染一个DisplayObject其实是进行若干变换后再渲染其drawable对象。
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
	
	this.drawable = null;	
	this.parent = null;	
	this.context = null;
	
	this._depth = 0;
	this._lastState = {};
	this._stateList = ["x", "y", "regX", "regY", "width", "height", "alpha", "scaleX", "scaleY", "rotation", "visible", "_depth"];
	
	Quark.merge(this, props);
};

/**
 * 设置可绘制对象，默认是一个Image对象，可通过覆盖此方法进行DOM绘制。
 */
DisplayObject.prototype.setDrawable = function(drawable)
{ 
	if(this.drawable == null || this.drawable.rawDrawable != drawable)
	{
		this.drawable = new Quark.Drawable(drawable);
	}
};

/**
 * 获得可绘制对象实体，如Image或Canvas等其他DOM对象。
 */
DisplayObject.prototype.getDrawable = function(context)
{
	//context = context || this.context || this.getStage().context;
	return this.drawable && this.drawable.get(this, context);
};

/**
 * 对象数据更新接口，仅供框架内部或组件开发者使用。用户通常应该重写update方法。
 */
DisplayObject.prototype._update = function(timeInfo)
{ 
	this.update(timeInfo);
};

/**
 * 对象数据更新接口，可通过覆盖此方法实现对象的数据更新。
 */
DisplayObject.prototype.update = function(timeInfo){ };

/**
 * 对象渲染接口，仅供框架内部或组件开发者使用。用户通常应该重写render方法。
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
 */
DisplayObject.prototype.render = function(context)
{
	context.draw(this, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
};

/**
 * DisplayObject对象的系统事件处理器，仅供框架内部或组件开发者使用。用户通常应该设置onEvent回调。
 */
DisplayObject.prototype._onEvent = function(e) 
{ 	
	if(this.onEvent != null) this.onEvent(e);
};

/**
 * DisplayObject对象的系统事件处理器，可通过设置onEvent回调来处理事件。
 */
DisplayObject.prototype.onEvent = null;

/**
 * 保存DisplayObject对象的状态列表中的各种属性状态。
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
 */
DisplayObject.prototype.getState = function(p)
{
	return this._lastState["last" + p];
};

/**
 * 比较DisplayObject对象的当前状态和最近一次保存的状态，返回指定属性中是否发生改变。
 */
DisplayObject.prototype.propChanged = function()
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
 * 计算DisplayObject对象的边框，以确定它是否与x和y参数指定的点重叠或相交。
 */
DisplayObject.prototype.hitTestPoint = function(x, y, usePixelCollision, threshold)
{
	if(!usePixelCollision)
	{
		var b = this.getBounds();		
		return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
	}
	//TODO: pixel collision
	return false;
};

/**
 * 计算DisplayObject对象的边框，以确定它是否与object参数指定的显示对象的边框重叠或相交。
 */
DisplayObject.prototype.hitTestObject = function(object, usePixelCollision, threshold)
{
	var b1 = this.getBounds(), b2 = object.getBounds();
	if(!usePixelCollision)
	{
		return (b1.x <= b2.x + b2.width && b2.x <= b1.x + b1.width &&
				b1.y <= b2.y + b2.height && b2.y <= b1.y + b1.height);		
	}
	//TODO: pixel collision
	return false;
};

/**
 * 将x和y指定的点从显示对象的（本地）坐标转换为舞台（全局）坐标。
 */
DisplayObject.prototype.localToGlobal = function(x, y)
{
	var cm = getConcatenatedMatrix(this);
	return {x:cm.tx+x, y:cm.ty+y};
};

/**
 * 将x和y指定的点从舞台（全局）坐标转换为显示对象的（本地）坐标。
 */
DisplayObject.prototype.globalToLocal = function(x, y) 
{
	var cm = getConcatenatedMatrix(this).invert();
	return {x:cm.tx+x, y:cm.ty+y};
};

/**
 * 将x和y指定的点从显示对象的（本地）坐标转换为指定对象的坐标系里坐标。
 */
DisplayObject.prototype.localToTarget = function(x, y, target) 
{
	var p = this.localToGlobal(x, y);
	return target.globalToLocal(p.x, p.y);
};

/**
 * 获得一个对象的连接矩阵。
 */
function getConcatenatedMatrix(obj) 
{	
	var mtx = new Quark.Matrix(1, 0, 0, 1, 0, 0);
	for (var o = obj; o.parent != null; o = o.parent)
	{		
		var cos = 1, sin = 0;
		if(o.rotation%360 != 0)
		{
			var r = o.rotation * Quark.RADIAN;
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
 * 返回DisplayObject对象相对于targetCoordinateSpace参数对象指定的坐标系的显示对象矩形区域。
 */
DisplayObject.prototype.getBounds = function(targetCoordinateSpace)
{
	var p = targetCoordinateSpace == null ? this.localToGlobal(0, 0) : this.localToTarget(0, 0, targetCoordinateSpace);
	var x = this.x, y = this.y, regX = this.regX, regY = this.regY, w = this.getCurrentWidth(), h = this.getCurrentHeight();
	//TODO: bugfix if scaleX < 0 or scaleY < 0.
	if(this.rotation%360 != 0)
	{
		var radian = this.rotation * Quark.RADIAN;
		var sin = Math.sin(radian), cos = Math.cos(radian);
		var origin = {x:x, y:y};
		var p1 = rotatePoint(origin, {x:x-regX, y:y-regY}, sin, cos);
		var p2 = rotatePoint(origin, {x:x-regX+w, y:y-regY}, sin, cos);
		var p3 = rotatePoint(origin, {x:x-regX+w, y:y-regY+h}, sin, cos);
		var p4 = rotatePoint(origin, {x:x-regX, y:y-regY+h}, sin, cos);
		this._rotatedPoints = [p1, p2, p3, p4];
		
		var left = Math.min(p1.x, p2.x, p3.x, p4.x);
		var right = Math.max(p1.x, p2.x, p3.x, p4.x);
		var top = Math.min(p1.y, p2.y, p3.y, p4.y);
		var bottom = Math.max(p1.y, p2.y, p3.y, p4.y);
		return {x:left, y:top, width:right-left, height:bottom-top};
	}
	return {x:p.x, y:p.y, width:w, height:h};
};

/**
 * 把一个点旋转指定角度。
 */
function rotatePoint(origin, point, sin, cos)
{	
	var x = (point.x - origin.x) * cos - (point.y - origin.y) * sin;
	var y = (point.y - origin.y) * cos + (point.x - origin.x) * sin;
	return {x:(x + origin.x + 0.5) >> 0, y:(y + origin.y + 0.5) >> 0};
};

/**
 * 获得DisplayObject对象变形后的宽度。
 */
DisplayObject.prototype.getCurrentWidth = function()
{
	return Math.abs(this.width * this.scaleX);
};

/**
 * 获得DisplayObject对象变形后的高度。
 */
DisplayObject.prototype.getCurrentHeight = function()
{
	return Math.abs(this.height * this.scaleY);
};

/**
 * 获得DisplayObject对象的舞台引用。如未被添加到舞台，则返回null。
 */
DisplayObject.prototype.getStage = function()
{
	var obj = this;
	while(obj.parent) obj = obj.parent;
	if(obj instanceof Quark.Stage) return obj;
	return null;
};

/**
 * 返回DisplayObject对象的全路径的字符串表示形式，方便debug。如Stage1.Container2.Bitmap3。
 */
DisplayObject.prototype.toString = function()
{
	return Quark.UIDUtil.displayObjectToString(this);
	//return this.id || this.name;
};

})();