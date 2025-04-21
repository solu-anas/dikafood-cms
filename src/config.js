const ENV = "development";

const config = {
    API_BASE: (ENV.toLocaleLowerCase() === "production") ? "https://api.dikafood.ma" : "http://localhost:1025",
    USE_MOCK_AUTH: true, // Set to true to use mock authentication instead of real API
};

export default config;