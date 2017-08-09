/* global module:false, __dirname:false */

var webpack = require('webpack');

module.exports = {
    devtool: 'cheap-module-source-map',
    module: {
        loaders: [
            {
                test:    /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel-loader']
            }
        ]
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json']
    }
};
