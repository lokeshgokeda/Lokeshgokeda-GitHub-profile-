const GITHUB_USERNAME="lokeshgokeda";
const API="https://api.github.com";
let profile=null,repos=[];
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Number(n||0).toLocaleString();
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__t);window.__t=setTimeout(()=>t.classList.remove("show"),2500)}
function setLinks(url){
  $("githubTop").href=url;$("heroGithub").href=url;$("aboutGithub").href=url;
  $("repoLink").href=url+"?tab=repositories";$("footerGithub").href=url;$("mobileGithub").href=url;
}
async function api(path){
  const r=await fetch(API+path,{headers:{"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2026-03-10"},cache:"no-store"});
  if(!r.ok){let msg=r.statusText;try{msg=(await r.json()).message||msg}catch{}const e=new Error(msg);e.status=r.status;throw e}
  return r.json();
}
function projectCard(r){
  let pages="";
  if(r.has_pages) pages=`https://${GITHUB_USERNAME}.github.io/${encodeURIComponent(r.name)}/`;
  return `<article class="project"><div class="repo-head"><h3><a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a></h3></div><div class="lang">${esc(r.language||"Mixed / not detected")}</div><p>${esc(r.description||"No description provided for this repository.")}</p><div class="meta"><span>★ ${fmt(r.stargazers_count)}</span><span>⑂ ${fmt(r.forks_count)}</span><span>${r.archived?"Archived":"Active"}</span></div><div class="project-actions"><a href="${esc(r.html_url)}" target="_blank" rel="noopener">Repository ↗</a>${pages?`<a class="live" href="${pages}" target="_blank" rel="noopener">Live Page ↗</a>`:""}</div></article>`;
}
function renderRepos(){
  const q=$("search").value.toLowerCase().trim(),sort=$("sort").value;
  let arr=repos.filter(r=>r.name.toLowerCase().includes(q)||String(r.description||"").toLowerCase().includes(q)||String(r.language||"").toLowerCase().includes(q));
  arr.sort((a,b)=>sort==="stars"?b.stargazers_count-a.stargazers_count:sort==="forks"?b.forks_count-a.forks_count:sort==="name"?a.name.localeCompare(b.name):new Date(b.pushed_at||0)-new Date(a.pushed_at||0));
  $("repoCount").textContent=`Showing ${arr.length} of ${repos.length} public repositories`;
  $("projectGrid").innerHTML=arr.map(projectCard).join("");
  $("empty").hidden=arr.length!==0;
}
function renderLanguages(){
  const map={};repos.forEach(r=>{if(r.language)map[r.language]=(map[r.language]||0)+1});
  const list=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8),max=list[0]?.[1]||1;
  $("languages").innerHTML=list.length?list.map(([name,n])=>`<div class="bar-row"><span>${esc(name)}</span><div class="track"><div class="fill" style="width:${n/max*100}%"></div></div><span>${n}</span></div>`).join(""):"<p style='font-size:10px;color:#69758a'>No language data available.</p>";
}
function renderRanking(){
  const list=[...repos].sort((a,b)=>b.stargazers_count-a.stargazers_count).slice(0,6);
  $("topProjects").innerHTML=list.length?list.map((r,i)=>`<div class="rank"><div class="rank-num">${String(i+1).padStart(2,"0")}</div><div class="rank-info"><b>${esc(r.name)}</b><small>${esc(r.language||"Repository")}</small></div><div class="rank-stars">★ ${fmt(r.stargazers_count)}</div></div>`).join(""):"<p style='font-size:10px;color:#69758a'>No repositories.</p>";
}
function render(){
  const u=profile,totalStars=repos.reduce((s,r)=>s+r.stargazers_count,0),totalForks=repos.reduce((s,r)=>s+r.forks_count,0);
  $("avatar").src=u.avatar_url;$("profileName").textContent=u.name||u.login;$("profileLogin").textContent="@"+u.login;
  $("bio").textContent=u.bio||"Developer building practical projects and continuously improving technical skills.";
  $("aboutBio").textContent=u.bio||"I'm a developer who enjoys building practical projects and continuously improving my skills.";
  $("location").textContent=u.location?"📍 "+u.location:"🌐 India";
  $("joined").textContent="Joined "+new Date(u.created_at).toLocaleDateString(undefined,{month:"short",year:"numeric"});
  $("heroRepos").textContent=fmt(u.public_repos);$("heroStars").textContent=fmt(totalStars);$("heroFollowers").textContent=fmt(u.followers);
  $("mRepos").textContent=fmt(u.public_repos);$("mStars").textContent=fmt(totalStars);$("mForks").textContent=fmt(totalForks);$("mFollowers").textContent=fmt(u.followers);
  renderRepos();renderLanguages();renderRanking();
}
async function load(){
  $("retry").hidden=true;$("syncStatus").textContent="Connecting to GitHub…";
  try{
    const [u,r]=await Promise.all([api(`/users/${GITHUB_USERNAME}`),api(`/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`)]);
    profile=u;repos=r;setLinks(u.html_url);render();
    $("syncStatus").textContent="Live · synced with GitHub";
  }catch(e){
    $("syncStatus").textContent=e.status===403||e.status===429?"GitHub API rate limit reached":"GitHub data temporarily unavailable";
    $("retry").hidden=false;
    toast("GitHub data could not be loaded");
  }
}
$("search").addEventListener("input",renderRepos);$("sort").addEventListener("change",renderRepos);
$("retry").onclick=load;
$("menuBtn").onclick=()=>$("mobileMenu").classList.toggle("open");
document.querySelectorAll("#mobileMenu a").forEach(a=>a.onclick=()=>$("mobileMenu").classList.remove("open"));
$("themeBtn").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("lokeshTheme",document.body.classList.contains("light")?"light":"dark");$("themeBtn").textContent=document.body.classList.contains("light")?"☀":"☾"};
if(localStorage.getItem("lokeshTheme")==="light"){document.body.classList.add("light");$("themeBtn").textContent="☀"}
load();
