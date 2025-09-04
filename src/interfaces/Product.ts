export default interface Product {
  _id: string;
  name: string;
  barcode: string;
  price: number;
  discountPrice: number;
  memberPrice: number;
  description: string;
  imageBase64: string;
}
