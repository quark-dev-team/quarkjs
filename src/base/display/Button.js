
(function(){

/**
 * 构造函数.
 * @name Button
 * @augments DisplayObjectContainer
 * @class Button类继承自DisplayObjectContainer，是Quark中的简单按钮实现。
 * @argument {Object} props 一个对象，包含以下属性：
 * <p>image - Image对象。</p>
 * <p>up - 按钮弹起状态下的显示帧数组对象。如：[0,0,50,50]。
 * <p>over - 按钮经过状态下的显示帧数组对象。如：[50,0,50,50]。
 * <p>down - 按钮按下状态下的显示帧数组对象。如：[100,0,50,50]。
 * <p>disabled - 按钮不可用状态下的显示帧数组对象。如：[150,0,50,50]。
 */
var Button = Quark.Button = function(props)
{
	this.state = Button.UP;
	this.enabled = true;
    
	props = props || {};
	Button.superClass.constructor.call(this, props);
	this.id = props.id || Quark.UIDUtil.createUID("Button");

	this._skin = new Quark.MovieClip({id:"skin", image:props.image});
	this.addChild(this._skin);
	this._skin.stop();

	this.eventChildren = false;
	if(props.useHandCursor === undefined) this.useHandCursor = true;
	if(props.up) this.setUpState(props.up);
	if(props.over) this.setOverState(props.over);
	if(props.down) this.setDownState(props.down);
	if(props.disabled) this.setDisabledState(props.disabled);
};
Quark.inherit(Button, Quark.DisplayObjectContainer);

/**
 * 按钮的弹起状态。常量值。
 */
Button.UP = "up";
/**
 * 按钮的经过状态。常量值。
 */
Button.OVER = "over";
/**
 * 按钮的按下状态。常量值。
 */
Button.DOWN = "down";
/**
 * 按钮的不可用状态。常量值。
 */
Button.DISABLED = "disabled";

/**
 * 设置按钮弹起状态的显示帧。
 * @param {Array} upState 弹起状态的显示帧。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setUpState = function(upState)
{
	upState.label = Button.UP;
	this._skin.setFrame(upState, 0);
	this.upState = upState;
	return this;
};

/**
 * 设置按钮经过状态的显示帧。
 * @param {Array} overState 经过状态的显示帧。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setOverState = function(overState)
{
	overState.label = Button.OVER;
	this._skin.setFrame(overState, 1);
	this.overState = overState;
	return this;
};

/**
 * 设置按钮按下状态的显示帧。
 * @param {Array} downState 点击状态的显示帧。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setDownState = function(downState)
{
	downState.label = Button.DOWN;
	this._skin.setFrame(downState, 2);
	this.downState = downState;
	return this;
};

/**
 * 设置按钮不可用状态的显示帧。
 * @param {Array} disabledState 不可用状态的显示帧。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setDisabledState = function(disabledState)
{
	disabledState.label = Button.DISABLED;
	this._skin.setFrame(disabledState, 3);
	this.disabledState = disabledState;
	return this;
};

/**
 * 设置按钮是否启用。
 * @param {Boolean} enabled 指定按钮是否启用。默认为false。
 * @return {Button} 返回按钮本身。
 */
Button.prototype.setEnabled = function(enabled)
{
	if(this.enabled == enabled) return this;
	this.eventEnabled = this.enabled = enabled;	 
	if(!enabled)
	{
		if(this.disabledState) this._skin.gotoAndStop(Button.DISABLED);
		else this._skin.gotoAndStop(Button.UP);
	}else
	{
		if(this._skin.currentFrame == 3) this._skin.gotoAndStop(Button.UP);
	}
	return this;
};

/**
 * 改变按钮的显示状态。
 * @param {String} state 指定按钮的显示状态。
 * @return {Button} 返回按钮本身。
 */
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
			this._skin.gotoAndStop(state);
			break;
		case Button.DISABLED:
			this.setEnabled(false);
			break;
	}
	return this;
};

/**
 * 按钮的默认事件处理行为。
 * @private
 */
Button.prototype.dispatchEvent = function(e)
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
		case "touchout":
		case "touchend":
			if(this.upState) this.changeState(Button.UP);
			break;
	}
	Button.superClass.dispatchEvent.call(this, e);
};

/**
 * 把Button的drawable置空，否则传入image参数时会绘制成Button的背景。
 * @private
 */
Button.prototype.setDrawable = function(drawable)
{
	Button.superClass.setDrawable.call(this, null);
};

})();