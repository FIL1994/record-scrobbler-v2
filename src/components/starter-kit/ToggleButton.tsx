import {
  ToggleButton as RACToggleButton,
  type ToggleButtonProps,
  composeRenderProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { focusRing } from "./utils";

let styles = tv({
  extend: focusRing,
  base: "px-5 py-2 [&:has(svg:only-child)]:px-2 text-sm text-center transition rounded-lg border border-black/10 forced-colors:border-[ButtonBorder] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] cursor-default forced-color-adjust-none",
  variants: {
    isSelected: {
      false:
        "bg-gray-100 hover:bg-gray-200 pressed:bg-gray-300 text-gray-800 forced-colors:bg-[ButtonFace]! forced-colors:text-[ButtonText]!",
      true: "bg-gray-700 hover:bg-gray-800 pressed:bg-gray-900 text-white forced-colors:bg-[Highlight]! forced-colors:text-[HighlightText]!",
    },
    isDisabled: {
      true: "bg-gray-100 forced-colors:bg-[ButtonFace]! text-gray-300 forced-colors:text-[GrayText]! border-black/5 forced-colors:border-[GrayText]",
    },
  },
});

export function ToggleButton(props: ToggleButtonProps) {
  return (
    <RACToggleButton
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        styles({ ...renderProps, className })
      )}
    />
  );
}
