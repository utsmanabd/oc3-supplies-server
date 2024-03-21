const express = require('express');
const app = express();
const cors = require('cors');
const mainRoutes = require("./src/routes/routes");
const { injectMstMaterialSupplies, injectTrSuppliesBudget, sapSupplies } = require('./inject');

// parse requests of content-type - application/json
app.use(express.json({ limit: '35mb' }));
//use cors
app.use(cors());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: '35mb', extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    service: "oc3-supplies-api",
  });
});

// register main routes
app.use("/api/", mainRoutes);

// return not found on all non-registered routes
app.get("*", (req, res) => {
  res.redirect("/api/not-found");
});

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(
    `oc3-supplies-server Service is running on port ${PORT}. ${
      process.env.DEV == "TRUE" ? "<Development Mode>" : ""
    }`
  );
});

