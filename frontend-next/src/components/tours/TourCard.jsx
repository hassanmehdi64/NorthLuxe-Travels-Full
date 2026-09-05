import { Link } from "@/lib/router";
import { Clock3, Heart, MapPin, ShoppingBag, Star, Users } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { useToast } from "../../context/ToastContext";
import {
  addToCart,
  isInCart,
  isInWishlist,
  toggleWishlist,
} from "../../features/commerce/storage";
import {
  buildDisplayItinerary,
  getTourPlaceName,
  getTourPlacesLabel,
  getTourPlanLabel,
} from "../tour-details/tourDetailsData";
import { formatCurrencyAmount } from "../../utils/currency";

const MotionArticle = motion.article;

const DEFAULT_TOUR_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

const cardReveal = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.72,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const parsePrice = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const cleaned = String(value || "").replace(/[^\d.-]+/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
};

const getDiscountPercent = (tour) => {
  const directPercent = parsePrice(
    tour?.discountPercent ?? tour?.discount ?? tour?.salePercent ?? 0,
  );

  if (directPercent > 0) {
    return Math.round(directPercent);
  }

  const originalPrice = parsePrice(tour?.originalPrice);
  const currentPrice = parsePrice(tour?.price);

  if (originalPrice > currentPrice && currentPrice > 0) {
    const percentOff = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100,
    );

    return percentOff > 0 ? percentOff : 0;
  }

  return 0;
};

