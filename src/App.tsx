import styled from 'styled-components'
import useSocket from './hooks/useSocket'
import useProductPreloader from './hooks/useProductPreloader'
import useFieldId from './hooks/useFieldId'

const AppContainer = styled.main.attrs({
  className: 'container',
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  margin: 0 auto;
  font-family: sans-serif;
  max-width: 100%;
  overflow-x: hidden;
`

const Title = styled.h1.attrs({
  className: 'title',
})`
  margin-bottom: 1rem;
  font-size: 2rem;
`

interface PriceProps {
  strikethrough?: boolean
  membersdiscount?: boolean
}

const Price = styled.p.attrs({
  className: 'price',
})<PriceProps>`
  font-weight: ${({ membersdiscount }: PriceProps) => (membersdiscount ? 'bold' : 'normal')};
  color: ${({ strikethrough, membersdiscount }: PriceProps) => (strikethrough ? '#ff000a' : membersdiscount ? '#3bd100' :  'white')};
  margin:  0;
  ${({ strikethrough }: PriceProps) => strikethrough && 'text-decoration: line-through;'}
  font-size: ${({ membersdiscount }: PriceProps) => (membersdiscount ? '22px' : '18px')};
`

const ProductImage = styled.img.attrs({
  className: 'image',
})`
  max-width: 400px;
  max-height: 400px;
  height: auto;
  border-radius: 4px;
`

interface ProductItemProps {
  visible: boolean
}

const ProductItem = styled.li.attrs({className: "ProductItem"})<ProductItemProps>`
  background: rgba(255, 255, 255, 0.3);
  margin-bottom: 0.75rem;
  padding: 3rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
  width: 100%;
  max-width: 600px;
  height: 800px;

  strong {
    font-size: 3.5rem;
    text-shadow: 1px 1px 20px rgba(255, 255, 255, 0.5);
    text-transform: capitalize;
    margin: 0 auto 1rem;
    text-align: center;
    height: 250px !important;
  }
`

const DescriptionText = styled.p.attrs({
  className: 'DescriptionText',
})`
  margin: 1.5rem 0;
  text-align: center;
  text-wrap: balance;
  height: 10rem;
`

function App() {
    const fieldId = useFieldId()
    // Preload products & images once per session for this field
    const { ready } = useProductPreloader(fieldId)
    const {product} = useSocket()
    const {name, price, discountPrice, memberPrice, description, image} = product ?? {}
    console.log({product})

    const visible: boolean = !!product

  if (!ready) {
    return (
      <AppContainer>
        <Title>Commercials Feed</Title>
        <p>Loading product catalog…</p>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <Title>Commercials Feed</Title>
      {!visible && <p>No commercials received yet.</p>}
      <ProductItem visible={visible} 
      >
          {visible && 
          <>
          <strong>{name}</strong>
          <Price strikethrough>₪{price?.toFixed(2) ?? 0}</Price>
          <Price>Discount: ₪{discountPrice?.toFixed(2) ?? 0}</Price>
          <Price membersdiscount>Members Discount: ₪{memberPrice?.toFixed(2) ?? 0}</Price>
          </>
          }
          <DescriptionText>{description}</DescriptionText>
          <ProductImage src={image} alt={name} />
      </ProductItem>
    </AppContainer>
  );
}

export default App
