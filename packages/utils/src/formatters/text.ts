export function replaceYouWithThey(text: string): string {
  return text
    .replace(/\bYou\b/g, "They")
    .replace(/\byou\b/g, "they")
    .replace(/\bYour\b/g, "Their")
    .replace(/\byour\b/g, "their")
    .replace(/\bYours\b/g, "Theirs")
    .replace(/\byours\b/g, "theirs")
    .replace(/\bYourself\b/g, "Themselves")
    .replace(/\byourself\b/g, "themselves");
}
