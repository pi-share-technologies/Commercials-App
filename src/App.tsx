import { useEffect } from "react";
import styled from "styled-components";
import useSocket from "@hooks/useSocket";
import useProductPreloader from "@hooks/useProductPreloader";
import useFieldId from "@hooks/useFieldId";
import MaxWidth from "./styles/responsive";
import WhatsOnLogo from "./assets/WhatsOnLogo.svg";

const AppContainer = styled.main.attrs({
  className: "container",
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  margin: 5rem auto 0;
  font-family: sans-serif;
  max-width: 100%;
  overflow-x: hidden;

  ${MaxWidth.tabletBreakpoint`
    margin: 7rem auto 0;
    gap: 3rem;
  `}
`;

interface ProductItemProps {
  $visible: boolean;
}

const ProductItem = styled.div.attrs({
  className: "ProductItem",
})<ProductItemProps>`
  position: relative;
  background: rgba(255, 255, 255, 0.3);
  padding: 3rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
  width: 100%;
  max-width: 600px;
  height: 800px;

  strong {
    font-size: 40px;
    line-height: 1.3;
    text-shadow: 1px 1px 2px black;
    text-transform: capitalize;
    text-align: center;
    height: 200px !important;
  }
`;

const Title = styled.h1.attrs({
  className: "title",
})`
  margin-bottom: 1rem;
  font-size: 35px;
  text-shadow: 1px 1px 2px black;
  text-align: center;
`;

const SubTitle = styled.p.attrs({
  className: "subtitle",
})`
  font-size: 20px;
`;

const PricingContainer = styled.div.attrs({
  className: "PricingContainer",
})`
  position: absolute;
  bottom: 50px;
  text-align: center;
`;

interface PriceProps {
  $strikethrough?: boolean;
  $membersDiscount?: boolean;
}

const Price = styled.p.attrs({
  className: "price",
})<PriceProps>`
  font-weight: ${({ $membersDiscount }: PriceProps) =>
    $membersDiscount ? "bold" : "normal"};
  color: ${({ $strikethrough, $membersDiscount }: PriceProps) =>
    $strikethrough ? "#ff000a" : $membersDiscount ? "#3bd100" : "white"};
  margin: 0;
  ${({ $strikethrough }: PriceProps) =>
    $strikethrough && "text-decoration: line-through;"}
  font-size: ${({ $membersDiscount }: PriceProps) =>
    $membersDiscount ? "26px" : "22px"};
`;

const ProductImage = styled.img.attrs({
  className: "image",
})`
  max-width: 400px;
  max-height: 400px;
  height: auto;
  border-radius: 4px;
`;

const DescriptionText = styled.p.attrs({
  className: "DescriptionText",
})`
  margin: 1.5rem 0;
  text-align: center;
  height: 10rem;
  @supports (text-wrap: balance) {
    text-wrap: balance;
  }
`;

const SVGContainer = styled.div.attrs({ className: "SVGStyled" })`
  width: 150px;
  position: absolute;
  top: 3rem;
  left: 2rem;
`;

export default function App() {
  const { fieldName, fieldId, resetFieldName, updateFieldId } = useFieldId();
  // Preload products & images once per session for this field
  const { loadedProducts } = useProductPreloader(
    resetFieldName,
    updateFieldId,
    fieldName
  );
  const { activeProduct } = useSocket(loadedProducts, fieldId);
  const { name, price, description, imageBase64 } = activeProduct ?? {};

  const discountPrice = price ? price * 0.9 : 0;
  const memberPrice = price ? price * 0.8 : 0;

  useEffect(() => {
    console.log({ loadedProducts }); /* eslint-disable-line */
  }, [loadedProducts]);

  //? Prevent back button from exiting the app on mobile devices
  useEffect(() => {
    // Add a dummy entry to the history stack
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      // Push the current state back to maintain the app state
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const visible: boolean = !!activeProduct;

  if (!loadedProducts.length) {
    return (
      <AppContainer>
        <Title>Commercials Feed</Title>
        <SubTitle>Loading product catalog…</SubTitle>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <SVGContainer>
        <img src={WhatsOnLogo} alt="WhatsOn" />
      </SVGContainer>
      <Title>Commercials Feed</Title>
      {!visible && <SubTitle>No commercials received yet.</SubTitle>}
      <ProductItem $visible={visible}>
        {visible && (
          <>
            <strong>{name}</strong>
            <ProductImage src={imageBase64} alt={name} />
            <PricingContainer>
              <Price $strikethrough>₪{price?.toFixed(2) ?? 0}</Price>
              <Price>Discount: ₪{discountPrice?.toFixed(2) ?? 0}</Price>
              <Price $membersDiscount>
                Members Discount: ₪{memberPrice?.toFixed(2) ?? 0}
              </Price>
            </PricingContainer>
          </>
        )}
        <DescriptionText>{description}</DescriptionText>
      </ProductItem>
    </AppContainer>
  );
}
