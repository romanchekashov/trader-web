const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = [
    {
        node: {
            __dirname: true,
        },
        mode: "development",
        entry: "./src/main.ts",
        target: "electron-main",
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    include: /src/,
                    use: [{ loader: "ts-loader" }],
                },
            ],
        },
        output: {
            path: __dirname + "/dist",
            filename: "main.js",
        },
    },
    {
        node: {
            __dirname: true,
        },
        mode: "development",
        entry: "./src/index.tsx",
        target: "electron-renderer",
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    include: /src/,
                    use: [{ loader: "ts-loader" }],
                },
                {
                    test: /(\.css)$/,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1,
                            },
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                config: {
                                    path: "./postcss.config.js",
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/,
                    loader: "url-loader?limit=100000",
                },
            ],
        },
        output: {
            path: __dirname + "/dist",
            filename: "index.js",
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env.API_URL": JSON.stringify("http://localhost:3001"),
                // "process.env.API_URL": JSON.stringify(
                //     "http://192.168.10.104:3001"
                // ),
            }),
            new HtmlWebpackPlugin({
                template: "index.html",
            }),
        ],
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
    },
];
