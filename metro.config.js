const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Block react-native-maps and its dependencies on web
config.resolver.alias = {
  ...config.resolver.alias,
};

// Platform-specific resolver
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Block react-native-maps completely on web
    if (moduleName === 'react-native-maps' || moduleName.startsWith('react-native-maps/')) {
      return {
        type: 'empty',
      };
    }
    
    // Block native-only modules
    if (moduleName.includes('codegenNativeCommands') || 
        moduleName.includes('Libraries/Utilities/codegenNativeCommands')) {
      return {
        type: 'empty',
      };
    }
  }
  
  return originalResolveRequest ? originalResolveRequest(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
