import styled from 'styled-components'
import useSocket from './hooks/useSocket'

const AppContainer = styled.main.attrs({
  className: 'container',
})`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  membersDiscount?: boolean
}

const Price = styled.p.attrs({
  className: 'price',
})<PriceProps>`
  font-weight: ${({ membersDiscount }: PriceProps) => (membersDiscount ? 'bold' : 'normal')};
  color: ${({ strikethrough, membersDiscount }: PriceProps) => (strikethrough ? '#ff000a' : membersDiscount ? '#3bd100' :  'white')};
  margin:  0;
  ${({ strikethrough }: PriceProps) => strikethrough && 'text-decoration: line-through;'}
  font-size: ${({ membersDiscount }: PriceProps) => (membersDiscount ? '22px' : '18px')};
`

const ProductImage = styled.img.attrs({
  className: 'image',
})`
  max-width: 400px;
  height: auto;
  border-radius: 4px;
`

interface ProductItemProps {
  visible: boolean
}

const ProductItem = styled.li.attrs({className: "ProductItem"})<ProductItemProps>`
  background: rgba(255, 255, 255, 0.3);
  margin-bottom: 0.75rem;
  padding: 1.5rem;
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
    font-size: 3rem;
    text-shadow: 1px 1px 20px rgba(255, 255, 255, 0.5);
    text-transform: capitalize;
    margin-bottom: 1rem;
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
    const {commercial} = useSocket()
    const {name, price, discountPrice, memberPrice, description, image} = commercial ?? {}

  return (
    <AppContainer>
      <Title>Commercials Feed</Title>
      {!commercial && <p>No commercials received yet.</p>}
        {/* {commercial && ( */}
      <ProductItem visible={!!commercial} >
          <strong>{name}</strong>
          { !!commercial && 
          <>
          <Price strikethrough>₪{price?.toFixed(2) ?? 0}</Price>
          <Price>Discount: ₪{discountPrice?.toFixed(2) ?? 0}</Price>
          <Price membersDiscount>Members Discount: ₪{memberPrice?.toFixed(2) ?? 0}</Price>
          </>
          }
          <DescriptionText>{description}</DescriptionText>
          <ProductImage src={image} alt={name} />
      </ProductItem>
    </AppContainer>
  );
}

export default App
