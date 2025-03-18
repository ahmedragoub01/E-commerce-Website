import { useEffect, useReducer } from "react";

interface Product {
  id: number;
  name: string;
  isAuction: boolean;
}

interface State {
  products: Product[];
  categories: string[];
  loading: boolean;
}

interface Action {
  type: string;
  payload?: any;
}

const initialState: State = {
  products: [],
  categories: [],
  loading: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PRODUCTS":
      return { ...state, products: action.payload, loading: false };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    default:
      return state;
  }
        // Removed misplaced dispatch call
  }
  
export default function useProductFetch() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);

        dispatch({ type: "SET_PRODUCTS", payload: productsData.filter((product: Product) => !product.isAuction) });
        dispatch({ type: "SET_CATEGORIES", payload: categoriesData });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return state;
}