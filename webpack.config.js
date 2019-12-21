/* eslint-env node */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OfflinePlugin = require('offline-plugin')
const packageJson = require('./package.json')

module.exports = (mode, argv) => {
  const chunkhash = argv.mode === 'production' ? '.[chunkhash]' : ''
  return {
    entry: path.resolve('./src/js/app.js'),
    devtool:
      argv.mode === 'production' ? 'hidden-source-map' : 'eval-source-map',
    output: {
      filename: argv.mode === 'production' ? '[chunkhash].js' : '[name].js',
      path: path.resolve(__dirname, 'dist')
    },
    target: 'web',
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader'
        },
        {
          test: /css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: {
                  localIdentName:
                    argv.mode === 'production'
                      ? '[hash:base64:5]'
                      : '[path][name]__[local]--[hash:base64:5]'
                },
                localsConvention: 'camelCase',
                importLoaders: 1
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        version: packageJson.version,
        template: 'src/html/index.html',
        filename: 'index.html',
        minify: {
          collapseWhitespace: argv.mode === 'production'
        }
      }),
      new MiniCssExtractPlugin({
        filename: `[name]${chunkhash}.css`,
        chunkFilename: `[id]${chunkhash}.css`
      }),
      new OfflinePlugin({
        ServiceWorker: {
          minify: argv.mode === 'production',
          events: true
        }
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all'
      },
      minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})]
    }
  }
}
