## ✨ CSS Style Guide (*Tailwind CSS*)

- **Typography & Fonts**
    - **Primary Font**: `font-minecraftia` (`Minecraftia`) - Used for all UI text.
    - **Title Font**: `font-minecrafter` (`Minecrafter`) - Used for special headings.
    - **Text Shadow**: `text-shadow-mc` - Custom Minecraft-style text shadow.

- **Color Palette**

    - **Text Colors**
        - **Primary**: `white` - Default global text color
        - **Secondary**: `neutral-200` - Secondary information and labels
        - **Tertiary**: `neutral-400` - Placeholders, disabled text, less important content, loading screen footer text and component shadows (*`<Header />` & `<Button />`*)

    - **Background Colors**
        - **Primary**: `neutral-950` - Global application background
        - **Secondary**: `neutral-900` - Cards, tooltips, drawers, and elevated surfaces
        - **Tertiary**: `neutral-800` - Input fields, secondary containers, and used in `text-shadow-mc` class
        - **Loading States**: `neutral-700` - Loading states, skeleton screens, and placeholders

    - **Interactive Elements**
        - **Minecraft Base**: `neutral-500` - Header background, Button background, Drawer handle, and Scrollbar normal state
        - **Minecraft Active**: `neutral-600` - Hover and active states for elements with `neutral-500` background, plus component shadows (*`<Header />` & `<Button />`*)

    - **Borders & Outlines**
        - **Default**: `neutral-700` - Input borders and card outlines
        - **Accent**: `neutral-500` - Focused and hovered states

    - **Misc Colors**
        - **Data Highlight**: `<color>-400` - Important data display (prices, profile information)
        - **Error Page Background**: `green-800` - Error page background color
        - **Loading Progress**: `green-600` to `green-400` - Loading screen progress bar gradient

- **Layout & Spacing**
    - **Base padding**: `p-base` class
        - For secondary containers like in `/profile` and `/store`, `p-2` is used for the outer padding and then `p-base` is used for inner content.
    - **Gap consistency**: `gap-2` (small), `gap-5` (large)
    - **Duration:** `duration-200` for all transitions, `duration-300` only used for loading screens.

- **Z-Index Layer System**
    - **Base Layer (`z-0`)**: Layout components and default content.
    - **UI Components (`z-50`)**: Tooltips, popovers, and dropdown menus.
    - **Loading Screen (`z-[2000]`)**: Initial loading screen which appears over the entire app.
    - **Toast Notifications (`z-[1000]`)**: Toast messages using inline styles.
    - **Select (`z-[1000]`)**: Select dropdowns and menus.
    - **Mobile Drawers (*default set to `z-[900]`*)**: Custom `zIndex` prop values for layered mobile interfaces.
    - **Panorama (`-z-100`)**: Used for panorama background in the app.

> [!IMPORTANT]
> We strongly recommend to use components from the `src/lib/components` directory instead of defining styles manually.
>
> For specific use cases where we need unstyled elements, you may define your own styles.

