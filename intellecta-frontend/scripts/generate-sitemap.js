const path = require("path");
const React = require("react");
const Generator = require("react-router-sitemap-generator").default;

// Route mock component recognizable by react-router-sitemap-generator
const Route = () => null;

// Public routes for indexing
const routes = React.createElement(
  "div",
  null,
  React.createElement(Route, { path: "/" }),
  React.createElement(Route, { path: "/login" }),
  React.createElement(Route, { path: "/signup" })
);

const BASE_URL = "https://intellecta.hasanbutt.me";
const DESTINATION = path.resolve(__dirname, "../public/sitemap.xml");

try {
  const generator = new Generator(BASE_URL, routes, {
    lastmod: new Date().toISOString().slice(0, 10),
    changefreq: "weekly",
    priority: 0.8,
  });

  generator.save(DESTINATION);
  console.log(`✅ Sitemap successfully generated at: ${DESTINATION}`);
} catch (error) {
  console.error("❌ Failed to generate sitemap:", error);
  process.exit(1);
}
