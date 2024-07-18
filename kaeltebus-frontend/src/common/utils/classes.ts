type ClassesDefinition = { [key: string]: boolean | (() => boolean) };

export const classes = (definition: ClassesDefinition) => {
  return Object.keys(definition).reduce((classes, currentClass) => {
    const curr = definition[currentClass];
    return (typeof curr === "function" && curr()) || !!curr
      ? `${classes.trim()} ${currentClass}`.trim()
      : classes;
  }, "");
};
