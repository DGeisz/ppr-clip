export const clipOuterHeight = 0.4;
export const clipWireRadius = 0.02 * clipOuterHeight;

export const clipInnerHeight = (2 * clipOuterHeight) / 3;

export const widthDelta = 3 * clipWireRadius;

export const clipOuterWidth = 0.4 * clipOuterHeight;
export const clipMiddleWidth = clipOuterWidth - widthDelta;
export const clipInnerWidth = clipMiddleWidth - widthDelta;
export const intermediateWireHeight =
    clipInnerHeight + (clipOuterHeight - clipInnerHeight) / 2;
