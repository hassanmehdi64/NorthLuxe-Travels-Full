import { Link } from "@/lib/router";
import { ArrowRight, Clock3, Heart, MapPin, ShoppingBag, Star, Users } from "lucide-react";
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
import { getTourPricing } from "../../lib/pricing";
import { getTourRating } from "../../lib/reviews";
import SafeImage from "../common/SafeImage";

const TourCard = ({ tour = {} }) => {
  const toast = useToast();
  const [, setWishlistVersion] = useState(0);

  const {
    id,
    slug,
    title,
    image,
    availableSeats,
    durationDays,
    durationLabel,
  } = tour;

  const tourId = id || slug;
  const slugOrId = slug || id;

  const displayTitle = title || "Scenic Escape";

  const placeName = getTourPlaceName(tour) || "Pakistan";
  const seatLabel = getTourPlanLabel(tour) || "Flexible plan";

  const totalDays = Number(durationDays || 0);
  const displayDuration =
    durationLabel || (totalDays > 0 ? `${totalDays} Days` : "Flexible");

  const seatCount = Number(availableSeats);
  const hasSeatInfo = Number.isFinite(seatCount);
  const isAvailable = !hasSeatInfo || seatCount > 0;

  const pricing = getTourPricing(tour);
  const rating = getTourRating(tour);

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

  const href = slugOrId ? `/tours/${slugOrId}` : "/tours";

  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      <div className="media media-zoom relative aspect-[16/10]">
        <Link to={href} aria-label={`View ${displayTitle}`} className="absolute inset-0">
          <SafeImage src={image} alt={displayTitle} label="Photo coming soon" loading="lazy" decoding="async" />
        </Link>
        {pricing.hasDiscount && <span className="badge badge-brand absolute left-3 top-3">{pricing.discountPercent}% off</span>}
        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={savedInWishlist}
          aria-label={savedInWishlist ? `Remove ${displayTitle} from wishlist` : `Save ${displayTitle}`}
          className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-card transition-colors hover:text-brand-700 ${savedInWishlist ? "text-brand" : "text-navy-900"}`}
        >
          <Heart size={15} className={savedInWishlist ? "fill-current" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-subtle">
          <MapPin size={13} className="shrink-0 text-brand" aria-hidden="true" />
          <span className="truncate" title={placeName}>{placeName}</span>
        </p>
        <h3 className="heading-3 mt-1.5 line-clamp-2">
          <Link to={href} className="hover:text-brand-700">{displayTitle}</Link>
        </h3>
        <div className="mb-3 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
          <span className="inline-flex items-center gap-1"><Clock3 size={13} aria-hidden="true" />{displayDuration}</span>
          <span className="inline-flex items-center gap-1"><Users size={13} aria-hidden="true" />{seatLabel.replace(/ plan$/, "")}</span>
          {rating && (
            <span className="inline-flex items-center gap-1" aria-label={`Rated ${rating.value} out of 5 from ${rating.count} reviews`}>
              <Star size={13} className="fill-sand text-sand" aria-hidden="true" />
              <strong className="font-semibold text-navy-900">{rating.value.toFixed(1)}</strong>({rating.count})
            </span>
          )}
        </div>
        {!isAvailable && <p className="mb-3 text-xs font-medium text-red-700">Fully booked</p>}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0 leading-tight">
            {pricing.hasPrice ? (
              <>
                <p className="text-[11px] text-subtle">
                  {pricing.hasDiscount ? <del>{pricing.formattedBase}</del> : "From"}
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[17px] font-bold text-navy-900">
                  {pricing.formattedFinal}
                  <span className="ml-1 text-xs font-normal text-subtle">{pricing.unitLabel}</span>
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-navy-900">Contact for price</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleCart}
              disabled={!isAvailable}
              aria-label={`Add ${displayTitle} to cart`}
              title={isAvailable ? "Add to cart" : "Tour is full"}
              className="btn-icon btn-icon-sm"
            >
              <ShoppingBag size={15} />
            </button>
            <Link to={href} className="btn btn-primary btn-sm">
              View<ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TourCard;
