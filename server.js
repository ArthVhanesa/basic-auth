const express = require("express");
const basicAuth = require("express-basic-auth");

const app = express();
const port = process.env.PORT || 3000;

const instanceData = require("./instanceData.json");

// Sample users for basic authentication
const users = {
  username1: "password1",
  username2: "password2",
};

// Middleware for basic authentication
const authenticate = basicAuth({
  users,
  //   challenge: true, // Display the login dialog when unauthorized
  unauthorizedResponse: { statusCode: "401", message: "Unauthorized" },
});

// Unprotected route
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(
    "This is basic auth mock API for fetching Instance data.\n\nTry /unprotected route.\nIt is not protected with basic auth which will give you 200 OK response.\n\nTry /protected route with basic authentication.\n\nUsername: username1, Password: password1\nUsername: username2, Password: password2\n\nIf you provide wrong credentials, you will get 401 Unauthorized response. Otherwise, you will get 200 OK response.\n\nRoute /instances is paginated and requires basic authentication.\nTry /instances?page=1&size=10 to get paginated data.\nIf you provide wrong page or size, you will get 500 Internal Server Error response."
  );
});

// Protected route that requires basic authentication
app.get("/protected", authenticate, (req, res) => {
  res.send({ statusCode: "200", message: "Successfully authenticated!" });
});

// Unprotected route
app.get("/unprotected", (req, res) => {
  res.send({ message: "This route is unprotected." });
});

// Paginated instance data
app.get("/instances", authenticate, (req, res) => {
  const defaultPageSize = 10;
  const defaultPageNumber = 1;

  try {
    var { page = defaultPageNumber, size = defaultPageSize } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    const instances = instanceData.instances;

    // Validate input parameters
    if (isNaN(page) || page < 1) {
      console.log("Invalid page number.");
      throw new Error("Invalid page number.");
    }
    if (isNaN(size) || size < 1) {
      console.log("Invalid page size.");
      throw new Error("Invalid page size.");
    }

    const totalPages = Math.ceil(instances.length / size);
    if (page > totalPages) {
      console.log("Requested page is beyond available data.");
      throw new Error("Requested page is beyond available data.");
    }

    const startIndex = (page - 1) * size;
    const endIndex = Math.min(startIndex + size, instances.length);
    const paginatedData = instances.slice(startIndex, endIndex);

    res.json({
      page: page,
      pageSize: size,
      totalPages,
      length: paginatedData.length,
      instances: paginatedData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message }); // Pass error to error handling middleware
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
