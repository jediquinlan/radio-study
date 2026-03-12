# Radio Lingo

## UI Style Guide — Duolingo-inspired
All screens should follow this visual style consistently:

### Colors
- Primary green: `#58CC02` (shadow: `#46A302`)
- Accent blue: `#1CB0F6` (shadow: `#1899D6`)
- Background: `#FFFFFF`
- Input background: `#F7F7F7`
- Border/divider: `#E5E5E5`
- Text primary: `#333333`
- Text secondary/placeholder: `#777777`

### Buttons
- Rounded corners: `borderRadius: 16`
- Bold uppercase text: `fontWeight: '800'`, `letterSpacing: 1`
- Primary buttons: green fill with darker bottom border (4px) for 3D effect
- Secondary buttons: white fill with gray outline border
- Use `Pressable` with pressed state (`opacity: 0.85`, `translateY: 1`)

### Inputs
- Rounded corners: `borderRadius: 16`
- Gray background (`#F7F7F7`) with gray border (`#E5E5E5`, 2px)
- Padding: `16px` horizontal, `14px` vertical
- Font size: `16`

### Typography
- Screen titles: `fontSize: 28`, `fontWeight: '800'`
- Subtitles: `fontSize: 16`, color `#777`
- Section labels: `fontSize: 14`, `fontWeight: '700'`, uppercase, `letterSpacing: 1`

### Layout
- Use `KeyboardAvoidingView` on screens with inputs
- Content padding: `24px` sides, `80px` top
- Spacing between elements: `12px` gap
- Use `ScrollView` with `keyboardShouldPersistTaps="handled"`
