// The production build excludes the fixture module. It cannot simulate approval.
export async function createDataAdapter() {
  if (__DEMO__) return (await import("./demo-data.js")).createDemoAdapter();
  return (await import("./live-data.js")).createLiveAdapter();
}
