import { useNavigate } from "react-router-dom";
import reezoLogo from "../assets/reezo-logo.png";

function Header({
  search = "",
  setSearch,
  cart = [],
  wishlist = [],
  onCartClick,
  onWishlistClick,
  onLoginClick,
}) {
  const navigate = useNavigate();

  const cartCount = Array.isArray(cart)
    ? cart.filter((item) => item && typeof item === "object").length
    : 0;

  const wishlistCount = Array.isArray(wishlist)
    ? wishlist.filter((item) => item && typeof item === "object").length
    : 0;

  const searchValue =
    typeof search === "string" ? search : "";

  const handleSearchChange = (event) => {
    if (typeof setSearch === "function") {
      setSearch(event.target.value);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate("/");
  };

  const handleNavigation = (callback, path) => {
    if (typeof callback === "function") {
      callback();
    } else {
      navigate(path);
    }
  };

  const plainButtonStyle = {
    background: "transparent",
    border: "none",
    color: "inherit",
    padding: 0,
    fontFamily: "inherit",
  };

  return (
    <header className="header">
      <button
        type="button"
        className="logo"
        style={plainButtonStyle}
        onClick={() => navigate("/")}
        aria-label="Reezo home"
      >
        <img
          src={reezoLogo}
          alt="Reezo"
          className="reezo-logo"
        />
      </button>

      <form
        className="search-box"
        role="search"
        onSubmit={handleSearchSubmit}
      >
        <input
          type="text"
          name="search"
          placeholder="Search for products, brands and more"
          aria-label="Search products"
          value={searchValue}
          onChange={handleSearchChange}
        />

        <button
          type="submit"
          aria-label="Search"
          title="Search"
        >
          <span aria-hidden="true">🔍</span>
        </button>
      </form>

      <button
        type="button"
        className="login-btn"
        onClick={() =>
          handleNavigation(onLoginClick, "/login")
        }
      >
        Login
      </button>

      <div
        className="header-link"
        style={{ cursor: "default" }}
      >
        Become a Seller
      </div>

      <button
        type="button"
        className="header-link wishlist-header-link"
        style={plainButtonStyle}
        onClick={() =>
          handleNavigation(onWishlistClick, "/wishlist")
        }
      >
        <span aria-hidden="true">❤️</span>{" "}
        Wishlist ({wishlistCount})
      </button>

      <button
        type="button"
        className="header-link cart"
        style={plainButtonStyle}
        onClick={() =>
          handleNavigation(onCartClick, "/cart")
        }
      >
        <span aria-hidden="true">🛒</span>{" "}
        Cart ({cartCount})
      </button>
    </header>
  );
}

export default Header;