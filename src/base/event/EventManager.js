
(function(){

/**
 * 构造函数.
 * @name EventManager
 * @class EventManager是一个简单的系统事件管理器。
 */
var EventManager = Quark.EventManager = function()
{
	this.keyState = {};
	this._evtHandlers = {};
};

/**
 * 注册Quark.Stage事件侦听，使得Stage能够接收和处理指定的事件。
 * @param stage Quark.Stage舞台对象。
 * @param events 要注册的事件类型数组。
 */
EventManager.prototype.registerStage = function(stage, events, preventDefault, stopPropagation)
{
	this.register(stage.context.canvas, events, {host:stage, func:stage.dispatchEvent}, preventDefault, stopPropagation);
};

/**
 * 删除Quark.Stage事件侦听。
 * @param stage Quark.Stage舞台对象。
 * @param events 要删除的事件类型数组。
 */
EventManager.prototype.unregisterStage = function(stage, events)
{
	this.unregister(stage.context.canvas, events, stage.dispatchEvent);
};

/**
 * 注册DOM事件侦听，当事件触发时调用callback函数。
 * @param target 事件目标DOM对象。
 * @param events 要注册事件类型数组。
 */
EventManager.prototype.register = function(target, events, callback, preventDefault, stopPropagation)
{
	if(callback == null || (typeof callback == "function")) callback = {host:null, func:callback};
	var params = {prevent:preventDefault, stop:stopPropagation};
	
	var me = this, handler = function(e){me._onEvent(e, params, callback);};
	
	for(var i = 0; i < events.length; i++)
	{
		var type = events[i], list = this._evtHandlers[type] || (this._evtHandlers[type] = []);
		for(var j = 0, has = false; j < list.length; j++)
		{
			var li = list[j];
			if(li.target == target && li.callback.func == callback.func) 
			{
				trace("duplicate callback");
				has = true;
				break;
			}
		}
		if(!has)
		{
			list.push({target:target, callback:callback, handler:handler});
			target.addEventListener(type, handler, false);
		}
	}
};

/**
 * 删除对象事件侦听。
 * @param target 事件目标DOM对象。
 * @param events 要删除的事件类型数组。
 */
EventManager.prototype.unregister = function(target, events, callback)
{
	for(var i = 0; i < events.length; i++)
	{
		var type = events[i], list = this._evtHandlers[type];
		for(var j = 0; j < list.length; j++)
		{
			var li = list[j];
			if(li.target == target && (li.callback.func == callback || callback == null))
			{
				target.removeEventListener(type, li.handler);
				list.splice(j, 1);
				break;
			}
		}
	}
};

/**
 * 内部事件处理器。
 * @private
 */
EventManager.prototype._onEvent = function(e, params, callback)
{	
	//correct touch events
    var ne = e, type = e.type, isTouch = e.type.indexOf("touch") == 0;
    if(isTouch)
    {
        ne = (e.touches && e.touches.length > 0) ? e.touches[0] : 
            (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : e;
        ne.type = type;
    }
	
	if(type == "keydown" || type == "keyup" || type == "keypress")
	{
		this.keyState[e.keyCode] = type;
	}
	
	//e.eventTime = Date.now();
	
	if(callback.func != null) callback.func.call(callback.host, ne);
	
	EventManager.stop(e, !params.prevent, !params.stop);
};

/**
 * 停止事件。
 * @param e 要停止的事件对象。
 * @param continueDefault 是否继续事件的默认行为。
 * @param continuePropagation 是否继续事件的冒泡。
 */
EventManager.stop = function(e, continueDefault, continuePropagation)
{
	if(!continueDefault) e.preventDefault();
	if(!continuePropagation)
	{
		e.stopPropagation();
		if(e.stopImmediatePropagation) e.stopImmediatePropagation();
	}
};
	
})();