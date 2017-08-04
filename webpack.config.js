var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: {
        demo1: './src/demo1.js',
        demo2: './src/demo2.js'
    },
    output: {
        //网站运行时的访问路径
        publicPath: "/build/",
        //打包文件存放的绝对路径
        path: path.resolve(__dirname, 'build'),
        // 打包后的文件名
        filename: '[name].js',
        library: 'soon',
        libraryTarget: 'umd'
            // umdNameDefine: true
    },
    externals: {
        jquery: 'jQuery'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            use: [{
                loader: "babel-loader",
                options: {
                    presets: ["es2015"]
                }
            }],
            exclude: /node_modules/
        }]
    },
    // resolve: {
    //     alias: {
    //         // 'views': path.resolve(__dirname, '../src/views'),
    //         'jQuery': './jquery.min.js'
    //     }
    // },
    devServer: {
        // historyApiFallback: true,
        noInfo: false,
        port: 3000,
        //@ contentBase的意思就是webpack-dev-server起服务的时候找资源，
        //@ 要以哪里为根目录
        // contentBase: path.join(__dirname, "dist"),
    },
    devtool: '#eval-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'demo1.html',
            template: './src/template1.html',
            chunks: ['demo1'],
        }),
        new HtmlWebpackPlugin({
            filename: 'demo2.html',
            template: './src/template2.html',
            chunks: ['demo2'],
        })
    ]
}
