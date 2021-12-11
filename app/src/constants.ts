export const clipOuterHeight = 0.4;
// export const clipWireRadius = 0.02 * clipOuterHeight; // 0.015 * clipOuterHeight;
export const clipWireRadius = 0.02 * clipOuterHeight; // 0.015 * clipOuterHeight;

export const clipInnerHeight = (2 * clipOuterHeight) / 3;

export const widthDelta = 3 * clipWireRadius;

export const clipOuterWidth = 0.4 * clipOuterHeight;
// const clipOuterWidth = 100;
export const clipMiddleWidth = clipOuterWidth - widthDelta;
export const clipInnerWidth = clipMiddleWidth - widthDelta;
export const intermediateWireHeight =
    clipInnerHeight + (clipOuterHeight - clipInnerHeight) / 2;

export const startingBlockRadius = clipOuterHeight / 2;
export const startingBlockHeight = clipOuterHeight;
export const startingBlockWidth = clipOuterHeight * 2;
