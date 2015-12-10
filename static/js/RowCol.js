function flatten1(rows) {
  var res = [];
  for (var i in rows) {
    res = res.concat(rows[i]);
  }
  return res;
}

export class RowCol {
  constructor(ele) {
    this.ele = document.querySelector(ele);
    this.state = [[1, 2], [3, 4]];
  }
  render() {
    // render the current state
    var rowColEles = [];
    for (var row in this.state) {
      rowColEles.push('<div class="row">');
      for (var col in this.state[row]) {
        let val = this.state[row][col];
        rowColEles.push(`<input id="${row},${col}" class="col" maxlength="2" value="${val}"/>`);
      }
      rowColEles.push('</div>');
    }

    this.ele.innerHTML = rowColEles.join(' ');
  }
  serialize() {
    var rows = this.state;
    return [rows.length].concat(flatten1(rows)).join(',');
  }
};
