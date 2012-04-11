
var Squirrel = function(props)
{	
	Squirrel.superClass.constructor.call(this, props);
	this.init();
};
Q.inherit(Squirrel, Q.DisplayObjectContainer);

Squirrel.prototype.init = function()
{
	this.head = new Q.MovieClip({id:"head", image:Q.getDOM("headIdle"), useFrames:true, interval:2, x:5, y:0});
	this.head.addFrame([
	{rect:[0,0,66,56]},
	{rect:[69,0,66,56]},
	{rect:[138,0,66,56]},
	{rect:[207,0,66,56]}
	]);

	this.body = new Q.MovieClip({id:"body", image:Q.getDOM('bodyWalk'), useFrames:true, interval:2, x:0, y:25});
	this.body.addFrame([
	{rect:[0,0,108,66]},
	{rect:[109,0,108,66]},
	{rect:[218,0,108,66]},
	{rect:[327,0,108,66]},
	{rect:[436,0,108,66]},
	{rect:[545,0,108,66]},
	{rect:[0,70,108,66]},
	{rect:[109,70,108,66]},
	{rect:[218,70,108,66]},
	{rect:[327,70,108,66]},
	{rect:[436,70,108,66]}
	]);

	this.addChild(this.body, this.head);
    
    this.eventChildren = false;
    this.jumping = false;
    this.speedY = this.currentSpeedY = 8;    
	this.originY = this.y;
};

Squirrel.prototype.onEvent = function(e)
{
    if(e.type == "mouseup" || e.type == "touchend")
    {
        if(!this.jumping) 
        {
            this.jumping = true;
            this.currentSpeedY = this.speedY;
        }
    }
};

Squirrel.prototype.onmouseup = Squirrel.prototype.ontouchend = function(e)
{
	if(!this.jumping) 
	{
		this.jumping = true;
		this.currentSpeedY = this.speedY;
	}
};

Squirrel.prototype.update = function()
{
    if(this.jumping)
    {
        this.currentSpeedY -= 0.3;
        this.y -= this.currentSpeedY;
        if(this.originY <= this.y)
        {
            this.y = this.originY;
            this.jumping = false;
        }
    }
};