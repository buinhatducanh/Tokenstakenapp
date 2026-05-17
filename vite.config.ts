import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // Feature and package aliases
      '@features/auth': path.resolve(__dirname, './features/auth/src/index.ts'),
      '@features/invoice': path.resolve(__dirname, './features/invoice/src/index.ts'),
      '@features/transaction': path.resolve(__dirname, './features/transaction/src/index.ts'),
      '@features/dashboard': path.resolve(__dirname, './features/dashboard/src/index.ts'),
      '@features/command-palette': path.resolve(__dirname, './features/command-palette/src/index.ts'),
      '@features/reports': path.resolve(__dirname, './features/reports/src/index.ts'),
      '@packages/shared-types': path.resolve(__dirname, './packages/shared-types/src/index.ts'),
      '@packages/common-utils': path.resolve(__dirname, './packages/common-utils/src/index.ts'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
