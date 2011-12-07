
(function(){

var Matrix = Quark.Matrix = function(a, b, c, d, tx, ty)
{
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.tx = tx;
	this.ty = ty;
};

Matrix.prototype.concat = function(mtx)
{
	var a = this.a;
	var c = this.c;
	var tx = this.tx;
	
	this.a = a * mtx.a + this.b * mtx.c;
	this.b = a * mtx.b + this.b * mtx.d;
	this.c = c * mtx.a + this.d * mtx.c;
	this.d = c * mtx.b + this.d * mtx.d;
	this.tx = tx * mtx.a + this.ty * mtx.c + mtx.tx;
	this.ty = tx * mtx.b + this.ty * mtx.d + mtx.ty;
	return this;
};

Matrix.prototype.rotate = function(angle)
{
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	
	var a = this.a;
	var c = this.c;
	var tx = this.tx;
	
	this.a = a * cos - this.b * sin;
	this.b = a * sin + this.b * cos;
	this.c = c * cos - this.d * sin;
	this.d = c * sin + this.d * cos;
	this.tx = tx * cos - this.ty * sin;
	this.ty = tx * sin + this.ty * cos;
	return this;
};

Matrix.prototype.scale = function(sx, sy)
{
	this.a *= sx;
	this.d *= sy;
	this.tx *= sx;
	this.ty *= sy;
	return this;
};

Matrix.prototype.translate = function(dx, dy)
{
	this.tx += dx;
	this.ty += dy;
	return this;
};

Matrix.prototype.identity = function()
{
	this.a = this.d = 1;
	this.b = this.c = this.tx = this.ty = 0;
	return this;
};

Matrix.prototype.invert = function()
{
	var a = this.a;
	var b = this.b;
	var c = this.c;
	var d = this.d;
	var tx = this.tx;
	var i = a * d - b * c;
	
	this.a = d / i;
	this.b = -b / i;
	this.c = -c / i;
	this.d = a / i;
	this.tx = (c * this.ty - d * tx) / i;
	this.ty = -(a * this.ty - b * tx) / i;
	return this;
};

Matrix.prototype.transformPoint = function(point, round, returnNew)
{
	var x = point.x * this.a + point.y * this.c + this.tx;
	var y =	point.x * this.b + point.y * this.d + this.ty;
	if(round)
	{
		x = x + 0.5 >> 0;
		y = y + 0.5 >> 0;
	}
	if(returnNew) return {x:x, y:y};
	point.x = x;
	point.y = y;
	return point;
};

Matrix.prototype.clone = function()
{
	return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

Matrix.prototype.toString = function()
{
	return "(a="+this.a+", b="+this.b+", c="+this.c+", d="+this.d+", tx="+this.tx+", ty="+this.ty+")";
};

})();