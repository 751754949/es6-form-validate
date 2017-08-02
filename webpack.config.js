var webpack = require('webpack');
var path = require('path');
module.exports = {
    entry: ['./src/app.js'],
    // entry: ['webpack/hot/dev-server', 'webpack-dev-server/client?http://localhost:8080', './src/app.js'],
    output: {
        //网站运行时的访问路径
        publicPath: "http://127.0.0.1:8080/lib/",
        //打包文件存放的绝对路径
        path: path.resolve(__dirname, 'lib'),
        // 打包后的文件名
        filename: 'bundle.js',
        library: 'soon',
        libraryTarget: 'umd'
        // umdNameDefine: true
    },
    externals: {
        jquery: 'jQuery',
        weui: 'weui'
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
        historyApiFallback: true,
        noInfo: true,
        port: 3000,
        //@ contentBase的意思就是webpack-dev-server起服务的时候找资源，
        //@ 要以哪里为根目录
        // contentBase: path.join(__dirname, "dist"),
    },
    devtool: '#eval-source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}
