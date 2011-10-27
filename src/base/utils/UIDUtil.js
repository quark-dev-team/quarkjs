
(function(){

/**
 * UIDUtil用来生成一个全局唯一的ID。
 * @private
 */
var UIDUtil = Quark.UIDUtil = { _counter:0 };

/**
 * 根据指定名字生成一个全局唯一的ID，如Stage1，Bitmap2等。
 */
UIDUtil.createUID = function(name)
{
	var charCode = name.charCodeAt(name.length - 1);
    if (charCode >= 48 && charCode <= 57) name += "_";
    return name + this._counter++;
};

/**
 * 为指定的displayObject显示对象生成一个包含路径的字符串表示形式。如Stage1.Container2.Bitmap3。
 */
UIDUtil.displayObjectToString = function(displayObject)
{
	var result;
	for(var o = displayObject; o != null; o = o.parent)
	{
        var s = o.id != null ? o.id : o.name;
        result = result == null ? s : (s + "." + result);
        if (o == o.parent) break;
	}
	return result;
};

})();