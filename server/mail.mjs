import net from 'node:net';
import tls from 'node:tls';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const envDir = fileURLToPath(new URL('..', import.meta.url));
for (const name of ['.env', '.env.smtp.local', '.env.local']) {
  const file = resolve(envDir, name);
  if (existsSync(file)) process.loadEnvFile(file);
}

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function addressOnly(value) {
  const match = String(value || '').match(/<([^>]+)>/);
  return (match ? match[1] : String(value || '')).trim();
}

function encodeHeader(value) {
  const text = String(value || '');
  return /^[\x20-\x7e]*$/.test(text) ? text : '=?UTF-8?B?' + Buffer.from(text, 'utf8').toString('base64') + '?=';
}

function readReply(socket) {
  return new Promise((resolvePromise, reject) => {
    let buf = '';
    const timer = setTimeout(() => finish(Object.assign(new Error('Tempo esgotado ao falar com o servidor de e-mail.'), {status:504})), 20000);
    function onData(chunk) {
      buf += chunk.toString('utf8');
      if (!buf.endsWith('\n')) return;
      const lines = buf.split(/\r?\n/).filter(Boolean);
      const last = lines.at(-1) || '';
      if (last.length < 4 || last[3] === '-' || !/^\d{3} /.test(last)) return;
      finish(null, {code: Number(last.slice(0, 3)), text: lines.join('\n')});
    }
    function onError(error) { finish(Object.assign(new Error('Falha de conexão com o servidor de e-mail.'), {status:503, cause:error})); }
    function finish(error, value) {
      clearTimeout(timer);
      socket.off('data', onData);
      socket.off('error', onError);
      if (error) reject(error); else resolvePromise(value);
    }
    socket.on('data', onData);
    socket.on('error', onError);
  });
}

async function exchange(socket, line, accept) {
  const pending = readReply(socket);
  socket.write(line + "\r\n");
  const reply = await pending;
  if (!accept(reply.code)) throw Object.assign(new Error("O servidor de e-mail recusou o envio."), {status:503, smtpCode:reply.code, smtpReply:reply.text});
  return reply;
}

async function command(socket, line) {
  return exchange(socket, line, code => code < 400);
}

function authFailure(reply) {
  const text = String(reply || '').replace(/\s+/g, ' ').slice(0, 280);
  const needsAppPassword = /application-specific password|InvalidSecondFactor|5\.7\.9|WebLoginRequired|5\.7\.14|BadCredentials/i.test(text);
  const message = needsAppPassword
    ? 'O Gmail recusou a senha da conta. Ative a verificação em duas etapas em https://myaccount.google.com/signinoptions/two-step-verification e crie uma senha de app em https://myaccount.google.com/apppasswords. Coloque essa senha de app em SMTP_PASS no arquivo .env.local (não use a senha normal).'
    : 'O Gmail recusou o login SMTP. Se a verificação em duas etapas estiver ativa, gere uma senha de app em https://myaccount.google.com/apppasswords e use-a em SMTP_PASS.';
  return Object.assign(new Error(message), {status:503, smtpCode:reply?.code, smtpReply:text});
}

async function openSmtp() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const socket = net.connect({host, port});
  try {
    await new Promise((resolvePromise, reject) => {
      socket.once('connect', resolvePromise);
      socket.once('error', () => reject(Object.assign(new Error('Não foi possível conectar ao servidor SMTP.'), {status:503})));
    });
    const greeting = await readReply(socket);
    if (greeting.code !== 220) throw Object.assign(new Error('Servidor SMTP indisponível.'), {status:503, smtpReply:greeting.text});
    await command(socket, 'EHLO fcclubs.local');
    await command(socket, 'STARTTLS');
    const secure = tls.connect({socket, servername:host});
    await new Promise((resolvePromise, reject) => {
      secure.once('secureConnect', resolvePromise);
      secure.once('error', () => reject(Object.assign(new Error('Falha ao iniciar TLS com o servidor SMTP.'), {status:503})));
    });
    await command(secure, 'EHLO fcclubs.local');
    return secure;
  } catch (error) {
    socket.destroy();
    throw error;
  }
}

async function authenticate(socket) {
  try {
    await exchange(socket, "AUTH LOGIN", code => code === 334);
    await exchange(socket, Buffer.from(process.env.SMTP_USER, "utf8").toString("base64"), code => code === 334);
    await exchange(socket, Buffer.from(process.env.SMTP_PASS, "utf8").toString("base64"), code => code === 235);
  } catch (error) {
    if (error.smtpCode === 535 || error.smtpCode === 534 || /5\.7\./.test(error.smtpReply || "")) throw authFailure(error.smtpReply || error.message);
    throw error;
  }
}

export async function verifySmtpLogin() {
  if (!mailConfigured()) throw Object.assign(new Error('E-mail não configurado.'), {status:503});
  const socket = await openSmtp();
  try {
    await authenticate(socket);
    await command(socket, 'QUIT');
  } finally {
    socket.destroy();
  }
  return {ok:true};
}

export async function sendMail({to, subject, text}) {
  if (!mailConfigured()) throw Object.assign(new Error('E-mail não configurado. Defina SMTP_HOST, SMTP_USER e SMTP_PASS em .env.local.'), {status:503});
  const recipient = String(to || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw Object.assign(new Error('Destinatário de e-mail inválido.'), {status:400});
  const from = addressOnly(process.env.SMTP_FROM || process.env.SMTP_USER);
  const body = String(text || '').replace(/\r?\n/g, '\r\n').split('\r\n').map(line => line.startsWith('.') ? '.' + line : line).join('\r\n');
  const message = [
    'From: ' + (process.env.SMTP_FROM || from),
    'To: ' + recipient,
    'Subject: ' + encodeHeader(subject || 'FC Clubs'),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n');
  const socket = await openSmtp();
  try {
    await authenticate(socket);
    await command(socket, 'MAIL FROM:<' + from + '>');
    await command(socket, 'RCPT TO:<' + recipient + '>');
    await command(socket, 'DATA');
    const pending = readReply(socket);
    socket.write(message + '\r\n.\r\n');
    const accepted = await pending;
    if (accepted.code >= 400) throw Object.assign(new Error('O servidor de e-mail não aceitou a mensagem.'), {status:503, smtpCode:accepted.code, smtpReply:accepted.text});
    await command(socket, 'QUIT');
  } catch (error) {
    if (error.smtpCode === 535 || error.smtpCode === 534) throw authFailure(error.smtpReply || '');
    throw error;
  } finally {
    socket.destroy();
  }
  return {ok:true};
}
