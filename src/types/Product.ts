interface Product {
    id: number
    name: string
    label: string
    price: number
    discountPrice: number
    memberPrice: number
    description: string
    image: string // Used in the test routes
    imageFileName?: string // Used in the production routes
  }

export default Product
