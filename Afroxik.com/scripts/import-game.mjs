// Nakopíruje webový export hry z Godotu do public/play/, odkud ho servíruje tento web na /play/.
// Použití: node Afroxik.com/scripts/import-game.mjs <složka s exportem> [titulek stránky]
//
// Cloudflare bere soubory do 25 MiB a index.wasm z Godotu má přes 35 MB. Proto se index.wasm a index.pck
// zabalí gzipem a do index.html se vloží skript, který je v prohlížeči rozbalí dřív, než si je Godot načte.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { constants, gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const MAX_ASSET = 25 * 1024 * 1024;
const PACKED = ["index.wasm", "index.pck"];
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
const escapeHtml = (text) => text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

async function main([source, title]) {
  if (!source) throw new Error('Použití: node Afroxik.com/scripts/import-game.mjs <složka s exportem> ["Titulek stránky"]');
  const target = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/play");

  for (const name of ["index.html", "index.js", ...PACKED]) {
    await fs.access(path.join(source, name)).catch(() => {
      throw new Error(`V ${source} chybí ${name}. Je to webový export z Godotu uložený jako index.html?`);
    });
  }

  let html = await fs.readFile(path.join(source, "index.html"), "utf8");
  if (/GODOT_THREADS_ENABLED\s*=\s*true/.test(html)) {
    throw new Error("Export má zapnutý Thread Support. Ten potřebuje hlavičky COOP/COEP, které web neposílá. Vypni ho a exportuj znovu.");
  }
  const anchor = '<script src="index.js"></script>';
  if (!html.includes(anchor)) throw new Error(`index.html neobsahuje ${anchor}. Změnila se šablona Godotu?`);

  // Původní název -> název na serveru. Verze v adrese zaručí, že se wasm a pck nikdy nesejdou ze dvou různých verzí.
  const packed = {};
  const output = [];
  for (const name of PACKED) {
    const data = await fs.readFile(path.join(source, name));
    const gz = gzipSync(data, { level: constants.Z_BEST_COMPRESSION });
    if (gz.length > MAX_ASSET) throw new Error(`${name}.gz má ${mb(gz.length)}, Cloudflare bere nejvíc 25 MiB. Hra se musí zmenšit.`);
    const version = createHash("sha1").update(gz).digest("hex").slice(0, 8);
    packed[name] = `${name}.gz?v=${version}`;
    output.push([`${name}.gz`, gz]);
    console.log(`${name.padEnd(10)} ${mb(data.length)} -> ${mb(gz.length)}`);
  }

  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
  for (const [name, gz] of output) await fs.writeFile(path.join(target, name), gz);
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name === "index.html" || PACKED.includes(entry.name)) continue;
    await fs.copyFile(path.join(source, entry.name), path.join(target, entry.name));
  }

  if (title) html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`);
  html = html.replace(anchor, () => `${loader(packed)}\n\t\t${anchor}`);
  await fs.writeFile(path.join(target, "index.html"), html);
  console.log(`Hotovo: ${target}`);
}

// Skript pro index.html. Godot si říká o index.wasm a index.pck přes globální fetch, tady dostane rozbalený proud.
// data-cfasync="false" ho drží mimo Rocket Loader, kdyby byl na Cloudflare zapnutý.
function loader(files) {
  return `<script data-cfasync="false">
// Soubory hry jsou na serveru zabalené gzipem (limit 25 MiB na soubor); tady je prohlížeč rozbalí pro Godot.
(function () {
	var packed = ${JSON.stringify(files)};
	var magic = { ".wasm": [0x00, 0x61, 0x73, 0x6d], ".pck": [0x47, 0x44, 0x50, 0x43] };
	var realFetch = window.fetch.bind(window);

	function startsWith(bytes, prefix) {
		for (var i = 0; i < prefix.length; i++) if (bytes[i] !== prefix[i]) return false;
		return true;
	}

	// Přečte začátek odpovědi (aspoň 4 bajty) a vrátí ho spolu s proudem, který jím zase začíná.
	async function peek(body) {
		var reader = body.getReader();
		var chunks = [];
		var length = 0;
		var done = false;
		while (length < 4 && !done) {
			var result = await reader.read();
			done = result.done;
			if (result.value && result.value.length) {
				chunks.push(result.value);
				length += result.value.length;
			}
		}
		var head = new Uint8Array(length);
		var offset = 0;
		chunks.forEach(function (chunk) {
			head.set(chunk, offset);
			offset += chunk.length;
		});
		var stream = new ReadableStream({
			start: function (controller) {
				if (head.length) controller.enqueue(head);
				if (done) controller.close();
			},
			pull: function (controller) {
				return reader.read().then(function (chunk) {
					if (chunk.done) controller.close();
					else controller.enqueue(chunk.value);
				});
			},
			cancel: function () {
				return reader.cancel();
			},
		});
		return { head: head, stream: stream, reader: reader };
	}

	window.fetch = async function (input, init) {
		var url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
		var base = url.split("?")[0].split("#")[0];
		var name = base.split("/").pop();
		if (!Object.prototype.hasOwnProperty.call(packed, name)) return realFetch(input, init);
		if (typeof DecompressionStream === "undefined") {
			throw new Error("This browser cannot unpack the game files. Please use Chrome/Edge 80+, Firefox 113+ or Safari 16.4+.");
		}
		var target = base.slice(0, base.length - name.length) + packed[name];
		var ext = name.slice(name.lastIndexOf("."));
		var headers = { "content-type": ext === ".wasm" ? "application/wasm" : "application/octet-stream" };
		// Když nepřijde gzip ani samotný soubor (třeba HTML úvodní stránky místo chybějícího souboru), zkusí se to
		// ještě jednou mimo cache prohlížeče. Rozhoduje obsah, ne hlavičky.
		for (var attempt = 0; attempt < 2; attempt++) {
			var res = await realFetch(target, attempt === 0 ? init : Object.assign({}, init, { cache: "reload" }));
			if (!res.ok || !res.body) return res;
			var peeked = await peek(res.body);
			if (startsWith(peeked.head, [0x1f, 0x8b])) {
				var inflated = peeked.stream.pipeThrough(new DecompressionStream("gzip"));
				return new Response(inflated, { status: res.status, statusText: res.statusText, headers: headers });
			}
			// Server nebo CDN už soubor rozbalil sám.
			if (startsWith(peeked.head, magic[ext])) {
				return new Response(peeked.stream, { status: res.status, statusText: res.statusText, headers: headers });
			}
			peeked.reader.cancel();
		}
		throw new Error("Game file " + name + " is damaged or missing on the server.");
	};

	// Chyby při načítání Godot často jen tiše spolkne a ukazatel zůstane stát. Dokud běží načítání, ukáže se hláška.
	window.addEventListener("unhandledrejection", function (event) {
		var overlay = document.getElementById("status");
		var notice = document.getElementById("status-notice");
		var progress = document.getElementById("status-progress");
		if (!overlay || !notice) return;
		var reason = event.reason;
		notice.textContent = reason && reason.message ? reason.message : String(reason);
		notice.style.display = "block";
		if (progress) progress.style.display = "none";
		overlay.style.visibility = "visible";
	});
})();
</script>`;
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
