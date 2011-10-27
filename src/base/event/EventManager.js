
(function(){

/**
 * Constructor.
 * @name EventManager
 * @class EventManager是一个简单的系统事件管理器。
 */
var EventManager = Quark.EventManager = function()
{
	this.keyState = {};
};

/**
 * 注册Quark.Stage事件侦听，使得Stage能够接收和处理指定的事件。
 * @param stage Quark.Stage舞台对象。
 * @param events 要注册事件类型数组。
 */
EventManager.prototype.registerStage = function(stage, events, preventDefault, stopPropagation)
{
	this.register(stage.context.canvas, events, function(e)
	{
		stage.onEvent(e);
	}, preventDefault, stopPropagation);
};

/**
 * 注册DOM事件侦听，当事件触发时调用callback函数。
 * @param target 事件目标DOM对象。
 * @param events 要注册事件类型数组。
 */
EventManager.prototype.register = function(target, events, callback, preventDefault, stopPropagation)
{
	var params = {prevent:preventDefault, stop:stopPropagation};
	var me = this, handler = function(e){me._onEvent(e, params, callback);};
	for(var i = 0; i < events.length; i++)
	{
		var type = events[i];
		target.addEventListener(type, handler, false);
	}
};

/**
 * 内部事件处理器。
 * @private
 */
EventManager.prototype._onEvent = function(e, params, callback)
{	
	var type = e.type, target = e.currentTarget;	
	
	if(type == "keydown" || type == "keyup" || type == "keypress") {
		this.keyState[e.keyCode] = type;
	}
	
	//不能修改原生的event对象，在opera下会抛错
	//e.timeStamp = Date.now();
	
	if(callback != null) callback(e);
	
	if(params.prevent) e.preventDefault();
	if(params.stop) {
		e.stopPropagation();
		if (e.stopImmediatePropagation){
			e.stopImmediatePropagation();
		}		
	}
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
	if(!continuePropagation) e.stopPropagation();
};
	
})();