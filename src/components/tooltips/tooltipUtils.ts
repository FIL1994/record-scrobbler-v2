export type { TooltipTriggerState } from "react-stately";
export { mergeProps, useTooltip } from "react-aria";

export const tooltipStyle = {
  position: "absolute",
  left: "-8px",
  top: "100%",
  maxWidth: 150,
  marginTop: "6px",
  backgroundColor: "white",
  border: "1px solid gray",
  zIndex: 1,
} as const satisfies React.CSSProperties;
