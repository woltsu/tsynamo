export const preventAwait = (c: Function, message: string): void => {
  Object.defineProperties(c.prototype, {
    then: {
      enumerable: false,
      value: () => {
        throw new Error(message);
      },
    },
  });
};
