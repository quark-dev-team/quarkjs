(function(){

/**
 * 构造函数.
 * @name DisplayObjectContainer
 * @augments DisplayObject
 * @class DisplayObjectContainer类继承自DisplayObject，是显示列表中显示对象容器的基类。每个DisplayObjectContainer对象都有自己的子级列表children，用于组织对象的Z轴顺序。注意：DisplayObjectContainer对象的宽高默认为0，在autoSize=false的情况下，需要手动设置宽高。
 * @property eventChildren 指示DisplayObjectContainer的子元素是否接受交互事件，如mousedown，touchstart等。默认为true。
 * @property autoSize 指示DisplayObjectContainer是否随子元素自动设置大小。默认为false。
 */
var DisplayObjectContainer = Quark.DisplayObjectContainer = function(props)
{
	this.eventChildren = true;
	this.autoSize = false;	

	props = props || {};
	DisplayObjectContainer.superClass.constructor.call(this, props);		
	this.id = props.id || Quark.UIDUtil.createUID("DisplayObjectContainer");
	this.setDrawable(props.drawable || props.image || null);
	
	this.children = [];
	if(props.children)
	{
		for(var i = 0; i < props.children.length; i++)
		{
			this.addChild(props.children[i]);
		}
	}
};
Quark.inherit(DisplayObjectContainer, Quark.DisplayObject);

/**
 * 将一个DisplayObject子实例添加到该DisplayObjectContainer实例的子级列表中的指定位置。
 * @param {DisplayObject} child 要添加的显示对象。
 * @param {Integer} index 指定显示对象要被添加到的索引位置。
 * @return {DisplayObjectContainer} 返回显示容器本身。
 */
DisplayObjectContainer.prototype.addChildAt = function(child, index)
{
	if(index < 0) index = 0;
	else if(index > this.children.length) index = this.children.length;
	
	var childIndex = this.getChildIndex(child);
	if(childIndex != -1)
	{
		if(childIndex == index) return this;
		this.children.splice(childIndex, 1);
	}else if(child.parent)
	{
		child.parent.removeChild(child);
	}

	this.children.splice(index, 0, child);
	child.parent = this;
	
	if(this.autoSize)
	{		
		var rect = new Quark.Rectangle(0, 0, this.rectWidth || this.width, this.rectHeight || this.height);
		var childRect = new Quark.Rectangle(child.x, child.y, child.rectWidth || child.width, child.rectHeight || child.height);
		rect.union(childRect);
		this.width = rect.width;
		this.height = rect.height;
	}
	
	return this;
};

/**
 * 将一个DisplayObject子实例添加到该DisplayObjectContainer实例的子级列表中。
 * @param {DisplayObject} child 要添加的显示对象。
 * @return {DisplayObjectContainer} 返回显示容器本身。
 */
DisplayObjectContainer.prototype.addChild = function(child)
{	
	var start = this.children.length;
	for(var i = 0; i < arguments.length; i++)
	{
		var child = arguments[i];
		this.addChildAt(child, start + i);
	}
	return this;
};

/**
 * 从DisplayObjectContainer的子级列表中指定索引处删除子对象。
 * @param {Integer} index 指定要删除的显示对象的索引位置。
 * @return {Boolean} 删除成功返回true，否则返回false。
 */
DisplayObjectContainer.prototype.removeChildAt = function(index)
{
	if (index < 0 || index >= this.children.length) return false;
	var child = this.children[index];
	if (child != null) 
	{
		var stage = this.getStage();
		if(stage != null) stage.context.remove(child);
		child.parent = null;
	}
	this.children.splice(index, 1);
	return true;
};

/**
 * 从DisplayObjectContainer的子级列表中删除指定子对象。
 * @param {DisplayObject} child 指定要删除的显示对象。
 * @return {Boolean} 删除成功返回true，否则返回false。
 */
DisplayObjectContainer.prototype.removeChild = function(child)
{
	return this.removeChildAt(this.children.indexOf(child));
};

/**
 * 删除DisplayObjectContainer的所有子对象。
 */
DisplayObjectContainer.prototype.removeAllChildren = function()
{
	while(this.children.length > 0) this.removeChildAt(0);
};

/**
 * 返回DisplayObjectContainer的位于指定索引处的子显示对象。
 * @param {Integer} index 指定子显示对象的索引位置。
 * @return {DisplayObject} 返回指定的子显示对象。
 */
DisplayObjectContainer.prototype.getChildAt = function(index)
{
	if (index < 0 || index >= this.children.length) return null;
	return this.children[index];
};

/**
 * 返回指定对象在DisplayObjectContainer的子级列表中的索引位置。
 * @param {Integer} child 指定子显示对象。
 * @return {Integer} 返回指定子显示对象的索引位置。
 */
DisplayObjectContainer.prototype.getChildIndex = function(child)
{
	return this.children.indexOf(child);
};

/**
 * 设置指定对象在DisplayObjectContainer的子级列表中的索引位置。
 * @param {DisplayObject} child 指定子显示对象。
 * @param {Integer} index 指定子显示对象新的索引位置。
 */
DisplayObjectContainer.prototype.setChildIndex = function(child, index)
{
	if(child.parent != this) return;
	var oldIndex = this.children.indexOf(child);
	if(index == oldIndex) return;
	this.children.splice(oldIndex, 1);
	this.children.splice(index, 0, child);
};

/**
 * 交换在DisplayObjectContainer的子级列表中的两个子对象的索引位置。
 * @param {DisplayObject} child1 指定交换索引位置的子显示对象1。
 * @param {DisplayObject} child2 指定交换索引位置的子显示对象2。
 */
DisplayObjectContainer.prototype.swapChildren = function(child1, child2)
{
	var index1 = this.getChildIndex(child1), index2 = this.getChildIndex(child2);
	this.children[index1] = child2;
	this.children[index2] = child1;
};

/**
 * 交换在DisplayObjectContainer的子级列表中的指定索引位置的两个子对象。
 * @param {Integer} index1 指定交换索引位置1。
 * @param {Integer} index2 指定交换索引位置2。
 */
DisplayObjectContainer.prototype.swapChildrenAt = function(index1, index2)
{
	var child1 = this.getChildAt(index1), child2 = this.getChildAt(index2);
	this.children[index1] = child2;
	this.children[index2] = child1;
};

/**
 * 返回DisplayObjectContainer中指定id的子显示对象。
 * @param {String} 指定子显示对象的id。
 * @return {DisplayObject} 返回指定id的子显示对象。
 */
DisplayObjectContainer.prototype.getChildById = function(id)
{
	for(var i = 0, len = this.children.length; i < len; i++)
	{
		var child = this.children[i];
		if(child.id == id) return child;
	}
	return null;
};

/**
 * 删除并返回DisplayObjectContainer中指定id的子显示对象。
 * @param {String} 指定子显示对象的id。
 * @return {DisplayObject} 返回删除的指定id的子显示对象。
 */
DisplayObjectContainer.prototype.removeChildById = function(id)
{	
	for(var i = 0, len = this.children.length; i < len; i++)
	{
		if(this.children[i].id == id) 
		{
			return this.removeChildAt(i);
		}
	}
	return null;
};

/**
 * 根据参数keyOrFunction指定的子元素键值或自定义函数对DisplayObjectContainer的子元素进行排序。
 * @param keyOrFunction 指定排序的子元素的键值或自定义函数。
 */
DisplayObjectContainer.prototype.sortChildren = function(keyOrFunction)
{
	var f = keyOrFunction;
	if(typeof(f) == "string")
	{
		var key = f;
		f = function(a, b)
		{
			return b[key] - a[key];
		};
	}
	this.children.sort(f);
};

/**
 * 确定指定对象是否为DisplayObjectContainer的子显示对象。
 * @param {DisplayObject} child 指定的显示对象。
 * @return {Boolean} 指定对象为DisplayObjectContainer的子显示对象返回true，否则返回false。
 */
DisplayObjectContainer.prototype.contains = function(child)
{
	return this.getChildIndex(child) != -1;
};

/**
 * 返回DisplayObjectContainer的子显示对象的数量。
 * @return {Integer} 返回子显示对象的数量。
 */
DisplayObjectContainer.prototype.getNumChildren = function()
{
	return this.children.length;
};

/**
 * 覆盖父类DisplayObject的_update方法，更新所有子显示对象的深度。
 * @protected
 */
DisplayObjectContainer.prototype._update = function(timeInfo)
{
	//先更新容器本身的数据，再更新子元素的数据
	var result = true;
	if(this.update != null) result = this.update(timeInfo);
	if(result === false) return;
	
	var copy = this.children.slice(0);
	for(var i = 0, len = copy.length; i < len; i++)
	{
		var child = copy[i];
		child._depth = i + 1;
		child._update(timeInfo);
	}
};

/**
 * 渲染DisplayObjectContainer本身及其所有子显示对象。
 * @param {Context} 渲染上下文。
 */
DisplayObjectContainer.prototype.render = function(context)
{
	DisplayObjectContainer.superClass.render.call(this, context);
	
	for(var i = 0, len = this.children.length; i < len; i++)
	{
		var child = this.children[i];
		child._render(context);
	}
};

/**
 * 返回x和y指定点下的DisplayObjectContainer的子项（或孙子项，依此类推）的数组集合。默认只返回最先加入的子显示对象。
 * @param {Number} x 指定点的x轴坐标。
 * @param {Number} y 指定点的y轴坐标。
 * @param {Boolean} usePolyCollision 指定是否采用多边形碰撞检测。默认为false。
 * @param {Boolean} returnAll 指定是否返回指定点下的所有显示对象。默认为false。
 * @return 返回指定点下的显示对象集合，当然returnAll为false时只返回最先加入的子显示对象。
 */
DisplayObjectContainer.prototype.getObjectUnderPoint = function(x, y, usePolyCollision, returnAll)
{
	if(returnAll) var result = [];
	
	for(var i = this.children.length - 1; i >= 0; i--)
	{
		var child = this.children[i];
		if(child == null || (!child.eventEnabled && child.children == undefined) || !child.visible || child.alpha <= 0) continue;
		
		if(child.children != undefined && child.eventChildren && child.getNumChildren() > 0)
		{			
			var obj = child.getObjectUnderPoint(x, y, usePolyCollision, returnAll);
			if(obj)
			{
				if(returnAll) {if(obj.length > 0) result = result.concat(obj);}
				else return obj;
			}else if(child.hitTestPoint(x, y, usePolyCollision) >= 0)
			{
				if(returnAll) result.push(child);
				else return child;
			}
		}else
		{
			if(child.hitTestPoint(x, y, usePolyCollision) >= 0) 
			{
				if(returnAll) result.push(child);
				else return child;
			}
		}
	}
	if(returnAll) return result;
	return null;
};
	
})();
