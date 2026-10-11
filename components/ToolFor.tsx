import type { ToolItem } from "@/lib/catalog";
import { BeeTool, BoxTool, JumbleTool, UnscrambleTool, WordleTool } from "./Tools";

export default function ToolFor({ tool }: { tool: ToolItem }) {
  switch (tool.kind) {
    case "unscramble": return <UnscrambleTool mode="unscramble" />;
    case "anagram": return <UnscrambleTool mode="anagram" initial="listen" />;
    case "scrabble": return <UnscrambleTool mode="scrabble" />;
    case "wwf": return <UnscrambleTool mode="wwf" />;
    case "jumble": return <JumbleTool />;
    case "wordle": return <WordleTool />;
    case "bee": return <BeeTool />;
    case "box": return <BoxTool />;
  }
}
