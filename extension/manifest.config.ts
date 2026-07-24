import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'UrPilot',
  version: '0.1.0',
  description: 'Hands-free voice assistant for browsing, tabs, and research.',
  action: {},
  side_panel: {
    default_path: 'src/sidepanel/sidepanel.html'
  },
  options_page: 'src/options/options.html',
  background: {
    service_worker: 'src/background/background.ts',
    type: 'module'
  },
  permissions: [
    'storage',
    'tabs',
    'tabGroups',
    'activeTab',
    'scripting',
    'offscreen',
    'sidePanel',
    'commands',
    'tts',
    'sessions',
    'alarms',
    'notifications',
    'downloads',
    'clipboardWrite'
  ],
  host_permissions: [
    '<all_urls>',
    'http://localhost:3001/*',
    'https://*.vercel.app/*'
  ],
  commands: {
    '_execute_action': {
      suggested_key: {
        default: 'Ctrl+Shift+Y',
        mac: 'Command+Shift+Y'
      },
      description: 'Open UrPilot Side Panel'
    },
    'toggle-listening': {
      suggested_key: {
        default: 'Ctrl+Shift+L',
        mac: 'Command+Shift+L'
      },
      description: 'Toggle UrPilot voice listening'
    }
  }
});
