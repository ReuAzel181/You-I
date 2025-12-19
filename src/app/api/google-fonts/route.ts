import { NextResponse } from "next/server";

type GoogleFontsApiItem = {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
};

type GoogleFontsApiResponse = {
  items: GoogleFontsApiItem[];
};

export async function GET() {
  const blockedFamilies = new Set([
    "Bonbon",
    "Coral Pixels",
    "Eater",
    "Flavors",
    "Flow Block",
    "Flow Circular",
    "Flow Rounded",
    "Foldit",
    "Akronim",
    "Alumni Sans Collegiate One",
    "Are You Serious",
    "Astloch",
    "Babylonica",
    "Badeen Display",
    "Big Shoulders Inline",
    "Bitcount",
    "Bitcount Grid Double",
    "Bitcount Grid Double Ink",
    "Bitcount Grid Singled",
    "Bitcount Grid Single Ink",
    "Bitcount Ink",
    "Bitcount Prop Double",
    "Bitcount Prop Double Ink",
    "Bitcount Prop Single",
    "Bitcount Prop Single Ink",
    "Bitcount Single",
    "Bitcount Single Ink",
    "Black And White Picture",
    "Blaka Ink",
    "Bungee Spice",
    "Bungee Tint",
    "Butcherman",
    "Bytesized",
    "Charmonman",
    "Cherish",
    "Codystar",
    "Comforter",
    "Comforter Brush",
    "Danfo",
    "Diplomata",
    "Diplomata SC",
    "East Sea Dokdo",
    "Edu AU VIC WA NT Guides",
    "Fuggles",
    "Homemade Apple",
    "Honk",
    "Kablammo",
    "Kalnia Glaze",
    "Libre Barcode 128",
    "Libre Barcode 128 Text",
    "Libre Barcode 39",
    "Libre Barcode 39 Extended",
    "Libre Barcode 39 Extended Text",
    "Libre Barcode 39 Text",
    "Libre Barcode EAN13 Text",
    "Aguafina Script",
    "Allison",
    "Ballet",
    "Butterfly Kids",
    "Carattere",
  ]);

  const apiKey = process.env.GOOGLE_FONTS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Google Fonts API key is not configured.",
      },
      { status: 500 },
    );
  }

  const response = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=${apiKey}`,
    {
      next: { revalidate: 60 * 60 },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Failed to fetch Google Fonts metadata.",
      },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as GoogleFontsApiResponse;

  const allowedSubsets = new Set(["latin", "latin-ext"]);

  const fonts = payload.items
    .filter((item) => {
      if (blockedFamilies.has(item.family)) {
        return false;
      }

      const hasRegular = item.variants.includes("regular") || item.variants.includes("400");

      if (!hasRegular) {
        return false;
      }

      const hasLatinSubset = item.subsets.some((subset) => allowedSubsets.has(subset));

      return hasLatinSubset;
    })
    .map((item) => ({
      family: item.family,
      category: item.category as
        | "sans-serif"
        | "serif"
        | "monospace"
        | "display"
        | "handwriting"
        | "system-ui",
    }));

  return NextResponse.json({ fonts });
}
