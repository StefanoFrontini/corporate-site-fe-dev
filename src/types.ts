export enum PAGOPA_MENU {
  RESERVED_MENU = 'ReservedMenu',
  MAIN_MENU = 'MainMenu',
  FOOTER_TOP = 'FooterTop',
  FOOTER_BOTTOM = 'FooterBottom',
}

export type PagoPABlockConfig = Record<'Standard' | 'Wide', string>;

// Dispatched on a <nav> element when focus leaves it entirely, so every
// MenuNavigation instance under that nav can close its own open submenu —
// otherwise only the item currently being left closes, leaving any other
// previously-opened sibling submenu stuck open (each item's own blur only
// fires once, when focus first passes through it).
export const MENU_CLOSE_ALL_SUBMENUS_EVENT = 'menu:close-all-submenus';
