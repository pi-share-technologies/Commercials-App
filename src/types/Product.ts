interface Product {
    id: number
    name: string
    label: string
    barcode?: string
    price: number
    discountPrice: number
    memberPrice: number
    description: string
    image: string // Used in the test routes
    imageFileName?: string // Used in the production routes
    imageFileId?: string // Used in the production routes
  }

export default Product
