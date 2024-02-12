import * as tokens from './kds/dist/tokens/tokens-es6';


/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.tsx|ts|js|jsx"],
  theme: {
    fontFamily: {
      heading: tokens.FONT_FAMILY_SANS_SERIF_ALT,
      body: tokens.FONT_FAMILY_SANS_SERIF,
    },
    letterSpacing: {
      sm: tokens.LETTER_SPACING_SM,
      md: tokens.LETTER_SPACING_MD,
      lg: tokens.LETTER_SPACING_LG,
    },
    lineHeight: {
      reset: tokens.LINE_HEIGHT_RESET,
      sm: tokens.LINE_HEIGHT_SM,
      md: tokens.LINE_HEIGHT_MD,
      lg: tokens.BOX_SHADOW_LARGE,
    },
    extend: {
      aria: {
        current: 'current="page"',
      },
      colors: {
        'kela-blue': {
          60: '#2a69c5',
          70: '#1652a6',
          80: '#003580',
          90: '#00265f',
          100: '#00143b'
        },
        'kela-yellow': {
          10: '#fff4dc',
          20: '#fedd9f',
          30: '#f8b516',
          40: '#cf9710',
          50: '#a7790b',
          60: '#8b6407',
          70: '#6f4f04',
          80: '#4c3502',
          90: '#372601',
          100: '#201400'
        },
        'kela-gray': {
          10: '#f5f5f5',
          20: '#e1e1e1',
          30: '#c1c1c1',
          40: '#a0a0a0',
          50: '#818181',
          60: '#6b6b6b',
          70: '#555555',
          80: '#393939',
          90: '#292929',
          100: '#171717'
        },
        'success-green': {
          40: '#44b56c',
          50: '#09953b',
          60: '#067c30',
          80: '#024316'
        }
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
};
