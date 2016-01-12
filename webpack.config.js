var path = require('path');
var webpack = require('webpack');

var isProd = process.env.NODE_ENV === 'production';

// http://www.jonathan-petitcolas.com/2015/05/15/howto-setup-webpack-on-es6-react-application-with-sass.html
function getEntrySources(sources) {
    if (!isProd) {
        sources.push('webpack-dev-server/client?http://localhost:8080');
    }

    return sources;
}

module.exports = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp(path));
  },
  entry: {
    main: getEntrySources(["./static/js/app.js"])
  },
  output: {
    path: __dirname + '/static/dist/js/',
    filename: "bundle.js",
    publicPath: '/js/'
  },
  debug: false,
  devtool: 'source-map',
  resolve: {
    root: [path.join(__dirname, "bower_components")],
    moduleDirectories: ['node_modules', 'bower_components'],
    alias: {
      'dropzone.js': 'dropzone/dist/min/dropzone.min.js',
      'dropzone.css': 'dropzone/dist/min/dropzone.min.css'
    }
  },
  module: {
    loaders: [
      { test: /\.html$/, loader: "html"},
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
  ],

  devServer: {
    proxy: {
      '/index.html': {
        target: 'http://localhost:8081',
        secure: false
      },
      '/api/*': {
        target: 'http://localhost:8081',
        secure: false
      },
      '/file/*': {
        target: 'http://localhost:8081',
        secure: false
      },
      '/_ah/*': {
        target: 'http://localhost:8081',
        secure: false
      }
    }
  }
};

if (isProd) {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      mangle: false
    })
  );
}
