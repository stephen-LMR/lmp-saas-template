// The approved font pairings (tokens/theme-catalog.json "font_pairings"). Fonts are downloaded
// at build time and served from the app itself. Each pairing exposes two CSS variables,
// --font-<id>-heading and --font-<id>-body; design/theme.ts picks the pair for this merchant.
import { Inter, Lora, Manrope, Nunito, Nunito_Sans, Source_Sans_3 } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-nunito" });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-nunito-sans" });
const lora = Lora({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-lora" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-source-sans" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-manrope" });

export const fontVariables = [inter, nunito, nunitoSans, lora, sourceSans, manrope].map(f => f.variable).join(" ");
