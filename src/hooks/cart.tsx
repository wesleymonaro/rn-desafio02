import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // DONE LOAD PRODUCTS FROM ASYNC STORAGE
      const products = await AsyncStorage.getItem('@GoMarketplace:products');
      if (products) {
        setProducts([...JSON.parse(products)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TRYOUT ADD A NEW PRODUCT TO THE CART, IF IT ALREADY EXISTS INCREMENT QUANTITY
      const productExists = products.find(item => item.id === product.id);
      if (productExists) {
        setProducts(
          products.map(item =>
            item.id === product.id
              ? { ...product, quantity: productExists.quantity + 1 }
              : item,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // DONE INCREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(
        products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity + 1 }
            : product,
        ),
      );
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // DONE DECREMENTS A PRODUCT QUANTITY IN THE CART ONLY IF ABOVE 0
      const productExists = products.find(item => item.id === id);
      if (productExists && productExists.quantity <= 0) {
        await AsyncStorage.removeItem(productExists.id);
        return;
      }
      // DONE DECREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(
        products
          .map(product =>
            product.id === id
              ? { ...product, quantity: product.quantity - 1 }
              : product,
          )
          // DONE REMOVE IF QUANTITY EQUAL 0
          .filter(product => product.quantity > 0),
      );
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
