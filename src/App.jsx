import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Categories from "./components/Categories";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import ProductListCard from "./components/ProductListCard";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import Wishlist from "./components/Wishlist";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import Profile from "./components/Profile";
import MyOrders from "./components/MyOrders";
import TrackOrder from "./components/TrackOrder";
const products = [
  {
    id: "smartphone-pro-max",
    name: "Smartphone Pro Max",
    category: "Mobiles",
    price: "₹24,999",
    oldPrice: "₹29,999",
    discount: "16% off",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "wireless-headphones",
    name: "Wireless Headphones",
    category: "Electronics",
    price: "₹1,499",
    oldPrice: "₹2,999",
    discount: "50% off",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "running-shoes",
    name: "Running Shoes",
    category: "Fashion",
    price: "₹1,999",
    oldPrice: "₹3,499",
    discount: "43% off",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "smart-watch",
    name: "Smart Watch",
    category: "Electronics",
    price: "₹2,499",
    oldPrice: "₹4,999",
    discount: "50% off",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "laptop",
    name: "Laptop",
    category: "Electronics",
    price: "₹49,999",
    oldPrice: "₹59,999",
    discount: "17% off",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80",
  },
];

// Invalid numeric values use zero for sorting; displayed product values stay intact.
const parseNumericValue = (value, suffix) => {
  if (typeof value !== "string" && typeof value !== "number") return 0;
  const parsed = typeof value === "number"
    ? value
    : Number(value.replace(suffix, "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};
const getNumericPrice = (value) => parseNumericValue(value, /₹/g);
const getNumericDiscount = (value) => parseNumericValue(value, /%\s*(?:off)?\s*$/i);
const isValidProduct = (product) =>
  product !== null && typeof product === "object" && !Array.isArray(product) &&
  typeof product.name === "string" &&
  (typeof product.price === "string" ||
    (typeof product.price === "number" && Number.isFinite(product.price))) &&
  ["image", "category", "oldPrice", "discount"].every((key) =>
    product[key] == null || typeof product[key] === "string" ||
    (typeof product[key] === "number" && Number.isFinite(product[key]))
  ) &&
  ((typeof product.id === "string" && product.id.trim() !== "") ||
    (typeof product.id === "number" && Number.isFinite(product.id)));
const normalizeQuantity = (value) => {
  const quantity = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
};
const incrementQuantity = (value) => Math.min(normalizeQuantity(value) + 1, Number.MAX_SAFE_INTEGER);
const loadProducts = (key, withQuantity = false) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter(isValidProduct).map((product) => ({
      ...product,
      ...(withQuantity ? { quantity: normalizeQuantity(product.quantity) } : {}),
    }));
  } catch (error) {
    console.error("Could not load " + key + ":", error);
    return [];
  }
};

function App() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(() => loadProducts("reezoCart", true));
  const [wishlist, setWishlist] = useState(() => loadProducts("reezoWishlist"));
  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");
  const [
    sortOption,
    setSortOption,
  ] = useState("default");
  const navigate = useNavigate();
  useEffect(() => {
    try {
      localStorage.setItem(
        "reezoCart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Could not save cart:",
        error
      );
    }
  }, [cart]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "reezoWishlist",
        JSON.stringify(wishlist)
      );
    } catch (error) {
      console.error(
        "Could not save wishlist:",
        error
      );
    }
  }, [wishlist]);
  const addToCart = (product) => {
    if (!isValidProduct(product)) return;
    setCart((currentCart) => {
      const existingProduct =
        currentCart.find(
          (item) =>
            item.id === product.id
        );
      if (existingProduct) {
        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    incrementQuantity(item.quantity),
                }
              : item
        );
      }
      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };
  const increaseQuantity = (
    productId
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity:
                incrementQuantity(item.quantity),
            }
          : item
      )
    );
  };
  const decreaseQuantity = (
    productId
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId &&
        item.quantity > 1
          ? {
              ...item,
              quantity:
                item.quantity - 1,
            }
          : item
      )
    );
  };
  const removeFromCart = (
    productId
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== productId
      )
    );
  };
  const toggleWishlist = (
    product
  ) => {
    if (!isValidProduct(product)) return;
    setWishlist(
      (currentWishlist) => {
        const alreadyWishlisted =
          currentWishlist.some(
            (item) =>
              item.id === product.id
          );
        if (alreadyWishlisted) {
          return currentWishlist.filter(
            (item) =>
              item.id !== product.id
          );
        }
        return [
          ...currentWishlist,
          product,
        ];
      }
    );
  };
  const removeFromWishlist = (
    productId
  ) => {
    setWishlist(
      (currentWishlist) =>
        currentWishlist.filter(
          (item) =>
            item.id !== productId
        )
    );
  };
  const isProductWishlisted = (
    productId
  ) => {
    return wishlist.some(
      (item) =>
        item.id === productId
    );
  };
  const openProduct = (
    product
  ) => {
    if (!isValidProduct(product)) return;
    navigate(
      `/product/${encodeURIComponent(product.id)}`
    );
  };
  const handleCategoryClick = (
    categoryName
  ) => {
    setSelectedCategory(
      categoryName
    );
    setSearch("");
    setSortOption("default");
  };
  const showAllProducts = () => {
    setSelectedCategory("All");
    setSearch("");
    setSortOption("default");
  };
  const filteredProducts =
    products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            String(search ?? "").toLowerCase()
          );
      const matchesCategory =
        selectedCategory === "All" ||
        product.category ===
          selectedCategory;
      return (
        matchesSearch &&
        matchesCategory
      );
    });
  const sortedProducts = [
    ...filteredProducts,
  ];
  if (
    sortOption ===
    "price-low-high"
  ) {
    sortedProducts.sort(
      (a, b) =>
        getNumericPrice(a.price) -
        getNumericPrice(b.price)
    );
  }
  if (
    sortOption ===
    "price-high-low"
  ) {
    sortedProducts.sort(
      (a, b) =>
        getNumericPrice(b.price) -
        getNumericPrice(a.price)
    );
  }
  if (
    sortOption ===
    "discount-high-low"
  ) {
    sortedProducts.sort(
      (a, b) =>
        getNumericDiscount(
          b.discount
        ) -
        getNumericDiscount(
          a.discount
        )
    );
  }
  const homePage = (
    <>
      <Categories
        onCategoryClick={
          handleCategoryClick
        }
      />
      {selectedCategory ===
        "All" && (
        <Hero />
      )}
      <section className="products-section">
        <div className="section-header">
          <div>
            <h2>
              {selectedCategory ===
              "All"
                ? "Deals of the Day"
                : selectedCategory}
            </h2>
            {selectedCategory !==
              "All" && (
              <p>
                {sortedProducts.length}{" "}
                {sortedProducts.length ===
                1
                  ? "product"
                  : "products"}{" "}
                found
              </p>
            )}
          </div>
          <div className="product-actions">
            <select
              className="sort-select"
              aria-label="Sort products"
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target.value
                )
              }
            >
              <option value="default">
                Sort By
              </option>
              <option value="price-low-high">
                Price: Low to High
              </option>
              <option value="price-high-low">
                Price: High to Low
              </option>
              <option value="discount-high-low">
                Discount: High to Low
              </option>
            </select>
            {selectedCategory !==
              "All" && (
              <button
                type="button"
                className="view-all"
                onClick={
                  showAllProducts
                }
              >
                All Products
              </button>
            )}
          </div>
        </div>
        {selectedCategory ===
        "All" ? (
          <div className="products">
            {sortedProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={
                    addToCart
                  }
                  onProductClick={
                    openProduct
                  }
                  isWishlisted={
                    isProductWishlisted(
                      product.id
                    )
                  }
                  onWishlistClick={
                    toggleWishlist
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="product-list">
            {sortedProducts.map(
              (product) => (
                <ProductListCard
                  key={product.id}
                  product={product}
                  addToCart={
                    addToCart
                  }
                  onProductClick={
                    openProduct
                  }
                  isWishlisted={
                    isProductWishlisted(
                      product.id
                    )
                  }
                  onWishlistClick={
                    toggleWishlist
                  }
                />
              )
            )}
          </div>
        )}
        {sortedProducts.length ===
          0 && (
          <div className="no-products">
            <h3>
              No products found
            </h3>
            <p>
              No products are
              available in this
              category yet.
            </p>
            <button
              type="button"
              className="view-all"
              onClick={
                showAllProducts
              }
            >
              View All Products
            </button>
          </div>
        )}
      </section>
    </>
  );
  return (
    <div className="app">


      <Header
        search={search}
        setSearch={setSearch}
        cart={cart}
        wishlist={wishlist}
        onLoginClick={() =>
          navigate("/login")
        }
        onWishlistClick={() =>
          navigate("/wishlist")
        }
        onCartClick={() =>
          navigate("/cart")
        }
      />
      <Routes>
        <Route
          path="/"
          element={homePage}
        />
        <Route
          path="/login"
          element={<Login />}
        />
<Route
  path="/signup"
  element={<Signup />}
/>
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
<Route
  path="/profile"
  element={<Profile />}
/>
<Route
  path="/orders"
  element={<MyOrders addToCart={addToCart} />}
/>
<Route
  path="/track-order"
  element={<TrackOrder />}
/>
        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={products}
              addToCart={
                addToCart
              }
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <Wishlist
              wishlist={
                wishlist
              }
              addToCart={
                addToCart
              }
              removeFromWishlist={
                removeFromWishlist
              }
            />
          }
        />
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              increaseQuantity={
                increaseQuantity
              }
              decreaseQuantity={
                decreaseQuantity
              }
              removeFromCart={
                removeFromCart
              }
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              setCart={setCart}
            />
          }
        />
        <Route
          path="/order-success"
          element={
            <OrderSuccess />
          }
        />
      </Routes>
    </div>
  );
}
export default App;
