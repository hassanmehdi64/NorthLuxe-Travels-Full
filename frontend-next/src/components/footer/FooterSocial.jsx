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
      className="grid h-8 w-8 place-items-center rounded-control border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
      aria-label={name}
    >
      {icons[icon]}
    </a>
  );
};

export default FooterSocial;
