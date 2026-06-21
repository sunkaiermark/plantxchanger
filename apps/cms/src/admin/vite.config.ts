export default (config: Record<string, any>) => ({
  ...config,
  build: {
    ...(config.build ?? {}),
    minify: false,
    target: "esnext",
  },
});
