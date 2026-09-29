const categories = [
  {
    name: "Mobiles",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Home",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Appliances",
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Grocery",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Toys",
    image:
      "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=300&q=80",
  },
];

function Categories({ onCategoryClick }) {
  const canSelectCategory =
    typeof onCategoryClick === "function";

  const handleCategoryClick = (categoryName) => {
    if (canSelectCategory) {
      onCategoryClick(categoryName);
    }
  };

  return (
    <section
      className="categories"
      aria-label="Shop by category"
    >
      {categories.map((category) => (
        <button
          type="button"
          className="category"
          key={category.name}
          disabled={!canSelectCategory}
          onClick={() => handleCategoryClick(category.name)}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            color: "inherit",
            font: "inherit",
          }}
        >
          <span className="category-image">
            <img
              src={category.image}
              alt=""
              width={82}
              height={82}
              decoding="async"
            />
          </span>

          <span
            className="category-name"
            style={{ display: "block" }}
          >
            {category.name}
          </span>
        </button>
      ))}
    </section>
  );
}

export default Categories;