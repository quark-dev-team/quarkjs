
(function(){

/**
 * 构造函数.
 * @name EventDispatcher
 * @class EventDispatcher类是可调度事件的类的基类，它允许显示列表上的任何对象都是一个事件目标。
 */
var EventDispatcher = Quark.EventDispatcher = function()
{
	//事件映射表，格式为：{type1:[listener1, listener2], type2:[listener3, listener4]}
	this._eventMap = {};
};

/**
 * 注册事件侦听器对象，以使侦听器能够接收事件通知。
 */
EventDispatcher.prototype.addEventListener = function(type, listener)
{
	var map = this._eventMap[type];
    if(map == null) map = this._eventMap[type] = [];
    
    if(map.indexOf(listener) == -1)
    {
    	map.push(listener);
    	return true;
    }
    return false;
};

/**
 * 删除事件侦听器。
 */
EventDispatcher.prototype.removeEventListener = function(type, listener)
{
	if(arguments.length == 1) return this.removeEventListenerByType(type);

	var map = this._eventMap[type];
	if(map == null) return false;

	for(var i = 0; i < map.length; i++)
	{
		var li = map[i];
		if(li === listener)
		{
			map.splice(i, 1);
			if(map.length == 0) delete this._eventMap[type];
			return true;
		}
	}
	return false;
};

/**
 * 删除指定类型的所有事件侦听器。
 */
EventDispatcher.prototype.removeEventListenerByType = function(type)
{
	var map = this._eventMap[type];
    if(map != null)
	{
		delete this._eventMap[type];
		return true;
	}
	return false;
};

/**
 * 删除所有事件侦听器。
 */
EventDispatcher.prototype.removeAllEventListeners = function()
{	
	this._eventMap = {};
};

/**
 * 派发事件，调用事件侦听器。
 */
EventDispatcher.prototype.dispatchEvent = function(event)
{
	var map = this._eventMap[event.type];
	if(map == null) return false;	
	if(!event.target) event.target = this;
    map = map.slice();

	for(var i = 0; i < map.length; i++)
	{
		var listener = map[i];
		if(typeof(listener) == "function")
		{
			listener.call(this, event);
		}
	}
	return true;
};

/**
 * 检查是否为指定事件类型注册了任何侦听器。
 */
EventDispatcher.prototype.hasEventListener = function(type)
{
	var map = this._eventMap[type];
	return map != null && map.length > 0;
};

//添加若干的常用的快捷缩写方法
EventDispatcher.prototype.on = EventDispatcher.prototype.addEventListener;
EventDispatcher.prototype.un = EventDispatcher.prototype.removeEventListener;
EventDispatcher.prototype.fire = EventDispatcher.prototype.dispatchEvent;

})();