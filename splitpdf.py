#!/usr/bin/python
import copy, getopt, sys, pprint

__author__ = "ciju.ch3rian@gmail.com (ciju cherian)"

from pypdf2 import PdfFileWriter, PdfFileReader, PageObject, ContentStream, DictionaryObject, DecodedStreamObject, NameObject

def page4eachXobj(spage):
    pl = {}
    objlst = spage["/Resources"].getObject()["/XObject"]

    for key in objlst.keys():
        page = copy.copy(spage)
        r,x,c = [ NameObject(n) for n in ("/Resources", "/XObject", "/Contents") ]
        page[r] = DictionaryObject()
        page[r][x] = DictionaryObject()
        page[r][x][key] = dict.__getitem__(objlst,key)
        try:
            page.mediaBox = page[r][x][key]["/BBox"]
        except: pass
        cs = DecodedStreamObject()
        cs.setData("q\n"+key+" Do\nQ")
        page[c] = ContentStream(cs, page.pdf)
        pl[key] = page

    # return pages in the order of original /Contents description
    stream = spage["/Contents"].getObject().getData().split()
    return [pl[x] for x in stream if x in pl.keys()]

def copy_page(page):
    p = PageObject(page)
    p.update(page)
    p.mediaBox = copy.copy(page.mediaBox)
    return p

def make_page(lx, ly, ux, uy, page, o):
    p = copy_page(page)
    p.mediaBox.lowerLeft = (lx, ly)
    p.mediaBox.upperRight = (ux, uy)
    return p

# range l, u divided into s+1 points.
def get_points(l, u, s):
    xl = [l]
    for i in range(1, s+1): xl.append(i*(u-l)/s)
    return xl

def mediabox_slide_split(page, output, y, x, lst):
    minx, miny = page.mediaBox.lowerLeft
    maxx, maxy = page.mediaBox.upperRight

    xl = get_points(minx, maxx, int(x)) # columns
    yl = get_points(miny, maxy, int(y)) # rows

    yl.reverse()

    pl=[]
    for j in range(len(yl)-1):
        for i in range(len(xl)-1):
            pl.append(make_page(xl[i], yl[j+1], xl[i+1], yl[j]\
                                    , page, output))
    for i in lst:
        output.addPage(pl[int(i)-1])


def try_xobject_slide_split(p, o):
    for i in page4eachXobj(p):
        o.addPage(i)


def ssplit(readf, writef, fn, *arg):
    out = PdfFileWriter()
    inp = PdfFileReader(readf, False)

    for i in range(inp.getNumPages()):
        page = inp.getPage(i)
        fn(page, out, *arg)

    out.write(writef)

def mediabox_pdf_split(readf, writef, x, y, lst):
    ssplit(readf, writef, mediabox_slide_split, x, y, lst)

def xobject_pdf_split(readf, writef):
    ssplit(readf, writef, try_xobject_slide_split)

if __name__ == "__main__":
    opts, args = getopt.getopt(sys.argv[1:], "")

    if len(args) < 4 :
        print "Usage: "+sys.argv[0]+" <in.pdf> <out.pdf> <row> <col> <opt: slide order>"
        print """
        Mention a slide order, if the result doesn't match the order of
        sequence you want. Example, if the 1st slide is at position 3, 2nd
        at 2, 3rd at 1st, and 4th at 4th, slide order "3 2 1 4" would give
        the required result."""
        sys.exit(0)

    inFile = file(args[0], "rb")
    outFile = file(args[1], "wb")

    try:
        xobject_pdf_split(inFile, outFile)
    except (KeyError, AttributeError):
        r, c, lst = int(args[2]), int(args[3]), args[4:]
        if (len(lst) != r*c): lst = range(1, r*c+1)
        mediabox_pdf_split(inFile, outFile, r, c, lst)
