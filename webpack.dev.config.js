const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

// Singleton packages that must have exactly one copy — always resolve to this
// app's node_modules so the plugin source doesn't pick up its own uninitialized copy.
const singletons = [
  '@edx/frontend-platform',
  '@hookstate/core',
  'react',
  'react-dom',
  '@openedx/paragon',
  '@openedx/frontend-plugin-framework',
  '@tanstack/react-query',
].reduce((acc, pkg) => {
  acc[pkg] = path.resolve(__dirname, 'node_modules', pkg);
  return acc;
}, {});

const config = createConfig('webpack-dev', {
  resolve: {
    alias: {
      // Plugins can use 'CourseAuthoring' as an import alias for this app:
      CourseAuthoring: path.resolve(__dirname, 'src/'),
      ...singletons,
    },
    fallback: {
      fs: false,
      constants: false,
    },
  },
});

config.devServer = {
  ...config.devServer,
  host: '0.0.0.0',
  allowedHosts: 'all',
};

// On cross-filesystem mounts (OrbStack /mnt/mac), native FS events don't fire
// and — critically — file mtimes are unreliable across the 9P bridge. Webpack's
// default snapshot strategy is mtime-based: if the mtime hasn't changed it skips
// recompilation even when content has changed. Two things fix this:
//
// 1. snapshot.unmanagedPaths: tells webpack to use content-hash snapshots (not
//    mtime) for the plugin source, so changed content is always detected.
//
// 2. BulkRerunWatcher plugin: chokidar polling detects changes, then clears both
//    the InputFileSystem cache AND FileSystemInfo's hash cache for the file before
//    calling invalidate(). That forces a fresh read + hash comparison each rebuild.
const pluginSrc = path.resolve(__dirname, '../frontend-plugin-bulk-rerun/src');

// Switch the plugin source to content-hash snapshot validation so webpack detects
// changes even when the 9P bridge doesn't update file mtimes.
config.snapshot = {
  ...(config.snapshot || {}),
  unmanagedPaths: [
    ...((config.snapshot || {}).unmanagedPaths || []),
    pluginSrc,
  ],
};

config.plugins = [
  ...config.plugins,
  {
    apply(compiler) {
      // After every build, evict all plugin-src file hashes from FileSystemInfo's
      // _fileHashes cache. unmanagedPaths makes webpack use hash comparison (not
      // mtime) for plugin files, but it still caches computed hashes between
      // builds. If we delete the entry inside the chokidar callback the in-progress
      // build often repopulates it with the OLD hash before the next rebuild starts,
      // creating a race. The done hook fires with no build running, so the eviction
      // is always visible to the very next snapshot check.
      compiler.hooks.done.tap('BulkRerunWatcher', () => {
        const fsi = compiler.watching?.fileSystemInfo;
        // eslint-disable-next-line no-underscore-dangle
        const fileHashes = fsi?._fileHashes;
        if (!fileHashes) { return; }
        for (const p of fileHashes.keys()) {
          if (p.startsWith(pluginSrc)) { fileHashes.delete(p); }
        }
      });

      compiler.hooks.afterEnvironment.tap('BulkRerunWatcher', () => {
        // eslint-disable-next-line global-require, import/no-extraneous-dependencies
        const chokidar = require('chokidar');
        const watcher = chokidar.watch(pluginSrc, {
          usePolling: true,
          interval: 500,
          ignoreInitial: true,
        });

        let debounceTimer = null;
        watcher.on('change', (filePath) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            // Purge InputFileSystem so webpack re-reads file content from disk
            // (complements the _fileHashes eviction in the done hook above).
            compiler.inputFileSystem.purge?.(filePath);
            compiler.inputFileSystem.purge?.(path.dirname(filePath));

            if (compiler.watching) {
              compiler.watching.invalidate(() => {});
            }
          }, 120);
        });

        compiler.hooks.watchClose.tap('BulkRerunWatcher', () => watcher.close());
      });
    },
  },
];

module.exports = config;
