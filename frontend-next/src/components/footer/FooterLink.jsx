import { Link } from "@/lib/router";

const FooterLink = ({ href, children }) => {
  return (
    <Link
      to={href}
      className="inline-flex text-xs font-medium text-[var(--footer-muted)] transition-colors duration-200 hover:text-[var(--footer-accent)]"
    >
      <span>{children}</span>
    </Link>
  );
};

export default FooterLink;
