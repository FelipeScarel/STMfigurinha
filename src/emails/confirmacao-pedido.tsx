import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Link,
} from "@react-email/components";
import * as React from "react";

interface ConfirmacaoPedidoProps {
  nome: string;
  pedidoId: string;
  total: string;
  itens: { nome: string; quantidade: number; preco: string }[];
}

export function ConfirmacaoPedidoEmail({
  nome = "Cliente",
  pedidoId = "ABC123",
  total = "R$ 49,90",
  itens = [{ nome: "Figurinha Personalizada", quantidade: 2, preco: "R$ 24,95" }],
}: ConfirmacaoPedidoProps) {
  return (
    <Html>
      <Head />
      <Preview>Seu pedido na StickerShop foi confirmado! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Pedido Confirmado! 🎉</Heading>
          <Text style={text}>Olá {nome},</Text>
          <Text style={text}>
            Seu pedido <strong>#{pedidoId}</strong> foi recebido e está sendo processado.
          </Text>

          <Section style={box}>
            {itens.map((item, i) => (
              <Text key={i} style={itemText}>
                {item.nome} x{item.quantidade} — {item.preco}
              </Text>
            ))}
            <Hr style={hr} />
            <Text style={totalText}>Total: {total}</Text>
          </Section>

          <Text style={text}>
            Acompanhe seu pedido em:{" "}
            <Link href={`https://stickershop.com.br/pedidos/${pedidoId}`}>
              Meus Pedidos
            </Link>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>StickerShop — Figurinhas Personalizadas</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" };
const container = { margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const h1 = { color: "#db2777", fontSize: "24px", fontWeight: "bold" };
const text = { color: "#333", fontSize: "16px", lineHeight: "26px" };
const box = { background: "#f8f8f8", borderRadius: "8px", padding: "16px", margin: "16px 0" };
const itemText = { color: "#555", fontSize: "14px", margin: "4px 0" };
const totalText = { color: "#db2777", fontSize: "18px", fontWeight: "bold" };
const hr = { borderColor: "#e6e6e6", margin: "16px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
