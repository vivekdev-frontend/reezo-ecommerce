import heroBags from "../assets/reezo-hero-bags.png";

function Hero() {
  const handleShopNow = () => {
    const productsSection =
      document.querySelector(".products-section");

    if (
      !productsSection ||
      typeof productsSection.scrollIntoView !== "function"
    ) {
      return;
    }

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    productsSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      className="hero"
      aria-labelledby="reezo-hero-title"
    >
      <div className="hero-content">
        <p className="hero-small">
          BIG SAVINGS EVERY DAY
        </p>

        <h1 id="reezo-hero-title">
          Everything You Need,
          <br />
          <span className="hero-gradient">
            All in One Place
          </span>
        </h1>

        <p>
          Discover amazing products at great prices.
        </p>

        <button
          type="button"
          className="shop-btn"
          onClick={handleShopNow}
        >
          Shop Now <span aria-hidden="true">→</span>
        </button>
      </div>

      <div
        className="hero-product"
        aria-hidden="true"
      >
        <img
          src={heroBags}
          alt=""
          width={1440}
          height={1080}
          decoding="async"
        />
      </div>
    </section>
  );
}

export default Hero;