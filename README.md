#purpose 
split multiple slide per page pdf's to single slide per page

ex:
[Probability and Statistics - Sam Roweis (4up)](https://github.com/ciju/split-pdf-slides/blob/master/static%2Fsample%2Fprobx.pdf)<sup>1</sup> to
[Probability and Statistics - Sam Roweis (1up)](https://github.com/ciju/split-pdf-slides/blob/master/static%2Fsample%2Fprobx-slides.pdf).

#usage
You can try the web app at [](https://split-4up-slides.appspot.com/).
If you prefer command line app, checkout the code, and run. Ex:

```
git clone https://github.com/ciju/split-pdf-slides.git
cd split-pdf-slides
python splitpdf.py -i in.pdf -s 2 2
```

Tested with Python 2.7

Supported by [ActiveSphere](http://www.activesphere.com/)

1: original at [Review: Probability and Statistics - Sam Roweis](http://www.cs.nyu.edu/~roweis/csc2515-2006/extras/probx.pdf)
