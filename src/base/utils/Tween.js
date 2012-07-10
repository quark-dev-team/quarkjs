
(function(){

/**
 * 构造函数.
 * @name Tween
 * @class Tween类是一个缓动动画类。使用它能实现移动、改变大小、淡入淡出等效果。
 * @param target 实现缓动动画的目标对象。
 * @param newProps 设置目标对象的新的属性。
 * @param params 设置缓动动画类的参数。
 */
var Tween = Quark.Tween = function(target, newProps, params)
{
	this.target = target;
	this.time = 0;
	this.delay = 0;
	this.paused = false;
	this.loop = false;
	this.reverse = false;
	this.interval = 0;
	this.ease = Easing.Linear.EaseNone;
	this.next = null;
	
	this.onStart = null;
	this.onUpdate = null;
	this.onComplete = null;
	
	this._oldProps = {};
	this._newProps = {};
	this._deltaProps = {};
	this._startTime = 0;
	this._lastTime = 0;
	this._pausedTime = 0;
	this._pausedStartTime = 0;
	this._reverseFlag = 1;
	this._frameTotal = 0;
	this._frameCount = 0;

	for(var p in newProps)
	{		
		var oldVal = target[p], newVal = newProps[p];
		if(oldVal !== undefined)
		{
			if(typeof(oldVal) == "number" && typeof(newVal) == "number")
			{
				this._oldProps[p] = oldVal;
				this._newProps[p] = newVal;
				this._deltaProps[p] = newVal - oldVal;
			}
		}
	}

	for(var p in params)
	{
		this[p] = params[p];
	}
};

/**
 * 设置缓动对象的初始和目标属性。
 * @param oldProps 缓动对象的初始属性。
 * @param newProps 缓动对象的目标属性。
 */
Tween.prototype.setProps = function(oldProps, newProps)
{
	for(var p in oldProps)
	{
		this.target[p] = this._oldProps[p] = oldProps[p];
	}
	for(var p in newProps)
	{
		this._newProps[p] = newProps[p];
		this._deltaProps[p] = newProps[p] - this.target[p];
	}
};

/**
 * 初始化Tween类。
 * @private
 */
Tween.prototype._init = function()
{
	this._startTime = Date.now() + this.delay;
	this._pausedTime = 0;
	if(this.interval > 0) this._frameTotal = Math.round(this.time / this.interval);
	Tween.add(this);
};

/**
 * 启动缓动动画的播放。
 */
Tween.prototype.start = function()
{	
	this._init();
	this.paused = false;
};

/**
 * 停止缓动动画的播放。
 */
Tween.prototype.stop = function()
{
	Tween.remove(this);
};

/**
 * 暂停缓动动画的播放。
 */
Tween.prototype.pause = function()
{	
	this.paused = true;
	this._pausedStartTime = Date.now();
};

/**
 * 恢复缓动动画的播放。
 */
Tween.prototype.resume = function()
{	
	this.paused = false;
	this._pausedTime += Date.now() - this._pausedStartTime;
};

/**
 * Tween类的内部更新方法。
 * @private
 */
Tween.prototype._update = function()
{
	if(this.paused) return;
	var now = Date.now();
	var elapsed = now - this._startTime - this._pausedTime;
	if(elapsed < 0) return;
	
	if(this._lastTime == 0 && this.onStart != null) this.onStart(this);
	this._lastTime = now;
	
	var ratio = this._frameTotal > 0 ? (++this._frameCount / this._frameTotal) : (elapsed / this.time);
	if(ratio > 1) ratio = 1;
	var value = this.ease(ratio);

	for(var p in this._oldProps)
	{
		this.target[p] = this._oldProps[p] + this._deltaProps[p] * this._reverseFlag * value;
	}
	
	if(this.onUpdate != null) this.onUpdate(this, value);

	if(ratio >= 1)
	{	
		if(this.reverse)
		{
			var tmp = this._oldProps;
			this._oldProps = this._newProps;
			this._newProps = tmp;
			this._startTime = Date.now();
			this._frameCount = 0;
			this._reverseFlag *= -1;
			if(!this.loop) this.reverse = false;
		}else if(this.loop)
		{
			for(var p in this._oldProps) this.target[p] = this._oldProps[p];
			this._startTime = Date.now();
			this._frameCount = 0;
		}else
		{
			Tween.remove(this);
			var next = this.next, nextTween;
			if(next != null)
			{
				if(next instanceof Tween)
				{
					nextTween = next;
					next = null;
				}else
				{
					nextTween = next.shift();
				}
				if(nextTween != null)
				{
					nextTween.next = next;
					nextTween.start();
				}
			}
		}
		if(this.onComplete != null) this.onComplete(this);	
	}
};

/**
 * 保存所有Tween类的实例。
 * @static
 */
Tween._tweens = [];

/**
 * 更新所有Tween实例，一般由Quark.Timer类自动调用。
 * @static
 */
Tween.step = function()
{
	var tweens = this._tweens, i = tweens.length;
	while(--i >= 0) tweens[i]._update();
};

/**
 * 添加Tween实例。
 * @static
 */
Tween.add = function(tween)
{
	if(this._tweens.indexOf(tween) == -1) this._tweens.push(tween);
	return this;
};

/**
 * 删除Tween实例。
 * @staitc
 */
Tween.remove = function(tween)
{
	var tweens = this._tweens, index = tweens.indexOf(tween);
	if(index > -1) tweens.splice(index, 1);
	return this;
};

/**
 * 创建一个缓动动画，让目标对象从当前属性变换到目标属性。
 * @param target 缓动目标对象
 * @param toProps 缓动目标对象的目标属性。
 * @param params 缓动动画的参数。
 */
Tween.to = function(target, toProps, params)
{
	var tween = new Tween(target, toProps, params);
	tween._init();
	return tween;
};

/**
 * 创建一个缓动动画，让目标对象从指定的起始属性变换到当前属性。
 * @param target 缓动目标对象
 * @param toProps 缓动目标对象的起始属性。
 * @param params 缓动动画的参数。
 */
Tween.from = function(target, fromProps, params)
{
	var tween = new Tween(target, fromProps, params);
	var tmp = tween._oldProps;
	tween._oldProps = tween._newProps;
	tween._newProps = tmp;
	tween._reverseFlag = -1;

	for(var p in tween._oldProps) target[p] = tween._oldProps[p];

	tween._init();
	return tween;
};

/**
 * 缓动函数集合。
 */
var Easing = Quark.Easing = 
{
	Linear: {}, 
	Quadratic: {}, 
	Cubic: {}, 
	Quartic: {}, 
	Quintic: {}, 
	Sinusoidal: {}, 
	Exponential: {}, 
	Circular: {}, 
	Elastic: {}, 
	Back: {}, 
	Bounce: {}
};

Easing.Linear.EaseNone = function(k)
{
	return k;
};

Easing.Quadratic.EaseIn = function(k)
{
	return k * k;
};

Easing.Quadratic.EaseOut = function(k) 
{
	return - k * (k - 2);
};

Easing.Quadratic.EaseInOut = function(k)
{
	if((k *= 2) < 1) return 0.5 * k * k;
	return -0.5 * (--k * (k - 2) - 1);
};

Easing.Cubic.EaseIn = function(k) 
{
	return k * k * k;
};

Easing.Cubic.EaseOut = function(k)
{
	return --k * k * k + 1;
};

Easing.Cubic.EaseInOut = function(k) 
{
	if((k *= 2) < 1) return 0.5 * k * k * k;
	return 0.5 * ((k -= 2) * k * k + 2);
};

Easing.Quartic.EaseIn = function(k) 
{
	return k * k * k * k;
};

Easing.Quartic.EaseOut = function(k)
{
	return -(--k * k * k * k - 1);
}

Easing.Quartic.EaseInOut = function(k)
{
	if((k *= 2) < 1) return 0.5 * k * k * k * k;
	return - 0.5 * ((k -= 2) * k * k * k - 2);
};

Easing.Quintic.EaseIn = function(k)
{
	return k * k * k * k * k;
};

Easing.Quintic.EaseOut = function(k) 
{
	return (k = k - 1) * k * k * k * k + 1;
};

Easing.Quintic.EaseInOut = function(k)
{
	if((k *= 2) < 1) return 0.5 * k * k * k * k * k;
	return 0.5 * ((k -= 2) * k * k * k * k + 2);
};

Easing.Sinusoidal.EaseIn = function(k) 
{
	return -Math.cos(k * Math.PI / 2) + 1;
};

Easing.Sinusoidal.EaseOut = function(k)
{
	return Math.sin(k * Math.PI / 2);
};

Easing.Sinusoidal.EaseInOut = function(k)
{
	return -0.5 * (Math.cos(Math.PI * k) - 1);
};

Easing.Exponential.EaseIn = function(k) 
{
	return k == 0 ? 0 : Math.pow(2, 10 * (k - 1));
};

Easing.Exponential.EaseOut = function(k) 
{
	return k == 1 ? 1 : -Math.pow(2, -10 * k) + 1;
};

Easing.Exponential.EaseInOut = function(k)
{
	if(k == 0) return 0;
	if(k == 1) return 1;
    if((k *= 2) < 1) return 0.5 * Math.pow(2, 10 * (k - 1));
	return 0.5 * (-Math.pow(2, - 10 * (k - 1)) + 2);
};

Easing.Circular.EaseIn = function(k) 
{
	return -(Math.sqrt(1 - k * k) - 1);
};

Easing.Circular.EaseOut = function(k) 
{
	return Math.sqrt(1 - --k * k);
};

Easing.Circular.EaseInOut = function(k)
{
	if((k /= 0.5) < 1) return - 0.5 * (Math.sqrt(1 - k * k) - 1);
	return 0.5 * ( Math.sqrt(1 - (k -= 2) * k) + 1);
};

Easing.Elastic.EaseIn = function(k) 
{
	var s, a = 0.1, p = 0.4;
	if (k == 0) return 0; 
	else if (k == 1) return 1;
	else if (!p) p = 0.3;
	if(!a || a < 1) { a = 1; s = p / 4; }
	else s = p / (2 * Math.PI) * Math.asin(1 / a);
	return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
};

Easing.Elastic.EaseOut = function(k) 
{
	var s, a = 0.1, p = 0.4;
	if(k == 0) return 0; 
	else if (k == 1) return 1; 
	else if (!p) p = 0.3;
	if(!a || a < 1) { a = 1; s = p / 4; }
	else s = p / (2 * Math.PI) * Math.asin(1 / a);
	return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
};

Easing.Elastic.EaseInOut = function(k) 
{
	var s, a = 0.1, p = 0.4;
	if (k == 0) return 0; 
	else if (k == 1) return 1; 
	else if (!p) p = 0.3;
	if(!a || a < 1) { a = 1; s = p / 4; }
	else s = p / (2 * Math.PI) * Math.asin(1 / a);
	if ((k *= 2 ) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
	return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

};

Easing.Back.EaseIn = function(k) 
{
	var s = 1.70158;
	return k * k * ((s + 1) * k - s);
};

Easing.Back.EaseOut = function(k)
{
	var s = 1.70158;
	return (k = k - 1) * k * (( s + 1) * k + s) + 1;
};

Easing.Back.EaseInOut = function(k) 
{
	var s = 1.70158 * 1.525;
	if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
	return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
};

Easing.Bounce.EaseIn = function(k) 
{
	return 1 - Easing.Bounce.EaseOut(1 - k);
};

Easing.Bounce.EaseOut = function(k)
{
	if(( k /= 1) < (1 / 2.75))
	{
		return 7.5625 * k * k;
	}else if(k < (2 / 2.75))
	{
		return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
	}else if(k < (2.5 / 2.75)) 
	{
		return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
	}else
	{
		return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
	}
};

Easing.Bounce.EaseInOut = function(k) 
{
	if(k < 0.5) return Easing.Bounce.EaseIn(k * 2) * 0.5;
	return Easing.Bounce.EaseOut(k * 2 - 1) * 0.5 + 0.5;
};

})();