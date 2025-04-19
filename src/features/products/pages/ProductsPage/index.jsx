import { useState } from "react";
import { PiPlus } from "react-icons/pi";
import Button from "../../../../components/ui/Button";
import "./styles.scss";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <Button
          variant="primary"
          icon={<PiPlus size={18} />}
        >
          Add Product
        </Button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <h2>All Products</h2>
          </div>

          <div className="card-body">
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products found</p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<PiPlus size={16} />}
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
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;