
(function(){

/**
 * Quark框架中显示对象结构的上下文，实现显示对象结构的渲染。
 */
var Context = Quark.Context = function(props)
{	
	if(props.canvas == null) throw "Quark.Context Error: canvas is required.";
	
	this.canvas = null;
	Quark.merge(this, props);
};

/**
 * 为开始绘制显示对象做准备，需要子类来实现。
 */
Context.prototype.startDraw = function(){ };

/**
 * 绘制显示对象，需要子类来实现。
 */
Context.prototype.draw = function(){ };

/**
 * 完成绘制显示对象后的处理方法，需要子类来实现。
 */
Context.prototype.endDraw = function(){ };

/**
 * 对显示对象进行变换，需要子类来实现。
 */
Context.prototype.transform = function(){ };

/**
 * 从画布中删除显示对象，需要子类来实现。
 */
Context.prototype.remove = function(obj){ };

})();