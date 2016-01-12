require('./../styles/app.scss');
require('dropzone.css');

require('pdfjs-dist/build/pdf.js');

var messageTmpl = require('./../message-tmpl.html');
var previewTmpl = require('./../preview-tmpl.html');
var $ = require('jQuery');
var Promise = require('bluebird');
var _ = require('lodash');
var utils = require('./utils');
var Dropzone = require('dropzone.js');
var {RowColMask} = require('./rowColMask');

class PDFCanvas {
  constructor(id) {
    this.eleId = id;
  }

  reset() {
    var canvas = document.getElementById(this.eleId);
    canvas.width = 0;
    canvas.height = 0;
  }

  setup(dims) {
    var canvas = document.getElementById(this.eleId);
    var context = canvas.getContext('2d');
    canvas.height = dims.height;
    canvas.width = dims.width;
    return context;
  }
}

class SplitPdfFile {
  constructor(dz, canvas) {
    this.dz = dz;
    this.canvas = canvas;
  }

  fetchUploadURL() {
    return Promise.resolve($.getJSON('/api/uploadURL')).then(data => data.url);
  }

  onSeqFinalised() {
    this.seq = this.rcm.serialize();
    this.dz.processQueue();
    // remove the rcm, and show progress of upload.
  }

  setupPDFInteraction(file) {
    return utils.fileToDataURIPromise(file)
      .then(utils.dataURIToBinary)
      .then(_.partial(loadPDF, this.canvas))
      .then(page => {
        this.pageRef = page;
        this.rcm = new RowColMask('canvas', 2, 2);
        this.rcm.render();
        this.rcm.registerSeqCompleteCb(this.onSeqFinalised.bind(this));
      }).catch(err => {
        console.log('error happened');
      });7
  }

  reset() {
    // show the initial template with message.
    this.rcm.cleanup();
    this.rcm = null;
    this.pageRef.cleanup();
    this.canvas.reset();
  }

  setupEvents() {
    var that = this;
    this.dz.on('success', ({name: name}, {url: url}) => {
      var path = [url, utils.baseName(name) + '-slides.pdf', this.seq].join('/');
      utils.triggerDownload(path);

      this.reset();
    });
    this.dz.on('error', file => {
      // state should tell where the error happened.
      console.log('error happened');
    });
    this.dz.on('complete', (file) => {
      this.dz.removeFile(file);
    });
    this.dz.on('uploadprogress', (file, progress) => {
      console.log('progress', progress);
    });
    this.dz.on('addedfile', (file) => {
      file.previewElement = Dropzone.createElement(this.dz.options.previewTemplate);
      if (utils.extension(file.name) !== 'pdf') {
        console.log('not pdf');
        return;
      }

      this.fetchUploadURL().then(url => {
        this.dz.options.url = url;
      }).catch(err => {
        console.log('uploadURL fetch failed', err);
      });

      this.setupPDFInteraction(file).then(() => {
        // new state.
      });
    });
  }
}

function loadPDF(canvas, pdfDoc) {
  PDFJS.workerSrc = require("pdfjs-dist/build/pdf.worker.js");
  return PDFJS
    .getDocument(pdfDoc)
    .then(pdf => pdf.getPage(1))
    .then(page => {
      var viewport = page.getViewport(1);

      return page.render({
        canvasContext: canvas.setup(viewport),
        viewport: viewport
      }).then(() => page);
    });
}

Dropzone.autoDiscover = false;

$.getJSON('/api/uploadURL').done(r => {
  $('.j-upload-target').html(messageTmpl);
  var dz = new Dropzone('.drop-zone', {
    previewsContainer: '.j-drop-zone-preview',
    previewTemplate: previewTmpl,
    autoProcessQueue: false,
    uploadMultiple: false,
    acceptableFiles: 'application/pdf',
    url: r.url,
    clickable: '.j-upload-target'
  });

  var canvas = new PDFCanvas('canvas');
  $(() => canvas.reset());

  var pd = new SplitPdfFile(dz, canvas);
  pd.setupEvents();
});
