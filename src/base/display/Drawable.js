
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