'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

function debugObj(input, name = "", depth = 0, maxDepth = 4) {
    if (depth > maxDepth) {
        return "";
    }
    let padding = "";
    if (depth > 0) {
        padding += "\n";
    }
    for (let i = 0; i < depth; i++) {
        padding += "  ";
    }
    switch (typeof input) {
        case "undefined":
            return `${padding}${name}: undefined`;
        case "object":
            if (input === null) {
                return `${padding}${name}: null`;
            }
            else {
                for (const [key, val] of Object.entries(input)) {
                    return `${padding}${name}: ${debugObj(val, key, depth + 1, maxDepth)}`;
                }
            }
        default:
            return `${padding}${name}: ${String(input)}`;

    }
}

// See https://webpack.js.org/api/cli/#environment-options for env
function createWebpackConfig({ env, argv, projectRoot, extendedConfig }) {
    const config = {};

    config.mode = env.production ? 'production' : 'development';

    console.log(`createWebpackConfig is in mode ${config.mode}`);
    console.log(debugObj(env, "env"));
    console.log(debugObj(argv, "argv"));
    console.log(debugObj(projectRoot, "projectRoot"));
    console.log(debugObj(extendedConfig, "extendedConfig"));

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

    if (extendedConfig.entry) {
        if (Array.isArray(extendedConfig.entry)) {
            const entryPoints = [];
            for (let i = 0; i < extendedConfig.entry.length; i++) {
                entryPoints.push(path.join(projectRoot, 'obj', extendedConfig.entry[i]));
            }
            config.entry = entryPoints;
        }
        else {
            config.entry = {
                app: path.join(projectRoot, 'obj', 'main.js')
            };
        }
    }
    else {
        config.entry = {
            app: path.join(projectRoot, 'obj', 'main.js')
        };
    }

    config.output = {
        path: path.join(projectRoot, 'bin'),
        filename: extendedConfig?.filename ?? '[name]_[contenthash].js'
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

    if (extendedConfig.externals) {
        config.externals = extendedConfig.externals;
    }

    return config;
}

module.exports = createWebpackConfig;