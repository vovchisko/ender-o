module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
    },
  },
  pluginOptions: {
    electronBuilder: {
      appId: 'com.domain.app',
      nodeIntegration: true,
      externals: [ 'electron-overlay-window' ],
      mainProcessFile: 'src/process/entry.js',
      builderOptions: {
        publish: [ 'github' ],
        productName: 'Ender-O',
        nsis: {
          oneClick: true,
          allowElevation: true,
          installerIcon: 'appicon.ico',
          uninstallerIcon: 'appicon.ico',
        },
        win: {
          target: [ 'nsis' ],
        },
      },
    },
  },
  css: {
    extract: false,
    loaderOptions: {
      sass: {
        sourceMap: true,
        prependData: `
          @import "@/styles/_injects.scss";
        `,
      },
    },
  },
}
