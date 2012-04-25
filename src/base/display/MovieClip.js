
(function(){

/**
 * Constructor.
 * @name MovieClip
 * @augments Bitmap
 * @class MovieClip影片剪辑类，表示一组动画片段。MovieClip是由Image对象的若干矩形区域组成的集合序列，并按照一定规则顺序播放。帧frame的定义格式为：{rect:*required*, label:"", interval:0, stop:0, jump:-1}。
 */
var MovieClip = Quark.MovieClip = function(props)
{	
	this.interval = 0;	
	this.paused = false;
	this.useFrames = false;
	this.currentFrame = 0; //read-only
	
	this._frames = [];
	this._frameLabels = {};	
	this._frameDisObj = null;
	this._displayedCount = 0;
	
	props = props || {};
	MovieClip.superClass.constructor.call(this, props);
	this.id = props.id || Quark.UIDUtil.createUID("MovieClip");

	if(props.frames) this.addFrame(props.frames);
};
Quark.inherit(MovieClip, Quark.Bitmap);

/**
 * 向MovieClip中添加帧frame，可以是单个帧或多帧的数组。
 */
MovieClip.prototype.addFrame = function(frame)
{
	var start = this._frames.length;
	if(frame instanceof Array)
	{
		 for(var i = 0; i < frame.length; i++) this.setFrame(frame[i], start + i);
	}else
	{
		this.setFrame(frame, start);
	}
	return this;
};

/**
 * 指定帧frame在MovieClip的播放序列中的位置（从0开始）。
 */
MovieClip.prototype.setFrame = function(frame, index)
{
	if(index == undefined || index > this._frames.length) index = this._frames.length;
	else if(index < 0) index = 0;
	
	this._frames[index] = frame;
	if(frame.label) this._frameLabels[frame.label] = frame;
	if(frame.interval == undefined) frame.interval = this.interval;
	if(index == 0 && this.currentFrame == 0) this.setRect(frame.rect);
};

/**
 * 获得指定位置或标签的帧frame。
 */
MovieClip.prototype.getFrame = function(indexOrLabel)
{
	if(typeof(indexOrLabel) == "number") return this._frames[indexOrLabel];
	return this._frameLabels[indexOrLabel];
};

/**
 * 从当前位置开始播放动画序列。
 */
MovieClip.prototype.play = function()
{
	this.paused = false;
};

/**
 * 停止播放动画序列。
 */
MovieClip.prototype.stop = function()
{
	this.paused = true;
};

/**
 * 跳转到指定位置或标签的帧，并停止播放动画序列。
 */
MovieClip.prototype.gotoAndStop = function(indexOrLabel)
{	
	this.currentFrame = this.getFrameIndex(indexOrLabel);
	this.paused = true;
};

/**
 * 跳转到指定位置或标签的帧，并继续播放动画序列。
 */
MovieClip.prototype.gotoAndPlay = function(indexOrLabel)
{
	this.currentFrame = this.getFrameIndex(indexOrLabel);
	this.paused = false;
};

/**
 * 获得指定参数对应的帧的位置。
 */
MovieClip.prototype.getFrameIndex = function(indexOrLabel)
{
	if(typeof(indexOrLabel) == "number") return indexOrLabel;
	var frame = this._frameLabels[indexOrLabel], frames = this._frames;	
	for(var i = 0; i < frames.length; i++)
	{
		if(frame == frames[i]) return i;
	}
	return -1;
};

/**
 * 播放动画序列的下一帧。
 */
MovieClip.prototype.nextFrame = function(displayedDelta)
{	
	var frame = this._frames[this.currentFrame];
	
	if(frame.interval > 0)
	{
		var count = this._displayedCount + displayedDelta;
		this._displayedCount = frame.interval > count ? count : 0;
	}
	
	if(frame.jump >= 0 || typeof(frame.jump) == "string") 
	{
		if(this._displayedCount == 0 || !frame.interval)
		{
			return this.currentFrame = this.getFrameIndex(frame.jump);
		}
	}
	
	if(frame.interval > 0 && this._displayedCount > 0) return this.currentFrame;
	else if(this.currentFrame >= this._frames.length - 1) return this.currentFrame = 0;
	else return ++this.currentFrame;
};

/**
 * 返回MovieClip的帧数。
 */
MovieClip.prototype.getNumFrames = function()
{
	return this._frames.length;
};

/**
 * 更新MovieClip对象的属性。
 */
MovieClip.prototype._update = function(timeInfo)
{
	var frame = this._frames[this.currentFrame];
	if(frame.stop)
	{
		this.stop();
		return;
	}
	if(!this.paused) 
	{
		var delta = this.useFrames ? 1 : timeInfo && timeInfo.deltaTime;
		this.nextFrame(delta);
	}
	this.setRect(frame.rect);
	
	MovieClip.superClass._update.call(this, timeInfo);
};

/**
 * 渲染当前帧到舞台。
 */
MovieClip.prototype.render = function(context)
{
	var frame = this._frames[this.currentFrame], rect = frame.rect;
	context.draw(this, rect[0], rect[1], rect[2], rect[3], 0, 0, this.width, this.height);
};

})();