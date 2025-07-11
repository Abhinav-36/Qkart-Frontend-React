import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Typography } from "@mui/material";
import { Button, IconButton, Stack, Divider } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 * 
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  let AllCartItem = [];
  //  cartData[i].productId===productsData[i]._id , used double for loop(most stupid) to find items in productData array using prodcutId in cartData
  if (cartData.length && productsData.length) {
    for (let i = 0; i < cartData.length; i++) {
      for (let j = 0; j < productsData.length; j++) {
        if (cartData[i].productId === productsData[j]._id) {
          // since we need to store both objs: cartData & productData in each obj of our new array so, make a new obj which has both of prev mentioned objs(use spread operator) and store that.
          AllCartItem.push({ ...productsData[j], ...cartData[i] });

        }
      }
    }
  }
  // console.log("AllCartItem :",AllCartItem);
  return AllCartItem;

};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items = []) => {
  let totalCartValue = 0;
  let len = items.length;
  for(let i=0;i<len;i++){
    totalCartValue += (items[i].cost * items[i].qty);
  }
  return totalCartValue
};


/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 * 
 * @param {Number} value
 *    Current quantity of product in cart
 * 
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 * 
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 * 
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 * 
 */
const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
}) => {
  // console.log(value);
  return (
      <Stack direction="row" alignItems="center" >
        <IconButton color="primary" size="small" onClick={handleDelete}>
          <RemoveOutlined />
        </IconButton>
        <Box padding="0.5rem" data-testid="item-qty">
          {value}
        </Box>
        <IconButton size="small" color="primary" onClick={handleAdd}>
          <AddOutlined />
        </IconButton>
      </Stack>
  );
};


const GetOrderDetails = ({items=[]}) => {
  return (
    <Box className="cart">
    <Box display="flex" flexDirection="column" padding="1rem">
    <Box>
      <h2>Order Details</h2>
    </Box>
    <Box display="flex" flexDirection="row" justifyContent="space-between">
    {/* since direction is row, hence only 1 row and 2 cols bcz 2 boxs below */}
        <Box>
          <p>Product</p>
          <p>Subtotal</p>
          <p>Shipping Charges</p>
          <Typography variant="h5">Total</Typography>
        </Box>
        
        <Box style={{ textAlign: "right" }}>
          <p>{items.length}</p>
          <p>${getTotalCartValue(items)}</p>
          <p>$0</p>
          <Typography variant="h5">${getTotalCartValue(items)}</Typography>
        </Box>
      </Box>
    </Box>
    
    </Box>
  );
}


/**
 * Component to display the Cart view
 * 
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 * 
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 * 
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 * 
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 * 
 */
const Cart = ({
  products,
  items = [],
  handleQuantity,
  isReadOnly=false
}) => {
  let history = useHistory();
  // console.log(items);
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
      {
        items.map((item) => (
            <Box display="flex" alignItems="flex-start" padding="1rem" key={item.productId}> 
              <Box className="image-container">
                <img
                  src={item.image}
                  alt={item.name}
                  width="100%"
                  height="100%"
                />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="6rem"
                paddingX="1rem"
              >
                <div>{item.name}</div>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                {isReadOnly?(
                    <Box style={{ fontSize: "1rem" }}>
                      Qty: {item.qty} 
                    </Box>

                  ):(
                    <ItemQuantity
                    // Pass item quantity here
                    value={item.qty} 

                    //no need to implement handleAdd/delete just use handleQuantity with -1/+1
                    handleAdd={()=>handleQuantity(item.productId,item.qty+1)}
                    handleDelete={()=>handleQuantity(item.productId,item.qty-1)}
                  />

                  )}

                  <Box padding="0.5rem" fontWeight="700">
                    {`$${item.cost}`}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))
        }
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>
        <Divider/>
        {
          isReadOnly ? (
            <GetOrderDetails items={items} />
          ) : (
            <Box display="flex" justifyContent="flex-end" className="cart-footer">
            <Button
              color="primary"
              variant="contained"
              startIcon={<ShoppingCart />}
              className="checkout-btn"
              onClick={()=>{
                history.push("/checkout");
              }}
            >
              Checkout
            </Button>
          </Box>
          )
        }
          
      </Box>
    </>
  );
};

export default Cart;
