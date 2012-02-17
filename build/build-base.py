#coding=utf-8

import re,os

def build():
	
	#config
	compress = True    
	src = "../src/"
	output = "../js/"
	filename = "quark.base-1.0.0.alpha.js"
	compiler = "compiler.jar"
	files = "base/core/base.js, base/geom/Matrix.js, base/geom/Rectangle.js, base/event/EventConst.js, base/event/EventManager.js, base/event/EventDispatcher.js, base/utils/UIDUtil.js, base/utils/Utils.js, base/utils/Timer.js, base/utils/ImageLoader.js, base/utils/Tween.js, base/utils/Audio.js, base/display/Drawable.js, base/display/DisplayObject.js, base/display/DisplayObjectContainer.js, base/display/Stage.js, base/display/Bitmap.js, base/display/MovieClip.js, base/display/Button.js, base/display/Graphics.js, base/context/Context.js, base/context/CanvasContext.js, base/context/DOMContext.js"

	#read files
	fileList = re.split(", ", files)
	content = ""	
	for f in fileList:
		fileName = src + f
		oFile = file(fileName)
		content += oFile.read() + "\n\n\n"
		oFile.close()
	
	#merge content
	outputFileName = output + filename
	outputFile = file(outputFileName, "w")
	outputFile.write(content)
	outputFile.close()

	#compress
	if(compress):
		compressOutputFileName = outputFileName[:-3] + ".min.js"
		os.system("java -jar " + compiler + " --js_output_file " + compressOutputFileName + " --js " + outputFileName)


if __name__ == "__main__":
	build()