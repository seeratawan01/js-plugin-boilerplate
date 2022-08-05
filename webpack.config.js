const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const config = require('config');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

/*-------------------------------------------------*/

const PluginName = 'MyPlugin'
module.exports = {
    // webpack optimization mode
    mode: (process.env.NODE_ENV ? process.env.NODE_ENV : 'development'),

    // entry file(s)
    entry: './src/index.js',

    // output file(s) and chunks
    output: {
        library: PluginName,
        libraryTarget: 'umd',
        globalObject: '(typeof self !== "undefined" ? self : this)',
        libraryExport: 'default',
        path: path.resolve(__dirname, 'dist'),
        filename: `${PluginName}.js`,
        publicPath: config.get('publicPath')
    },

    // module/loaders configuration
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
            }
        ]
    },
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin({
                extractComments: false
            })
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'index.html')
        }),
        new MiniCssExtractPlugin(),
    ],

    // development server configuration
    devServer: {

        static: './',

        // must be `true` for SPAs
        historyApiFallback: true,

        // open browser on server start
        open: config.get('open'),

        hot: true,

        port: 9999
    },

    // generate source map
    devtool: 'production' === process.env.NODE_ENV ? 'source-map' : false
};
