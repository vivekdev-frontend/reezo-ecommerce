import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import handArt from "../assets/reezo-cart-hand-retract.webp";
import portalArt from "../assets/reezo-cart-portal.webp";
import "../reezo-cart-hand.css";

// One owner prevents overlapping animations from different product cards.
let activeOwner = null;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const center = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
const visible = r => r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth;
const preload = src => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

function useCartHand() {
  const run = useRef(null);
  const alive = useRef(true);
  const noticeTimer = useRef(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);
  const dismiss = () => { clearTimeout(noticeTimer.current); setSuccess(null); };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(noticeTimer.current);
      run.current?.stop();
    };
  }, []);

  async function start(source, product, add) {
    if (activeOwner || !alive.current) return;
    const owner = {};
    activeOwner = owner;
    let frame = 0, overlay, committed = false, stopped = false;
    const originalVisibility = source?.style.visibility;
    const restore = () => { if (source) source.style.visibility = originalVisibility; };
    function stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      overlay?.remove();
      restore();
      if (activeOwner === owner) activeOwner = null;
      if (run.current?.owner === owner) run.current = null;
      if (alive.current) setBusy(false);
    }
    function commit() {
      if (committed) return;
      committed = true;
      add(product);
    }
    function finish() {
      commit();
      stop();
      if (alive.current) {
        setSuccess(product);
        clearTimeout(noticeTimer.current);
        noticeTimer.current = setTimeout(() => setSuccess(null), 4000);
      }
    }
    run.current = { owner, stop };
    setBusy(true);
    dismiss();
    const cart = document.querySelector(".header .cart");
    if (!source || !cart || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish(); return;
    }
    try {
      // A cutout is optional: never pretend CSS removes a photograph's background.
      const productURL = product.cartImage || source.currentSrc || source.src;
      await Promise.race([
        Promise.all([preload(handArt), preload(portalArt), preload(productURL)]),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Asset timeout")), 6000)),
      ]);
      if (stopped) return;
      const rect = source.getBoundingClientRect();
      if (!visible(rect)) { finish(); return; }
      const computed = getComputedStyle(source);
      let width = rect.width, height = rect.height;
      if (computed.objectFit === "contain" && source.naturalWidth && source.naturalHeight) {
        const ratio = Math.min(width / source.naturalWidth, height / source.naturalHeight);
        width = source.naturalWidth * ratio;
        height = source.naturalHeight * ratio;
      }
      const size = clamp(Math.max(width, height), 56, Math.min(190, innerWidth * .3));
      // The inspected artwork's grip is at 78% x, 55% y of its canvas.
      const handWidth = size * 2.4;
      overlay = document.createElement("div");
      overlay.className = "reezo-hand-v3";
      overlay.setAttribute("aria-hidden", "true");
      const portal = document.createElement("img");
      portal.className = "rhv3-portal"; portal.src = portalArt;
      const group = document.createElement("div"); group.className = "rhv3-group";
      const hand = document.createElement("img"); hand.className = "rhv3-hand"; hand.src = handArt;
      const item = document.createElement("img"); item.className = "rhv3-product"; item.src = productURL;
      Object.assign(item.style, { width: `${width}px`, height: `${height}px`, objectFit: computed.objectFit, objectPosition: computed.objectPosition });
      Object.assign(hand.style, { width: `${handWidth}px`, left: `${-handWidth * .78}px`, top: "0px" });
      // Dimensions come from the loaded asset, not a guessed aspect ratio.
      const handImage = await preload(handArt);
      if (stopped) return;
      hand.style.top = `${-handWidth * handImage.height / handImage.width * .55}px`;
      portal.style.width = `${size * 1.15}px`;
      const fingers = hand.cloneNode();
      fingers.classList.add("rhv3-fingers");
      group.append(hand, item, fingers); overlay.append(portal, group); document.body.append(overlay);
      let carryStart = null, destination = center(cart.getBoundingClientRect()), pickup = null, startAt = null;
      function paint(now) {
        if (stopped) return;
        if (!source.isConnected || !cart.isConnected) { finish(); return; }
        startAt ??= now;
        const t = now - startAt;
        const currentSource = center(source.getBoundingClientRect());
        // Source portal follows document scrolling while the flight uses viewport pixels.
        const origin = { x: currentSource.x - size * .62, y: currentSource.y };
        const portalScale = t < 350 ? ease(t / 350) : t > 2700 ? 1 - clamp((t - 2700) / 350, 0, 1) : 1;
        portal.style.transform = `translate(${origin.x}px,${origin.y}px) translate(-50%,-50%) scale(${portalScale})`;
        let point = currentSource, scale = 1;
        hand.style.opacity = String(clamp((t - 200) / 200, 0, 1));
        if (t < 750) {
          const reach = ease(clamp((t - 300) / 450, 0, 1));
          point = { x: mix(origin.x, currentSource.x, reach), y: currentSource.y };
          item.style.opacity = "0";
        } else {
          if (!pickup) { pickup = currentSource; source.style.visibility = "hidden"; }
          item.style.opacity = "1";
          item.style.transform = `translate(-50%,-50%) scale(${mix(1, .55, ease(clamp((t - 750) / 400, 0, 1)))})`;
          point = pickup;
          if (t >= 950 && !carryStart) {
            carryStart = pickup;
            if (!visible(cart.getBoundingClientRect())) cart.scrollIntoView({ behavior: "instant", block: "center", inline: "nearest" });
          }
          if (carryStart && t < 2050) {
            const u = ease(clamp((t - 950) / 1100, 0, 1));
            destination = center(cart.getBoundingClientRect());
            const controlY = Math.max(size * .3, Math.min(carryStart.y, destination.y) - size * .6);
            point = { x: mix(carryStart.x, destination.x, u), y: (1-u)**2*carryStart.y + 2*(1-u)*u*controlY + u*u*destination.y };
            scale = mix(1, .28, u);
          } else if (t >= 2050 && t < 2350) {
            destination = center(cart.getBoundingClientRect());
            point = destination; scale = .28;
            const release = clamp((t - 2050) / 300, 0, 1);
            item.style.transform = `translate(-50%,-50%) scale(${.55 * (1 - release)})`;
            item.style.opacity = String(1 - release);
            hand.style.translate = `${-release * size * .15}px 0px`;
          } else if (t >= 2350) {
            commit(); restore();
            const u = ease(clamp((t - 2350) / 500, 0, 1));
            point = { x: mix(destination.x, origin.x, u), y: mix(destination.y, origin.y, u) };
            scale = mix(.28, .65, u);
            item.style.opacity = "0";
            hand.style.opacity = String(1 - u);
          }
        }
        fingers.style.opacity = hand.style.opacity;
        fingers.style.translate = hand.style.translate;
        group.style.transform = `translate(${point.x}px,${point.y}px) scale(${scale})`;
        if (t >= 3050) { finish(); return; }
        frame = requestAnimationFrame(paint);
      }
      frame = requestAnimationFrame(paint);
    } catch (error) {
      if (!stopped) { console.warn("Cart animation unavailable", error); finish(); }
    }
  }
  return { busy, success, dismiss, start };
}

