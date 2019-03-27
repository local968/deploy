const path = require('path');
const { injectBabelPlugin } = require('react-app-rewired');
const rewireMobX = require('react-app-rewire-mobx');
const rewireCssModules = require('react-app-rewire-css-modules');
const { override, fixBabelImports, addDecoratorsLegacy,disableEsLint, addWebpackAlias } = require('customize-cra');

// module.exports = function override(config, env) {
//   // do stuff with the webpack config...
//   config = rewireMobX(config, env);
//   config = rewireCssModules(config, env);
//   config = injectBabelPlugin(
//     ['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
//     config
//   );
//   config.resolve = {
//     alias: {
//       components: path.join(__dirname, 'src/components'),
//       stores: path.join(__dirname, 'src/stores'),
//       style: path.join(__dirname, 'src/components/Common/basic.module.css'),
//       sample: path.join(__dirname, 'sample'),
//       config: path.join(__dirname, 'src/config'),
//       util: path.join(__dirname, 'src/util')
//     }
//   };
//   return config;
// };

module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
  addWebpackAlias({
    components: path.join(__dirname, 'src/components'),
    stores: path.join(__dirname, 'src/stores'),
    style: path.join(__dirname, 'src/components/Common/basic.module.css'),
    sample: path.join(__dirname, 'sample'),
    config: path.join(__dirname, 'src/config'),
    util: path.join(__dirname, 'src/util')
  }),
  fixBabelImports('import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }),
)
