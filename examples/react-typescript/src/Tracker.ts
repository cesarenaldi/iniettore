export default interface Tracker {
  pageView(path: string): void
  event(category: string, action: string, label?: string, value?: number): void
}
