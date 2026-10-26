// Contact delivery for La Liberté.live. Configure RESEND_API_KEY, CONTACT_TO_EMAIL,
// CONTACT_FROM_EMAIL in the Vercel environment before enabling real submissions.
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Méthode non autorisée.'});}
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return res.status(415).json({error:'Format de demande invalide.'});
  if(Number(req.headers['content-length']||0)>12000)return res.status(413).json({error:'Message trop long.'});
  try{
    const b=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(!b||typeof b!=='object'||Array.isArray(b))return res.status(400).json({error:'Données invalides.'});
    if(b.website)return res.status(200).json({ok:true});
    const {name,email,phone='',subject='',message}=b;
    if([name,email,phone,subject,message].some(x=>typeof x!=='string'))return res.status(400).json({error:'Données invalides.'});
    if(name.trim().length<2||name.length>120||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>180||phone.length>40||message.trim().length<10||message.length>5000)
      return res.status(400).json({error:'Vérifiez votre nom, votre email et votre message (10 caractères minimum).'});
    const categories=new Set(['','visite','priere','benevolat','kids','don','autre','enligne','implantation','reseau','conversion']);
    if(!categories.has(subject)||/[\r\n]/.test(name)||/[\r\n]/.test(email))return res.status(400).json({error:'Données invalides.'});
    const key=process.env.RESEND_API_KEY,to=process.env.CONTACT_TO_EMAIL,from=process.env.CONTACT_FROM_EMAIL;
    if(!key||!to||!from)return res.status(503).json({error:"Le formulaire n'est pas encore activé. Vous pouvez nous contacter via nos réseaux sociaux."});
    const safe=v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const html='<h2>Message depuis La Liberté.live</h2><p><b>Nom :</b> '+safe(name)+'</p><p><b>Email :</b> '+safe(email)+'</p><p><b>Téléphone :</b> '+safe(phone)+'</p><p><b>Motif :</b> '+safe(subject)+'</p><p><b>Message :</b><br>'+safe(message).replace(/\n/g,'<br>')+'</p>';
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:'La Liberté.live — '+(subject||'contact'),html})});
    if(!response.ok){console.error('Mail failed',response.status);return res.status(502).json({error:"Le message n'a pas pu être transmis. Réessayez plus tard."});}
    return res.status(200).json({ok:true});
  }catch(e){console.error('Contact endpoint error',e.message);return res.status(500).json({error:'Une erreur est survenue. Réessayez plus tard.'});}
}
