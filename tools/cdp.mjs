/* Başsız Chrome'u DevTools protokolüyle sürmek için küçük yardımcı (bağımlılık yok, Node 22).
   Neden: `--dump-dom` sayfa yüklenince çıktı verir, zamanla çalışan testleri (animasyon, bekleme) ve belli anlardaki ekran görüntülerini alamaz.
   Kullanım:
     import { launch } from './cdp.mjs';
     const b = await launch({ width: 390, height: 844, dpr: 2, dark: false, reduceMotion: false, lang: 'tr-TR', seed: 'localStorage.setItem(...)' });
     await b.goto('file:///.../www/index.html');          // seed, sayfa betiklerinden önce çalışır
     const v = await b.eval('1 + 1');                      // await'li ifade de olur
     await b.shot('/tmp/a.png');                           // ekran görüntüsü (css px × dpr)
     await b.close();
   Chrome yolu CHROME ortam değişkeniyle verilebilir. */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

export const launch = async (o = {}) => {
  const { width = 390, height = 844, dpr = 2, dark = false, reduceMotion = false, lang = '', seed = '', flags = [], gpu = false } = o;
  const prof = mkdtempSync(join(tmpdir(), 'kp-cdp-'));
  const port = 9300 + Math.floor(Math.random() * 600);
  const proc = spawn(CHROME, ['--headless=new', ...(gpu ? [] : ['--disable-gpu']), '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=' + port, '--user-data-dir=' + prof, '--window-size=' + Math.max(width, 520) + ',' + (height + 120), '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', ...flags, 'about:blank'], { stdio: 'ignore' });
  let page = null;
  for (let i = 0; i < 240 && !page; i++) {
    try { const list = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); page = list.find(t => t.type === 'page'); } catch (e) { /* henüz açılmadı */ }
    if (!page) await sleep(150);
  }
  if (!page) { proc.kill(); throw new Error('Chrome açılmadı'); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  let id = 0;
  const pending = new Map();
  const logs = [], listeners = {};
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.method && listeners[m.method]) listeners[m.method].forEach(f => f(m.params));
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') logs.push('İSTİSNA ' + (m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text));
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('console.error ' + m.params.args.map(a => a.value || a.description).join(' '));
  });
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduceMotion ? 'reduce' : 'no-preference' }, { name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
  if (lang) await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36', acceptLanguage: lang, platform: 'Android' });
  const langScript = lang ? 'Object.defineProperty(navigator,"language",{get:function(){return ' + JSON.stringify(lang) + '}});Object.defineProperty(navigator,"languages",{get:function(){return [' + JSON.stringify(lang) + ']}});' : '';
  await send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{' + langScript + seed + '}catch(e){}' });
  const api = {
    logs,
    send,
    on: (method, fn) => { (listeners[method] = listeners[method] || []).push(fn); },
    goto: async url => { await send('Page.navigate', { url }); await sleep(700); },
    eval: async (expr, opt = {}) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: opt.timeout || 60000 });
      if (r.result && r.result.exceptionDetails) throw new Error('eval hatası: ' + (r.result.exceptionDetails.exception ? r.result.exceptionDetails.exception.description : r.result.exceptionDetails.text));
      return r.result && r.result.result ? r.result.result.value : undefined;
    },
    shot: async file => {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(file, Buffer.from(r.result.data, 'base64'));
      return file;
    },
    sleep,
    close: async () => { try { ws.close(); } catch (e) { /* kapalı */ } proc.kill('SIGKILL'); await sleep(150); rmSync(prof, { recursive: true, force: true }); }
  };
  return api;
};
