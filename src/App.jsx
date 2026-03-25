import { useState, useRef, useEffect } from "react";

const INIT_COMPANIES = ["Forme Seguro","Original Fotografia","Doctor Wealth","CDL"];
const INIT_AREAS = ["Financeiro","Estratégico","Marketing","Comercial"];
const AREA_ICONS = {"Financeiro":"₿","Estratégico":"◈","Marketing":"◉","Comercial":"◆"};
const getAreaIcon = a => AREA_ICONS[a]||"◇";
const FILE_ICONS = {pdf:"📄",doc:"📝",docx:"📝",xls:"📊",xlsx:"📊",ppt:"📋",pptx:"📋",txt:"📃",json:"🗂",default:"📎"};
const getFileIcon = n => FILE_ICONS[n.split(".").pop().toLowerCase()]||FILE_ICONS.default;
const formatSize = b => b<1024?`${b}B`:b<1048576?`${(b/1024).toFixed(1)}KB`:`${(b/1048576).toFixed(1)}MB`;
const fmt = v => (v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const MESES_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const CATS = ["Alimentação","Gasolina","Lazer","Restaurante","Farmácia","Saúde","Educação","Moradia","Transporte","Vestuário","Assinaturas","Outros"];
const CAT_COLORS = ["#c9a84c","#dfc27a","#b8870a","#5bc4a0","#e07a5f","#a78bfa","#7a5a00","#edd99a","#c9a84c88","#dfc27a88","#5bc4a088","#e07a5f88"];
const CONTRACT_STATUS = ["Ativo","A vencer","Vencido","Em negociação","Encerrado"];
const STATUS_COLORS = {"Ativo":"#5bc4a0","A vencer":"#c9a84c","Vencido":"#e07a5f","Em negociação":"#a78bfa","Encerrado":"#555"};
const RISK_LABELS = ["Baixo","Médio","Alto","Crítico"];
const RISK_COLORS = ["#5bc4a0","#c9a84c","#e07a5f","#cc2222"];

const CALENDAR_EVENTS = [
  {id:"1",title:"Gabriel MKT",date:"2026-03-24",start:"10:30",end:"11:30",allDay:false},
  {id:"2",title:"Mauro Sicredi",date:"2026-03-24",start:"14:30",end:"15:30",allDay:false},
  {id:"3",title:"Adapta Live",date:"2026-03-24",start:"19:00",end:"20:00",allDay:false},
  {id:"4",title:"Antonio Idea BH",date:"2026-03-25",start:"11:00",end:"12:00",allDay:false},
  {id:"5",title:"Dra Júlia",date:"2026-03-25",start:"16:30",end:"17:30",allDay:false},
  {id:"6",title:"Stay at Nobile Suites Diamond",date:"2026-03-29",start:"",end:"",allDay:true},
];

const AGENT_NAME = "ORION";
const AGENT_SUBTITLE = "Inteligência Executiva MAXXXI";

const AGENT_TIPS = [
  {type:"melhoria",msg:"Ative metas mensais por empresa para comparar Meta x Realizado em tempo real."},
  {type:"gestao",msg:"OKR: defina 3 objetivos-chave por trimestre. Foco gera resultado."},
  {type:"lei",msg:"Empresas médicas: observe a Resolução CFM 2.336/2023 sobre publicidade médica."},
  {type:"motivacao",msg:"'Não gerencie o que não pode medir.' — Peter Drucker"},
  {type:"melhoria",msg:"Alertas automáticos de inadimplência acima de 5% previnem perdas."},
  {type:"gestao",msg:"Método 80/20: 20% dos clientes geram 80% da receita. Identifique-os."},
  {type:"gestao",msg:"L10 (EOS/Traction): reunião semanal de 15min aumenta execução em 40%."},
  {type:"lei",msg:"Lei 14.133/2021: verifique conformidade para contratos com entidades públicas."},
  {type:"motivacao",msg:"'Excelência não é um ato, é um hábito.' — Aristóteles"},
  {type:"melhoria",msg:"Configure alertas de vencimento de contratos com 30, 15 e 7 dias de antecedência."},
  {type:"gestao",msg:"PDCA: Plan→Do→Check→Act em cada meta. Nunca repita o mesmo erro."},
  {type:"motivacao",msg:"'Empresas excelentes acreditam na melhoria contínua.' — Tom Peters"},
];
const TC = {melhoria:"#c9a84c",gestao:"#5bc4a0",lei:"#e07a5f",motivacao:"#a78bfa"};
const TL = {melhoria:"MELHORIA",gestao:"GESTÃO",lei:"ATENÇÃO LEGAL",motivacao:"INSPIRAÇÃO"};
const TI = {melhoria:"💡",gestao:"📐",lei:"⚖️",motivacao:"✨"};

const G = {900:"#000",800:"#0d0d0d",700:"#1a1a1a",600:"#7a5a00",500:"#b8870a",400:"#c9a84c",300:"#dfc27a",200:"#edd99a",100:"#f5eabc"};

const LS = {
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
};

// ─── ESTILOS ATUALIZADOS — LAYOUT EXECUTIVO PREMIUM ──────────────────────────
const S = {
  inp:{background:G[800],border:`1px solid ${G[600]}`,borderRadius:8,padding:"10px 14px",color:G[100],fontSize:14,outline:"none"},
  btn:{background:`linear-gradient(135deg,${G[400]},${G[300]})`,border:"none",borderRadius:8,padding:"10px 18px",color:"#000",fontWeight:700,fontSize:13,cursor:"pointer"},
  ghost:{background:"none",border:`1px solid ${G[700]}`,borderRadius:8,padding:"8px 14px",color:G[400],fontSize:13,cursor:"pointer"},
  lbl:{fontSize:11,letterSpacing:"3px",color:G[500],textTransform:"uppercase",marginBottom:8},
  box:{background:"#00000099",border:`1px solid ${G[700]}`,borderRadius:14,padding:"20px 24px",marginBottom:14},
  del:{background:"none",border:"none",color:G[700],cursor:"pointer",fontSize:14,padding:0},
  sel:{background:G[800],border:`1px solid ${G[600]}`,borderRadius:8,padding:"10px 14px",color:G[100],fontSize:14,outline:"none"},
  card:h=>({background:h?`linear-gradient(135deg,${G[800]},${G[700]}99)`:`${G[800]}88`,border:`1px solid ${h?G[500]:G[700]}`,borderRadius:14,padding:"20px",cursor:"pointer",transition:"all 0.15s",position:"relative",display:"flex",flexDirection:"column",gap:8,boxShadow:h?`0 4px 24px ${G[500]}33`:"none"}),
  addCard:h=>({background:"transparent",border:`1px dashed ${h?G[400]:G[700]}`,borderRadius:14,padding:"20px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:h?G[300]:G[600],fontSize:14,transition:"all 0.15s"}),
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14,marginBottom:16},
};

// ─── HEALTH ──────────────────────────────────────────────────────────────────
function calcHealth(kpis) {
  let s=50;
  if(kpis.fat>0){
    const m=(kpis.fat-kpis.custo)/kpis.fat;
    s+=m>0.3?20:m>0.15?10:m>0?0:-15;
    const ip=kpis.inadimplencia/kpis.fat;
    s+=ip<0.03?10:ip<0.05?5:ip<0.1?0:-10;
    if(kpis.meta>0) s+=(kpis.fat/kpis.meta)>=1?15:(kpis.fat/kpis.meta)>=0.8?5:-10;
  }
  if(kpis.caixa>0) s+=5; else if(kpis.caixa<0) s-=15;
  return Math.max(0,Math.min(100,Math.round(s)));
}
function HealthBadge({score}) {
  const c=score>=75?"#5bc4a0":score>=50?G[400]:score>=30?"#e07a5f":"#cc2222";
  const l=score>=75?"Saudável":score>=50?"Estável":score>=30?"Atenção":"Crítico";
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:c,background:c+"11"}}>{score}</div>
      <span style={{fontSize:11,color:c,letterSpacing:"1px"}}>{l}</span>
    </div>
  );
}

