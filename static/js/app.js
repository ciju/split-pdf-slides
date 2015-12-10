require('./../dropzone/dropzone.css');
var Dropzone = require('./../dropzone/dropzone.js');

require('./../styles/app.css');

var RowCol = require('./RowCol.js').RowCol;

function setupEvents(dz, seq) {
  //  TODO-ci: check the upload has pdf extension
  dz.on('success', function (s, data) {
    var farr = s.name.split('.');
    farr.pop(); // extension

    var parts = [
      data.url,
      farr.join('.') + '-slides.pdf',
      seq
    ];

    window.open(parts.join('/'));
  });

  dz.on('complete', function (file) {
    this.removeFile(file);
  });
}

Dropzone.options.upload = {
  init: () => {
    var rowCol = new RowCol('.rowcol');
    rowCol.render();

    setupEvents(Dropzone.forElement('#upload'), rowCol.serialize());
  }
};
