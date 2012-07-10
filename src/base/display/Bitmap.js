
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