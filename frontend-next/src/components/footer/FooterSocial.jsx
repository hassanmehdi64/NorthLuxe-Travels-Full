import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

const icons = {
  facebook: <Facebook size={14} />,
  instagram: <Instagram size={14} />,
  twitter: <Twitter size={14} />,
  linkedin: <Linkedin size={14} />,
};

const FooterSocial = ({ href, icon, name }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ql-btn-icon h-8 w-8 rounded-lg text-[var(--footer-muted)] shadow-none hover:shadow-none [--btn-icon-bg:rgba(255,255,255,0.04)] [--btn-icon-border:rgba(255,255,255,0.12)] [--btn-icon-text:var(--footer-muted)] [--btn-icon-hover-bg:rgba(255,255,255,0.08)] [--btn-icon-hover-border:rgba(var(--c-brand-rgb),0.38)] [--btn-icon-hover-text:var(--footer-accent)]"
      aria-label={name}
    >
      <span>{icons[icon]}</span>
    </a>
  );
};

export default FooterSocial;
