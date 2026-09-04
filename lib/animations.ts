/**
 * Split a string into its words (whitespace tokens dropped) for the
 * word-by-word reveal.
 */
export const words = (text: string) =>
  text.split(/(\s+)/).filter((w) => w.trim().length);
