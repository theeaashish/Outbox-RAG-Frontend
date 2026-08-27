import { config } from "./base.js";
import globals from "globals";

export default [
  ...config,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
