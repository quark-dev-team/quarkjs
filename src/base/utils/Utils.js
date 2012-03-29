
(function(){

/**
 * Translates url parameters into a key-value object.
 * 获取并对象化url参数。
 */
Quark.getUrlParams = function()
{
	var params = {};
	var url = window.location.href;
	var idx = url.indexOf("?");
	if(idx > 0)
	{
		var queryStr = url.substring(idx + 1);
		var args = queryStr.split("&");
		for(var i = 0, a, nv; a = args[i]; i++)
		{
			nv = args[i] = a.split("=");
			params[nv[0]] = nv.length > 1 ? nv[1] : true;
		}
	}
	return params;
};

var head = document.getElementsByTagName("head")[0];
var metas = head.getElementsByTagName("meta");
var metaAfterNode = metas.length > 0 ? metas[metas.length-1].nextSibling : head.childNodes[0];

/**
 * Add a meta tag into the head of the document.
 * 动态添加meta到head中。
 * {Object} props The meta properties to add. e.g. {name:'viewport', content:'width=device-width'}
 */
Quark.addMeta = function(props)
{
	var meta = document.createElement("meta");
	for(var p in props) meta.setAttribute(p, props[p]);
	head.insertBefore(meta, metaAfterNode);
};

/**
 * Show or Hide the bounding rects of all display objects on stage. This method is mainly for debugging use.
 * 显示或关闭舞台上所有显示对象的外包围矩形。主要用于调试物体碰撞区域等。
 * @param {Quark.Stage} The stage to be debug.
 */
Quark.toggleDebugRect = function(stage)
{
	stage.debug = !stage.debug;	
	if(stage.debug)
	{
		stage._render = function(context)
		{
			if(context.clear != null) context.clear(0, 0, stage.width, stage.height);
			Quark.Stage.superClass._render.call(stage, context);
			
			var ctx = stage.context.context;
			if(ctx != null)
			{
				ctx.save();
				ctx.lineWidth = 1;
				ctx.strokeStyle = "#f00";
				ctx.globalAlpha = 0.5;
			}
			drawObjectRect(stage, ctx);
			if(ctx != null) ctx.restore();
		};
	}else
	{
		stage._render = function(context)
		{
			if(context.clear != null) context.clear(0, 0, stage.width, stage.height);
			Quark.Stage.superClass._render.call(stage, context);
		};
	}
};

/**
 * Draws the bounding rect of the display object. Internal function.
 * 绘制显示对象的外包围矩形。
 */
function drawObjectRect(obj, ctx)
{
	for(var i = 0; i < obj.children.length; i++)
	{
		var child = obj.children[i];
		if(child.children)
		{
			drawObjectRect(child, ctx);
		}else
		{
			if(ctx != null)
			{
				var b = child.getBounds();
								
				ctx.globalAlpha = 0.2;
				ctx.beginPath();
				var p0 = b[0];
				ctx.moveTo(p0.x-0.5, p0.y-0.5);						
				for(var j = 1; j < b.length; j++)
				{
					var p = b[j];					
					ctx.lineTo(p.x-0.5, p.y-0.5);	
				}
				ctx.lineTo(p0.x-0.5, p0.y-0.5);
				ctx.stroke();
				ctx.closePath();
				ctx.globalAlpha = 0.5;
				
				ctx.beginPath();
				ctx.rect((b.x>>0)-0.5, (b.y>>0)-0.5, b.width>>0, b.height>>0);
				ctx.stroke();
				ctx.closePath();
			}else
			{
				if(child.drawable.domDrawable) child.drawable.domDrawable.style.border = "1px solid #f00";
			}	
		}
	}
};

/**
 * Draws the display object into a new canvas for caching use.
 * 把DisplayObject对象绘制到一个新的画布上。可作为缓存使用，也可转换成dataURL格式的位图。
 * @param {Quark.DisplayObject} obj The display object to draw.
 * @param {Boolean} toImage Indicates whether convert to an image in dataURL format.
 * @param {String} type The converting image mime type, 'image/png' is default.
 */
Quark.cacheObject = function(obj, toImage, type)
{
	var w = obj.width, h = obj.height;
	var canvas = Quark.createDOM("canvas", {width:w, height:h});
	var context = new Quark.CanvasContext({canvas:canvas});
	obj.render(context);
	
	if(toImage)
	{
		var img = new Image();
		img.width = w;
		img.height = h;
		img.src = canvas.toDataURL(type || "image/png");
		return img;
	}
	return canvas;
};


/**
 * A help stage for internal use.
 * 用于Quark内部实现的一个上下文。
 */
Quark._helpContext = new Quark.CanvasContext({canvas:Quark.createDOM("canvas")});

})();