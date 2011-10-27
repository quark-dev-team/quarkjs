
(function(){

var Rectangle = Quark.Rectangle = function(x, y, width, height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};

Rectangle.prototype.intersects = function(rect)
{
	return (this.x <= rect.x + rect.width && rect.x <= this.x + this.width &&
			this.y <= rect.y + rect.height && rect.y <= this.y + this.height);
};

Rectangle.prototype.intersection = function(rect)
{
	var x0 = Math.max(this.x, rect.x);
	var x1 = Math.min(this.x + this.width, rect.x + rect.width);

	if(x0 <= x1)
	{
		var y0 = Math.max(this.y, rect.y);
		var y1 = Math.min(this.y + this.height, rect.y + rect.height);

		if(y0 <= y1)
		{
			return new Rectangle(x0, y0, x1 - x0, y1 - y0);
		}
	}
	return null;
};

Rectangle.prototype.union = function(rect, returnNew)
{
 	var right = Math.max(this.x + this.width, rect.x + rect.width);
  	var bottom = Math.max(this.y + this.height, rect.y + rect.height);
	
  	var x = Math.min(this.x, rect.x);
 	var y = Math.min(this.y, rect.y);
  	var width = right - x;
  	var height = bottom - y;
  	if(returnNew) 
  	{
  		return new Rectangle(x, y, width, height);
  	}else
  	{
  		this.x = x;
  		this.y = y;
  		this.width = width;
  		this.height = height;
  	}
};

Rectangle.prototype.containsPoint = function(x, y)
{
	return (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height);
};

Rectangle.prototype.clone = function()
{
	return new Rectangle(this.x, this.y, this.width, this.height);	
};

Rectangle.prototype.toString = function()
{
	return "(x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";	
};

})();