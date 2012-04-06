
(function(){

/**
 * Constructor.
 * @name Text
 * @augments DisplayObject
 * @class The Text class provides simple text drawing.
 * @property text The text to display.
 * @property font  The font style to use.
 * @property color The color to use.
 * @property textAlign The text alignment. Can be any of "start", "end", "left", "right", and "center".
 * @property outline Determine whether stroke or fill text.
 * @property maxWidth The maximum width to draw the text, For canvas use.
 * @property lineWidth The maximum width for a line of text.
 * @property lineSpacing The space between two lines, in pixel.
 * @property fontMetrics The font metrics. You don't need to care it in most cases, can be passed in for performance optimization.
 */
var Text = Quark.Text = function(props)
{
	this.text = "";
	this.font = "12px arial";
	this.color = "#000";
	this.textAlign = "start";
	this.outline = false;
	this.maxWidth = 10000;
	this.lineWidth = null;
	this.lineSpacing = 0;
	this.fontMetrics = null;

	props = props || {};
	Text.superClass.constructor.call(this, props);
	this.id = Quark.UIDUtil.createUID("Text");

	if(this.fontMetrics == null) this.fontMetrics = Text.getFontMetrics(this.font);
}
Quark.inherit(Text, Quark.DisplayObject);


/**
 * Draws the text into the specific context.
 * @private
 */
Text.prototype._draw = function(context)
{
	if(!this.text || this.text.length == 0) return;

	//set drawing style
	context.font = this.font;
	context.textAlign = this.textAlign;
	context.textBaseline = "top";
	if(this.outline) context.strokeStyle = this.color;
	else context.fillStyle = this.color;

	//find and draw all explicit lines
	var lines = this.text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
	var y = 0, lineHeight = this.fontMetrics.height + this.lineSpacing;
	this.width = this.lineWidth || 0;

	for(var i = 0, len = lines.length; i < len; i++)
	{
		var line = lines[i], width = context.measureText(line).width;

		//check if the line need to split
		if(this.lineWidth == null || width < this.lineWidth)
		{
			if(width > this.width) this.width = width;
			this._drawTextLine(context, line, y);
			y += lineHeight;
			continue;
		}

		//split the line by each single word, loop to find the break
		//TODO: optimize the regular expression
		var words = line.split(/([^\x00-\xff]|\b)/), str = words[0];
		for(var j = 1, wlen = words.length; j < wlen; j++)
		{
			var word = words[j];
			if(!word || word.length == 0) continue;

			var newWidth = context.measureText(str + word).width;
			if(newWidth > this.lineWidth)
			{
				this._drawTextLine(context, str, y);
				y += lineHeight;
				str = word;
			}else
			{
				str += word;
			}
		}

		//draw remaining string
		this._drawTextLine(context, str, y);
		y += lineHeight;
	}

	this.height = y;
};

/**
 * Draws a text line into the specific context.
 * @private
 */
Text.prototype._drawTextLine = function(context, text, y)
{
	var x = 0;
	switch(this.textAlign)
	{
		case "center":
			x = this.width*0.5;
			break;
		case "right":
		case "end":
			x = this.width;
			break;
	};
	if(this.outline) context.strokeText(text, x, y, this.maxWidth);
	else context.fillText(text, x, y, this.maxWidth);
};

/**
 * Indicates the font style to use.
 */
Text.prototype.setFont = function(font, ignoreFontMetrics)
{
	if(this.font == font) return;
	this.font = font;
	if(!ignoreFontMetrics) this.fontMetrics = Text.getFontMetrics(this.font);
};

/**
 * Overrideed.
 * @private
 */
Text.prototype.render = function(context)
{
	if(context instanceof Quark.DOMContext)
	{
		var dom = this.getDrawable(context), style = dom.style;
		style.font = this.font;
		style.textAlign = this.textAlign;
		style.color = this.color;
		//Notice: be care of width/height might be 0.
		style.width = this.width + "px";
		style.height = this.height + "px";
		dom.innerHTML = this.text;
	}
	Text.superClass.render.call(this, context);
};

/**
 * Overrideed.
 * @private
 */
Text.prototype.getDrawable = function(context)
{
	//for DOMContext drawing only
	if(this.drawable == null) this.setDrawable(Quark.createDOM("div"), true);
	return this.drawable.get(this, context);
};

/**
 * A help method that returns line height and baseline informations of the specific font.
 * @method getFontMetrics
 * @return {Object} a font metrics object with height, ascent, descent.
 */
Text.getFontMetrics = function(font)
{
	var elem = Quark.createDOM("div", {style:{font: font}});
  	//trick: calculate baseline shift by creating 1px height element that will be aligned to baseline.
  	elem.innerHTML = '<div style="display:inline-block; width:1px; height:1px;"></div>';
  	document.body.appendChild(elem);

	var metrics = { }, baseline = elem.childNodes[0];
	//the height of the specific font style.
  	metrics.height = elem.offsetHeight;
  	//the ascent value is the length from the baseline to the top of the line height.
  	metrics.ascent = baseline.offsetTop + baseline.offsetHeight;
  	//the descent value is the length from the baseline to the bottom of the line height.
  	metrics.descent = metrics.height - metrics.ascent;
  	
  	document.body.removeChild(elem);
  	return metrics;
};


})();