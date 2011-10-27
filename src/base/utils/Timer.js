
(function(){

/**
 * Constructor.
 * @name Timer
 * @class Timer是一个计时器。它能按指定的时间序列运行代码。
 * @param interval 计时器的时间间隔。以毫秒为单位。
 */
var Timer = Quark.Timer = function(interval)
{	
	this.interval = interval || 50;
	this.paused = false;	
	this.info = {lastTime:0, currentTime:0, deltaTime:0, realDeltaTime:0};

	this._startTime = 0;
	this._intervalID = null;
	this._listeners = [];
};

/**
 * 启动计时器。
 */
Timer.prototype.start = function()
{
	if(this._intervalID != null) return;
	this._startTime = this.info.lastTime = this.info.currentTime = Date.now();
	var me = this;
	var run = function(){me._intervalID = setTimeout(run, me.interval);me._run();};
	run();
};

/**
 * 停止计时器。
 */
Timer.prototype.stop = function()
{
	clearTimeout(this._intervalID);
	this._intervalID = null;
	this._startTime = 0;
};

/**
 * 暂停计时器。
 */
Timer.prototype.pause = function()
{
	this.paused = true;
};

/**
 * 恢复计时器。
 */
Timer.prototype.resume = function()
{
	this.paused = false;
};

/**
 * 计时器的运行回调。当达到执行条件时，调用所有侦听器的step方法。
 * @private
 */
Timer.prototype._run = function()
{
	if(this.paused) return;
	
	var info = this.info;
	var time = info.currentTime = Date.now();
	info.deltaTime = info.realDeltaTime = time - info.lastTime;
	
	for(var i = 0, len = this._listeners.length, obj, runTime; i < len; i++)
	{
		obj = this._listeners[i];
		runTime = obj.__runTime || 0;
		if(runTime == 0)
		{
			obj.step(this.info);
		}else if(time > runTime)
		{
			obj.step(this.info);
			this._listeners.splice(i, 1);
			i--;
			len--;
		}
	}
	
	info.lastTime = time;
};

/**
 * 延迟一定时间time调用callback方法。
 * @param callback 调用的方法。
 * @param time 延迟的时间，以毫秒为单位。
 */
Timer.prototype.delay = function(callback, time)
{
	var obj = {step:callback, __runTime:Date.now() + time};
	this.addListener(obj);
};

/**
 * 添加侦听器对象，计时器会按照指定的时间间隔来调用侦听器的step方法。即listner必需有step方法。
 * @param obj 侦听器对象。
 **/
Timer.prototype.addListener = function(obj)
{
	if(obj == null || typeof(obj.step) != "function") throw "Timer Error: The listener object must implement a step() method!";
	this._listeners.push(obj);
};

/**
 * 删除侦听器。
 */
Timer.prototype.removeListener = function(obj)
{
	var index = this._listeners.indexOf(obj);
	if(index > -1)
	{
		this._listeners.splice(index, 1);
	}
};

})();