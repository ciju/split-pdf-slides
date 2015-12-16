
var BASE64_MARKER = ';base64,';
export function dataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for (var i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }

  return array;
}

export function fileToDataURIPromise(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}
