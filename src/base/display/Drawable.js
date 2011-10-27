
(function(){

/**
 * Constructor.
 * @name Drawable
 * @class Drawable是可绘制图像或DOM的包装。当封装的是HTMLImageElement、HTMLCanvasElement或HTMLVideoElement对象时，可同时支持canvas和dom两种渲染方式，而如果封装的是dom时，则不支持canvas方式。
 */
var Drawable = Quark.Drawable = function(drawable, isDOM)
{	
	if(isDrawable(drawable)) this.rawDrawable = drawable;
	if(isDOM === true) this.domDrawable = drawable;
};

/**
 * 根据context上下文获取不同的Drawable包装的对象。
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

function isDrawable(elem)
{
	return (elem instanceof HTMLImageElement) || 
	  	   (elem instanceof HTMLCanvasElement) ||
	   	   (elem instanceof HTMLVideoElement);
};

})();