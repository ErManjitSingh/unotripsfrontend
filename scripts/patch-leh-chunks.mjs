import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function patchDir(metaDir) {
  const chunksDir = join(root, "meta", metaDir, "_next", "static", "chunks");
  const backupDir = join(root, "meta", metaDir, "_next_restore", "_next", "static", "chunks");
  const files = ["0r7~nbls8q_4w.js", "01b7hp~g0i3p1.js"];

  for (const file of files) {
    const backup = join(backupDir, file);
    const target = join(chunksDir, file);
    const source = existsSync(backup) ? backup : target;
    let text = readFileSync(source, "utf8");

    text = text.replaceAll("https://formsubmit.co/ajax/unotripsit@gmail.com", "./send_lead.php");

    if (file === "0r7~nbls8q_4w.js") {
      const oldCb =
        'try{fetch("./send_lead.php",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({_subject:"New Callback Request - Ladakh Landing",_captcha:"false",source:"Callback Modal",phone:`+91${r}`,message:`Callback request from landing page.\nPhone: +91${r}`})}).catch(()=>{}),w(),window.location.assign("./thank-you.html")}finally{m(!1)}';
      const newCb =
        'try{const t=await fetch("./send_lead.php",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({_subject:"New Callback Request - Ladakh Landing",source:"Callback Modal",phone:`+91${r}`,message:`Callback request from landing page.\nPhone: +91${r}`})});if(!t.ok)throw new Error("x");w(),window.location.assign("./thank-you.html")}catch(e){p("Could not send. Please call us or try WhatsApp.")}finally{m(!1)}';
      if (text.includes(oldCb)) text = text.replace(oldCb, newCb);
    }

    writeFileSync(target, text, "utf8");
    console.log("patched", metaDir + "/" + file);
  }
}

for (const dir of ["leh_tour_package", "leh"]) patchDir(dir);
