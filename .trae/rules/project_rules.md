PILL BUTTON RULE:
    - The label container is a pill whose size is auto-calculated from its text content with exactly 2 units of padding on all sides, and it must resize dynamically when the text size or content changes.
    - The parent pill must have 1 unit padding and size itself based on its children using the same dynamic content-driven layout rules, without fixed widths or heights.
    - The active toggle state must be visually indicated by a red pill background.
    - State changes must use a smooth morphing animation using transition: transform, where the active pill slides to the newly selected option, interpolating position and size over time rather than switching instantly.
    - The animation must preserve continuity of shape, position, and dimensions so the transition appears as a single pill transforming between states.
