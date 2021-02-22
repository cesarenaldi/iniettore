export default function lowPriorityWarning (condition: boolean, message: string): void {
  if (condition) {
    console?.warn(message)
  }
}
