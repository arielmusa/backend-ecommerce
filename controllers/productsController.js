import { db } from "../config/db.js";

// ALL PRODUCTS
export default function index(req, res) {
  db.query("SELECT * FROM products ORDER BY name ASC", (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else {
      res.json(data);
    }
  });
}

// PRODUCT DETAIL
export function getProductBySlug(req, res) {
  const slug = req.params.slug;
  const sql = `
    SELECT 
      p.*, 
      b.name AS brand_name, 
      c.name AS category_name
    FROM products p
    JOIN brands b ON p.brand_id = b.id
    JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ?
  `;

  db.query(sql, [slug], (err, result) => {
    if (err || result.length === 0) {
      return res
        .status(404)
        .json({ error: 404, message: "Prodotto non trovato" });
    }
    res.json(result[0]);
  });
}

// export function getProductById(req, res) {
//   const productId = req.params.id;

//   const sql = `
//     SELECT
//       p.*,
//       b.name AS brand_name,
//       c.name AS category_name
//     FROM products p
//     JOIN brands b ON p.brand_id = b.id
//     JOIN categories c ON p.category_id = c.id
//     WHERE p.id = ?
//   `;

//   db.query(sql, [productId], (err, result) => {
//     if (err || result.length === 0) {
//       return res
//         .status(404)
//         .json({ error: 404, message: "Prodotto non trovato" });
//     }

//     res.json(result[0]);
//   });
// }

// SEARCH + SORT
export function searchProducts(req, res) {
  const search = req.query.search || "";
  const sort = req.query.sort || "name_asc";
  const brand = req.query.brand || "";
  const category = req.query.category || "";
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
  const promoOnly = req.query.promo === "true"; // ✅ nuovo parametro

  let orderBy = "ORDER BY p.name ASC";
  if (sort === "price_asc") {
    orderBy = "ORDER BY effective_price ASC";
  } else if (sort === "price_desc") {
    orderBy = "ORDER BY effective_price DESC";
  } else if (sort === "recent") {
    orderBy = "ORDER BY p.created_at DESC";
  }

  const filters = [];
  const values = [];

  // Ricerca su nome o descrizione
  if (search !== "") {
    filters.push("(p.name LIKE ? OR p.description LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }

  if (brand !== "") {
    filters.push("b.name = ?");
    values.push(brand);
  }

  if (category !== "") {
    filters.push("c.name = ?");
    values.push(category);
  }

  // ✅ Filtro per prodotti in promozione
  if (promoOnly) {
    filters.push("p.promotion_price > 0");
  }

  // Filtro sul prezzo effettivo
  filters.push(`
    CASE 
      WHEN p.promotion_price > 0 THEN p.promotion_price 
      ELSE p.price 
    END >= ?
  `);
  values.push(minPrice);

  if (maxPrice !== Infinity) {
    filters.push(`
      CASE 
        WHEN p.promotion_price > 0 THEN p.promotion_price 
        ELSE p.price 
      END <= ?
    `);
    values.push(maxPrice);
  }

  const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

  const sql = `
    SELECT 
      p.*, 
      b.name AS brand_name, 
      c.name AS category_name,
      CASE 
        WHEN p.promotion_price > 0 THEN p.promotion_price 
        ELSE p.price 
      END AS effective_price
    FROM products p
    JOIN brands b ON p.brand_id = b.id
    JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderBy}
  `;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Errore nella ricerca:", err);
      return res.status(502).json({ error: 502, message: "Query fallita" });
    }
    res.json(results);
  });
}

// LATEST PRODUCTS
export function getRecentProducts(req, res) {
  db.query(
    "SELECT * FROM products ORDER BY created_at DESC LIMIT 10",
    (err, data) => {
      if (err) {
        res.status(502).json({ error: 502, message: "Errore nella query" });
      } else {
        res.json(data);
      }
    }
  );
}

// BEST SELLERS
export function getMostSoldProducts(req, res) {
  const sql = `
    SELECT p.*, COUNT(op.product_id) as sold_count
    FROM products p
    JOIN order_product op ON p.id = op.product_id
    GROUP BY p.id
    ORDER BY sold_count DESC
    LIMIT 10
  `;
  db.query(sql, (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else {
      res.json(data);
    }
  });
}

export function getBrands(req, res) {
  const sql = "SELECT id, name FROM brands ORDER BY name ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Errore nel recupero brands:", err);
      return res.status(500).json({ error: 500, message: "Query fallita" });
    }
    res.json(results);
  });
}

export function getCategories(req, res) {
  const sql = "SELECT id, name FROM categories ORDER BY name ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Errore nel recupero categorie:", err);
      return res.status(500).json({ error: 500, message: "Query fallita" });
    }
    res.json(results);
  });
}
