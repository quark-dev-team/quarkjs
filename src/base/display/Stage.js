
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