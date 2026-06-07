import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.log(`[EMAIL DEV] Para: ${to} | Assunto: ${subject}`);
    console.log(`[EMAIL DEV] HTML: ${html.slice(0, 200)}...`);
    return { id: "dev-mode", success: true };
  }

  try {
    const data = await resend.emails.send({
      from: "StickerShop <pedidos@stickershop.com.br>",
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Enviado para ${to}: ${data.id}`);
    return data;
  } catch (error) {
    console.error("[EMAIL] Erro ao enviar:", error);
    return null;
  }
}

export async function sendOrderConfirmation(
  email: string,
  nome: string,
  pedidoId: string
) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:20px">
      <h1 style="color:#db2777">Pedido Confirmado! 🎉</h1>
      <p>Olá ${nome},</p>
      <p>Seu pedido <strong>#${pedidoId.slice(-8).toUpperCase()}</strong> foi recebido e está sendo processado.</p>
      <p>Acompanhe pelo site: <a href="https://stickershop.com.br/meus-pedidos">Meus Pedidos</a></p>
      <hr />
      <p style="color:#888;font-size:12px">StickerShop — Figurinhas Personalizadas</p>
    </div>`;

  return sendEmail({ to: email, subject: "Pedido Confirmado — StickerShop", html });
}

export async function sendStatusUpdate(
  email: string,
  nome: string,
  pedidoId: string,
  novoStatus: string
) {
  const statusLabels: Record<string, string> = {
    pago: "Pagamento Confirmado ✅",
    em_producao: "Em Produção 🏭",
    enviado: "Pedido Enviado 📦",
    entregue: "Pedido Entregue 🎉",
    cancelado: "Pedido Cancelado",
  };

  const label = statusLabels[novoStatus] || novoStatus;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:20px">
      <h1 style="color:#db2777">Atualização do Pedido</h1>
      <p>Olá ${nome},</p>
      <p>Seu pedido <strong>#${pedidoId.slice(-8).toUpperCase()}</strong> foi atualizado:</p>
      <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
        <p style="font-size:20px;font-weight:bold;color:#db2777">${label}</p>
      </div>
      <p>Acompanhe pelo site: <a href="https://stickershop.com.br/meus-pedidos">Meus Pedidos</a></p>
      <hr />
      <p style="color:#888;font-size:12px">StickerShop — Figurinhas Personalizadas</p>
    </div>`;

  return sendEmail({ to: email, subject: `${label} — StickerShop`, html });
}
