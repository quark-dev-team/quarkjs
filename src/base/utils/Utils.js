
(function(){

/**
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

var head = document.head;
var metas = head.getElementsByTagName("meta");
var metaAfterNode = metas.length > 0 ? metas[metas.length-1].nextSibling : head.childNodes[0];

/**
 * 动态添加meta到head中。
 */
Quark.addMeta = function(props)
{
	var meta = document.createElement("meta");
	for(var p in props) meta.setAttribute(p, props[p]);
	head.insertBefore(meta, metaAfterNode);
};

/**
 * 打开或关闭调试区域。
 */
Quark.toggleDebugRect = function(stage)
{
	stage.paused = !stage.paused;
	if(!stage.paused) return;
	
	var context = stage.context;
	stage._update(context);
	
	var ctx = context.context;
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

/**
 * 绘制显示对象区域。
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
				
				if(child._rotatedPoints != null)
				{
					ctx.globalAlpha = 0.2;
					ctx.beginPath();
					var p0 = child._rotatedPoints[0];
					ctx.moveTo(p0.x-0.5, p0.y-0.5);						
					for(var j = 1; j < child._rotatedPoints.length; j++)
					{
						var p = child._rotatedPoints[j];							
						ctx.lineTo(p.x-0.5, p.y-0.5);	
					}
					ctx.lineTo(p0.x-0.5, p0.y-0.5);
					ctx.stroke();
					ctx.closePath();
					ctx.globalAlpha = 0.5;
				}
				
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

})();