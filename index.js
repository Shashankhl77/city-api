const http = require("http");
const url = require("url");
const { getCities, addCity, updateCity, deleteCity } = require("./data");

const PORT = 3000;

const server = http.createServer((req, res) => {
  const { method, url: reqUrl } = req;
  const parsedUrl = url.parse(reqUrl, true);
  const path = parsedUrl.pathname;

  if (method === "POST" && path === "/cities") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const city = JSON.parse(body);

      if (
        !city.name ||
        !city.population ||
        !city.country ||
        !city.latitude ||
        !city.longitude
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Missing required fields" }));
        return;
      }

      addCity(city, (insertId) => {
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: "City added successfully", id: insertId })
        );
      });
    });
  } else if (method === "PUT" && path.startsWith("/cities/")) {
    const name = path.split("/")[2];
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const updatedCity = JSON.parse(body);
      updateCity(name, updatedCity, (success) => {
        if (success) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "City updated successfully" }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "City not found" }));
        }
      });
    });
  } else if (method === "DELETE" && path.startsWith("/cities/")) {
    const name = path.split("/")[2];
    deleteCity(name, (success) => {
      if (success) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "City deleted successfully" }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "City not found" }));
      }
    });
  } else if (method === "GET" && path === "/cities") {
    const {
      page = 1,
      limit = 10,
      filter,
      sort,
      search,
      projection,
    } = parsedUrl.query;

    getCities((cities) => {
      let filteredCities = cities;

      if (filter) {
        const filterObj = JSON.parse(filter);
        filteredCities = filteredCities.filter((city) =>
          Object.keys(filterObj).every((key) => city[key] === filterObj[key])
        );
      }

      if (search) {
        filteredCities = filteredCities.filter((city) =>
          Object.values(city).some((value) =>
            value.toString().toLowerCase().includes(search.toLowerCase())
          )
        );
      }

      if (sort) {
        const [field, order] = sort.split(":");
        filteredCities = filteredCities.sort((a, b) =>
          order === "desc" ? b[field] - a[field] : a[field] - b[field]
        );
      }

      if (projection) {
        const projectionFields = projection.split(",");
        filteredCities = filteredCities.map((city) =>
          projectionFields.reduce((acc, field) => {
            if (field in city) {
              acc[field] = city[field];
            }
            return acc;
          }, {})
        );
      }

      const skip = (page - 1) * limit;
      const take = parseInt(limit);
      const paginatedCities = filteredCities.slice(skip, skip + take);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(paginatedCities));
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
