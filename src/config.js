const ENV = "development";

const config = {
    API_BASE: (ENV.toLocaleLowerCase() === "production") ? "https://api.dikafood.ma" : "http://localhost:1025",
};

export default config;