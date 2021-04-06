import Tracker from './Tracker';

export default class DebugTracker implements Tracker {
  pageView(path: string): void {
    console.log('DebugTracker#pageView', path)
  }

  event(category: string, action: string, label?: string, value?: number): void {
    console.log('DebugTracker#event', { category, action, label, value })
  }
}
