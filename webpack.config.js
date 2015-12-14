var webpack = require('webpack');

module.exports = {
  entry: "./static/js/app.js",
  output: {
    path: __dirname,
    filename: "./static/js/bundle.js"
  },
  devtool: 'source-map',
  resolve: {
    moduleDirectories: ['node_modules', 'bower_components']
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.js$/, exclude: /node_modules|bower_components/, loader: "babel-loader"}
    ]
  }
};
