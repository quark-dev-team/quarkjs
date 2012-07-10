
(function(){

/**
 * 构造函数.
 * @name ImageLoader
 * @augments EventDispatcher
 * @class ImageLoader类是一个图片加载器，用于动态加载图片资源。
 * @param source 要加载的图片资源，可以是一个单独资源或多个资源的数组。图片资源格式为：{src:$url, id:$id, size:$size}。
 */
var ImageLoader = Quark.ImageLoader = function(source)
{
	ImageLoader.superClass.constructor.call(this);	
	
	this.loading = false; //ready-only
	
	this._index = -1;
	this._loaded = 0;
	this._images = {};
	this._totalSize = 0;
	this._loadHandler = Quark.delegate(this._loadHandler, this);
	
	this._addSource(source);
};
Quark.inherit(ImageLoader, Quark.EventDispatcher);

/**
 * 开始顺序加载图片资源。
 * @param source 要加载的图片资源，可以是一个单独资源或多个资源的数组。
 */
ImageLoader.prototype.load = function(source)
{
	this._addSource(source);
	if(!this.loading) this._loadNext();
};

/**
 * 添加图片资源。
 * @private 
 */
ImageLoader.prototype._addSource = function(source)
{
	if(!source) return;
	source = (source instanceof Array) ? source : [source];
	for(var i = 0; i < source.length; i++)
	{
		this._totalSize+= source[i].size || 0;
	}
	if(!this._source) this._source = source;
	else this._source = this._source.concat(source);
};

/**
 * 加载下一个图片资源。
 * @private
 */
ImageLoader.prototype._loadNext = function()
{
	this._index++;
	if(this._index >= this._source.length)
	{
		this.dispatchEvent({type:"complete", target:this, images:this._images});
		this._source = [];
		this.loading = false;
		this._index = -1;
		return;
	}
	
	var img = new Image();
	img.onload = this._loadHandler;
	img.src = this._source[this._index].src;
	this.loading = true;
};

/**
 * 图片加载处理器。
 * @private
 */
ImageLoader.prototype._loadHandler = function(e)
{	
	this._loaded++;
	var image = this._source[this._index];
	image.image = e.target;
	var id = image.id || image.src;
	this._images[id] = image;
	this.dispatchEvent({type:"loaded", target:this, image:image});	
	this._loadNext();
};

/**
 * 返回已加载图片资源的数目。
 */
ImageLoader.prototype.getLoaded = function()
{
	return this._loaded;
};

/**
 * 返回所有图片资源的总数。
 */
ImageLoader.prototype.getTotal = function()
{
	return this._source.length;
};

/**
 * 返回已加载的图片资源的大小之和（在图片资源的大小size已指定的情况下）。
 */
ImageLoader.prototype.getLoadedSize = function()
{
	var size = 0;
	for(var id in this._images)
	{
		var item = this._images[id];
		size += item.size || 0;
	}
	return size;
};

/**
 * 返回所有图片资源的大小之和（在图片资源的大小size已指定的情况下）。
 */
ImageLoader.prototype.getTotalSize = function()
{
	return this._totalSize;
};

})();