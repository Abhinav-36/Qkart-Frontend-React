import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  MenuItem
} from "@mui/material";
import { Box } from "@mui/system"; 
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart"
// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 * @property {string} productId - Unique ID for the product
 */


const Products = () => {
  const [productsData,setProductsData] = useState([]);
  const [filterData,setFilterData] = useState([]);
  const [isLoading,setIsLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar();
  const [debounceTime,setDebounceTime] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  
  const [cartItem,setCartItem] = useState([]);

  const username = localStorage.getItem("username")
  const token = localStorage.getItem("token");

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it


  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    let url = `${config.endpoint}/products`;
    setIsLoading(true);
    try {
      let res = await axios.get(url);
      // console.log(res.data);
      // console.log(res.status);
      if(res.status === 200){
        setProductsData(res.data)
        // console.log(productsData);
        setFilterData(res.data)
      }

    } catch (error) {
      if(error.response && error.response.status === 400){
        enqueueSnackbar(error.response.data.message,{variant: "error"});
      }else{
        enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" });
      }
    }finally{
      setIsLoading(false);
    }
    
  };

  useEffect(()=> {
    performAPICall()
  },[]);

  useEffect(() => {
    if (token && productsData.length > 0) {
      fetchCart(token);
    }
  }, [productsData, token]);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */

  const performSearch = async (text) => {
    setIsLoading(true);
    try {
      // console.log(text);
      let response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );

      // console.log(response);
      if(response.status === 200){
        setFilterData(response.data);
      }
    } catch (error) {
      if (error.response) {
        //if product not found, show nothing
        if (error.response.status === 404) {
          setFilterData([]);
          //now since (filteredProduct.length) is zero, hence only no product found will be there :(
        }

        //if server side error, then show full product list
        if (error.response.status === 500) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }finally{
      setIsLoading(false);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    let text = event.target.value;
    
    if(debounceTimeout){
      clearTimeout(debounceTimeout)
    }

    let newTimeout = setTimeout(() => {
      performSearch(text)
    }, 500);
    
    setDebounceTime(newTimeout)

  };

  useEffect(() => {
    let filtered = productsData;

    // Filter by search text (product name or category)
    if (searchText) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (sortBy === "PRICE_HIGH_TO_LOW") {
      filtered = filtered.sort((a, b) => b.cost - a.cost);
    } else if (sortBy === "PRICE_LOW_TO_HIGH") {
      filtered = filtered.sort((a, b) => a.cost - b.cost);
    } else if (sortBy === "RATING") {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    }
    setFilterData(filtered);
  }, [searchText, selectedCategory, sortBy, productsData]);

  // helper: unique categories from fetched products
  const uniqueCategories = [
    ...new Set(productsData.map((product) => product.category)),
  ];







  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;
    let url = `${config.endpoint}/cart`;
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      try {
        let res = await axios.get(`${config.endpoint}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      if(res.status === 200){
        // console.log(productsData);
        setCartItem(generateCartItemsFrom(res.data,productsData));
        // console.log(cartItem);
      }
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // fetchCart(token); testing for fetching

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let len = items.length
    for(let i=0;i<len;i++){
      let searchId = items[i].productId;
      console.log(searchId,productId);
      if(searchId === productId){
        return true;
      }
    }
    return false;

  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty=1,
    options = { preventDuplicate: false }
  ) => {
    if(token){
      // console.log(items,productId);
      if(isItemInCart(items,productId)){
        enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.",{variant: "warning"})
      }else{
        addToCartApiCall(productId,qty)
      }
    }else{
      enqueueSnackbar("Login to add an item to the Cart",{variant: "warning"})
    }
  };

const  addToCartApiCall = async (productId,qty) => {
  let url = `${config.endpoint}/cart`;
  try {
    let res = await axios.post(url,{
      productId: productId,
          qty: qty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );

    if(res.status === 200){
      setCartItem(generateCartItemsFrom(res.data,productsData))
     }
   } catch (error) {
    if (error.response && error.response.status === 400) {
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    } else {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
    }
    return null;
  }
}

const handleCart = (productId)=>{
  addToCart(
    token,
    cartItem,
    productsData,
    productId
  )
}

const handleQuantity = (productId,qty) => {
  addToCartApiCall(productId,qty)
};

  return (
    <div>
      <Header children={<TextField
        className="search-desktop"
        size="small"
        fullWidth
        sx={{ m: 1, width: "50ch" }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {debounceSearch(e,debounceTime)}}
      />} />
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {debounceSearch(e,debounceTime)}}
      />
      <Box className="filter-container" my={2} px={2}>
        <Grid container spacing={1} alignItems="center">
          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              select
              variant="outlined"
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Sort By Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              select
              variant="outlined"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="PRICE_HIGH_TO_LOW">
                Price (highest first)
              </MenuItem>
              <MenuItem value="PRICE_LOW_TO_HIGH">
                Price (lowest first)
              </MenuItem>
              <MenuItem value="RATING">Ratings</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

       <Grid container display="flex" direction="row">
        <Grid item
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          xs
          md>
          <Grid item className="product-grid" >
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
         </Grid>
         {isLoading ? (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              sx={{ margin: "auto" }}
              py={10}
            >
              <CircularProgress size={30} />
              <h4> Loading Products... </h4>
            </Box>
          ) : (
            <Grid
              container
              item
              spacing={2}
              direction="row"
              justifyContent="center"
              alignItems="center"
              my={3}
            >
              {filterData.length > 0 ? (
                filterData.map((product) => (
                  <Grid item key={product["_id"]} xs={6} md={3}>
                    <ProductCard
                      product={product}
                      handleAddToCart = { event => handleCart(product["_id"])}
                      //taking _id from abov
                    />
                    </Grid>
                ))
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  py={10}
                  sx={{ margin: "auto" }}
                >
                  <SentimentDissatisfied size={40} />
                  <h4>No products found</h4>
                </Box>
              )}
            </Grid>
          )}

        </Grid>
        {username && (
          <Grid
            container
            item
            xs={12}
            md={3} //bcz after log out we want our main grid to take whole width
            style={{ backgroundColor: "#E9F5E1", height: "100vh" }}
            justifyContent="center"
            alignItems="stretch"
          >
            {/* cart component */}
            <Cart
              products={productsData}
              items = {cartItem}
              handleQuantity={handleQuantity}
            />
          </Grid>
        )}
         
       </Grid>
      <Footer />
    </div>
  ); 
};
export default Products;
