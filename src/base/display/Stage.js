
(function(){

/**
 * Constructor.
 * @name Stage
 * @augments DisplayObjectContainer
 * @class 舞台是显示对象的根，所有显示对象都会被添加到舞台上，必须传入一个context使得舞台能被渲染。舞台是一种特殊显示对象容器，可以容纳子显示对象。
 */
var Stage = Quark.Stage = function(props)
{
	this.stageX = 0;
	this.stageY = 0;
	this.paused = false;
	
	this.eventTarget = null;
	
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
	for(var i = 0, len = this.children.length; i < len; i++)
	{
		var child = this.children[i];
		child._depth = i;
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
 * 舞台Stage默认的事件处理器。调用事件发生的目标显示对象的onEvent回调。
 */
Stage.prototype._onEvent = function(e)
{	
	var x = e.pageX - this.stageX, y = e.pageY - this.stageY;
	var obj = this.getObjectUnderPoint(x, y);
		
	if(this.eventTarget != null && this.eventTarget != obj)
	{
		//派发移开事件mouseout或touchout到上一个事件对象
		var outEvent = e.type == "mousemove" ? "mouseout" : e.type == "touchmove" ? "touchout" : null;
		if(outEvent) this.eventTarget._onEvent({type:outEvent});
		this.eventTarget = null;
	}
	//派发事件到目标对象
	if(obj!= null && obj.eventEnabled)
	{
		this.eventTarget = obj;
		obj._onEvent(e);
	}
	//设置光标状态
	if(!Quark.supportTouch)
	{
		var cursor = (this.eventTarget && this.eventTarget.useHandCursor && this.eventTarget.eventEnabled) ? "pointer" : "";
		this.context.canvas.style.cursor = cursor;
	}

    if(this.onEvent != null) this.onEvent(e);
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