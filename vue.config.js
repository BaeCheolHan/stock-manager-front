const path = require('path')
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false,

  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
    }
    config.devtool = 'hidden-source-map';
    config.output = {
      hashFunction: 'xxhash64',
      path: path.join(__dirname, 'dist'),
      filename: 'stock-front.[contenthash:8].js',
      publicPath: '/',
      chunkFilename: 'stock-front.[contenthash:8].js'
    }
    config.resolve = {
      alias: {
        '@': path.join(__dirname, 'src'),
        'vue$': 'vue/dist/vue.runtime.esm-bundler.js',
        'assets' : path.resolve(__dirname, 'src/assets'),
      },
      extensions: [ '.mjs', '.js', '.jsx', '.vue', '.json', '.wasm' ],
      modules: [
        'node_modules',
        path.join(__dirname, 'node_modules'),
        path.join(__dirname, 'node_modules/@vue/cli-service/node_modules'),
      ]
    }
    config.externals = {
      // 이곳의 선언된 Json 객체는 .vue 자바스크림트에서 ${config.apiUrl}로 가져올 수 있다.
      config: JSON.stringify({
        contextRoot: ''
      })
    }
    config.devServer = {
      static: {
        directory: path.join(__dirname, 'public')
      },
      historyApiFallback: true,
      host: process.env.VUE_APP_DEVSERVER_HOST || 'localhost',
      port: Number(process.env.VUE_APP_DEVSERVER_PORT || 8080),
      https: (process.env.VUE_APP_DEVSERVER_HTTPS || 'false') === 'true',
      proxy: {
        '/api': {
          target: process.env.VUE_APP_API_PROXY_TARGET || 'http://localhost:18081'
        },
        '/login': {
          target: process.env.VUE_APP_API_PROXY_TARGET || 'http://localhost:18081'
        },
        '/sns': {
          target: process.env.VUE_APP_API_PROXY_TARGET || 'http://localhost:18081'
        }
      }
    }
  },

  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  }
})
