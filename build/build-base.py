#coding=utf-8

import os

def build():
	
	#config
	src = "../src/"
	output = "../js/"
	version = "1.0.0"
	filename = "quark.base"
	compiler = "compiler.jar"
	compress = True

	files = ["base/core/base.js", 
			 "base/geom/Matrix.js",
			 "base/geom/Rectangle.js",
			 "base/event/EventConst.js",
			 "base/event/EventManager.js",
			 "base/event/EventDispatcher.js",
			 "base/context/Context.js",
			 "base/context/CanvasContext.js",
			 "base/context/DOMContext.js",
			 "base/utils/UIDUtil.js",
			 "base/utils/Utils.js",
			 "base/utils/Timer.js",
			 "base/utils/ImageLoader.js",
			 "base/utils/Tween.js",
			 "base/utils/Audio.js",
			 "base/display/Drawable.js",
			 "base/display/DisplayObject.js",
			 "base/display/DisplayObjectContainer.js",
			 "base/display/Stage.js",
			 "base/display/Bitmap.js",
			 "base/display/MovieClip.js",
			 "base/display/Button.js",
			 "base/display/Graphics.js"]

	
	#build version
	buildVer = None
	buildName = filename + "-" + version + ".js"
	f = open(output + buildName)
	for line in f:
		index = line.find("Quark " + version)
		if index != -1:
			buildVer = line[(line.index("build")+6):line.rindex(")")]
			break
	f.close()
	
	if buildVer == None:
		buildVer = 1
	else:
		buildVer = int(buildVer) + 1

	#build info
	buildInfo = "/*\n"
	buildInfo += "Quark " + version + " (build " + str(buildVer)+ ")\n"
	buildInfo += "Licensed under the MIT License.\n"
	buildInfo += "http://github.com/quark-dev-team/quarkjs\n"
	buildInfo += "*/\n\n"

	#read files
	content = ""	
	for f in files:
		fileName = src + f
		oFile = file(fileName)
		content += oFile.read() + "\n\n\n"
		oFile.close()
	content = buildInfo + content

	#merge content
	outputFileName = output + buildName
	outputFile = file(outputFileName, "w")
	outputFile.write(content)
	outputFile.close()

	#compress
	if(compress):
		compressOutputFileName = outputFileName[:-3] + ".min.js"
		os.system("java -jar " + compiler + " --js_output_file " + compressOutputFileName + " --js " + outputFileName)
		f = open(compressOutputFileName)
		content = buildInfo + f.read()
		f.close()
		f = file(compressOutputFileName, "w")
		f.write(content)
		f.close()


if __name__ == "__main__":
	build()