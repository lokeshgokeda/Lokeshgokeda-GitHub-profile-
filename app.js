const GITHUB_USERNAME = "lokeshgokeda";
const API = "https://api.github.com";
let profile = null, repos = [];

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
const fmt = n => Number(n || 0).toLocaleString();

function toast(msg){
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(window.__toast); window.__toast = setTimeout(() => t.classList.remove("show"), 2500);
}

async function api(path){
  const r = await fetch(API + path, {
    headers: {"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},
    cache: "no-store"
  });
  if(!r.ok){
    let msg = r.statusText;
    try { msg = (await r.json()).message || msg; } catch {}
    const e = new Error(msg); e.status = r.status; throw e;
  }
  return r.json();
}

function setProfileLinks(){
  const url = `https://github.com/${GITHUB_USERNAME}`;
  ["githubTop","heroGithub","aboutGithub","footerGithub","mobileGithub"].forEach(id => {
    if($(id)) $(id).href = url;
  });
  if($("repoLink")) $("repoLink").href = url + "?tab=repositories";
}

function projectCard(r){
  let pages = "";
  if(r.has_pages) pages = `https://${GITHUB_USERNAME}.github.io/${encodeURIComponent(r.name)}/`;
  return `<article class="project">
    <div class="repo-head"><h3><a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a></h3></div>
    <div class="lang">${esc(r.language || "Mixed / not detected")}</div>
    <p>${esc(r.description || "No description provided for this repository.")}</p>
    <div class="meta"><span>★ ${fmt(r.stargazers_count)}</span><span>⑂ ${fmt(r.forks_count)}</span><span>${r.archived ? "Archived" : "Active"}</span></div>
    <div class="project-actions"><a href="${esc(r.html_url)}" target="_blank" rel="noopener">Repository ↗</a>${pages ? `<a class="live" href="${pages}" target="_blank" rel="noopener">Live Page ↗</a>` : ""}</div>
  </article>`;
}

function renderRepos(){
  const q = $("search").value.toLowerCase().trim(), sort = $("sort").value;
  let arr = repos.filter(r =>
    r.name.toLowerCase().includes(q) ||
    String(r.description || "").toLowerCase().includes(q) ||
    String(r.language || "").toLowerCase().includes(q)
  );
  arr.sort((a,b) => sort==="stars" ? b.stargazers_count-a.stargazers_count :
    sort==="forks" ? b.forks_count-a.forks_count :
    sort==="name" ? a.name.localeCompare(b.name) :
    new Date(b.pushed_at||0)-new Date(a.pushed_at||0));

  $("repoCount").textContent = `${arr.length} project${arr.length===1?"":"s"} shown`;
  $("projectGrid").innerHTML = arr.length ? arr.map(projectCard).join("") : "";
  $("empty").hidden = arr.length !== 0;
}

function renderAnalytics(){
  const stars = repos.reduce((s,r)=>s+(r.stargazers_count||0),0);
  const forks = repos.reduce((s,r)=>s+(r.forks_count||0),0);
  const languages = {};
  repos.forEach(r => { if(r.language) languages[r.language] = (languages[r.language]||0)+1; });

  $("mRepos").textContent = fmt(profile?.public_repos ?? repos.length);
  $("mStars").textContent = fmt(stars);
  $("mForks").textContent = fmt(forks);
  $("mFollowers").textContent = fmt(profile?.followers);
  $("heroRepos").textContent = fmt(profile?.public_repos);
  $("heroStars").textContent = fmt(stars);
  $("heroFollowers").textContent = fmt(profile?.followers);

  const total = Object.values(languages).reduce((a,b)=>a+b,0)||1;
  $("languages").innerHTML = Object.entries(languages)
    .sort((a,b)=>b[1]-a[1]).slice(0,8)
    .map(([name,count])=>`<div class="bar"><div><span>${esc(name)}</span><b>${Math.round(count/total*100)}%</b></div><i style="width:${Math.max(5, count/total*100)}%"></i></div>`).join("");

  $("topProjects").innerHTML = [...repos].sort((a,b)=>b.stargazers_count-a.stargazers_count).slice(0,5)
    .map((r,i)=>`<a class="rank" href="${esc(r.html_url)}" target="_blank" rel="noopener"><span>#${i+1}</span><strong>${esc(r.name)}</strong><em>★ ${fmt(r.stargazers_count)}</em></a>`).join("");
}

async function load(){
  $("retry").hidden = true;
  $("syncStatus").textContent = "Connecting to GitHub…";
  try{
    profile = await api(`/users/${GITHUB_USERNAME}`);
    repos = await api(`/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
    $("avatar").src = profile.avatar_url || `https://github.com/${GITHUB_USERNAME}.png?size=240`;
    $("profileName").textContent = profile.name || "Lokesh Gokeda";
    $("profileLogin").textContent = `@${profile.login}`;
    $("bio").textContent = profile.bio || "Aspiring software developer focused on learning, building and improving.";
    $("aboutBio").textContent = profile.bio || "I'm focused on learning software development, building practical projects and continuously improving my problem-solving skills.";
    $("location").textContent = profile.location ? `📍 ${profile.location}` : "🌐 India";
    $("joined").textContent = `Joined ${new Date(profile.created_at).getFullYear()}`;
    renderRepos(); renderAnalytics();
    $("syncStatus").textContent = `Synced with GitHub · ${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`;
  }catch(err){
    console.error(err);
    $("syncStatus").textContent = `GitHub sync failed: ${err.message}`;
    $("retry").hidden = false;
    toast("Could not load GitHub data.");
  }
}

$("search").addEventListener("input", renderRepos);
$("sort").addEventListener("change", renderRepos);
$("retry").addEventListener("click", load);
$("menuBtn").addEventListener("click", () => $("mobileMenu").classList.toggle("open"));
document.querySelectorAll(".mobile-menu a").forEach(a => a.addEventListener("click", () => $("mobileMenu").classList.remove("open")));

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  $("themeBtn").textContent = light ? "☀" : "☾";
  localStorage.setItem("portfolio-theme", light ? "light" : "dark");
});
if(localStorage.getItem("portfolio-theme")==="light"){
  document.body.classList.add("light"); $("themeBtn").textContent = "☀";
}

setProfileLinks();
load();