export const defaultPageHeroImages = {
  tours: "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
  destinations: "/gb.jpg",
  activities: "/gb.jpg",
  services: "/gb.jpg",
  about: "https://www.travelertrails.com/wp-content/uploads/2022/11/Gilgit-Baltistan-4.jpg",
  blog: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
  contact: "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
};

export const defaultHomeHeroImages = [
  "/gb.jpg",
  "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
  "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
  "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
];

export const defaultLogoUrl = "/north-luxe-logo.png";
export const defaultBrandColor = "#20b77a";
export const defaultBrandHoverColor = "#159f6a";

export const defaultHeroColors = {
  overlay: "rgba(0, 0, 0, 0.45)",
  start: "rgba(15, 47, 87, 0.9)",
  middle: "rgba(15, 47, 87, 0.6)",
  end: "rgba(15, 47, 87, 0.2)",
  homeStart: "rgba(5, 8, 12, 0.24)",
  homeEnd: "rgba(5, 8, 12, 0.56)",
};

export const defaultNavbarColors = {
  main: "#061B3A",
  scrolled: "#061B3A",
  mobile: "#061B3A",
  text: "#ffffff",
  mutedText: "rgba(255, 255, 255, 0.9)",
  activeText: "#20b77a",
};

export const defaultFooterColors = {
  background: "#061B3A",
  text: "#ffffff",
  mutedText: "rgba(255, 255, 255, 0.78)",
  accentText: "#20b77a",
};

export const getPageHeroImage = (settings, page, fallback) =>
  settings?.pageHeroImages?.[page] || fallback || defaultPageHeroImages[page] || "";

export const getHomeHeroImages = (settings) => {
  const items = Array.isArray(settings?.homeHeroImages) ? settings.homeHeroImages.filter(Boolean) : [];
  const selectedItems = items.length ? items : defaultHomeHeroImages;

  return selectedItems.map((src) => {
    try {
      const url = new URL(src);
      if (["localhost", "127.0.0.1"].includes(url.hostname)) {
        return `${url.pathname}${url.search}`;
      }
    } catch {
      // Relative asset paths are already valid for the current Next.js origin.
    }

    return src;
  });
};

export const getHeroColors = (settings) => ({
  ...defaultHeroColors,
  ...(settings?.heroColors || {}),
});

export const getLogoUrl = (settings) => settings?.logoUrl || defaultLogoUrl;

export const getBrandColor = (settings) => settings?.primaryColor || defaultBrandColor;

export const getNavbarColors = (settings) => ({
  ...defaultNavbarColors,
  ...(settings?.navbarColors || {}),
});

export const getFooterColors = (settings) => ({
  ...defaultFooterColors,
  ...(settings?.footerColors || {}),
});
