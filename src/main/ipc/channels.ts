export const IPC_CHANNELS = {
  // AI 相关
  AI_CHAT: 'ai:chat',
  AI_STREAM: 'ai:stream',
  AI_STREAM_CHUNK: 'ai:stream-chunk',
  AI_SET_API_KEY: 'ai:set-api-key',
  AI_IS_CONFIGURED: 'ai:is-configured',
  AI_SET_PROVIDER: 'ai:set-provider',
  AI_GET_PROVIDERS: 'ai:get-providers',

  // 文件操作
  FILE_SELECT: 'file:select',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',

  // 配置
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',

  // 更新
  UPDATE_CHECK: 'update:check',
  UPDATE_DOWNLOAD: 'update:download',
  UPDATE_MESSAGE: 'update:message',
  APP_VERSION: 'app:version'
} as const
