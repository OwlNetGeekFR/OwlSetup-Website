const demoApps=[
  {id:"chrome",name:"Google Chrome",desc:"Navigateur rapide",logo:"googlechrome.svg",color:"#4285f4"},
  {id:"firefox",name:"Mozilla Firefox",desc:"Navigateur libre",logo:"firefox.svg",color:"#ff7139"},
  {id:"sevenzip",name:"7-Zip",desc:"Compression de fichiers",logo:"sevenzip.svg",color:"#596477"},
  {id:"vlc",name:"VLC media player",desc:"Lecteur multimédia",logo:"vlc.svg",color:"#f08a24"},
  {id:"discord",name:"Discord",desc:"Messages et appels",logo:"discord.svg",color:"#5865f2"},
  {id:"vscode",name:"Visual Studio Code",desc:"Éditeur de code",logo:"vscode.svg",color:"#168bd2"},
  {id:"spotify",name:"Spotify",desc:"Musique et podcasts",logo:"spotify.svg",color:"#1db954"},
  {id:"bitwarden",name:"Bitwarden",desc:"Mots de passe",logo:"bitwarden.svg",color:"#175ddc"},
  {id:"docker",name:"Docker Desktop",desc:"Conteneurs",logo:"docker.svg",color:"#2496ed"}
];
const selected=new Set();
const $=selector=>document.querySelector(selector);

function setupRevealAnimations(){
  const groups=[
    [".stats div",70],
    [".platform-card",120],
    [".feature-grid article",90],
    [".update-cards article",90],
    [".cleanup-demo label",70],
    [".security-points span",70],
    [".faq details",65]
  ];
  document.querySelectorAll(".section-heading,.demo-window,.security-visual,.security>div:last-child,.download-banner,.beta-warning").forEach(element=>element.classList.add("reveal"));
  document.querySelector(".security-visual")?.classList.add("from-left");
  document.querySelector(".security>div:last-child")?.classList.add("from-right");
  groups.forEach(([selector,delay])=>document.querySelectorAll(selector).forEach((element,index)=>{
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay",`${index*delay}ms`);
  }));
  if(!("IntersectionObserver" in window)){
    document.querySelectorAll(".reveal").forEach(element=>element.classList.add("revealed"));
    return;
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    });
  },{threshold:.12,rootMargin:"0px 0px -45px"});
  document.querySelectorAll(".reveal").forEach(element=>observer.observe(element));
}

function animateStats(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  document.querySelectorAll(".stats strong").forEach(element=>{
    const text=element.textContent.trim();
    const match=text.match(/^(\d+)(.*)$/);
    if(!match)return;
    const target=Number(match[1]),suffix=match[2];
    let started=false;
    const observer=new IntersectionObserver(entries=>{
      if(started||!entries[0].isIntersecting)return;
      started=true;observer.disconnect();
      const start=performance.now(),duration=900;
      const frame=now=>{
        const progress=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-progress,3);
        element.textContent=`${Math.round(target*eased)}${suffix}`;
        if(progress<1)requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },{threshold:.5});
    observer.observe(element);
  });
}

function renderSoftware(){
  $("#softwareGrid").innerHTML=demoApps.map(app=>`<button class="software-card ${selected.has(app.id)?"selected":""}" data-demo-app="${app.id}" style="--app:${app.color}"><img src="assets/logos/${app.logo}" alt=""><span><strong>${app.name}</strong><small>${app.desc}</small></span><b>${selected.has(app.id)?"✓":"+"}</b></button>`).join("");
  $("#demoCount").textContent=selected.size;
  $("#dockCount").textContent=selected.size;
  $("#selectionDock").classList.toggle("hidden",selected.size===0);
}

function showPanel(name){
  document.querySelectorAll(".demo-nav").forEach(button=>button.classList.toggle("active",button.dataset.panel===name));
  document.querySelectorAll(".demo-panel").forEach(panel=>panel.classList.toggle("active",panel.id===`panel-${name}`));
}

let demoTimer;
function runSimulation(kind){
  const config={
    install:{icon:"↓",title:"Installation simulée",steps:["Préparation de la sélection","Téléchargement depuis les sources officielles","Installation silencieuse","Vérification finale"]},
    update:{icon:"↥",title:"Mise à jour simulée",steps:["Actualisation du gestionnaire de paquets","Mise à jour des applications","Recherche des mises à jour système","Vérification finale"]},
    cleanup:{icon:"◇",title:"Nettoyage simulé",steps:["Analyse des zones sélectionnées","Suppression des fichiers temporaires","Nettoyage des caches","Calcul de l’espace récupéré"]}
  }[kind];
  clearInterval(demoTimer);
  $("#modalIcon").textContent=config.icon;$("#modalTitle").textContent=config.title;$("#modalDetail").textContent="Préparation...";$("#modalProgress").style.width="0%";$("#modalPercent").textContent="0%";$("#modalFinish").classList.add("hidden");$("#modalClose").disabled=true;$("#demoModal").classList.remove("hidden");
  let step=0;
  const advance=()=>{const percent=Math.min(100,(step+1)*25);$("#modalDetail").textContent=config.steps[step]||"Opération terminée";$("#modalProgress").style.width=`${percent}%`;$("#modalPercent").textContent=`${percent}%`;step++;if(step>=config.steps.length){clearInterval(demoTimer);setTimeout(()=>{$("#modalTitle").textContent="Simulation terminée";$("#modalDetail").textContent=kind==="cleanup"?"2,4 Go pourraient être récupérés sur cet exemple.":"Aucune modification n’a été effectuée sur votre ordinateur.";$("#modalFinish").classList.remove("hidden");$("#modalClose").disabled=false;if(kind==="install"){selected.clear();renderSoftware()}},450)}};
  setTimeout(advance,150);demoTimer=setInterval(advance,650);
}

