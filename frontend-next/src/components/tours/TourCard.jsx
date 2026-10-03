import { Link } from "@/lib/router";
import { Clock3, Heart, MapPin, ShoppingBag, Star, Users } from "lucide-react";
import { useState } from "react";

import { useToast } from "../../context/ToastContext";
import {
  addToCart,
  isInCart,
  isInWishlist,
  toggleWishlist,
} from "../../features/commerce/storage";
import {
  getTourPlaceName,
  getTourPlanLabel,
} from "../tour-details/tourDetailsData";
import { formatCurrencyAmount } from "../../utils/currency";

const DEFAULT_TOUR_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

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

const TourCard = ({ tour = {} }) => {
  const toast = useToast();
  const [, setWishlistVersion] = useState(0);

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

  const placeName = getTourPlaceName(tour) || "Pakistan";
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
    <article className="luxe-tour-card flex h-full min-w-0 flex-col overflow-hidden border bg-white">
      <div className="luxe-tour-cover relative shrink-0 overflow-hidden">
        <Link to={slugOrId ? `/tours/${slugOrId}` : "/tours"} aria-label={`View ${displayTitle}`} className="block h-full">
          <img src={imageSrc} alt={displayTitle} loading="lazy" decoding="async" className="h-full w-full object-cover" onError={(event) => { if (!event.currentTarget.dataset.fallbackApplied) { event.currentTarget.dataset.fallbackApplied = "true"; event.currentTarget.src = "/gb.jpg"; } }} />
        </Link>
        {hasDiscount && <span className="luxe-tour-discount absolute left-3 top-3 rounded-md bg-[var(--c-brand)] px-2.5 py-1.5 text-[11px] font-semibold text-white">{discountPercent}% off</span>}

      </div>
      <div className="luxe-tour-details flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--c-muted)]">
          <span className="flex min-w-0 items-center gap-1.5"><MapPin size={13} className="shrink-0" /><span className="truncate">{placeName}</span></span>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={handleWishlist} aria-pressed={savedInWishlist} aria-label={savedInWishlist ? `Remove ${displayTitle} from wishlist` : `Save ${displayTitle}`} className="grid h-7 w-7 place-items-center rounded-md bg-[var(--c-hover)] text-[var(--c-brand)] transition-colors hover:bg-[var(--c-brand)] hover:text-white">
              <Heart size={13} className={savedInWishlist ? "fill-current" : ""} />
            </button>
            <button type="button" onClick={handleCart} disabled={!isAvailable} aria-label={`Add ${displayTitle} to cart`} title={isAvailable ? "Add to cart" : "Tour is full"} className="grid h-7 w-7 place-items-center rounded-md bg-[var(--c-hover)] text-[var(--c-brand)] transition-colors hover:bg-[var(--c-brand)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
              <ShoppingBag size={13} />
            </button>
          </div>
        </div>
        <h3 className="luxe-tour-title line-clamp-2 text-[var(--c-navy)]"><Link to={slugOrId ? `/tours/${slugOrId}` : "/tours"}>{displayTitle}</Link></h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--c-muted)]">
          <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{displayDuration}</span>
          <span className="inline-flex items-center gap-1.5"><Users size={13} />{seatLabel}</span>
          <span className="inline-flex items-center gap-1"><Star size={11} className="fill-[var(--c-brand)] text-[var(--c-brand)]" />{ratingText}</span>
          {!isAvailable && <span className="text-red-700">Fully booked</span>}
        </div>
        <div className="luxe-tour-footer mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-[var(--c-border)] pt-2.5">
          <div className="min-w-0">
            <p className="text-[10px] leading-4 text-[var(--c-muted)]">From {hasDiscount && <span className="ml-1 line-through">{formatCurrencyAmount(originalPrice, currency)}</span>}</p>
            <p className="luxe-tour-price break-words">{storedPrice > 0 ? formatCurrencyAmount(hasDiscount ? finalPrice : storedPrice, currency) : "Contact for price"}</p>
            <p className="text-[10px] leading-4 text-[var(--c-muted)]">/ person</p>
          </div>
          <Link to={slugOrId ? `/tours/${slugOrId}` : "/tours"} className="ql-btn-primary inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg px-2.5 text-[11px] font-medium">View tour</Link>
        </div>
      </div>
    </article>
  );
};

export default TourCard;
