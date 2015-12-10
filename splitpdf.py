#!/usr/bin/python
import copy, sys, pprint
import argparse

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

def split_pdf(readf, writef, r, c, lst):
    try:
        xobject_pdf_split(readf, writef)
    except (KeyError, AttributeError):
        if (len(lst) != r*c): lst = range(1, r*c+1)
        mediabox_pdf_split(readf, writef, r, c, lst)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-o', default='out.pdf', help='Output file')
    parser.add_argument('-i', required=True, help='Input file')
    parser.add_argument('-m', '--mediabox', action='store_true', help='Split pdf using mediabox')
    parser.add_argument('-s', '--size', type=int, nargs=2, help='Row and column size of the split')
    parser.add_argument('--seq', type=int, nargs=argparse.REMAINDER, help='Sequence of the slides, in the input file')

    args = parser.parse_args()

    inFile = file(args.i, "rb")
    outFile = file(args.o, "wb")

    r, c = args.size
    seq = args.seq or []

    if not args.mediabox:
        split_pdf(inFile, outFile, r, c, seq);
        sys.exit(0)

    if args.mediabox and len(seq) == 0:
        seq = range(1, r*c + 1)

    if args.mediabox and len(seq) != r*c:
        print "Sequence doesn't span the rows and columns"
        sys.exit(2)

    print args.i, args.o, r, c, seq
    mediabox_pdf_split(inFile, outFile, r, c, seq)
