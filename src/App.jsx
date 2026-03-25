import React,{useState,useRef,useEffect} from 'react'
const G='#c9a84c',BG='#0d0d0d',S1='#141414',S2='#1a1a1a',B1='rgba(201,168,76,0.15)',B2='rgba(201,168,76,0.3)',TX='#f0ead8',MT='#7a7060'
const fmt=v=>!v?'R$ 0':'R$ '+(v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'k':v.toLocaleString('pt-BR'))
const E=[
{id:'dw',n:'Doctor Wealth',s:'DW',d:'Ecossistema Financeiro Médico',c:'#3b82f6',f:48500,m:60000,r:22000,g:18.4,
fl:[{x:'Out',a:32,b:28},{x:'Nov',a:35,b:30},{x:'Dez',a:38,b:33},{x:'Jan',a:41,b:35},{x:'Fev',a:44,b:36},{x:'Mar',a:48.5,b:38}],
kp:[{l:'Clientes Ativos',v:'47/60',i:'👥'},{l:'Recorrência',v:'R$ 38k',i:'🔄'},{l:'Inadimplência',v:'3,2%',i:'⚠'},{l:'Ticket Médio',v:'R$ 1.031',i:'🎯'}],
ok:[{o:'Atingir 60 clientes médicos',p:78},{o:'Reduzir inadimplência para 2%',p:45},{o:'Lançar DW Academy',p:30}],
ta:[{t:'Pitch para 3 clínicas — BH',p:'alta',k:false},{t:'Onboarding Dr. Felipe e Dra. Ana',p:'alta',k:false},{t:'Proposta Dr. Marcos Vinícius',p:'media',k:false},{t:'Calendário Instagram Abril',p:'baixa',k:true}],
co:[{n:'Contrato Padrão Médicos',v:'R$ 890/mês',s:'ativo',d:'Dez/2026'},{n:'Plano Elite — Dr. Carvalho',v:'R$ 2.400/mês',s:'ativo',d:'Jun/2026'}],
ri:[{r:'Entrada de concorrente especializado',n:'alto'},{r:'Regulação CFC contadores médicos',n:'medio'}],
de:[{d:'Lançar vertical patrimonial',dt:'Mar/2026'},{d:'Contratar 2º contador sênior',dt:'Abr/2026'}]},
{id:'of',n:'Original Fotografia',s:'OF',d:'Estúdio e Eventos Visuais',c:'#f59e0b',f:28000,m:35000,r:4200,g:-4.2,
fl:[{x:'Out',a:31,b:27},{x:'Nov',a:33,b:29},{x:'Dez',a:36,b:34},{x:'Jan',a:29,b:26},{x:'Fev',a:27,b:24},{x:'Mar',a:28,b:25}],
kp:[{l:'Clientes Ativos',v:'22/30',i:'👥'},{l:'Margem Líquida',v:'15%',i:'📊'},{l:'Inadimplência',v:'8,7%',i:'🚨'},{l:'Custo Fixo',v:'R$ 18,5k',i:'🏢'}],
ok:[{o:'Reduzir inadimplência para 4%',p:35},{o:'Atingir 30 clientes ativos',p:73},{o:'Lançar pacote corporativo',p:20}],
ta:[{t:'Cobranças — 3 clientes atrasados',p:'alta',k:false},{t:'Reunião equipe — corte de custos',p:'alta',k:false},{t:'Calendário de ensaios Q2',p:'media',k:false},{t:'Revisão contrato fornecedor',p:'media',k:true}],
co:[{n:'Parceria Evento Casa Casada',v:'R$ 3.500/evento',s:'ativo',d:'Dez/2026'},{n:'Cliente Corporativo XYZ',v:'R$ 1.800/mês',s:'inadim',d:'Mai/2026'}],
ri:[{r:'Sazonalidade — queda Q1 e Q3',n:'alto'},{r:'Equipamento principal precisa revisão',n:'medio'}],
de:[{d:'Reestruturação de precificação',dt:'Mar/2026'},{d:'Definir nicho corporativo vs social',dt:'Abr/2026'}]},
{id:'fs',n:'Forme Seguro',s:'FS',d:'Fundos de Formatura Premium',c:'#8b5cf6',f:15000,m:50000,r:8500,g:50,
fl:[{x:'Out',a:0,b:0},{x:'Nov',a:0,b:0},{x:'Dez',a:0,b:0},{x:'Jan',a:5,b:3},{x:'Fev',a:10,b:6},{x:'Mar',a:15,b:8}],
kp:[{l:'Fundos Gerenciados',v:'3 turmas',i:'🎓'},{l:'Capital Gerenciado',v:'R$ 420k',i:'💰'},{l:'Inadimplência',v:'0%',i:'✅'},{l:'Pipeline',v:'5 turmas',i:'🚀'}],
ok:[{o:'Fechar 12 contratos em 2026',p:25},{o:'Atingir R$ 2M gerenciados',p:21},{o:'Lançar app Forme Digital',p:10}],
ta:[{t:'Fechar UNIFENAS — Medicina 2026',p:'alta',k:false},{t:'Proposta para UNIFAL',p:'alta',k:false},{t:'Configurar agente IA WhatsApp',p:'media',k:false},{t:'Planilha fundos ativos',p:'media',k:true}],
co:[{n:'Fundo UNIFENAS Med 2026',v:'R$ 5.000/mês',s:'ativo',d:'Dez/2026'},{n:'Fundo UNILAVRAS Med 2025',v:'R$ 6.200/mês',s:'ativo',d:'Jun/2025'}],
ri:[{r:'Concorrência de bancos tradicionais',n:'medio'},{r:'Dependência de captação via indicação',n:'alto'}],
de:[{d:'Contratar comercial dedicado',dt:'Abr/2026'},{d:'Criar landing page Forme Seguro',dt:'Mar/2026'}]},
{id:'cdl',n:'CDL Divinópolis',s:'CDL',d:'Câmara de Dirigentes Lojistas',c:'#10b981',f:35000,m:40000,r:12000,g:5.3,
fl:[{x:'Out',a:32,b:22},{x:'Nov',a:33,b:23},{x:'Dez',a:38,b:26},{x:'Jan',a:34,b:23},{x:'Fev',a:34,b:23},{x:'Mar',a:35,b:24}],
kp:[{l:'Associados',v:'1.100',i:'🏪'},{l:'Receita Associativa',v:'R$ 30k/mês',i:'💼'},{l:'Taxa Adimplência',v:'97,9%',i:'✅'},{l:'Eventos no Ano',v:'12',i:'📅'}],
ok:[{o:'Atingir 1.200 associados',p:92},{o:'Lançar Hub CDL — Sebrae',p:60},{o:'Digitalizar 80% dos processos',p:40}],
ta:[{t:'Reunião Hub CDL com Sebrae',p:'alta',k:false},{t:'Aprovação pauta assembleia Abril',p:'alta',k:false},{t:'Relatório mensal para diretoria',p:'media',k:true},{t:'Captação novos associados',p:'baixa',k:false}],
co:[{n:'Parceria Sebrae — Hub Inovação',v:'Institucional',s:'negoc',d:'Abr/2026'},{n:'Contrato Feira do Empreendedor',v:'R$ 8.000',s:'ativo',d:'Mai/2026'}],
ri:[{r:'Queda no varejo regional',n:'medio'},{r:'Renovação diretoria Nov/2026',n:'baixo'}],
de:[{d:'Aprovar projeto Hub CDL',dt:'Abr/2026'},{d:'Parceria SENAC para cursos',dt:'Mar/2026'}]},
{id:'gp',n:'Gestão Pessoal',s:'GP',d:'Patrimônio e Finanças Pessoais',c:'#ec4899',f:0,m:0,r:0,g:0,
fl:[{x:'Out',a:28,b:22},{x:'Nov',a:30,b:24},{x:'Dez',a:35,b:28},{x:'Jan',a:28,b:20},{x:'Fev',a:30,b:21},{x:'Mar',a:32,b:22}],
kp:[{l:'Patrimônio Estimado',v:'R$ 1,2M',i:'🏦'},{l:'Renda Total',v:'R$ 52k/mês',i:'💰'},{l:'Investimentos',v:'R$ 380k',i:'📈'},{l:'Taxa de Poupança',v:'42%',i:'🎯'}],
ok:[{o:'Atingir R$ 1,5M patrimônio',p:80},{o:'Investir R$ 10k/mês',p:65},{o:'Quitar financiamento imóvel',p:45}],
ta:[{t:'Declaração IRPF 2026',p:'alta',k:false},{t:'Revisar carteira de investimentos',p:'media',k:false},{t:'Renovar seguro de vida',p:'media',k:false},{t:'Planejamento viagem família',p:'baixa',k:false}],
co:[{n:'Financiamento Imóvel — CEF',v:'R$ 2.100/mês',s:'ativo',d:'Dez/2031'},{n:'Previdência Privada PGBL',v:'R$ 1.500/mês',s:'ativo',d:'Vitalício'}],
ri:[{r:'Concentração renda em empresas próprias',n:'alto'},{r:'Falta de diversificação internacional',n:'medio'}],
de:[{d:'Aportar em FII — MXRF11',dt:'Mar/2026'},{d:'Contratar assessor de investimentos',dt:'Abr/2026'}]}
]
const AL=[{m:'OF: Inadimplência em 8,7% — acima do limite',t:'r'},{m:'FS: Meta mensal atingindo apenas 30%',t:'a'},{m:'OF: Contrato cliente XYZ em inadimplência',t:'r'},{m:'DW: 3 tarefas alta prioridade pendentes',t:'a'}]
const AG=[{titulo:'Antonio Idea BH',dia:'QUA',num:'25',hora:'11:00 — 12:00'},{titulo:'Dra Júlia',dia:'QUA',num:'25',hora:'16:30 — 17:30'},{titulo:'Stay at Nobile Suites Diamond',dia:'DOM',num:'29',hora:'Dia inteiro'}]
const card={background:S1,border:`1px solid ${B1}`,borderRadius:12,padding:20}
const lbl={fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:MT,marginBottom:6}
const btn={display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:8,border:`1px solid ${B1}`,background:'transparent',color:TX,cursor:'pointer',fontSize:13}
const Lb=({t})=><div style={lbl}>{t}</div>
const Tg=({c,b,t})=><span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',padding:'3px 10px',borderRadius:20,color:c,background:b}}>{t}</span>
const Br=({v,m,c})=><div style={{background:'rgba(255,255,255,0.06)',borderRadius:99,height:4,overflow:'hidden',marginTop:6}}><div style={{width:`${m>0?Math.min(v/m*100,100):0}%`,height:'100%',background:c,borderRadius:99,transition:'width .6s'}}/></div>
const Ch=({d,c})=>{const mx=Math.max(...d.map(x=>Math.max(x.a,x.b)),1);return<div style={{display:'flex',alignItems:'flex-end',gap:3,height:40}}>{d.map((x,i)=><div key={i} style={{flex:1,display:'flex',gap:1,alignItems:'flex-end',height:'100%'}}><div style={{flex:1,height:`${x.a/mx*100}%`,background:c,opacity:.7,borderRadius:'2px 2px 0 0',minHeight:2}}/><div style={{flex:1,height:`${x.b/mx*100}%`,background:'#ef4444',opacity:.4,borderRadius:'2px 2px 0 0',minHeight:2}}/></div>)}</div>}
function Orion(){
const[op,setOp]=useState(false),[ms,setMs]=useState([{r:'ai',t:'Olá Maxwell. Sou o ORION — sua inteligência executiva. Como posso ajudar?'}]),[ip,setIp]=useState(''),[ld,setLd]=useState(false),rf=useRef()
useEffect(()=>{if(rf.current)rf.current.scrollTop=rf.current.scrollHeight},[ms])
const send=async()=>{
if(!ip.trim()||ld)return
const txt=ip;setIp('');setLd(true);setMs(m=>[...m,{r:'u',t:txt}])
try{
const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,
system:'Voce e ORION agente executivo MAXXXI de Maxwell Oliveira Machado CEO Contador Presidente CDL Divinopolis. Empresas: Doctor Wealth contabilidade medica, Original Fotografia estudio, Forme Seguro fundos formatura, CDL Divinopolis. Direto executivo portugues.',
messages:ms.concat([{r:'u',t:txt}]).map(x=>({role:x.r==='ai'?'assistant':'user',content:x.t}))})})
const d=await res.json();setMs(m=>[...m,{r:'ai',t:d.content?.[0]?.text||'Erro na resposta.'}])
}catch(e){setMs(m=>[...m,{r:'ai',t:'Erro de conexao. Tente novamente.'}])}
setLd(false)}
return<>
<div onClick={()=>setOp(!op)} style={{position:'fixed',bottom:24,right:24,width:56,height:56,borderRadius:'50%',background:`linear-gradient(135deg,${G},#8b5cf6)`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:1000,boxShadow:`0 4px 24px ${G}66`,flexDirection:'column',gap:1}}>
<span style={{fontSize:18,color:'#000'}}>✦</span><span style={{fontSize:8,fontWeight:800,color:'#000',letterSpacing:1}}>ORION</span></div>
{op&&<div style={{position:'fixed',bottom:92,right:24,width:360,height:480,background:S1,border:`1px solid ${B2}`,borderRadius:16,display:'flex',flexDirection:'column',zIndex:999,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,.8)'}}>
<div style={{padding:'14px 16px',borderBottom:`1px solid ${B1}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:'linear-gradient(135deg,#1a1500,#141414)'}}>
<div><div style={{fontSize:13,fontWeight:700,color:G,letterSpacing:1}}>✦ ORION</div><div style={{fontSize:10,color:MT,letterSpacing:2}}>INTELIGENCIA EXECUTIVA MAXXXI</div></div>
<button onClick={()=>setOp(false)} style={{background:'none',border:'none',color:MT,cursor:'pointer',fontSize:20}}>x</button></div>
<div ref={rf} style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:10}}>
{ms.map((m,i)=><div key={i} style={{alignSelf:m.r==='u'?'flex-end':'flex-start',maxWidth:'85%'}}>
{m.r==='ai'&&<div style={{fontSize:9,color:G,letterSpacing:'2px',marginBottom:3}}>ORION INTELIGENCIA EXECUTIVA</div>}
<div style={{padding:'10px 12px',borderRadius:10,background:m.r==='u'?`linear-gradient(135deg,${G},#8b5cf6)`:'rgba(255,255,255,0.06)',fontSize:13,lineHeight:1.5,color:m.r==='u'?'#000':TX}}>{m.t}</div></div>)}
{ld&&<div style={{alignSelf:'flex-start',padding:'10px 12px',borderRadius:10,background:'rgba(255,255,255,0.06)',fontSize:13,color:G}}>Analisando...</div>}
</div>
<div style={{padding:12,borderTop:`1px solid ${B1}`,display:'flex',gap:8}}>
<input value={ip} onChange={e=>setIp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Consulte o ORION..." style={{flex:1,background:'rgba(255,255,255,0.06)',border:`1px solid ${B1}`,borderRadius:8,padding:'8px 12px',color:TX,fontSize:13,outline:'none'}}/>
<button onClick={send} style={{padding:'8px 14px',background:`linear-gradient(135deg,${G},#8b5cf6)`,border:'none',borderRadius:8,color:'#000',fontWeight:700,cursor:'pointer',fontSize:13}}>-></button>
</div></div>}</>}
function Home({go}){
const[ci,sCi]=useState([{p:'O que e prioridade hoje?',r:''},{p:'Qual decisao nao pode esperar?',r:''},{p:'Que resultado vou entregar hoje?',r:''}])
const tF=E.filter(x=>x.id!=='gp').reduce((s,x)=>s+x.f,0),tR=E.filter(x=>x.id!=='gp').reduce((s,x)=>s+x.r,0)
const hj=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
return<div>
<div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:16,marginBottom:20}}>
{[{l:'Faturamento Consolidado',v:fmt(tF),d:'+8,2%',c:'#3b82f6'},{l:'Resultado do Mes',v:fmt(tR),d:'+12,1%',c:'#10b981'},{l:'Empresas Ativas',v:'4 negocios',c:G},{l:'Alertas Ativos',v:AL.length+' alertas',c:'#ef4444'}].map((k,i)=>
<div key={i} style={card}><Lb t={k.l}/><div style={{fontSize:24,fontWeight:700,color:k.c,fontFamily:"'Syne',sans-serif",marginBottom:4}}>{k.v}</div>{k.d&&<div style={{fontSize:11,color:'#10b981'}}>▲ {k.d} vs mes ant.</div>}</div>)}
</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:16,marginBottom:20}}>
<div style={{...card,borderColor:'rgba(16,185,129,0.2)'}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
<div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:18}}>📅</span>
<div><div style={{fontSize:10,letterSpacing:3,color:MT,textTransform:'uppercase'}}>Agenda</div><div style={{fontSize:11,color:'#10b981',fontWeight:600,letterSpacing:2}}>Google Calendar</div></div></div>
<div style={{display:'flex',gap:8}}>
<button style={{...btn,fontSize:11,padding:'6px 12px',borderColor:B2}}>🔗 Link</button>
<button style={{...btn,fontSize:11,padding:'6px 12px',background:`${G}18`,borderColor:B2,color:G}}>+ Evento</button>
<button style={{...btn,fontSize:11,padding:'6px 12px'}}>Abrir</button></div></div>
{AG.map((a,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',background:S2,borderRadius:10,borderLeft:'3px solid #10b981',marginBottom:8}}>
<div style={{textAlign:'center',minWidth:44}}><div style={{fontSize:9,color:MT,letterSpacing:2,textTransform:'uppercase'}}>{a.dia}</div><div style={{fontSize:24,fontWeight:800,color:G,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{a.num}</div></div>
<div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,marginBottom:2}}>{a.titulo}</div><div style={{fontSize:12,color:MT}}>{a.hora}</div></div>
<button style={{background:'none',border:'none',color:MT,cursor:'pointer',fontSize:18}}>x</button></div>)}</div>
<div style={card}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}><span>🔔</span><Lb t="Central de Alertas"/></div>
{AL.map((a,i)=><div key={i} style={{padding:'10px 12px',borderRadius:8,background:S2,borderLeft:`3px solid ${a.t==='r'?'#ef4444':G}`,fontSize:12,lineHeight:1.4,marginBottom:8}}>{a.m}</div>)}</div></div>
<div style={{...card,background:'linear-gradient(135deg,#1a1500,#0d0d0d)',borderColor:B2,marginBottom:20}}>
<div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}><div style={{width:4,height:40,background:G,borderRadius:2}}/><div><div style={{fontSize:10,letterSpacing:4,color:MT,textTransform:'uppercase'}}>Check-in do Dia</div><div style={{fontSize:12,color:G,fontWeight:600}}>{hj}</div></div></div>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
{ci.map((c,i)=><div key={i}><Lb t={c.p}/><textarea value={c.r} onChange={e=>sCi(x=>x.map((v,j)=>j===i?{...v,r:e.target.value}:v))} placeholder="Digite aqui..." rows={3} style={{width:'100%',background:`${G}08`,border:`1px solid ${B1}`,borderRadius:8,padding:'8px 10px',color:TX,fontSize:13,resize:'none',outline:'none',boxSizing:'border-box'}}/></div>)}</div></div>
<div style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:MT,marginBottom:12}}>Visao Geral do Ecossistema</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:14}}>
{E.filter(x=>x.id!=='gp').map(e=><div key={e.id} onClick={()=>go('workspace')} style={{...card,cursor:'pointer'}} onMouseEnter={x=>x.currentTarget.style.borderColor=e.c+'55'} onMouseLeave={x=>x.currentTarget.style.borderColor=B1}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
<div><div style={{width:30,height:30,borderRadius:8,background:e.c+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:e.c,fontFamily:"'Syne',sans-serif",marginBottom:6}}>{e.s}</div>
<div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{e.n}</div><div style={{fontSize:10,color:MT}}>{e.d}</div></div>
<div style={{textAlign:'right'}}><div style={{fontSize:16,fontWeight:700,color:e.c,fontFamily:"'Syne',sans-serif"}}>{fmt(e.f)}</div><div style={{fontSize:10,color:e.g>=0?'#10b981':'#ef4444'}}>{e.g>=0?'▲':'▼'} {Math.abs(e.g)}%</div></div></div>
<div style={{fontSize:10,color:MT,display:'flex',justifyContent:'space-between',marginBottom:3}}><span>{fmt(e.f)}</span><span>Meta {fmt(e.m)}</span></div>
<Br v={e.f} m={e.m} c={e.c}/><div style={{marginTop:10}}><Ch d={e.fl} c={e.c}/></div></div>)}</div></div>}
function Work(){
const[id,sId]=useState('dw'),[ab,sAb]=useState('kpi')
const e=E.find(x=>x.id===id)
return<div>
<div style={{display:'flex',gap:10,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
{E.map(x=><button key={x.id} onClick={()=>{sId(x.id);sAb('kpi')}} style={{padding:'9px 16px',borderRadius:10,border:`1px solid ${id===x.id?x.c:B1}`,background:id===x.id?x.c+'18':'transparent',color:id===x.id?x.c:MT,cursor:'pointer',fontSize:12,fontWeight:600,whiteSpace:'nowrap',transition:'all .2s'}}><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800}}>{x.s}</span> — {x.n}</button>)}</div>
<div style={{...card,marginBottom:16,borderColor:e.c+'44'}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{display:'flex',alignItems:'center',gap:14}}>
<div style={{width:44,height:44,borderRadius:10,background:e.c+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:e.c,fontFamily:"'Syne',sans-serif"}}>{e.s}</div>
<div><div style={{fontSize:18,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{e.n}</div><div style={{fontSize:12,color:MT}}>{e.d}</div></div></div>
{e.id!=='gp'&&<div style={{display:'flex',gap:24,textAlign:'right'}}>
<div><Lb t="Faturamento"/><div style={{fontSize:20,fontWeight:700,color:e.c,fontFamily:"'Syne',sans-serif"}}>{fmt(e.f)}</div></div>
<div><Lb t="Resultado"/><div style={{fontSize:20,fontWeight:700,color:'#10b981',fontFamily:"'Syne',sans-serif"}}>{fmt(e.r)}</div></div>
<div><Lb t="Crescimento"/><div style={{fontSize:20,fontWeight:700,color:e.g>=0?'#10b981':'#ef4444',fontFamily:"'Syne',sans-serif"}}>{e.g>=0?'+':''}{e.g}%</div></div></div>}</div></div>
<div style={{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'}}>
{['kpi','okr','tarefas','contratos','riscos','decisoes'].map(a=><button key={a} onClick={()=>sAb(a)} style={{padding:'7px 16px',borderRadius:8,border:`1px solid ${ab===a?e.c:B1}`,background:ab===a?e.c+'18':'transparent',color:ab===a?e.c:MT,cursor:'pointer',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',transition:'all .2s'}}>{a==='kpi'?'KPI':a==='okr'?'OKRs':a.charAt(0).toUpperCase()+a.slice(1)}</button>)}</div>
{ab==='kpi'&&<div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:14}}>{e.kp.map((k,i)=><div key={i} style={card}><div style={{fontSize:22,marginBottom:8}}>{k.i}</div><Lb t={k.l}/><div style={{fontSize:22,fontWeight:700,color:e.c,fontFamily:"'Syne',sans-serif"}}>{k.v}</div></div>)}</div>}
{ab==='okr'&&<div style={{display:'flex',flexDirection:'column',gap:10}}>{e.ok.map((o,i)=><div key={i} style={card}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><span style={{fontSize:14}}>{o.o}</span><span style={{fontSize:16,fontWeight:700,color:e.c,fontFamily:"'Syne',sans-serif"}}>{o.p}%</span></div><Br v={o.p} m={100} c={e.c}/></div>)}</div>}
{ab==='tarefas'&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{e.ta.map((t,i)=><div key={i} style={{...card,display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderLeft:`3px solid ${t.k?'#10b981':t.p==='alta'?'#ef4444':G}`,opacity:t.k?.6:1}}><span style={{fontSize:16}}>{t.k?'✅':t.p==='alta'?'🔴':'🟡'}</span><span style={{flex:1,fontSize:14,textDecoration:t.k?'line-through':'none',color:t.k?MT:TX}}>{t.t}</span>{!t.k&&<Tg c={t.p==='alta'?'#ef4444':G} b={t.p==='alta'?'rgba(239,68,68,.15)':`${G}20`} t={t.p}/>}</div>)}</div>}
{ab==='contratos'&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{e.co.map((c,i)=><div key={i} style={{...card,display:'flex',alignItems:'center',justifyContent:'space-between'}}><div><div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{c.n}</div><div style={{fontSize:12,color:MT}}>Vence: {c.d}</div></div><div style={{textAlign:'right',display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}><div style={{fontSize:15,fontWeight:700,color:e.c}}>{c.v}</div><Tg c={c.s==='ativo'?'#10b981':c.s==='inadim'?'#ef4444':G} b={c.s==='ativo'?'rgba(16,185,129,.15)':c.s==='inadim'?'rgba(239,68,68,.15)':`${G}20`} t={c.s==='ativo'?'Ativo':c.s==='inadim'?'Inadimplente':'Negociacao'}/></div></div>)}</div>}
{ab==='riscos'&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{e.ri.map((r,i)=><div key={i} style={{...card,display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{display:'flex',alignItems:'center',gap:10}}><span>{r.n==='alto'?'🔴':r.n==='medio'?'🟡':'🟢'}</span><span style={{fontSize:14}}>{r.r}</span></div><Tg c={r.n==='alto'?'#ef4444':r.n==='medio'?G:'#10b981'} b={r.n==='alto'?'rgba(239,68,68,.15)':r.n==='medio'?`${G}20`:'rgba(16,185,129,.15)'} t={r.n}/></div>)}</div>}
{ab==='decisoes'&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{e.de.map((d,i)=><div key={i} style={{...card,display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{display:'flex',alignItems:'center',gap:10}}><span>⚡</span><span style={{fontSize:14}}>{d.d}</span></div><span style={{fontSize:12,color:MT}}>{d.dt}</span></div>)}</div>}
</div>}
export default function App(){
const[tb,sTb]=useState('home')
return<div style={{background:BG,minHeight:'100vh',color:TX,fontFamily:"'DM Sans',-apple-system,sans-serif"}}>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<div style={{background:BG,borderBottom:`1px solid ${B1}`,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:64,position:'sticky',top:0,zIndex:200}}>
<div style={{display:'flex',alignItems:'center',gap:16}}>
<div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:G,letterSpacing:2}}>MAXXXI</div><div style={{fontSize:9,color:MT,letterSpacing:4,textTransform:'uppercase',marginTop:-2}}>Plataforma de Gestao Executiva</div></div>
<div style={{width:1,height:36,background:B1}}/>
<button onClick={()=>window.open('https://drive.google.com','_blank')} style={{...btn,color:G,borderColor:B2}}>📁 MAXXXI Drive</button>
<button style={btn}>⌘K Busca rapida</button></div>
<div style={{display:'flex',alignItems:'center',gap:10}}>
<button style={{...btn,padding:'8px 10px',position:'relative'}}>🔔<span style={{position:'absolute',top:6,right:6,width:7,height:7,borderRadius:'50%',background:'#ef4444'}}/></button>
<div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 12px',border:`1px solid ${B1}`,borderRadius:10}}>
<div style={{width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${G},#8b5cf6)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#000',fontFamily:"'Syne',sans-serif"}}>MM</div>
<span style={{fontSize:13,fontWeight:500}}>Maxwell Machado</span></div></div></div>
<div style={{background:S1,borderBottom:`1px solid ${B1}`,padding:'0 24px',display:'flex',overflowX:'auto'}}>
{[{id:'home',l:'🏠 Home'},{id:'workspace',l:'💼 Workspace'},{id:'pessoal',l:'👤 Gestao Pessoal'}].map(x=>
<button key={x.id} onClick={()=>sTb(x.id)} style={{padding:'12px 16px',fontSize:12,fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',border:'none',background:'transparent',color:tb===x.id?G:MT,borderBottom:`2px solid ${tb===x.id?G:'transparent'}`,whiteSpace:'nowrap'}}>{x.l}</button>)}</div>
<div style={{padding:24,maxWidth:1400,margin:'0 auto'}}>
{tb==='home'&&<Home go={sTb}/>}
{(tb==='workspace'||tb==='pessoal')&&<Work/>}
</div>
<Orion/></div>}