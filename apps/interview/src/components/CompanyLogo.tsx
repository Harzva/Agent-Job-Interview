interface CompanyLogoProps {
  name: string;
  logo: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CompanyLogo({ name, logo, logoUrl, size = 'md', className = '' }: CompanyLogoProps) {
  const sizeClass = `company-logo-frame--${size}`;
  const classes = ['company-logo-frame', sizeClass, className].filter(Boolean).join(' ');

  if (logoUrl) {
    return (
      <span className={classes}>
        <img src={logoUrl} alt={`${name} 官方 logo`} loading="lazy" />
      </span>
    );
  }

  return (
    <span className={`${classes} company-logo-frame--fallback`} aria-label={`${name} logo`}>
      {logo}
    </span>
  );
}
