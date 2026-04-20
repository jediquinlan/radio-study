import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { YStack } from "tamagui";
import { ScreenTitle, Subtitle, colors, APP_NAME } from "@radio-lingo/ui";
import { WebCharacter } from "./WebCharacter";
export function Confirmed() {
    return (_jsx(YStack, { flex: 1, justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: colors.white, children: _jsxs(YStack, { gap: 12, maxWidth: 360, width: "100%", padding: 24, alignItems: "center", children: [_jsx(WebCharacter, { width: 140, height: 168, mood: "happy" }), _jsx(ScreenTitle, { children: "You're Confirmed!" }), _jsxs(Subtitle, { children: ["Your email has been verified. Open the ", APP_NAME, " app on your phone to start studying."] })] }) }));
}
