interface LogoMarkIconProps {
  className?: string;
}

/**
 * The two squares that close the wordmark (`components/site/shared/logo.comp.tsx`,
 * `.logo__marks`): the top-left and bottom-right of a 2×2 board, in the same
 * proportion, on their own so the platform can use the brand's mark without
 * the word.
 */
export function LogoMarkIcon({ className }: LogoMarkIconProps) {
  return (
    <svg className={className} viewBox="0 0 44 44" width="44" height="44" fill="currentColor" aria-hidden="true">
      <path d="M0 0h22v22H0z" />
      <path d="M22 22h22v22H22z" />
    </svg>
  );
}