document.addEventListener("click",event=>{
  const nav=event.target.closest("[data-panel]");if(nav)showPanel(nav.dataset.panel);
  const app=event.target.closest("[data-demo-app]");if(app){selected.has(app.dataset.demoApp)?selected.delete(app.dataset.demoApp):selected.add(app.dataset.demoApp);renderSoftware()}
});
$("#demoInstall").addEventListener("click",()=>runSimulation("install"));
$("#demoUpdate").addEventListener("click",()=>runSimulation("update"));
$("#demoCleanup").addEventListener("click",()=>runSimulation("cleanup"));
$("#modalFinish").addEventListener("click",()=>$("#demoModal").classList.add("hidden"));
$("#modalClose").addEventListener("click",()=>{if(!$("#modalClose").disabled)$("#demoModal").classList.add("hidden")});
renderSoftware();
setupRevealAnimations();
animateStats();

function formatMegabytes(bytes){
  return `${(bytes/1024/1024).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1})} Mo`;
}

async function syncReleaseMetadata(){
  try{
    const response=await fetch("release.json",{cache:"no-store"});
    if(!response.ok)throw new Error(`release.json: ${response.status}`);
    const release=await response.json();
    if(release.schemaVersion!==1||!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(release.version))throw new Error("Métadonnées de version invalides");
    const required=["OwlSetup-Setup.exe","OwlSetup.exe","SHA256.txt"];
    if(required.some(name=>!release.assets?.[name]?.url))throw new Error("Fichiers de Release incomplets");

    document.querySelectorAll("[data-release-version]").forEach(element=>element.textContent=release.version);
    document.querySelectorAll("[data-release-label]").forEach(element=>{
      element.textContent=element.dataset.releaseLabel.replace("{version}",release.version);
    });
    document.querySelectorAll("[data-release-page]").forEach(element=>element.href=release.releaseUrl);
    document.querySelectorAll("[data-release-asset]").forEach(element=>{
      const asset=release.assets[element.dataset.releaseAsset];
      if(asset?.url)element.href=asset.url;
    });

    const published=new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"long",year:"numeric"}).format(new Date(release.publishedAt));
    const installer=release.assets["OwlSetup-Setup.exe"];
    const portable=release.assets["OwlSetup.exe"];
    $("#releaseMeta").textContent=`Publiée le ${published} · Installateur ${formatMegabytes(installer.size)}`;
    $("#portableMeta").textContent=`Aucune installation · ${formatMegabytes(portable.size)}`;

    const hash=installer.sha256;
    if(/^[A-F0-9]{64}$/.test(hash)){
      $("#installerHash").textContent=`${hash.slice(0,8)}…${hash.slice(-8)}`;
      $("#copyInstallerHash").dataset.copyHash=hash;
    }
    document.documentElement.dataset.releaseSync="ok";
  }catch(error){
    console.warn("Synchronisation de la Release indisponible, utilisation des liens de secours.",error);
    document.documentElement.dataset.releaseSync="fallback";
  }
}

syncReleaseMetadata();

const menuToggle=$("#menuToggle");
const mainNav=$("#mainNav");
menuToggle?.addEventListener("click",()=>{
  const open=mainNav.classList.toggle("open");
  menuToggle.classList.toggle("active",open);
  menuToggle.setAttribute("aria-expanded",String(open));
});
mainNav?.addEventListener("click",event=>{
  if(!event.target.closest("a"))return;
  mainNav.classList.remove("open");
  menuToggle?.classList.remove("active");
  menuToggle?.setAttribute("aria-expanded","false");
});

let toastTimer;
document.querySelectorAll("[data-copy-hash]").forEach(button=>button.addEventListener("click",async()=>{
  const hash=button.dataset.copyHash;
  try{
    await navigator.clipboard.writeText(hash);
  }catch{
    const input=document.createElement("textarea");
    input.value=hash;document.body.appendChild(input);input.select();document.execCommand("copy");input.remove();
  }
  const toast=$("#siteToast");
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("visible"),2200);
}));
