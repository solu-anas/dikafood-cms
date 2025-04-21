import { useState } from "react";
import { PiPlusDuotone } from "react-icons/pi";
import Button from "../../../../components/ui/Button";
import "./styles.scss";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);

  return (
    <div className="products-page">
      <div className="content-container">
        <div className="content-header">
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        
        <div className="content-body">
          <div className="header-actions">
            <Button
              variant="primary"
              icon={<PiPlusDuotone size={18} />}
            >
              Add Product
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <p>No products found</p>
              <Button
                variant="primary"
                size="md"
                icon={<PiPlusDuotone size={16} />}
              >
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="table-container">
              {/* Product table will go here */}
              <p>Product table placeholder</p>
            </div>
          )}
        </div>
        
        <div className="content-footer">
          <p>Showing {products.length} products</p>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;