from PIL import Image
import sys

filename = (sys.argv)[1]
im = Image.open(filename)
width = im.size[0]
height = im.size[1]
tileWidth = 500
tileHeight = 500

x = 0
y = 0
c = 0

while y<(height):
  while x<(width):
    box = (x,y,x+tileWidth,y+tileHeight)
    tile = im.crop(box)
    tile.save('tile-'+str(x)+'-'+str(y)+'.png')
    x+=tileWidth
    c+=1
    print "created tile number "+str(c)+" || saved as "+'tile-'+str(x)+'-'+str(y)+'.png'
  y+=tileHeight
  x=0