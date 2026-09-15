import React from "react";
import { Composition } from "remotion";
import { TopUpDemo } from "./TopUpDemo";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TopUpDemo"
      component={TopUpDemo}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
