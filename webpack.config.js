module.exports = {
  entry: "./static/js/app.js",
  output: {
    path: __dirname,
    filename: "./static/js/bundle.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  }
};
