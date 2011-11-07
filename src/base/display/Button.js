
(function(){

/**
 * Constructor.
 * @name Button
 * @augments MovieClip
 * @class Button类继承自MovieClip，是Quark中的简单按钮实现。
 */
var Button = Quark.Button = function(props)
{
	props = props || {};
	Button.superClass.constructor.call(this, props);
	this.id = props.id || Quark.UIDUtil.createUID("Button");
	
	if(props.up) this.setUpState(props.up);
	if(props.over) this.setOverState(props.over);
	if(props.down) this.setDownState(props.down);
	if(props.disabled) this.setDisabledState(props.disabled);
	
	this.state = Button.UP;
	this.enabled = true;
	this.mouseChildren = false;
	this.useHandCursor = true;
	this.stop();
};
Quark.inherit(Button, Quark.MovieClip);

//Button states
Button.UP = "up";
Button.OVER = "over";
Button.DOWN = "down";
Button.DISABLED = "disabled";

Button.prototype.setUpState = function(upState)
{
	upState.label = Button.UP;
	this.setFrame(upState, 0);
	this.upState = upState;
	return this;
};

Button.prototype.setOverState = function(overState)
{
	overState.label = Button.OVER;
	this.setFrame(overState, 1);
	this.overState = overState;
	return this;
};

Button.prototype.setDownState = function(downState)
{
	downState.label = Button.DOWN;
	this.setFrame(downState, 2);
	this.downState = downState;
	return this;
};

Button.prototype.setDisabledState = function(disabledState)
{
	disabledState.label = Button.DISABLED;
	this.setFrame(disabledState, 3);
	this.disabledState = disabledState;
	return this;
};

Button.prototype.setEnabled = function(enabled)
{
	if(this.enabled == enabled) return this;
	this.eventEnabled = this.enabled = enabled;	 
	if(!enabled)
	{
		if(this.disabledState) this.gotoAndStop(Button.DISABLED);
		else this.gotoAndStop(Button.state.UP);
	}else
	{
		if(this.currentFrame == 3) this.gotoAndStop(Button.UP);
	}
	return this;
};

Button.prototype.changeState = function(state)
{
	if(this.state == state) return;
	this.state = state;

	switch(state)
	{
		case Button.OVER:
		case Button.DOWN:
		case Button.UP:
			if(!this.enabled) this.eventEnabled = this.enabled = true;
			this.gotoAndStop(state);
			break;
		case Button.DISABLED:
			this.setEnabled(false);
			break;
	}
	return this;
};

Button.prototype._onEvent = function(e)
{
	if(!this.enabled) return;
	
	switch(e.type)
	{
		case "mousemove":
			if(this.overState) this.changeState(Button.OVER);		
			break;
		case "mousedown":
		case "touchstart":
		case "touchmove":
			if(this.downState) this.changeState(Button.DOWN);
			break;
		case "mouseup":
			if(this.overState) this.changeState(Button.OVER);
			else this.changeState(Button.UP);
			break;
		case "mouseout":
		case "touchend":
			if(this.upState) this.changeState(Button.UP);
			break;
	}
	Button.superClass._onEvent.call(this, e);
};

})();