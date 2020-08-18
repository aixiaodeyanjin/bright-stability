const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
module.exports = {
    plugins:[
        new FileManagerPlugin({
            onEnd: {
                copy: [
                    { source: './src/assets/iconfont/font.css', destination: './dist/stability/static/fonts/font.css' },
                    { source: './src/assets/iconfont/fangfangxianfeng.ttf', destination: './dist/stability/static/fonts/fangfangxianfeng.ttf' },
                    { source: './src/assets/iconfont/PingFangSC-Regular.ttf', destination: './dist/stability/static/fonts/PingFangSC-Regular.ttf' },
                ],
                move: [{source: './dist/archive/stability.tar.gz', destination: './dist/stability.tar.gz.orginal'}],
                archive: [{
                    source: './dist/stability',
                    destination: './dist/archive/stability.tar.gz',
                    format: 'tar',
                    gzipOptions: {
                        level: 1
                    },
                    globOptions: {
                        nomount: true
                    }
                }]
            }
        })
    ]
}
