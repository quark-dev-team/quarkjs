
(function(){

/**
 * Constructor.
 * @name CanvasContext
 * @augments Context
 * @class CanvasContext是Canvas渲染上下文，将显示对象渲染到指定的Canvas上。
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
 * 绘制指定对象到Canvas上。
 */
CanvasContext.prototype.draw = function(target)
{
	var img = target.getDrawable(this);
	if(img != null)
	{
		arguments[0] = img;
		this.context.drawImage.apply(this.context, arguments);
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
 */
CanvasContext.prototype.clear = function(x, y, width, height)
{
	this.context.clearRect(x, y, width, height);
	//this.canvas.width = this.canvas.width;
};

})();