import { css } from "styled-components";
import theme from "./theme";

type CssParams = Parameters<typeof css>;
type BreakpointKey = keyof typeof theme.breakpoints;
type ResponsiveFunction = (...args: CssParams) => ReturnType<typeof css>;

const keys = Object.keys(theme.breakpoints) as Array<BreakpointKey>;

const MaxWidth = keys.reduce((accumulator, label) => {
  accumulator[label] = (...args: CssParams) => {
    return css`
      @media only screen and (max-width: ${theme.breakpoints[label]}px) {
        ${css(...args)};
      }
    `;
  };
  return accumulator;
}, {} as Record<BreakpointKey, ResponsiveFunction>);

export default MaxWidth;

export const MinWidth = keys.reduce((accumulator, label) => {
  accumulator[label] = (...args: CssParams) => {
    return css`
      @media only screen and (min-width: ${theme.breakpoints[label]}px) {
        ${css(...args)};
      }
    `;
  };
  return accumulator;
}, {} as Record<BreakpointKey, ResponsiveFunction>);
