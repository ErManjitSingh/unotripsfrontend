/**
 * Site-wide content width — matches Navbar logo → sign-up row (`Navbar` ease variant).
 * Keep padding in sync with the header inner row.
 */
export const PAGE_MAX_WIDTH_CLASS = "max-w-[1320px]";

export const PAGE_MARGIN_X_CLASS = "px-3 sm:px-4 lg:px-6";

/** Centered page shell: same width + horizontal inset as the header. */
export const PAGE_CONTAINER_CLASS = `mx-auto w-full ${PAGE_MAX_WIDTH_CLASS} ${PAGE_MARGIN_X_CLASS}`;
