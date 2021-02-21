export default function (condition: boolean, message: string): void {
  if (condition) {
    console?.warn(message)
  }
}
