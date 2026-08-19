const GITHUB_USERNAME="lokeshgokeda";
const API="https://api.github.com";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function fmt(n){return Number(n||0).toLocaleString()}
function setLinks(url){
  $("topGithub").href=url;$("profileBtn").href=url;$("allRepos").href=url+"?tab=repositories";
  $("aboutGithub").href=url;$("footerGithub").href=url;
}
async function api(path){
  const r=await fetch(API+path,{headers:{"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2026-03-10"},cache:"no-store"});
  if(!r.ok){let m=r.statusText;try{m=(await r.json()).message||m}catch{}throw new Error(m)}
  return r.json();
}
function repoCard(r){
  const pages=r.has_pages?`https://${GITHUB_USERNAME}.github.io/${encodeURIComponent(r.name)}/`:null;
  const live=pages?`<a class="live" href="${pages}" target="_blank" rel="noopener">Live Page ↗</a>`:"";
  return `<article class="project">
    <div class="repo-head"><h3><a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a></h3></div>
    <div class="lang">${esc(r.language||"Mixed / not detected")}</div>
    <p>${esc(r.description||"No description available for this repository.")}</p>
    <div class="meta"><span>★ ${fmt(r.stargazers_count)}</span><span>⑂ ${fmt(r.forks_count)}</span><span>${r.archived?"Archived":"Active"}</span></div>
    <div class="project-actions"><a href="${esc(r.html_url)}" target="_blank" rel="noopener">Repository ↗</a>${live}</div>
  </article>`;
}
function renderLanguages(repos){
  const map={};repos.forEach(r=>{if(r.language)map[r.language]=(map[r.language]||0)+1});
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const max=entries[0]?.[1]||1;
  $("languages").innerHTML=entries.length?entries.map(([name,n])=>`<div class="bar-row"><span>${esc(name)}</span><div class="track"><div class="fill" style="width:${n/max*100}%"></div></div><span>${n}</span></div>`).join(""):"<p style='font-size:10px;color:#69758a'>No language data.</p>";
}
function renderTop(repos){
  const top=[...repos].sort((a,b)=>b.stargazers_count-a.stargazers_count).slice(0,6);
  $("topProjects").innerHTML=top.length?top.map((r,i)=>`<div class="rank"><div class="rank-num">0${i+1}</div><div class="rank-info"><b>${esc(r.name)}</b><small>${esc(r.language||"Repository")}</small></div><div class="rank-stars">★ ${fmt(r.stargazers_count)}</div></div>`).join(""):"<p style='font-size:10px;color:#69758a'>No repositories.</p>";
}
async function load(){
  try{
    const [u,repos]=await Promise.all([
      api(`/users/${GITHUB_USERNAME}`),
      api(`/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`)
    ]);
    setLinks(u.html_url);
    $("avatar").src=u.avatar_url;$("avatar").alt=u.name||GITHUB_USERNAME;
    $("name").textContent=u.name||GITHUB_USERNAME;$("login").textContent="@"+u.login;
    $("bio").textContent=u.bio||"Developer building and learning through practical projects.";
    $("aboutBio").textContent=u.bio||"I'm a developer who enjoys building practical projects and continuously improving my skills.";
    $("repos").textContent=fmt(u.public_repos);$("followers").textContent=fmt(u.followers);
    $("stars").textContent=fmt(repos.reduce((s,r)=>s+r.stargazers_count,0));
    $("mRepos").textContent=fmt(u.public_repos);
    $("mStars").textContent=fmt(repos.reduce((s,r)=>s+r.stargazers_count,0));
    $("mForks").textContent=fmt(repos.reduce((s,r)=>s+r.forks_count,0));
    $("mFollowers").textContent=fmt(u.followers);
    $("projectGrid").innerHTML=repos.length?repos.map(repoCard).join(""):"<div class='loading'>No public repositories found.</div>";
    renderLanguages(repos);renderTop(repos);
    $("statusText").textContent="Live · Public GitHub data loaded";
    document.querySelector(".status i").style.background="#35d48a";
  }catch(e){
    $("statusText").textContent="Could not load live GitHub data";
    $("projectGrid").innerHTML=`<div class="loading">GitHub API could not be reached.<br><br>${esc(e.message)}<br><br><a class="text-link" href="https://github.com/${GITHUB_USERNAME}" target="_blank">Open my GitHub profile ↗</a></div>`;
    $("aboutGithub").href=`https://github.com/${GITHUB_USERNAME}`;
    $("topGithub").href=`https://github.com/${GITHUB_USERNAME}`;
    $("profileBtn").href=`https://github.com/${GITHUB_USERNAME}`;
    $("allRepos").href=`https://github.com/${GITHUB_USERNAME}?tab=repositories`;
    $("footerGithub").href=`https://github.com/${GITHUB_USERNAME}`;
  }
}
$("emailLink").href="mailto:";
load();
