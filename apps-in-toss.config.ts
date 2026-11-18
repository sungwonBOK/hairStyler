import { defineConfig } from '@apps-in-toss/web-framework/config';
export default defineConfig({
  // Replace with the appName registered in the Apps in Toss console before upload.
  appName: 'hair-fit',
  permissions: [],
  webView: { bounces: false, pullToRefreshEnabled: false },
  webBundleDir: 'dist',
});
