var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: "./static/js/app.js",
  output: {
    path: __dirname + '/static/dist/js/',
    filename: "bundle.js",
    publicPath: '/js/'
  },
  debug: true,
  devtool: 'source-map',
  resolve: {
    root: [path.join(__dirname, "bower_components")],
    moduleDirectories: ['node_modules', 'bower_components']
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.scss$/, loaders: ["style", "css", "sass"] },
      { test: /pdf\.worker\.js$/, loader: "url-loader?limit=10000&name=pdf.worker.js" },
      { test: /\.js$/, exclude: /node_modules|bower_components/, loader: "babel-loader"}
    ]
  },
  plugins: [
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    ),
    new webpack.ProvidePlugin({
      $: "jQuery/dist/jquery",
      jQuery: "jQuery/dist/jquery"
    })
  ]
};
