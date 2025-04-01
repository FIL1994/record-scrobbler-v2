import type { TooltipTriggerProps } from "react-aria";

export type { TooltipTriggerState } from "react-stately";
export { mergeProps, useTooltip } from "react-aria";

export const tooltipStyle = {
  position: "absolute",
  left: "-8px",
  top: "100%",
  marginTop: "4px",
  maxWidth: 150,
  backgroundColor: "white",
  border: "1px solid gray",
  zIndex: 1,
} as const satisfies React.CSSProperties;

export const defaultTooltipState = {
  delay: 380,
  closeDelay: 450,
} as const satisfies Partial<TooltipTriggerProps>;
