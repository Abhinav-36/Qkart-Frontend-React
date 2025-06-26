import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  const  { name, cost, rating, image, _id, discount } = product;
  return (
    <Card className="card">
      <CardMedia sx={{ height: 200 }} component="img" image={image} alt={name}/>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="h5">${cost}</Typography>
        <Rating name="rating-stars" precision={0.5} value={rating} readOnly></Rating>
      </CardContent>
      <CardActions className="card-actions">
      <Button
          fullWidth
          variant="contained"
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          value={_id}
          startIcon={<AddShoppingCartOutlined />}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
