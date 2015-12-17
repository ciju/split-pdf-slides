require('./../dropzone/dropzone.css');
require('./../styles/app.scss');

// would have to make it promisable?
require('./../pdfjs/pdf.js');

var $ = require('jQuery');
var Promise = require('bluebird');
var partial = require('lodash/function/partial');
var utils = require('./utils');
var Dropzone = require('./../dropzone/dropzone.js');
var {RowColMask} = require('./rowColMask');

function setupEvents(dz) {
  //  TODO-ci: check the upload has pdf extension
  var seq;
  var rcm;
  var pageRef;

  dz.on('success', function ({name: name}, {url: url}) {
    var path = [url, utils.baseName(name) + '-slides.pdf', seq].join('/');

    // cleanup?
    rcm.cleanup();
    rcm = null;
    pageRef.cleanup();
    var canvas = document.getElementById('canvas');
    canvas.width = 0;
    canvas.height = 0;

    window.open(path);
  });

  dz.on('complete', function (file) {
    this.removeFile(file);
  });

  dz.on('addedfile', function (file) {
    if (utils.extension(file.name) !== 'pdf') {
      console.log('not pdf');
      return;
    }

    $.getJSON('/uploadURL')
      .done(r => this.options.url = r.url);

    utils.fileToDataURIPromise(file)
      .then(utils.dataURIToBinary)
      .then(partial(loadPDF, 'canvas'))
      .then(function (page) {
        pageRef = page;
        rcm = new RowColMask('canvas', 2, 2);
        rcm.render();
        rcm.registerSeqCompleteCb(function () {
          seq = rcm.serialize();
          dz.processQueue();
        });
      });
  });
}

function canvasContext(sel, dims) {
  var canvas = document.getElementById(sel);
  var context = canvas.getContext('2d');
  canvas.height = dims.height;
  canvas.width = dims.width;
  return context;
}

function loadPDF(canvasSel, pdfDoc) {
  PDFJS.workerSrc = "./pdfjs/pdf.worker.js";
  return PDFJS
    .getDocument(pdfDoc)
    .then(pdf => pdf.getPage(1))
    .then(page => {
      var viewport = page.getViewport(1);

      return page.render({
        canvasContext: canvasContext(canvasSel, viewport),
        viewport: viewport
      }).then(() => page);
    });
}

$(function () {
  var c = document.getElementById('canvas');
  c.width = 0;
  c.height = 0;
});

function setupDropZone() {
  $.getJSON('/uploadURL').done(r => {
    var dz = new Dropzone('.drop-zone', {
      previewsContainer: '.j-drop-zone-preview',
      autoProcessQueue: false,
      parallelUploads: 1,
      uploadMultiple: false,
      acceptableFiles: 'application/pdf',
      url: r.url
    });
    setupEvents(dz);
  });
}
setupDropZone();
