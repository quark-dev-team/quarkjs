
(function(){

/**
 * 获取URL参数。
 * @return {Object} 包含URL参数的键值对对象。
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
 * 动态添加meta到head中。
 * @param {Object} props 要添加的meta的属性. 格式如：{name:'viewport', content:'width=device-width'}。
 */
Quark.addMeta = function(props)
{
	var meta = document.createElement("meta");
	for(var p in props) meta.setAttribute(p, props[p]);
	head.insertBefore(meta, metaAfterNode);
};

/**
 * 显示或关闭舞台上所有显示对象的外包围矩形。此方法主要用于调试物体碰撞区域等。
 * @param {Stage} stage 要调试的舞台对象。
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
 * 绘制显示对象的外包围矩形。
 * @private
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
 * 把DisplayObject对象绘制到一个新的画布上。可作为缓存使用，也可转换成dataURL格式的位图。
 * @param {DisplayObject} obj 要缓存的显示对象。
 * @param {Boolean} toImage 指定是否把缓存转为DataURL格式的。默认为false。
 * @param {String} type 指定转换为DataURL格式的图片mime类型。默认为"image/png"。
 * @return {Object} 显示对象的缓存结果。根据参数toImage不同而返回Canvas或Image对象。
 */
Quark.cacheObject = function(obj, toImage, type)
{
	var w = obj.width, h = obj.height, mask = obj.mask;
	var canvas = Quark.createDOM("canvas", {width:w, height:h});
	var context = new Quark.CanvasContext({canvas:canvas});
	obj.mask = null;
	obj.render(context);
	obj.mask = mask;
	
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
 * 用于Quark内部实现的一个上下文。
 * @private
 */
Quark._helpContext = new Quark.CanvasContext({canvas:Quark.createDOM("canvas")});

})();