const TourCard = ({ tour = {}, index = 0 }) => {
  const toast = useToast();
  const [wishlistVersion, setWishlistVersion] = useState(0);

  const {
    id,
    slug,
    title,
    image,
    currency,
    rating,
    price,
    availableSeats,
    durationDays,
    durationLabel,
  } = tour;

  const tourId = id || slug;
  const slugOrId = slug || id;

  const displayTitle = title || "Scenic Escape";
  const imageSrc = image || DEFAULT_TOUR_IMAGE;

  const itinerary = buildDisplayItinerary(tour);

  const placeName = getTourPlaceName(tour) || "Pakistan";
  const placesLabel = getTourPlacesLabel(tour, itinerary) || "Multiple places";
  const seatLabel = getTourPlanLabel(tour) || "Flexible plan";

  const totalDays = Number(durationDays || 0);
  const displayDuration =
    durationLabel || (totalDays > 0 ? `${totalDays} Days` : "Flexible");

  const seatCount = Number(availableSeats);
  const hasSeatInfo = Number.isFinite(seatCount);
  const isAvailable = !hasSeatInfo || seatCount > 0;

  const ratingNumber = Number(rating);
  const ratingText = Number.isFinite(ratingNumber)
    ? ratingNumber.toFixed(1)
    : "New";

  const cardDelay = Math.min(index * 0.08, 0.36);
  const discountPercent = getDiscountPercent(tour);
  const storedPrice = parsePrice(price);
  const explicitOriginalPrice = parsePrice(tour?.originalPrice);
  const hasExplicitSalePrice = explicitOriginalPrice > storedPrice && storedPrice > 0;
  const originalPrice = hasExplicitSalePrice ? explicitOriginalPrice : storedPrice;
  const finalPrice = hasExplicitSalePrice
    ? storedPrice
    : Number((storedPrice * (1 - discountPercent / 100)).toFixed(2));
  const hasDiscount = discountPercent > 0 && originalPrice > finalPrice;

  const savedInWishlist = tourId ? isInWishlist(tourId) : false;

  const handleWishlist = () => {
    if (!tourId) {
      toast.info("Tour unavailable", "This tour cannot be saved right now.");
      return;
    }

    const added = toggleWishlist(tour);
    setWishlistVersion((value) => value + 1);

    if (added) {
      toast.success("Added to wishlist", `${displayTitle} is saved for later.`);
    } else {
      toast.info("Removed from wishlist", `${displayTitle} was removed.`);
    }
  };

  const handleCart = () => {
    if (!tourId) {
      toast.info("Tour unavailable", "This tour cannot be added right now.");
      return;
    }

    if (!isAvailable) {
      toast.info("Tour is full", `${displayTitle} has no seats available.`);
      return;
    }

    if (isInCart(tourId)) {
      toast.info("Already in cart", `${displayTitle} is already added.`);
      return;
    }

    addToCart(tour);
    toast.success("Added to cart", `${displayTitle} is ready for checkout.`);
  };

  return (
    <MotionArticle
      variants={cardReveal}
      custom={cardDelay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{
        y: -6,
        transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
      }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(6,27,58,0.07)] transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:border-[rgba(var(--c-brand-rgb),0.55)] hover:shadow-[0_22px_44px_rgba(6,27,58,0.14)]">
      <div className="relative h-44 overflow-hidden sm:h-48">
        <motion.img
          src={imageSrc}
          alt={displayTitle}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.055] motion-reduce:transform-none"
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(var(--c-brand-rgb),0.14),transparent_48%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {hasDiscount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: cardDelay + 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            viewport={{ once: true, amount: 0.6 }}
            className="absolute right-3 top-3 z-[2]">
            <div className="rounded-full border border-white/70 bg-[var(--c-brand)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_8px_20px_rgba(var(--c-brand-rgb),0.3)]">
              {discountPercent}% OFF
            </div>
          </motion.div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#061b3a]/75 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-[#061b3a]/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            <Star
              size={10}
              className="fill-[var(--c-brand)] stroke-[var(--c-brand)]"
            />
            {ratingText}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-[#061b3a]/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
            <Clock3 size={11} />
            {displayDuration}
          </div>

          {!isAvailable && (
            <div className="rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
              Full
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2.5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--c-brand)]">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{placeName}</span>
          </span>
        </div>

        <h3 className="min-h-[40px] text-[15px] font-bold leading-[1.35] text-[#061b3a] line-clamp-2 transition-colors duration-300 group-hover:text-[var(--c-brand)] sm:text-base">
          {displayTitle}
        </h3>

        <div className="mt-2 flex items-center gap-4 text-[10px] font-medium text-slate-500">
          <div className="flex min-w-0 items-center gap-1.5">
            <Users size={13} className="shrink-0 text-[#061b3a]/55" />
            <span className="truncate">{seatLabel}</span>
          </div>

          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-[#061b3a]/55" />
            <span className="truncate">{placesLabel}</span>
          </div>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-2.5">
          <div className="mb-2.5 flex min-h-6 items-center gap-1.5 overflow-hidden whitespace-nowrap">
            <span className="shrink-0 text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
              From
            </span>
              {storedPrice > 0 ? (
                <div className="flex min-w-0 items-baseline gap-1.5">
                  {hasDiscount ? (
                    <span className="shrink-0 text-[9px] font-medium text-slate-400 line-through decoration-slate-400">
                      {formatCurrencyAmount(originalPrice, currency)}
                    </span>
                  ) : null}
                  <span className="truncate text-[13px] font-extrabold tracking-tight text-[#061b3a] transition-colors duration-300 group-hover:text-[var(--c-brand-dark)]">
                    {formatCurrencyAmount(hasDiscount ? finalPrice : storedPrice, currency)}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-[#061b3a]">Contact for price</span>
              )}
            <span className="ml-auto shrink-0 text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              / person
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleWishlist}
            className="ql-btn-icon h-10 w-10 shrink-0 rounded-[10px] transition-transform duration-300 hover:-translate-y-0.5"
            data-active={savedInWishlist ? "true" : undefined}
            aria-label={
              savedInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
            title={
              savedInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }>
            <Heart
              size={14}
              className={savedInWishlist ? "fill-current" : ""}
            />
          </button>

          <button
            type="button"
            onClick={handleCart}
            disabled={!isAvailable}
            className="ql-btn-icon h-10 w-10 shrink-0 rounded-[10px] transition-transform duration-300 hover:-translate-y-0.5"
            aria-label="Add to cart"
            title={isAvailable ? "Add to cart" : "Tour is full"}>
            <ShoppingBag size={14} />
          </button>

          <Link
            to={slugOrId ? `/tours/${slugOrId}` : "/tours"}
            className="ql-btn-primary min-h-10 flex-1 rounded-[10px] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] active:scale-95 sm:text-[11px]">
            Book Now
          </Link>
          </div>
        </div>
      </div>
    </MotionArticle>
  );
};

export default TourCard;
