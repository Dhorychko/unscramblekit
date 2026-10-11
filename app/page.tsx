import { ToolPage, toolMetadata } from "@/components/Pages";
import { TOOL_BY_KEY } from "@/lib/catalog";

export const metadata = toolMetadata(TOOL_BY_KEY.home);
export default function Home() { return <ToolPage tool={TOOL_BY_KEY.home} />; }
