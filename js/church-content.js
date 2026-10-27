/* Public, read-only CMS bridge. Only approved, explicitly published records are rendered. */
(()=>{
  'use strict';
  const section=document.querySelector('#church-dynamic-content');
  if(!section)return;
  const $=selector=>section.querySelector(selector);
  const youtubeId=value=>{
    if(typeof value!=='string')return null;
    if(/^[A-Za-z0-9_-]{11}$/.test(value))return value;
    try{
      const u=new URL(value),h=u.hostname.replace(/^www\./,'').toLowerCase();
      if(h==='youtu.be'){const id=u.pathname.split('/')[1];return /^[A-Za-z0-9_-]{11}$/.test(id)?id:null;}
      if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(h)){
        const id=u.searchParams.get('v')||u.pathname.match(/^\/(?:live|embed|shorts)\/([\w-]{11})/)?.[1];
        return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;
      }
    }catch{}
    return null;
  };
  const valid=(x)=>x&&typeof x.title==='string'&&x.title.trim()&&x.status==='published';
  const create=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const card=(record,type)=>{
    const item=create('article','church-feed-card');
    const label=create('span','church-feed-label',type);item.append(label,create('h3','church-feed-title',record.title));
    if(record.description)item.append(create('p','church-feed-summary',record.description.slice(0,350)));
    if(record.speaker)item.append(create('p','church-feed-meta',record.speaker));
    if(record.date)item.append(create('p','church-feed-meta',record.date));
    if(record.location)item.append(create('p','church-feed-meta',record.location));
    const video=youtubeId(record.url||'');
    if(video){
      const a=create('a','church-feed-link','Regarder sur YouTube ↗');
      a.href='https://www.youtube.com/watch?v='+video;a.target='_blank';a.rel='noopener noreferrer';item.append(a);
    }
    return item;
  };
  async function load(){
    let data;
    try{
      const res=await fetch('/data/church-content.json',{headers:{Accept:'application/json'},cache:'no-cache'});
      if(!res.ok)throw Error('feed unavailable');
      data=await res.json();
      if(!data||data.version!==1)throw Error('unsupported feed');
    }catch{return;}
    let count=0;
    for(const [key,title] of [['sermons','Prédications récentes'],['podcasts','Podcasts et formation'],['events','Nos prochains événements']]){
      const arr=Array.isArray(data[key])?data[key].filter(valid).slice(0,6):[];
      if(!arr.length)continue;
      const block=create('div','church-feed-block');
      block.append(create('h2','church-feed-heading',title));
      const grid=create('div','church-feed-grid');
      for(const r of arr)grid.append(card(r,key==='sermons'?'Enseignement':key==='podcasts'?'Podcast':'Événement'));
      block.append(grid);$('#church-content-lists').append(block);count++;
    }
    const video=youtubeId(data.live?.youtubeVideoId||'');
    if(video&&data.live?.isLive===true){
      const wrapper=$('#church-live-wrapper');
      wrapper.hidden=false;
      $('#church-live-title').textContent=(typeof data.live.title==='string'&&data.live.title)||'Suivre le culte en direct';
      const iframe=document.createElement('iframe');
      iframe.src='https://www.youtube-nocookie.com/embed/'+video;
      iframe.title='Culte en direct laliberte.live';
      iframe.loading='lazy';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;
      $('#church-live-player').append(iframe);
      count++;
    }
    section.hidden=count===0;
  }
  load();
})();