"use server";
// Function to fetch products
export const fetchProducts = async () => {
    const res = await fetch("http://localhost:3000/api/products");
    return res.json();
  };
  
  // Function to fetch categories
  export const fetchCategories = async () => {
    const res = await fetch("http://localhost:3000/api/categories");
    return res.json();
  };


  