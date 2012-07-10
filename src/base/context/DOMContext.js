
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