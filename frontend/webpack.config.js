const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = {
  context: path.resolve(__dirname),
  entry: {
    main: "./src/index.js",
    ...(process.env.NODE_ENV === "production"
      ? { sw: "./src/sw-register.js" }
      : {}),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@peach": path.resolve(__dirname, "src/peach"),
      "@app": path.resolve(__dirname, "src/app"),
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
  output: {
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/",
  },
  devServer: {
    historyApiFallback: true,
    port: 8080,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]",
              outputPath: "assets/images",
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]",
              outputPath: "assets/fonts",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: true, // Inject scripts into the body
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist"),
          globOptions: {
            ignore: ["**/index.html"], // Avoid copying index.html twice
          },
        },
      ],
    }),
    ...(process.env.NODE_ENV === "production"
      ? [
          new WorkboxPlugin.GenerateSW({
            clientsClaim: true, // Take control of clients immediately
            skipWaiting: true, // Activate new Service Worker immediately
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit per file
            // Precache all Webpack output (JS, CSS, images, fonts, HTML)
            include: [
              /\.(?:js|css|html|png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/,
            ],
            // Cache static assets with CacheFirst, app shell with StaleWhileRevalidate
            runtimeCaching: [
              {
                urlPattern:
                  /\.(?:png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/,
                handler: "CacheFirst",
                options: {
                  cacheName: "static-assets",
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                  },
                },
              },
              {
                urlPattern: /\.(?:js|css|html)$/,
                handler: "StaleWhileRevalidate",
                options: {
                  cacheName: "app-shell",
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                  },
                },
              },
            ],
          }),
        ]
      : []),
  ],
  optimization: {
    minimize: true,
  },
};
