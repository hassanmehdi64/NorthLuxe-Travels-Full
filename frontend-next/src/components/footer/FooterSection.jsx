import FooterLink from "./FooterLink";

const FooterSection = ({ title, links, children, className = "" }) => {
  return (
    <div className={`space-y-3 text-left ${className}`}>
      {title && (
        <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--footer-accent)]">
          {title}
        </h4>
      )}

      {links && (
        <nav className="flex flex-col items-center space-y-2 sm:items-start">
          {links.map((link, idx) => (
            <FooterLink key={idx} href={link.href}>
              {link.name}
            </FooterLink>
          ))}
        </nav>
      )}

      {children}
    </div>
  );
};

export default FooterSection;
