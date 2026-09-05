"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { forwardRef, useCallback, useEffect, useMemo } from "react";

const STATE_PREFIX = "north-luxe:navigation-state:";

const normalizeTarget = (target) => {
  if (typeof target === "string") return target;
  if (!target) return "/";
  return `${target.pathname || ""}${target.search || ""}${target.hash || ""}` || "/";
};

const stateKey = (target) => `${STATE_PREFIX}${normalizeTarget(target).split("#")[0]}`;

const saveNavigationState = (target, state) => {
  if (typeof window === "undefined" || state === undefined) return;
  try {
    sessionStorage.setItem(stateKey(target), JSON.stringify(state));
  } catch {
    // Navigation must continue when storage is unavailable or full.
  }
};

const readNavigationState = (target) => {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(stateKey(target));
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const Link = forwardRef(function Link(
  { to, state, replace = false, onClick, children, ...props },
  ref,
) {
  const href = normalizeTarget(to);
  return (
    <NextLink
      {...props}
      ref={ref}
      href={href}
      replace={replace}
      onClick={(event) => {
        saveNavigationState(href, state);
        onClick?.(event);
      }}
    >
      {children}
    </NextLink>
  );
});

export const NavLink = forwardRef(function NavLink(
  { to, end = false, className, style, children, ...props },
  ref,
) {
  const pathname = usePathname();
  const href = normalizeTarget(to);
  const targetPath = href.split(/[?#]/)[0] || "/";
  const isActive = end
    ? pathname === targetPath
    : pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  const status = { isActive, isPending: false };
  return (
    <Link
      {...props}
      ref={ref}
      to={to}
      className={typeof className === "function" ? className(status) : className}
      style={typeof style === "function" ? style(status) : style}
    >
      {typeof children === "function" ? children(status) : children}
    </Link>
  );
});

export const useNavigate = () => {
  const router = useRouter();
  return useCallback(
    (to, options = {}) => {
      if (typeof to === "number") {
        if (to < 0) router.back();
        else if (to > 0) router.forward();
        return;
      }
      const href = normalizeTarget(to);
      saveNavigationState(href, options.state);
      if (options.replace) router.replace(href, { scroll: options.scroll });
      else router.push(href, { scroll: options.scroll });
    },
    [router],
  );
};

export const useLocation = () => {
  const pathname = usePathname();
  const params = useNextSearchParams();
  const search = params.toString();
  const target = `${pathname}${search ? `?${search}` : ""}`;
  return useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : "",
      hash: typeof window === "undefined" ? "" : window.location.hash,
      state: readNavigationState(target),
      key: target,
    }),
    [pathname, search, target],
  );
};

export const useParams = () => useNextParams();

export const useSearchParams = () => {
  const current = useNextSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const value = useMemo(() => new URLSearchParams(current.toString()), [current]);
  const setValue = useCallback(
    (nextValue, options = {}) => {
      const next =
        typeof nextValue === "function"
          ? nextValue(new URLSearchParams(current.toString()))
          : nextValue;
      const query = new URLSearchParams(next).toString();
      const href = query ? `${pathname}?${query}` : pathname;
      if (options.replace) router.replace(href, { scroll: options.scroll });
      else router.push(href, { scroll: options.scroll });
    },
    [current, pathname, router],
  );
  return [value, setValue];
};

export const Navigate = ({ to, replace, state }) => {
  const navigate = useNavigate();
  useEffect(() => navigate(to, { replace, state }), [navigate, replace, state, to]);
  return null;
};