function ProductCard({
  product,
  addToCart,
  onProductClick,
  isWishlisted = false,
  onWishlistClick,
}) {
  const magic = useCartHand();
  const [wishMagic, setWishMagic] = useState(false);
  const [wishMessage, setWishMessage] = useState("");
  const wishTimer = useRef(null);
  useEffect(() => () => clearTimeout(wishTimer.current), []);
  if (
    !product ||
    typeof product !== "object" ||
    Array.isArray(product) ||
    product.id == null
  ) {
    return null;
  }

  const displayValue = (value) => {
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    return "";
  };

  const formatPrice = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return `₹${value.toLocaleString("en-IN")}`;
    }

    return displayValue(value);
  };

  const name = displayValue(product.name) || "Product";
  const image =
    typeof product.image === "string" ? product.image : "";

  const price = formatPrice(product.price);
  const oldPrice = formatPrice(product.oldPrice);
  const discount =
    typeof product.discount === "number" &&
    Number.isFinite(product.discount)
      ? `${product.discount}% off`
      : displayValue(product.discount);

  const canOpenProduct = typeof onProductClick === "function";
  const canAddToCart = typeof addToCart === "function";
  const canToggleWishlist = typeof onWishlistClick === "function";

  const handleWishlistClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (canToggleWishlist) {
      onWishlistClick(product);
      setWishMessage(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist");
      setWishMagic(true);
      clearTimeout(wishTimer.current);
      wishTimer.current = setTimeout(() => setWishMagic(false), 2000);
    }
  };

  const handleProductClick = () => {
    if (canOpenProduct && !magic.busy) {
      onProductClick(product);
    }
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (canAddToCart) {
      magic.start(event.currentTarget.closest(".product-card")?.querySelector(".product-image img"), product, addToCart);
    }
  };

  return (
    <>
    {wishMagic && createPortal(<div className="wish-magic-overlay"><div className="wish-magic-heart">❤️{[1,2,3,4,5].map(n => <span key={n} className={`floating-heart h${n}`}>♥</span>)}</div><div className="wish-magic-text">{wishMessage}</div></div>, document.body)}
    {magic.success && createPortal(<div className="rhv3-success-shade"><div className="rhv3-success" role="status" aria-live="polite"><div className="rhv3-check">✓</div><h2>Thank you!</h2><p><strong>{name}</strong> has been added to your cart.</p><span>Kindly proceed to checkout whenever you're ready.</span><div className="rhv3-actions"><button type="button" onClick={magic.dismiss}>Continue Shopping</button><button type="button" onClick={() => { magic.dismiss(); document.querySelector(".header .cart")?.click(); }}>View Cart</button></div></div></div>, document.body)}
    <div className="product-card">
      <button
        type="button"
        className={`wishlist-btn ${
          isWishlisted ? "wishlisted" : ""
        }`}
        onClick={handleWishlistClick}
        disabled={!canToggleWishlist}
        aria-pressed={Boolean(isWishlisted)}
        aria-label={
          isWishlisted
            ? `Remove ${name} from wishlist`
            : `Add ${name} to wishlist`
        }
        title={
          isWishlisted
            ? "Remove from Wishlist"
            : "Add to Wishlist"
        }
      >
        <span aria-hidden="true">
          {isWishlisted ? "♥" : "♡"}
        </span>
      </button>

      <button
        type="button"
        className="product-image"
        onClick={handleProductClick}
        disabled={!canOpenProduct}
        aria-label={`View ${name}`}
        style={{
          border: "none",
          padding: 0,
          color: "inherit",
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span>Image unavailable</span>
        )}
      </button>

      <h3>
        <button
          type="button"
          onClick={handleProductClick}
          disabled={!canOpenProduct}
          style={{
            display: "block",
            width: "100%",
            border: "none",
            padding: 0,
            background: "transparent",
            color: "inherit",
            font: "inherit",
            textAlign: "inherit",
          }}
        >
          {name}
        </button>
      </h3>

      <div className="price">
        {price !== "" ? price : "Price unavailable"}
      </div>

      {oldPrice !== "" && (
        <div className="old-price">{oldPrice}</div>
      )}

      {discount !== "" && (
        <div className="discount">{discount}</div>
      )}

      <button
        type="button"
        className="add-cart"
        onClick={handleAddToCart}
        disabled={!canAddToCart || price === "" || magic.busy}
      >
        {magic.busy ? "Adding…" : "Add to Cart"}
      </button>
    </div>
    </>
  );
}

export default ProductCard;