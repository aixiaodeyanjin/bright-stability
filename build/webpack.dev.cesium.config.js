const path = require('path');
const CopywebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
    output: {
        // Needed to compile multiline strings in Cesium
        sourcePrefix: '',
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true,
    },
    node: {
        // Resolve node module use of fs
        fs: 'empty',
    },
    resolve: {
        alias: {
            // CesiumJS module name
            // cesium: path.resolve(__dirname, cesiumSource + '/Cesium'),
        },
    },
    plugins: [
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        
        new CopywebpackPlugin([
            { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
        ]),
        new CopywebpackPlugin([
            { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
        ]),
        new CopywebpackPlugin([
            { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
        ]),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify(''),
        }),
    ],
    module: {
        // cesium 3 不加这个配置会报require引入警告
        unknownContextCritical: false,
    },
};