// ─── MINI CHART ──────────────────────────────────────────────────────────────
function BarChart({data,height=80}) {
  const max=Math.max(...data.map(d=>d.value),1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height,marginTop:10}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:"100%",background:d.color||G[400],borderRadius:"3px 3px 0 0",height:`${(d.value/max)*100}%`,minHeight:d.value>0?3:0,transition:"height 0.5s"}}/>
          <div style={{fontSize:9,color:G[600],whiteSpace:"nowrap",overflow:"hidden",maxWidth:"100%"}}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── AGENDA ──────────────────────────────────────────────────────────────────
function AgendaWidget() {
  const today = new Date().toISOString().slice(0,10);
  const [events,setEvents] = useState(CALENDAR_EVENTS);
  const [showForm,setShowForm] = useState(false);
  const [showLink,setShowLink] = useState(false);
  const [copied,setCopied] = useState(false);
  const [form,setForm] = useState({title:"",date:"",start:"",end:"",allDay:false});
  const upcoming = events.filter(e=>e.date>=today).slice(0,6);
  const availLink = "https://calendar.google.com/calendar/u/0/r?cid=maxwellmachado.adm%40gmail.com";
  const copyLink = () => {
    navigator.clipboard.writeText(availLink).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };
  const addEvent = () => {
    if(!form.title.trim()||!form.date) return;
    setEvents(prev=>[...prev,{id:Date.now().toString(),title:form.title,date:form.date,start:form.start,end:form.end,allDay:form.allDay}]);
    setForm({title:"",date:"",start:"",end:"",allDay:false});
    setShowForm(false);
  };
  return (
    <div style={{background:G[800],border:`1px solid ${G[600]}44`,borderLeft:`3px solid #5bc4a0`,borderRadius:14,padding:"16px 20px",marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:11,letterSpacing:"3px",color:"#5bc4a0"}}>📅 AGENDA — GOOGLE CALENDAR</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowLink(v=>!v)} style={{background:`${G[600]}33`,border:`1px solid ${G[600]}`,borderRadius:7,padding:"5px 12px",color:G[300],fontSize:11,cursor:"pointer",letterSpacing:"1px"}}>🔗 LINK</button>
          <button onClick={()=>setShowForm(v=>!v)} style={{background:`${G[400]}22`,border:`1px solid ${G[500]}`,borderRadius:7,padding:"5px 12px",color:G[300],fontSize:11,cursor:"pointer",letterSpacing:"1px"}}>+ EVENTO</button>
          <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:G[600],textDecoration:"none",letterSpacing:"1px",padding:"5px 8px"}}>ABRIR ↗</a>
        </div>
      </div>
      {showLink&&(
        <div style={{background:`#5bc4a011`,border:`1px solid #5bc4a033`,borderRadius:9,padding:"14px 16px",marginBottom:14}}>
          <div style={{fontSize:11,color:"#5bc4a0",letterSpacing:"2px",marginBottom:6}}>LINK DE DISPONIBILIDADE</div>
          <div style={{fontSize:12,color:G[600],marginBottom:10}}>Compartilhe para que alguém veja sua agenda e marque um horário</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,background:G[700],borderRadius:7,padding:"9px 12px",fontSize:11,color:G[400],overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{availLink}</div>
            <button onClick={copyLink} style={{background:copied?"#5bc4a0":G[700],border:`1px solid ${copied?"#5bc4a0":G[600]}`,borderRadius:7,padding:"8px 16px",color:copied?"#000":G[300],fontSize:11,cursor:"pointer",fontWeight:600,transition:"all 0.2s",whiteSpace:"nowrap"}}>{copied?"COPIADO ✓":"COPIAR"}</button>
          </div>
        </div>
      )}
      {showForm&&(
        <div style={{background:G[700],borderRadius:9,padding:"16px",marginBottom:14,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:11,color:G[500],letterSpacing:"3px",marginBottom:2}}>NOVO COMPROMISSO</div>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Título do evento..." value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="date" style={{...S.inp,flex:1}} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:G[400],cursor:"pointer",flexShrink:0}}>
              <input type="checkbox" checked={form.allDay} onChange={e=>setForm(f=>({...f,allDay:e.target.checked}))} style={{accentColor:G[400]}}/>
              Dia inteiro
            </label>
          </div>
          {!form.allDay&&(
            <div style={{display:"flex",gap:8}}>
              <input type="time" style={{...S.inp,flex:1}} value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))}/>
              <input type="time" style={{...S.inp,flex:1}} value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))}/>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button>
            <button style={S.btn} onClick={addEvent}>Salvar Evento</button>
          </div>
        </div>
      )}
      {upcoming.length===0&&<div style={{fontSize:13,color:G[700]}}>Nenhum evento nos próximos dias</div>}
      {upcoming.map(ev=>(
        <div key={ev.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <div style={{width:42,textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:10,color:G[600],letterSpacing:"1px"}}>{new Date(ev.date+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"short"}).toUpperCase()}</div>
            <div style={{fontSize:20,fontWeight:700,color:G[300]}}>{ev.date.slice(8)}</div>
          </div>
          <div style={{flex:1,background:`${G[700]}55`,borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontSize:14,fontWeight:600,color:G[100]}}>{ev.title}</div>
            {ev.allDay
              ? <div style={{fontSize:11,color:G[600],marginTop:2}}>Dia inteiro</div>
              : ev.start&&<div style={{fontSize:11,color:G[600],marginTop:2}}>{ev.start}{ev.end?" — "+ev.end:""}</div>
            }
          </div>
          <button style={{...S.del,fontSize:13}} onClick={()=>setEvents(events.filter(x=>x.id!==ev.id))}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── ALERTS BELL ─────────────────────────────────────────────────────────────
function AlertsBell({companies}) {
  const [open,setOpen] = useState(false);
  const today = new Date();
  const alerts = [];
  companies.forEach(c=>{
    const kpis=LS.get("mx_kpi_"+c,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0});
    const contracts=LS.get("mx_contracts_"+c,[]);
    if(kpis.fat>0&&kpis.inadimplencia/kpis.fat>0.05) alerts.push({type:"danger",msg:`${c}: inadimplência acima de 5%`});
    if(kpis.meta>0&&kpis.fat/kpis.meta<0.8) alerts.push({type:"warning",msg:`${c}: meta abaixo de 80%`});
    if(kpis.caixa<0) alerts.push({type:"danger",msg:`${c}: caixa negativo`});
    contracts.forEach(ct=>{
      if(!ct.vencimento||ct.status==="Encerrado") return;
      const diff=Math.ceil((new Date(ct.vencimento)-today)/(1000*60*60*24));
      if(diff<=7&&diff>=0) alerts.push({type:"danger",msg:`Contrato "${ct.nome}" (${c}) vence em ${diff}d`});
      else if(diff<=15) alerts.push({type:"warning",msg:`Contrato "${ct.nome}" (${c}) vence em ${diff}d`});
    });
  });
  const color=alerts.length===0?"#5bc4a0":alerts.some(a=>a.type==="danger")?"#e07a5f":G[400];
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(v=>!v)} style={{background:"none",border:`1px solid ${color}44`,borderRadius:9,padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color,fontSize:16,position:"relative"}}>
        🔔
        {alerts.length>0&&<div style={{position:"absolute",top:-4,right:-4,background:color,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#000"}}>{alerts.length}</div>}
      </button>
      {open&&(
        <div style={{position:"absolute",top:48,right:0,background:G[800],border:`1px solid ${G[600]}`,borderRadius:14,padding:"16px",width:320,zIndex:100,boxShadow:`0 8px 32px #00000088`}}>
          <div style={{fontSize:11,letterSpacing:"3px",color:G[500],marginBottom:12}}>ALERTAS ATIVOS</div>
          {alerts.length===0&&<div style={{fontSize:13,color:G[600]}}>Nenhum alerta no momento ✓</div>}
          {alerts.map((a,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8,background:a.type==="danger"?"#e07a5f11":"#c9a84c11",border:`1px solid ${a.type==="danger"?"#e07a5f33":"#c9a84c33"}`,borderRadius:9,padding:"10px 12px"}}>
              <span style={{fontSize:14}}>{a.type==="danger"?"⚠":"⚡"}</span>
              <span style={{fontSize:13,color:G[200],lineHeight:1.4}}>{a.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DAILY CHECK-IN ───────────────────────────────────────────────────────────
function DailyCheckin() {
  const today = new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});
  const key = "mx_checkin_"+new Date().toISOString().slice(0,10);
  const [items,setItems] = useState(()=>LS.get(key,["","",""]));
  const prompts = ["O que é prioridade hoje?","Qual decisão não pode esperar?","Que resultado vou entregar hoje?"];
  const update = (i,v) => { const n=[...items]; n[i]=v; setItems(n); LS.set(key,n); };
  return (
    <div style={{background:`${G[800]}`,border:`1px solid ${G[600]}44`,borderLeft:`3px solid ${G[400]}`,borderRadius:14,padding:"16px 20px",marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:11,letterSpacing:"3px",color:G[400]}}>CHECK-IN DO DIA — {today.toUpperCase()}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {prompts.map((p,i)=>(
          <div key={i}>
            <div style={{fontSize:11,color:G[600],marginBottom:6}}>{p}</div>
            <input style={{...S.inp,width:"100%",boxSizing:"border-box",fontSize:13}} placeholder="Responder..." value={items[i]} onChange={e=>update(i,e.target.value)}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
function UserProfile() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"6px 14px",background:G[800],border:`1px solid ${G[700]}`,borderRadius:10,cursor:"pointer"}}>
      <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${G[600]},${G[400]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#000"}}>MM</div>
      <span style={{fontSize:13,color:G[300],fontWeight:500}}>Maxwell Machado</span>
    </div>
  );
}

// ─── COMMAND BAR ──────────────────────────────────────────────────────────────
function CommandBar({companies,areas,onNavigate}) {
  const [open,setOpen] = useState(false);
  const [q,setQ] = useState("");
  const ref = useRef();
  useEffect(()=>{ if(open) ref.current?.focus(); },[open]);
  useEffect(()=>{
    const h=(e)=>{ if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setOpen(v=>!v);} if(e.key==="Escape")setOpen(false); };
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h);
  },[]);
  const results=[];
  if(q.trim()){
    companies.forEach(c=>{ if(c.toLowerCase().includes(q.toLowerCase())) results.push({label:c,sub:"Empresa",action:()=>{onNavigate("areas",c);setOpen(false);setQ("");}}); });
    companies.forEach(c=>areas.forEach(a=>{ if(a.toLowerCase().includes(q.toLowerCase())||c.toLowerCase().includes(q.toLowerCase())) results.push({label:`${c} / ${a}`,sub:"Workspace",action:()=>{onNavigate("workspace",c,a);setOpen(false);setQ("");}}); }));
  }
  return (
    <>
      <button onClick={()=>setOpen(true)} style={{background:G[800],border:`1px solid ${G[700]}`,borderRadius:9,padding:"8px 16px",color:G[600],fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
        <span>⌘</span> Busca rápida <span style={{fontSize:11,opacity:0.6}}>Ctrl+K</span>
      </button>
      {open&&(
        <div style={{position:"fixed",inset:0,background:"#00000088",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:100}} onClick={()=>{setOpen(false);setQ("");}}>
          <div style={{background:G[800],border:`1px solid ${G[500]}`,borderRadius:16,width:"90%",maxWidth:540,overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
            <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar empresa, área ou workspace..." style={{...S.inp,width:"100%",boxSizing:"border-box",borderRadius:0,border:"none",borderBottom:`1px solid ${G[700]}`,fontSize:15,padding:"18px 20px"}}/>
            {results.slice(0,6).map((r,i)=>(
              <div key={i} onClick={r.action} style={{padding:"14px 20px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${G[700]}33`}}>
                <span style={{fontSize:14,color:G[100]}}>{r.label}</span>
                <span style={{fontSize:11,color:G[600],letterSpacing:"1px"}}>{r.sub}</span>
              </div>
            ))}
            {q&&results.length===0&&<div style={{padding:"16px 20px",fontSize:13,color:G[600]}}>Nenhum resultado</div>}
            {!q&&<div style={{padding:"14px 20px",fontSize:12,color:G[700]}}>Digite para buscar...</div>}
          </div>
        </div>
      )}
    </>
  );
}

// ─── ORION ────────────────────────────────────────────────────────────────────
function OrionAgent() {
  const [open,setOpen] = useState(false);
  const [msgs,setMsgs] = useState([{role:"ai",text:"Olá! Sou o ORION, sua inteligência executiva MAXXXI. Analiso dados, respondo estrategicamente e auxilio em decisões. Como posso ajudar hoje?"}]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const endRef = useRef();
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,open]);
  const send = async () => {
    const q=input.trim(); if(!q||loading) return;
    setInput("");
    const newMsgs=[...msgs,{role:"user",text:q}];
    setMsgs(newMsgs); setLoading(true);
    const ctx="Você é o ORION — Inteligência Executiva MAXXXI. Especialista em gestão empresarial, finanças, estratégia, compliance e inovação. Responda de forma direta, executiva e em português. Use metodologias modernas (OKR, BSC, PDCA, Lean) quando relevante. Empresas: Forme Seguro, Original Fotografia, Doctor Wealth, CDL.";
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:ctx,messages:newMsgs.slice(-10).map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}))})});
      const data=await res.json();
      setMsgs(p=>[...p,{role:"ai",text:data.content?.[0]?.text||"Erro ao processar."}]);
    } catch { setMsgs(p=>[...p,{role:"ai",text:"Erro de conexão."}]); }
    setLoading(false);
  };
  return (
    <>
      <button onClick={()=>setOpen(v=>!v)}
        style={{position:"fixed",bottom:28,right:28,width:60,height:60,borderRadius:"50%",background:`linear-gradient(135deg,${G[600]},${G[500]})`,border:`2px solid ${G[400]}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2,boxShadow:`0 4px 28px ${G[400]}55`,zIndex:300,transition:"all 0.2s"}}>
        <div style={{fontSize:10,fontWeight:800,color:G[100],letterSpacing:"1px"}}>ORION</div>
        <div style={{fontSize:16}}>{open?"✕":"🤖"}</div>
      </button>
      {open&&(
        <div style={{position:"fixed",bottom:104,right:28,width:380,background:G[800],border:`1px solid ${G[500]}`,borderRadius:18,display:"flex",flexDirection:"column",zIndex:300,boxShadow:`0 8px 40px #00000099`,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(135deg,${G[700]},${G[800]})`,padding:"16px 20px",borderBottom:`1px solid ${G[700]}`,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${G[500]},${G[400]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:G[100],letterSpacing:"1px"}}>ORION</div>
              <div style={{fontSize:10,color:G[500],letterSpacing:"2px"}}>{AGENT_SUBTITLE}</div>
            </div>
            <div style={{marginLeft:"auto",width:9,height:9,borderRadius:"50%",background:"#5bc4a0",boxShadow:"0 0 8px #5bc4a0"}}/>
          </div>
          <div style={{height:320,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",background:m.role==="user"?`linear-gradient(135deg,${G[600]},${G[500]})`:`${G[700]}`,border:`1px solid ${m.role==="user"?G[500]:G[600]}44`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"10px 14px",fontSize:13,color:G[100],lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                  {m.role==="ai"&&<div style={{fontSize:9,color:G[500],letterSpacing:"2px",marginBottom:4}}>ORION · INTELIGÊNCIA EXECUTIVA</div>}
                  {m.text}
                </div>
              </div>
            ))}
            {loading&&<div style={{display:"flex"}}><div style={{background:G[700],borderRadius:"12px 12px 12px 4px",padding:"10px 14px",fontSize:13,color:G[500]}}>Analisando...</div></div>}
            <div ref={endRef}/>
          </div>
          <div style={{padding:"12px 16px",borderTop:`1px solid ${G[700]}`,display:"flex",gap:8}}>
            <input style={{...S.inp,flex:1,fontSize:13,padding:"9px 14px"}} placeholder="Pergunte ao ORION..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
            <button style={{...S.btn,padding:"9px 16px",minWidth:44}} onClick={send} disabled={loading}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── AGENT TIP ────────────────────────────────────────────────────────────────
function AgentTip() {
  const [idx,setIdx]=useState(0);
  const [loading,setLoading]=useState(false);
  const tip=AGENT_TIPS[idx];
  const next=()=>{setLoading(true);setTimeout(()=>{setIdx(i=>(i+1)%AGENT_TIPS.length);setLoading(false);},350);};
  return (
    <div style={{background:G[800],border:`1px solid ${G[600]}44`,borderLeft:`3px solid ${TC[tip.type]}`,borderRadius:14,padding:"16px 20px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{fontSize:20,flexShrink:0}}>{TI[tip.type]}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:11,letterSpacing:"2px",color:TC[tip.type],fontWeight:600}}>{TL[tip.type]}</span>
            <span style={{fontSize:11,color:G[700]}}>· Agente MAXXXI</span>
          </div>
          <div style={{fontSize:14,color:G[200],lineHeight:1.6,opacity:loading?0.2:1,transition:"opacity 0.3s"}}>{tip.msg}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}>
        {tip.type==="melhoria"&&<button onClick={next} style={{background:`${G[400]}22`,border:`1px solid ${G[500]}`,borderRadius:7,padding:"5px 14px",color:G[300],fontSize:11,cursor:"pointer"}}>CONFIRMAR</button>}
        <button onClick={next} style={{background:"none",border:`1px solid ${G[700]}`,borderRadius:7,padding:"5px 14px",color:G[600],fontSize:11,cursor:"pointer"}}>{tip.type==="motivacao"||tip.type==="lei"?"CIENTE":"DISPENSAR"}</button>
      </div>
    </div>
  );
}

// ─── CONSOLIDATED ─────────────────────────────────────────────────────────────
function ConsolidatedPanel({companies}) {
  const allKpis=companies.map(c=>({company:c,kpis:LS.get("mx_kpi_"+c,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0})}));
  const totalFat=allKpis.reduce((s,k)=>s+k.kpis.fat,0);
  const totalRes=allKpis.reduce((s,k)=>s+(k.kpis.fat-k.kpis.custo),0);
  const totalCli=allKpis.reduce((s,k)=>s+k.kpis.clientes,0);
  return (
    <div style={{background:G[800],border:`1px solid ${G[500]}44`,borderRadius:14,padding:"20px 24px",marginBottom:16}}>
      <div style={S.lbl}>Visão CEO — Ecossistema Consolidado</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[{l:"Faturamento Total",v:fmt(totalFat)},{l:"Resultado Líquido",v:fmt(totalRes)},{l:"Clientes Totais",v:totalCli}].map((k,i)=>(
          <div key={i} style={{background:`${G[700]}55`,borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:G[600],marginBottom:4}}>{k.l}</div>
            <div style={{fontSize:22,fontWeight:700,color:G[300]}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
        {allKpis.map(({company:c,kpis:k})=>{
          const score=calcHealth(k);
          const color=score>=75?"#5bc4a0":score>=50?G[400]:score>=30?"#e07a5f":"#cc2222";
          return (
            <div key={c} style={{background:`${G[700]}55`,borderRadius:10,padding:"14px 16px"}}>
              <div style={{fontSize:13,fontWeight:600,color:G[200],marginBottom:8}}>{c}</div>
              <div style={{fontSize:18,color:G[300],marginBottom:6}}>{fmt(k.fat)}</div>
              <div style={{height:4,background:G[600],borderRadius:2,marginBottom:6}}>
                <div style={{height:"100%",width:`${score}%`,background:color,borderRadius:2}}/>
              </div>
              <HealthBadge score={score}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BRIEFING MODAL ───────────────────────────────────────────────────────────
function BriefingModal({company,onClose}) {
  const kpis=LS.get("mx_kpi_"+company,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0});
  const contracts=LS.get("mx_contracts_"+company,[]).filter(c=>c.status!=="Encerrado");
  const risks=LS.get("mx_risks_"+company,[]);
  const decisions=LS.get("mx_decisions_"+company,[]);
  const score=calcHealth(kpis);
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:G[800],border:`1px solid ${G[500]}`,borderRadius:18,width:"100%",maxWidth:600,maxHeight:"90vh",overflow:"auto",padding:"28px 32px"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div>
            <div style={{fontSize:11,letterSpacing:"3px",color:G[500],marginBottom:6}}>BRIEFING EXECUTIVO</div>
            <div style={{fontSize:24,fontWeight:700,color:G[100]}}>{company}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <HealthBadge score={score}/>
            <button onClick={onClose} style={{background:"none",border:`1px solid ${G[700]}`,borderRadius:8,padding:"8px 12px",color:G[600],cursor:"pointer",fontSize:16}}>✕</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[{l:"Faturamento",v:fmt(kpis.fat)},{l:"Custo Total",v:fmt(kpis.custo)},{l:"Meta",v:fmt(kpis.meta)},{l:"Margem",v:kpis.fat>0?`${Math.round((kpis.fat-kpis.custo)/kpis.fat*100)}%`:"—"},{l:"Clientes",v:kpis.clientes||"—"},{l:"Inadimplência",v:fmt(kpis.inadimplencia)}].map((k,i)=>(
            <div key={i} style={{background:`${G[700]}55`,borderRadius:10,padding:"12px 16px"}}>
              <div style={{fontSize:11,color:G[600],marginBottom:4}}>{k.l}</div>
              <div style={{fontSize:18,color:G[200],fontWeight:600}}>{k.v}</div>
            </div>
          ))}
        </div>
        {contracts.length>0&&<><div style={S.lbl}>Contratos Ativos</div>{contracts.slice(0,3).map((c,i)=><div key={i} style={{background:`${G[700]}55`,borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:G[200]}}>{c.nome}</span><span style={{fontSize:12,color:STATUS_COLORS[c.status]||G[400]}}>{c.status}</span></div>)}</>}
        {risks.filter(r=>r.nivel>=2).length>0&&<><div style={{...S.lbl,marginTop:14}}>Riscos Altos</div>{risks.filter(r=>r.nivel>=2).slice(0,3).map((r,i)=><div key={i} style={{background:`#e07a5f11`,border:"1px solid #e07a5f33",borderRadius:10,padding:"10px 14px",marginBottom:8,fontSize:13,color:G[200]}}>{r.descricao}</div>)}</>}
        {decisions.length>0&&<><div style={{...S.lbl,marginTop:14}}>Últimas Decisões</div>{decisions.slice(0,3).map((d,i)=><div key={i} style={{background:`${G[700]}55`,borderRadius:10,padding:"10px 14px",marginBottom:8,fontSize:13,color:G[200]}}>{d.descricao}</div>)}</>}
      </div>
    </div>
  );
}

// ─── WORKSPACE ────────────────────────────────────────────────────────────────
function Workspace({company,area}) {
  const [tab,setTab] = useState("kpi");
  const TABS = [{id:"kpi",label:"KPI & Metas"},{id:"contracts",label:"Contratos"},{id:"risks",label:"Riscos"},{id:"decisions",label:"Decisões"},{id:"files",label:"Arquivos"}];
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:`1px solid ${G[700]}`,paddingBottom:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?G[400]:"transparent"}`,padding:"10px 18px",color:tab===t.id?G[300]:G[600],fontSize:13,fontWeight:tab===t.id?600:400,cursor:"pointer",letterSpacing:"0.5px",marginBottom:-1,transition:"all 0.15s"}}>{t.label}</button>
        ))}
      </div>
      {tab==="kpi"&&<KPIPanel company={company}/>}
      {tab==="contracts"&&<ContractsPanel company={company}/>}
      {tab==="risks"&&<RisksPanel company={company}/>}
      {tab==="decisions"&&<DecisionsPanel company={company}/>}
      {tab==="files"&&<FilesPanel company={company} area={area}/>}
    </div>
  );
}

// ─── KPI PANEL ────────────────────────────────────────────────────────────────
function KPIPanel({company}) {
  const [kpis,setKpis] = useState(()=>LS.get("mx_kpi_"+company,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0}));
  const save=(k,v)=>{ const n={...kpis,[k]:parseFloat(v)||0}; setKpis(n); LS.set("mx_kpi_"+company,n); };
  const score=calcHealth(kpis);
  const chartData=[{label:"Fat.",value:kpis.fat,color:G[400]},{label:"Custo",value:kpis.custo,color:"#e07a5f"},{label:"Meta",value:kpis.meta,color:"#5bc4a0"},{label:"Pipeline",value:kpis.pipeline,color:"#a78bfa"}];
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={S.lbl}>{company} — Indicadores</div>
        <HealthBadge score={score}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:20}}>
        {[{k:"fat",l:"Faturamento Mensal"},{k:"custo",l:"Custo Total"},{k:"meta",l:"Meta Mensal"},{k:"clientes",l:"Nº Clientes"},{k:"inadimplencia",l:"Inadimplência (R$)"},{k:"caixa",l:"Caixa Atual"},{k:"pipeline",l:"Pipeline / Funil"}].map(({k,l})=>(
          <div key={k} style={{background:`${G[700]}55`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:G[600],marginBottom:6}}>{l}</div>
            <input type="number" style={{...S.inp,width:"100%",boxSizing:"border-box",fontSize:15,fontWeight:600,padding:"8px 12px"}} value={kpis[k]||""} onChange={e=>save(k,e.target.value)} placeholder="0"/>
          </div>
        ))}
      </div>
      {chartData.some(d=>d.value>0)&&(
        <div style={{background:`${G[700]}55`,borderRadius:12,padding:"16px 20px"}}>
          <div style={{fontSize:11,color:G[600],marginBottom:4}}>Comparativo</div>
          <BarChart data={chartData} height={90}/>
        </div>
      )}
    </div>
  );
}

// ─── CONTRACTS PANEL ──────────────────────────────────────────────────────────
function ContractsPanel({company}) {
  const [contracts,setContracts] = useState(()=>LS.get("mx_contracts_"+company,[]));
  const [showForm,setShowForm] = useState(false);
  const [form,setForm] = useState({nome:"",valor:0,status:"Ativo",vencimento:"",obs:""});
  const save=(list)=>{ setContracts(list); LS.set("mx_contracts_"+company,list); };
  const add=()=>{ if(!form.nome.trim()) return; save([...contracts,{...form,id:Date.now().toString()}]); setForm({nome:"",valor:0,status:"Ativo",vencimento:"",obs:""}); setShowForm(false); };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={S.lbl}>Contratos</div>
        <button style={S.btn} onClick={()=>setShowForm(v=>!v)}>+ Novo</button>
      </div>
      {showForm&&(
        <div style={{background:G[700],borderRadius:12,padding:"18px 20px",marginBottom:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{gridColumn:"1/-1"}}><div style={{fontSize:11,color:G[500],marginBottom:6}}>Nome do Contrato</div><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))}/></div>
          <div><div style={{fontSize:11,color:G[500],marginBottom:6}}>Valor (R$)</div><input type="number" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.valor} onChange={e=>setForm(p=>({...p,valor:parseFloat(e.target.value)||0}))}/></div>
          <div><div style={{fontSize:11,color:G[500],marginBottom:6}}>Status</div><select style={{...S.sel,width:"100%"}} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{CONTRACT_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div><div style={{fontSize:11,color:G[500],marginBottom:6}}>Vencimento</div><input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.vencimento} onChange={e=>setForm(p=>({...p,vencimento:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><div style={{fontSize:11,color:G[500],marginBottom:6}}>Obs.</div><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.obs} onChange={e=>setForm(p=>({...p,obs:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end",gap:8}}><button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button><button style={S.btn} onClick={add}>Salvar</button></div>
        </div>
      )}
      {contracts.length===0&&<div style={{fontSize:13,color:G[600]}}>Nenhum contrato cadastrado.</div>}
      {contracts.map((c,i)=>(
        <div key={c.id||i} style={{background:`${G[700]}55`,borderRadius:12,padding:"14px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:G[100],marginBottom:4}}>{c.nome}</div>
            <div style={{fontSize:12,color:G[600]}}>{fmt(c.valor)}{c.vencimento&&` · Vence ${new Date(c.vencimento+"T12:00:00").toLocaleDateString("pt-BR")}`}</div>
            {c.obs&&<div style={{fontSize:12,color:G[600],marginTop:2}}>{c.obs}</div>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:12,color:STATUS_COLORS[c.status]||G[400],background:(STATUS_COLORS[c.status]||G[400])+"22",padding:"4px 12px",borderRadius:20,fontWeight:600}}>{c.status}</span>
            <button style={S.del} onClick={()=>save(contracts.filter((_,j)=>j!==i))}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── RISKS PANEL ──────────────────────────────────────────────────────────────
function RisksPanel({company}) {
  const [risks,setRisks] = useState(()=>LS.get("mx_risks_"+company,[]));
  const [form,setForm] = useState({descricao:"",nivel:1,mitigacao:""});
  const [showForm,setShowForm] = useState(false);
  const save=(list)=>{ setRisks(list); LS.set("mx_risks_"+company,list); };
  const add=()=>{ if(!form.descricao.trim()) return; save([...risks,{...form,id:Date.now().toString()}]); setForm({descricao:"",nivel:1,mitigacao:""}); setShowForm(false); };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={S.lbl}>Mapa de Riscos</div>
        <button style={S.btn} onClick={()=>setShowForm(v=>!v)}>+ Risco</button>
      </div>
      {showForm&&(
        <div style={{background:G[700],borderRadius:12,padding:"18px 20px",marginBottom:16,display:"flex",flexDirection:"column",gap:10}}>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Descreva o risco..." value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))}/>
          <select style={{...S.sel,width:"100%"}} value={form.nivel} onChange={e=>setForm(p=>({...p,nivel:parseInt(e.target.value)}))}>
            {RISK_LABELS.map((l,i)=><option key={l} value={i}>{l}</option>)}
          </select>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Plano de mitigação..." value={form.mitigacao} onChange={e=>setForm(p=>({...p,mitigacao:e.target.value}))}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button><button style={S.btn} onClick={add}>Salvar</button></div>
        </div>
      )}
      {risks.length===0&&<div style={{fontSize:13,color:G[600]}}>Nenhum risco mapeado.</div>}
      {risks.map((r,i)=>(
        <div key={r.id||i} style={{background:`${G[700]}55`,borderRadius:12,padding:"14px 18px",marginBottom:10,borderLeft:`3px solid ${RISK_COLORS[r.nivel]||G[400]}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:G[100],marginBottom:4}}>{r.descricao}</div>
              {r.mitigacao&&<div style={{fontSize:13,color:G[600]}}>→ {r.mitigacao}</div>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:12,color:RISK_COLORS[r.nivel]||G[400],background:(RISK_COLORS[r.nivel]||G[400])+"22",padding:"4px 12px",borderRadius:20,fontWeight:600}}>{RISK_LABELS[r.nivel]}</span>
              <button style={S.del} onClick={()=>save(risks.filter((_,j)=>j!==i))}>✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DECISIONS PANEL ──────────────────────────────────────────────────────────
function DecisionsPanel({company}) {
  const [decisions,setDecisions] = useState(()=>LS.get("mx_decisions_"+company,[]));
  const [form,setForm] = useState({descricao:"",responsavel:"",prazo:"",status:"Pendente"});
  const [showForm,setShowForm] = useState(false);
  const save=(list)=>{ setDecisions(list); LS.set("mx_decisions_"+company,list); };
  const add=()=>{ if(!form.descricao.trim()) return; save([...decisions,{...form,id:Date.now().toString(),data:new Date().toISOString().slice(0,10)}]); setForm({descricao:"",responsavel:"",prazo:"",status:"Pendente"}); setShowForm(false); };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={S.lbl}>Histórico de Decisões</div>
        <button style={S.btn} onClick={()=>setShowForm(v=>!v)}>+ Decisão</button>
      </div>
      {showForm&&(
        <div style={{background:G[700],borderRadius:12,padding:"18px 20px",marginBottom:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{gridColumn:"1/-1"}}><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Descreva a decisão..." value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))}/></div>
          <input style={S.inp} placeholder="Responsável" value={form.responsavel} onChange={e=>setForm(p=>({...p,responsavel:e.target.value}))}/>
          <input type="date" style={S.inp} value={form.prazo} onChange={e=>setForm(p=>({...p,prazo:e.target.value}))}/>
          <div style={{gridColumn:"1/-1",display:"flex",gap:8,justifyContent:"flex-end"}}><button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button><button style={S.btn} onClick={add}>Salvar</button></div>
        </div>
      )}
      {decisions.length===0&&<div style={{fontSize:13,color:G[600]}}>Nenhuma decisão registrada.</div>}
      {decisions.map((d,i)=>(
        <div key={d.id||i} style={{background:`${G[700]}55`,borderRadius:12,padding:"14px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:G[100],marginBottom:4}}>{d.descricao}</div>
            <div style={{fontSize:12,color:G[600]}}>{d.data&&new Date(d.data+"T12:00:00").toLocaleDateString("pt-BR")}{d.responsavel&&` · ${d.responsavel}`}{d.prazo&&` · Prazo: ${new Date(d.prazo+"T12:00:00").toLocaleDateString("pt-BR")}`}</div>
          </div>
          <button style={S.del} onClick={()=>save(decisions.filter((_,j)=>j!==i))}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── FILES PANEL ──────────────────────────────────────────────────────────────
function FilesPanel({company,area}) {
  const key=`mx_files_${company}_${area}`;
  const [files,setFiles] = useState(()=>LS.get(key,[]));
  const [dragOver,setDragOver] = useState(false);
  const ref = useRef();
  const save=(list)=>{ setFiles(list); LS.set(key,list); };
  const addFiles=(fileList)=>{
    const newFiles=Array.from(fileList).map(f=>({id:Date.now()+"_"+f.name,name:f.name,size:f.size,date:new Date().toLocaleDateString("pt-BR"),url:URL.createObjectURL(f)}));
    save([...files,...newFiles]);
  };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={S.lbl}>{company} / {area} — Arquivos</div>
        <button style={S.btn} onClick={()=>ref.current.click()}>+ Upload</button>
      </div>
      <input ref={ref} type="file" multiple style={{display:"none"}} onChange={e=>addFiles(e.target.files)}/>
      <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);addFiles(e.dataTransfer.files);}}
        style={{border:`2px dashed ${dragOver?G[400]:G[700]}`,borderRadius:14,padding:"32px 20px",textAlign:"center",marginBottom:16,background:dragOver?`${G[400]}11`:"transparent",transition:"all 0.15s",cursor:"pointer"}} onClick={()=>ref.current.click()}>
        <div style={{fontSize:28,marginBottom:8}}>📁</div>
        <div style={{fontSize:14,color:G[600]}}>Arraste arquivos aqui ou clique para selecionar</div>
      </div>
      {files.length===0&&<div style={{fontSize:13,color:G[600]}}>Nenhum arquivo nesta área.</div>}
      {files.map((f,i)=>(
        <div key={f.id||i} style={{background:`${G[700]}55`,borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:22}}>{getFileIcon(f.name)}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:G[100]}}>{f.name}</div>
            <div style={{fontSize:11,color:G[600]}}>{formatSize(f.size)} · {f.date}</div>
          </div>
          {f.url&&<a href={f.url} download={f.name} style={{fontSize:11,color:G[400],textDecoration:"none",padding:"5px 12px",border:`1px solid ${G[600]}`,borderRadius:7}}>↓</a>}
          <button style={S.del} onClick={()=>save(files.filter((_,j)=>j!==i))}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── PERSONAL FINANCE ─────────────────────────────────────────────────────────
function PersonalFinance() {
  const [tab,setTab]=useState("despesas");
  const [transactions,setTransactions]=useState(()=>LS.get("mx_personal_transactions",[]));
  const [form,setForm]=useState({tipo:"despesa",descricao:"",valor:0,categoria:CATS[0],data:new Date().toISOString().slice(0,10),mes:new Date().getMonth(),ano:new Date().getFullYear()});
  const [showForm,setShowForm]=useState(false);
  const save=(list)=>{ setTransactions(list); LS.set("mx_personal_transactions",list); };
  const add=()=>{ if(!form.descricao.trim()||!form.valor) return; save([...transactions,{...form,id:Date.now().toString()}]); setForm(f=>({...f,descricao:"",valor:0})); setShowForm(false); };
  const mes=new Date().getMonth(); const ano=new Date().getFullYear();
  const curr=transactions.filter(t=>t.mes===mes&&t.ano===ano);
  const receitas=curr.filter(t=>t.tipo==="receita").reduce((s,t)=>s+t.valor,0);
  const despesas=curr.filter(t=>t.tipo==="despesa").reduce((s,t)=>s+t.valor,0);
  const byCat=CATS.map((c,i)=>({label:c.substring(0,4),value:curr.filter(t=>t.tipo==="despesa"&&t.categoria===c).reduce((s,t)=>s+t.valor,0),color:CAT_COLORS[i]})).filter(d=>d.value>0);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
        {[{l:"Receitas",v:receitas,c:"#5bc4a0"},{l:"Despesas",v:despesas,c:"#e07a5f"},{l:"Saldo",v:receitas-despesas,c:receitas-despesas>=0?"#5bc4a0":"#e07a5f"}].map((k,i)=>(
          <div key={i} style={{background:`${G[700]}55`,borderRadius:12,padding:"14px 18px"}}>
            <div style={{fontSize:11,color:G[600],marginBottom:6}}>{k.l} — {MESES_FULL[mes]}</div>
            <div style={{fontSize:22,fontWeight:700,color:k.c}}>{fmt(k.v)}</div>
          </div>
        ))}
      </div>
      {byCat.length>0&&<div style={{background:`${G[700]}55`,borderRadius:12,padding:"14px 18px",marginBottom:20}}><div style={{fontSize:11,color:G[600],marginBottom:4}}>Despesas por Categoria</div><BarChart data={byCat} height={80}/></div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:4}}>
          {["receitas","despesas","todos"].map(t=><button key={t} onClick={()=>setTab(t)} style={{...S.ghost,fontSize:12,padding:"6px 14px",borderColor:tab===t?G[400]:G[700],color:tab===t?G[300]:G[600]}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
        </div>
        <button style={S.btn} onClick={()=>setShowForm(v=>!v)}>+ Lançamento</button>
      </div>
      {showForm&&(
        <div style={{background:G[700],borderRadius:12,padding:"18px 20px",marginBottom:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <select style={{...S.sel,gridColumn:"1/-1"}} value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}>
            <option value="despesa">Despesa</option><option value="receita">Receita</option>
          </select>
          <input style={{...S.inp,gridColumn:"1/-1"}} placeholder="Descrição" value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))}/>
          <input type="number" style={S.inp} placeholder="Valor" value={form.valor||""} onChange={e=>setForm(p=>({...p,valor:parseFloat(e.target.value)||0}))}/>
          <input type="date" style={S.inp} value={form.data} onChange={e=>{ const d=new Date(e.target.value+"T12:00:00"); setForm(p=>({...p,data:e.target.value,mes:d.getMonth(),ano:d.getFullYear()})); }}/>
          {form.tipo==="despesa"&&<select style={{...S.sel,gridColumn:"1/-1"}} value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</select>}
          <div style={{gridColumn:"1/-1",display:"flex",gap:8,justifyContent:"flex-end"}}><button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button><button style={S.btn} onClick={add}>Salvar</button></div>
        </div>
      )}
      {transactions.filter(t=>tab==="todos"||t.tipo===(tab==="receitas"?"receita":"despesa")).sort((a,b)=>b.data.localeCompare(a.data)).slice(0,20).map((t,i)=>(
        <div key={t.id||i} style={{background:`${G[700]}55`,borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:G[100]}}>{t.descricao}</div>
            <div style={{fontSize:11,color:G[600]}}>{new Date(t.data+"T12:00:00").toLocaleDateString("pt-BR")}{t.categoria&&` · ${t.categoria}`}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:15,fontWeight:700,color:t.tipo==="receita"?"#5bc4a0":"#e07a5f"}}>{t.tipo==="receita"?"+":"-"}{fmt(t.valor)}</span>
            <button style={S.del} onClick={()=>save(transactions.filter((_,j)=>j!==i))}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── COMPANY CARD ─────────────────────────────────────────────────────────────
function CompanyCard({name,hov,logoUrl,onSelect,onDelete,onLogoUpload,onBriefing}) {
  const ref=useRef();
  const kpis=LS.get("mx_kpi_"+name,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0});
  const score=calcHealth(kpis);
  const color=score>=75?"#5bc4a0":score>=50?G[400]:score>=30?"#e07a5f":"#cc2222";
  return (
    <div onClick={onSelect} style={S.card(hov)}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div onClick={e=>{e.stopPropagation();ref.current.click();}} style={{width:42,height:42,borderRadius:10,background:G[700],border:`1px solid ${G[600]}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,cursor:"pointer"}}>
          {logoUrl?<img src={logoUrl} style={{width:"100%",height:"100%",objectFit:"contain"}} alt={name}/>:<span style={{fontSize:10,color:G[600]}}>LOGO</span>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:16,fontWeight:700,color:G[100],overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
          <div style={{fontSize:12,color,letterSpacing:"1px",marginTop:2}}>Score {score}</div>
        </div>
      </div>
      <div style={{height:4,background:G[700],borderRadius:2,marginTop:4}}>
        <div style={{height:"100%",width:`${score}%`,background:color,borderRadius:2,transition:"width 0.5s"}}/>
      </div>
      {kpis.fat>0&&<div style={{fontSize:13,color:G[400],fontWeight:600}}>{fmt(kpis.fat)}</div>}
      <button style={{position:"absolute",bottom:12,right:12,background:`${G[600]}44`,border:`1px solid ${G[500]}`,borderRadius:7,padding:"4px 10px",color:G[300],fontSize:11,cursor:"pointer",letterSpacing:"1px"}} onClick={e=>{e.stopPropagation();onBriefing();}}>BRIEF</button>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onClick={e=>e.stopPropagation()} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onLogoUpload(ev.target.result);r.readAsDataURL(f);e.target.value="";}}/>
      <button style={{position:"absolute",top:10,right:10,...S.del}} onClick={e=>{e.stopPropagation();onDelete();}}>✕</button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Maxxxi() {
  const [companies,setCompanies]=useState(()=>LS.get("mx_companies",INIT_COMPANIES));
  const [logoMap,setLogoMap]=useState(()=>LS.get("mx_logos",{}));
  const [areas,setAreas]=useState(()=>LS.get("mx_areas",INIT_AREAS));
  const [selCompany,setSelCompany]=useState(null);
  const [selArea,setSelArea]=useState(null);
  const [showAddC,setShowAddC]=useState(false);
  const [showAddA,setShowAddA]=useState(false);
  const [newC,setNewC]=useState("");
  const [newA,setNewA]=useState("");
  const [hov,setHov]=useState(null);
  const [screen,setScreen]=useState("companies");
  const [showConsolidated,setShowConsolidated]=useState(false);
  const [briefingCompany,setBriefingCompany]=useState(null);

  useEffect(()=>{LS.set("mx_companies",companies);},[companies]);
  useEffect(()=>{LS.set("mx_logos",logoMap);},[logoMap]);
  useEffect(()=>{LS.set("mx_areas",areas);},[areas]);

  const navigate=(sc,company,area)=>{setScreen(sc);if(company)setSelCompany(company);if(area)setSelArea(area);};
  const goHome=()=>{setSelCompany(null);setSelArea(null);setScreen("companies");};
  const goAreas=()=>{setSelArea(null);setScreen("areas");};
  const addCompany=()=>{const n=newC.trim();if(n&&!companies.includes(n))setCompanies([...companies,n]);setNewC("");setShowAddC(false);};
  const addArea=()=>{const n=newA.trim();if(n&&!areas.includes(n))setAreas([...areas,n]);setNewA("");setShowAddA(false);};

  return (
    <div style={{minHeight:"100vh",background:"#000",color:G[200],fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>

      {/* ── HEADER ── */}
      <div style={{padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${G[700]}`,gap:14,flexWrap:"wrap"}}>
        <div style={{cursor:"pointer"}} onClick={goHome}>
          <div style={{fontSize:34,fontWeight:900,letterSpacing:"-3px",lineHeight:1,color:G[300]}}>MAX<span style={{color:G[400]}}>XXI</span></div>
          <div style={{fontSize:10,color:G[600],letterSpacing:"4px",textTransform:"uppercase",marginTop:3}}>Plataforma de Gestão Executiva</div>
        </div>
        <a href="https://drive.google.com/drive/folders/1OnjLvt2-wl_f-KParYc6e7CJ0EPbw4O2" target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,background:G[800],border:`1px solid ${G[600]}`,borderRadius:10,padding:"9px 16px",color:G[300],fontSize:13,textDecoration:"none",letterSpacing:"1px"}}>
          <svg width="16" height="16" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
          MAXXXI Drive
        </a>
        <CommandBar companies={companies} areas={areas} onNavigate={navigate}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <AlertsBell companies={companies}/>
          <UserProfile/>
        </div>
      </div>
      <div style={{height:2,background:`linear-gradient(90deg,transparent,${G[400]} 30%,${G[300]} 50%,${G[400]} 70%,transparent)`}}/>

      {/* ── CONTEÚDO ── */}
      <div style={{flex:1,padding:"28px 40px",maxWidth:1600,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* Breadcrumb nas sub-telas */}
        {screen!=="companies"&&(
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,fontSize:13}}>
            <span style={{cursor:"pointer",color:G[600]}} onClick={goHome}>Ecossistema</span>
            {selCompany&&<><span style={{color:G[700]}}>›</span><span style={{cursor:screen==="workspace"?"pointer":"default",color:screen==="workspace"?G[600]:G[400]}} onClick={goAreas}>{selCompany}</span></>}
            {screen==="workspace"&&<><span style={{color:G[700]}}>›</span><span style={{color:G[400]}}>{selArea}</span></>}
            {screen==="personal"&&<><span style={{color:G[700]}}>›</span><span style={{color:G[400]}}>Gestão Pessoal</span></>}
          </div>
        )}

        {/* ── HOME: EMPRESAS PRIMEIRO ── */}
        {screen==="companies"&&(
          <>
            {/* Visão CEO */}
            <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              <button onClick={()=>setShowConsolidated(v=>!v)} style={{...S.ghost,fontSize:12}}>{showConsolidated?"▼ Fechar Visão CEO":"▶ Visão CEO Consolidada"}</button>
            </div>
            {showConsolidated&&<ConsolidatedPanel companies={companies}/>}

            {/* Empresas — destaque máximo */}
            <div style={{fontSize:11,letterSpacing:"3px",color:G[500],textTransform:"uppercase",marginBottom:10}}>Ecossistema</div>
            <div style={{fontSize:24,fontWeight:700,color:G[100],marginBottom:20,letterSpacing:"-0.5px"}}>Qual empresa vamos trabalhar agora?</div>
            <div style={S.grid}>
              {companies.map(c=>(
                <div key={c} onMouseEnter={()=>setHov(c)} onMouseLeave={()=>setHov(null)}>
                  <CompanyCard name={c} hov={hov===c} logoUrl={logoMap[c]}
                    onSelect={()=>{setSelCompany(c);setScreen("areas");}}
                    onDelete={()=>setCompanies(companies.filter(x=>x!==c))}
                    onLogoUpload={url=>setLogoMap(p=>({...p,[c]:url}))}
                    onBriefing={()=>setBriefingCompany(c)}/>
                </div>
              ))}
              <div style={{...S.card(hov==="pessoal"),borderStyle:"dashed"}} onMouseEnter={()=>setHov("pessoal")} onMouseLeave={()=>setHov(null)} onClick={()=>setScreen("personal")}>
                <div style={{fontSize:24,color:G[400]}}>👤</div>
                <div style={{fontSize:16,fontWeight:700,color:G[100]}}>Gestão Pessoal</div>
                <div style={{fontSize:13,color:G[600]}}>Finanças · Receitas · Despesas</div>
              </div>
              {showAddC?(
                <div style={{gridColumn:"1/-1",display:"flex",gap:10}}>
                  <input autoFocus style={S.inp} placeholder="Nome da nova empresa..." value={newC} onChange={e=>setNewC(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCompany()}/>
                  <button style={S.btn} onClick={addCompany}>Adicionar</button>
                  <button style={S.ghost} onClick={()=>{setShowAddC(false);setNewC("");}}>Cancelar</button>
                </div>
              ):(
                <div style={S.addCard(hov==="addC")} onClick={()=>setShowAddC(true)} onMouseEnter={()=>setHov("addC")} onMouseLeave={()=>setHov(null)}>
                  <div style={{width:24,height:24,borderRadius:"50%",border:"1px solid currentColor",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>+</div>Nova empresa
                </div>
              )}
            </div>

            {/* Agenda, Check-in e Dica — no FINAL */}
            <div style={{marginTop:32}}>
              <AgendaWidget/>
              <DailyCheckin/>
              <AgentTip/>
            </div>
          </>
        )}

        {/* Áreas */}
        {screen==="areas"&&(
          <>
            <div style={{fontSize:11,letterSpacing:"3px",color:G[500],textTransform:"uppercase",marginBottom:10}}>Áreas — {selCompany}</div>
            <div style={{fontSize:24,fontWeight:700,color:G[100],marginBottom:20}}>Onde vamos focar agora?</div>
            <div style={S.grid}>
              {areas.map(a=>(
                <div key={a} style={S.card(hov===a)} onMouseEnter={()=>setHov(a)} onMouseLeave={()=>setHov(null)} onClick={()=>{setSelArea(a);setScreen("workspace");}}>
                  <div style={{fontSize:22,color:G[400]}}>{getAreaIcon(a)}</div>
                  <div style={{fontSize:16,fontWeight:700,color:G[100]}}>{a}</div>
                  <button style={{position:"absolute",top:10,right:10,...S.del}} onClick={e=>{e.stopPropagation();setAreas(areas.filter(x=>x!==a));}}>✕</button>
                </div>
              ))}
              {showAddA?(
                <div style={{gridColumn:"1/-1",display:"flex",gap:10}}>
                  <input autoFocus style={S.inp} placeholder="Nova área..." value={newA} onChange={e=>setNewA(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addArea()}/>
                  <button style={S.btn} onClick={addArea}>Adicionar</button>
                  <button style={S.ghost} onClick={()=>{setShowAddA(false);setNewA("");}}>Cancelar</button>
                </div>
              ):(
                <div style={S.addCard(hov==="addA")} onClick={()=>setShowAddA(true)} onMouseEnter={()=>setHov("addA")} onMouseLeave={()=>setHov(null)}>
                  <div style={{width:24,height:24,borderRadius:"50%",border:"1px solid currentColor",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>+</div>Nova área
                </div>
              )}
            </div>
            <div style={{marginTop:32,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <AgendaWidget/>
              <DailyCheckin/>
            </div>
            <AgentTip/>
          </>
        )}

        {screen==="workspace"&&<Workspace company={selCompany} area={selArea}/>}
        {screen==="personal"&&(
          <>
            <div style={{fontSize:11,letterSpacing:"3px",color:G[500],textTransform:"uppercase",marginBottom:10}}>Gestão Pessoal</div>
            <div style={{fontSize:24,fontWeight:700,color:G[100],marginBottom:20}}>Controle de Receitas & Despesas</div>
            <PersonalFinance/>
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{padding:"12px 40px",borderTop:`1px solid ${G[800]}`,display:"flex",justifyContent:"space-between"}}>
        <div style={{fontSize:10,color:G[700],letterSpacing:"3px"}}>MAXXXI ◆ MÁQUINA DE GESTÃO</div>
        <div style={{fontSize:10,color:G[700],letterSpacing:"3px"}}>v5.3</div>
      </div>

      {briefingCompany&&<BriefingModal company={briefingCompany} onClose={()=>setBriefingCompany(null)}/>}
      <OrionAgent/>
    </div>
  );
}
