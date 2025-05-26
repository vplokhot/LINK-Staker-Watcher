export const wait = (ms: number) => {
  console.log("Waiting " + ms + " ms...");
  return new Promise((resolve) => setTimeout(resolve, ms));
};
