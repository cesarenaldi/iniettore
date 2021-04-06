import { singleton } from 'iniettore'
import DebugTracker from './DebugTracker'

export function describe() {
  return {
    tracker: singleton(() => new DebugTracker())
  }
}
