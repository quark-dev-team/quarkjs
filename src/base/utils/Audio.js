
(function(){

/**
 * 构造函数.
 * @name Audio
 * @class Audio类是原生Audio的封装。
 * @param src 要加载的声音的地址。
 * @param preload 指示是否自动加载，在某些浏览器下无效，如IOS上的Safari。
 * @param autoPlay 指示是否自动播放，在某些浏览器下无效，如IOS上的Safari。
 * @param loop 指示是否循环播放。
 */
var Audio = Quark.Audio = function(src, preload, autoPlay, loop)
{	
    Audio.superClass.constructor.call(this);
    
    this.src = src;
	this.autoPlay = preload && autoPlay;
	this.loop = loop;
	
	this._loaded = false;
    this._playing = false;
	this._evtHandler = Quark.delegate(this._evtHandler, this);
	
	this._element = document.createElement('audio');
	this._element.preload = preload;
	this._element.src = src;
	if(preload) this.load();
};
Quark.inherit(Audio, Quark.EventDispatcher);

/**
 * 开始加载声音文件。
 */
Audio.prototype.load = function()
{	
	this._element.addEventListener("progress", this._evtHandler, false);
	this._element.addEventListener("ended", this._evtHandler, false);
	this._element.addEventListener("error", this._evtHandler, false);
    try{
        this._element.load();
    }catch(e){trace(e);};
	
};

/**
 * 内部的声音事件处理。
 * @private
 */
Audio.prototype._evtHandler = function(e)
{
	if(e.type == "progress")
	{
		var i = 0, buffered = 0, ranges = e.target.buffered;
		if(ranges && ranges.length > 0)
		{
			for (i = ranges.length - 1; i >= 0; i--)
			{
	          buffered = (ranges.end(i) - ranges.start(i));
	        }
		}
		var percent = buffered / e.target.duration;
		if(percent >= 1)
		{
			this._element.removeEventListener("progress", this._evtHandler);
			this._element.removeEventListener("error", this._evtHandler);
			this._loaded = true;
			this.dispatchEvent({type:"loaded", target:this});
			if(this.autoPlay) this.play();
		}
	}else if(e.type == "ended")
	{
		this.dispatchEvent({type:"ended", target:this});
		if(this.loop) this.play();
		else this._playing = false;
	}else if(e.type == "error")
	{
		trace("Quark.Audio Error: " + e.target.src);
	}
};

/**
 * 开始播放。
 */
Audio.prototype.play = function()
{
	if (this._loaded)
	{
        this._element.play();
        this._playing = true;
    }else
	{
		this.autoPlay = true;
		this.load();
	}
};

/**
 * 停止播放。
 */
Audio.prototype.stop = function()
{
    if(this._playing)
	{
        this._element.pause();
        this._playing = false;
    }
};

/**
 * 指示声音文件是否已被加载。
 */
Audio.prototype.loaded = function()
{
    return this._loaded;
};

/**
 * 指示声音是正在播放。
 */
Audio.prototype.playing = function()
{
    return this._playing;
};

})();