'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

// See https://webpack.js.org/api/cli/#environment-options for env
function createWebpackConfig({ env, argv, projectRoot }) {
    const config = {};

    config.mode = env.production ? 'production' : 'development';

    if (config.mode == 'development') {
        config.devtool = 'source-map';
    }
    config.module = {
        rules: [
            {
                test: /\.js$/,
                exclude: /[\\/]\.pnpm[\\/]/,
                enforce: 'pre',
                use: [
                    {
                        loader: require.resolve('source-map-loader')
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    require.resolve('style-loader'),
                    {
                        loader: require.resolve('css-loader'),
                        options:
                        {
                            importLoaders: 1,
                            url: true,
                            modules: true,
                            sourceMap: config.mode == 'development' ? true : false
                        },
                    },
                ],
            }
        ]
    };

    config.entry = {
        app: path.join(projectRoot, 'obj', 'main.js'),
    };
    config.output = {
        path: path.join(projectRoot, 'bin'),
        filename: '[name]_[contenthash].js'
    };

    config.devServer = {
        host: 'localhost',
        port: 9000,
        static: {
            directory: path.join(projectRoot, 'bin')
        },
        webSocketServer: false,
    };

    config.plugins = [
        new HtmlWebpackPlugin({
            template: path.resolve(projectRoot, 'assets', 'index.html')
        })
    ];

    return config;
}

module.exports = createWebpackConfig;