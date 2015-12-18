var $ = require('jQuery');
var bind = require('lodash/function/bind');
var flatten = require('lodash/array/flatten');

require('FitText.js');

// function fitText($el) {
//   $el.css('font-size', $el.width() / (compressor*10));
// }

export class RowColMask {
  constructor(canvas, rows, cols) {
    this.$canvas = $(canvas);
    this.rows = rows;
    this.cols = cols;
    this.seq = [];

    this.renderMaskControls();
    this.addMaskContainer();
  }

  addMaskContainer() {
    this.masks = $('<div class="masks">');
    this.$canvas.parent().append(this.masks);
  }

  renderMask(row, col, dims) {
    var mask = $('<div class="mask">');
    this.masks.append(mask);

    mask.data({ row: row, col: col });
    mask.height(dims.height);
    mask.width(dims.width);
    mask.offset(dims);
  }

  render() {
    var rows = this.rows || 2;
    var cols = this.cols || 2;
    var offset = this.$canvas.offset();
    var w = this.$canvas.width() / cols;
    var h = this.$canvas.height() / rows;

    for (let row=0; row < rows; row++) {
      for (let col=0; col < cols; col++) {
        this.renderMask(row, col, {
          width: w,
          height: h,
          top: offset.top + h * row,
          left: offset.left + w * col
        });
      }
    }

    this.registerClickHandler();
  }

  controlDiv(type) {
    return $(`<div class="controls ${type}-control">${type} count: <a class="op op-minus" href="javascript:;">-</a> | <a class="op op-plus" href="javascript:;">+</a></div>`);
  }
  reRender() {
    this.cleanup();
    this.addMaskContainer();
    this.renderMaskControls();
    this.render();
  }

  removeRow() {
    this.rows -= 1;
    this.reRender();
  }
  addRow() {
    this.rows += 1;
    this.reRender();
  }
  removeCol() {
    this.cols -= 1;
    this.reRender();
  }
  addCol() {
    this.cols += 1;
    this.reRender();
  }

  renderMaskControls() {
    var rowControl = this.controlDiv('row')
          .on('click', '.op-minus', evt => this.removeRow())
          .on('click', '.op-plus', evt => this.addRow());

    var colControl = this.controlDiv('col')
          .on('click', '.op-minus', evt => this.removeCol())
          .on('click', '.op-plus', evt => this.addCol());
    var contorls = $('<div class="op-controls">').append(rowControl, colControl);
    this.$canvas.parent().prepend(contorls);
  }

  registerClickHandler() {
    var that = this;
    this.masks.on('click', '.mask', function () {
      that.addToSeq($(this));
    });
  }
  unregisterClickHandler() {
    this.masks.off();
  }

  addToSeq($e) {
    this.seq.push([$e.data('row'), $e.data('col')].join('-'));
    $e.html(`<h3>${this.seq.length}</h3>`);
    $e.find('h3').fitText(0.5);

    if (this.seq.length === this.rows * this.cols) {
      this.unregisterClickHandler();
      this.seqComplete();
    }
  }

  seqComplete() {
    this.seqCompleteCb();
  }
  registerSeqCompleteCb(fn) {
    this.seqCompleteCb = fn;
  }

  clearSeq() {
    this.seq = [];
  }

  cleanup() {
    this.unregisterClickHandler();
    this.$canvas.parent().find('.op-controls').remove();
    this.clearSeq();
    this.masks.remove();
  }

  serialize() {
    var seq = [];
    for (let r=0; r<this.rows; r++) {
      for (let c=0; c<this.cols; c++) {
        seq[r] = seq[r] || [];
        seq[r][c] = this.seq.indexOf([r, c].join('-')) + 1;
      }
    }
    return [this.rows].concat(flatten(seq)).join(',');
  }
}
