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

const S = {
  inp:{background:G[800],border:`1px solid ${G[600]}`,borderRadius:8,padding:"9px 13px",color:G[100],fontSize:13,outline:"none"},
  btn:{background:`linear-gradient(135deg,${G[400]},${G[300]})`,border:"none",borderRadius:8,padding:"9px 16px",color:"#000",fontWeight:700,fontSize:12,cursor:"pointer"},
  ghost:{background:"none",border:`1px solid ${G[700]}`,borderRadius:8,padding:"7px 12px",color:G[600],fontSize:12,cursor:"pointer"},
  lbl:{fontSize:9,letterSpacing:"4px",color:G[500],textTransform:"uppercase",marginBottom:8},
  box:{background:"#00000099",border:`1px solid ${G[700]}`,borderRadius:14,padding:"18px 20px",marginBottom:12},
  del:{background:"none",border:"none",color:G[700],cursor:"pointer",fontSize:12,padding:0},
  sel:{background:G[800],border:`1px solid ${G[600]}`,borderRadius:8,padding:"8px 12px",color:G[100],fontSize:13,outline:"none"},
  card:h=>({background:h?`linear-gradient(135deg,${G[800]},${G[700]}99)`:`${G[800]}55`,border:`1px solid ${h?G[500]:G[700]}`,borderRadius:12,padding:"14px",cursor:"pointer",transition:"all 0.15s",position:"relative",display:"flex",flexDirection:"column",gap:5,boxShadow:h?`0 4px 20px ${G[500]}22`:"none"}),
  addCard:h=>({background:"transparent",border:`1px dashed ${h?G[400]:G[700]}`,borderRadius:12,padding:"14px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:h?G[300]:G[600],fontSize:13,transition:"all 0.15s"}),
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:10,marginBottom:12},
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
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:c,background:c+"11"}}>{score}</div>
      <span style={{fontSize:9,color:c,letterSpacing:"1px"}}>{l}</span>
    </div>
  );
}

// ─── MINI CHART ──────────────────────────────────────────────────────────────
function BarChart({data,height=70}) {
  const max=Math.max(...data.map(d=>d.value),1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height,marginTop:8}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:"100%",background:d.color||G[400],borderRadius:"3px 3px 0 0",height:`${(d.value/max)*100}%`,minHeight:d.value>0?3:0,transition:"height 0.5s"}}/>
          <div style={{fontSize:8,color:G[600],whiteSpace:"nowrap",overflow:"hidden",maxWidth:"100%"}}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── AGENDA COMPLETA ─────────────────────────────────────────────────────────
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
    <div style={{background:G[800],border:`1px solid ${G[600]}44`,borderLeft:`3px solid #5bc4a0`,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:9,letterSpacing:"3px",color:"#5bc4a0"}}>📅 AGENDA — GOOGLE CALENDAR</div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setShowLink(v=>!v)} style={{background:`${G[600]}33`,border:`1px solid ${G[600]}`,borderRadius:7,padding:"4px 10px",color:G[300],fontSize:10,cursor:"pointer",letterSpacing:"1px"}}>🔗 LINK</button>
          <button onClick={()=>setShowForm(v=>!v)} style={{background:`${G[400]}22`,border:`1px solid ${G[500]}`,borderRadius:7,padding:"4px 10px",color:G[300],fontSize:10,cursor:"pointer",letterSpacing:"1px"}}>+ EVENTO</button>
          <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:G[600],textDecoration:"none",letterSpacing:"1px",padding:"5px 8px"}}>ABRIR ↗</a>
        </div>
      </div>

      {showLink&&(
        <div style={{background:`#5bc4a011`,border:`1px solid #5bc4a033`,borderRadius:9,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:9,color:"#5bc4a0",letterSpacing:"2px",marginBottom:6}}>LINK DE DISPONIBILIDADE</div>
          <div style={{fontSize:11,color:G[600],marginBottom:8}}>Compartilhe este link para que alguém veja sua agenda e marque um horário com você</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,background:G[700],borderRadius:7,padding:"8px 10px",fontSize:10,color:G[400],overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{availLink}</div>
            <button onClick={copyLink} style={{background:copied?"#5bc4a0":G[700],border:`1px solid ${copied?"#5bc4a0":G[600]}`,borderRadius:7,padding:"7px 14px",color:copied?"#000":G[300],fontSize:10,cursor:"pointer",fontWeight:600,transition:"all 0.2s",whiteSpace:"nowrap"}}>{copied?"COPIADO ✓":"COPIAR"}</button>
          </div>
        </div>
      )}

      {showForm&&(
        <div style={{background:G[700],borderRadius:9,padding:"14px",marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontSize:9,color:G[500],letterSpacing:"3px",marginBottom:2}}>NOVO COMPROMISSO</div>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Título do evento..." value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="date" style={{...S.inp,flex:1}} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            <label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:G[400],cursor:"pointer",flexShrink:0}}>
              <input type="checkbox" checked={form.allDay} onChange={e=>setForm(f=>({...f,allDay:e.target.checked}))} style={{accentColor:G[400]}}/>
              Dia inteiro
            </label>
          </div>
          {!form.allDay&&(
            <div style={{display:"flex",gap:8}}>
              <input type="time" style={{...S.inp,flex:1}} value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))} placeholder="Início"/>
              <input type="time" style={{...S.inp,flex:1}} value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))} placeholder="Fim"/>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button>
            <button style={S.btn} onClick={addEvent}>Salvar Evento</button>
          </div>
        </div>
      )}

      {upcoming.length===0&&<div style={{fontSize:11,color:G[700]}}>Nenhum evento nos próximos dias</div>}
      {upcoming.map(ev=>(
        <div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
          <div style={{width:38,textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:8,color:G[600],letterSpacing:"1px"}}>{new Date(ev.date+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"short"}).toUpperCase()}</div>
            <div style={{fontSize:13,fontWeight:700,color:G[300]}}>{ev.date.slice(8)}</div>
          </div>
          <div style={{flex:1,background:`${G[700]}55`,borderRadius:7,padding:"6px 10px"}}>
            <div style={{fontSize:12,fontWeight:600,color:G[100]}}>{ev.title}</div>
            {ev.allDay
              ? <div style={{fontSize:10,color:G[600],marginTop:1}}>Dia inteiro</div>
              : ev.start&&<div style={{fontSize:10,color:G[600],marginTop:1}}>{ev.start}{ev.end?" — "+ev.end:""}</div>
            }
          </div>
          <button style={{...S.del,fontSize:11}} onClick={()=>setEvents(events.filter(x=>x.id!==ev.id))}>✕</button>
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
      <button onClick={()=>setOpen(v=>!v)} style={{background:"none",border:`1px solid ${color}44`,borderRadius:9,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color,fontSize:14,position:"relative"}}>
        🔔
        {alerts.length>0&&<div style={{position:"absolute",top:-4,right:-4,background:color,borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#000"}}>{alerts.length}</div>}
      </button>
      {open&&(
        <div style={{position:"absolute",top:44,right:0,background:G[800],border:`1px solid ${G[600]}`,borderRadius:12,padding:"14px",width:300,zIndex:100,boxShadow:`0 8px 32px #00000088`}}>
          <div style={{fontSize:9,letterSpacing:"3px",color:G[500],marginBottom:10}}>ALERTAS ATIVOS</div>
          {alerts.length===0&&<div style={{fontSize:12,color:G[600]}}>Nenhum alerta no momento ✓</div>}
          {alerts.map((a,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:7,background:a.type==="danger"?"#e07a5f11":"#c9a84c11",border:`1px solid ${a.type==="danger"?"#e07a5f33":"#c9a84c33"}`,borderRadius:8,padding:"8px 10px"}}>
              <span style={{fontSize:12}}>{a.type==="danger"?"⚠":"⚡"}</span>
              <span style={{fontSize:12,color:G[200],lineHeight:1.4}}>{a.msg}</span>
            </div>
          ))}
          <button onClick={()=>setOpen(false)} style={{...S.ghost,width:"100%",marginTop:8,fontSize:11}}>Fechar</button>
        </div>
      )}
    </div>
  );
}

// ─── BRIEFING MODAL ──────────────────────────────────────────────────────────
function BriefingModal({company,onClose}) {
  const kpis=LS.get("mx_kpi_"+company,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0});
  const okrs=LS.get("mx_okr_"+company,[]);
  const contracts=LS.get("mx_contracts_"+company,[]);
  const decisions=LS.get("mx_decisions_"+company,[]);
  const score=calcHealth(kpis);
  const pct=kpis.meta>0?((kpis.fat/kpis.meta)*100).toFixed(1):0;
  const today=new Date().toLocaleDateString("pt-BR");
  const activeContracts=contracts.filter(c=>c.status==="Ativo"||c.status==="A vencer");
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:G[800],border:`1px solid ${G[500]}`,borderRadius:16,padding:"28px 32px",width:"100%",maxWidth:560,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:9,letterSpacing:"3px",color:G[500],marginBottom:4}}>BRIEFING EXECUTIVO</div>
            <div style={{fontSize:20,fontWeight:700,color:G[100]}}>{company}</div>
            <div style={{fontSize:11,color:G[600]}}>{today}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <HealthBadge score={score}/>
            <button style={{...S.del,fontSize:18}} onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            [fmt(kpis.fat),"Faturamento",G[300]],
            [fmt(kpis.fat-kpis.custo),"Resultado",kpis.fat-kpis.custo>=0?"#5bc4a0":"#e07a5f"],
            [`${pct}%`,"Meta",parseFloat(pct)>=100?"#5bc4a0":parseFloat(pct)>=80?G[400]:"#e07a5f"],
            [fmt(kpis.caixa),"Caixa",kpis.caixa>=0?G[200]:"#e07a5f"]
          ].map(([v,l,c])=>(
            <div key={l} style={{background:G[700],borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:G[600],letterSpacing:"2px",marginBottom:3}}>{l}</div>
              <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        {okrs.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:G[500],letterSpacing:"3px",marginBottom:8}}>OKRs ATIVOS</div>
            {okrs.slice(0,2).map(o=>{
              const p=Math.round(o.krs.reduce((s,k)=>s+(Math.min(k.atual,k.meta)/k.meta)*100,0)/o.krs.length);
              return (
                <div key={o.id} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:12,color:G[200]}}>{o.objetivo}</span>
                    <span style={{fontSize:11,fontWeight:600,color:p>=80?"#5bc4a0":G[400]}}>{p}%</span>
                  </div>
                  <div style={{height:4,background:G[700],borderRadius:2}}>
                    <div style={{height:"100%",width:`${p}%`,background:p>=80?"#5bc4a0":G[400],borderRadius:2}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {activeContracts.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:G[500],letterSpacing:"3px",marginBottom:8}}>CONTRATOS ATIVOS ({activeContracts.length})</div>
            {activeContracts.slice(0,3).map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:G[200],marginBottom:4}}>
                <span>{c.nome}</span>
                <span style={{color:STATUS_COLORS[c.status]}}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
        {decisions.length>0&&(
          <div>
            <div style={{fontSize:9,color:G[500],letterSpacing:"3px",marginBottom:8}}>ÚLTIMA DECISÃO</div>
            <div style={{background:G[700],borderRadius:8,padding:"10px 12px",fontSize:12,color:G[200]}}>
              {decisions[0].decisao}
              <div style={{fontSize:10,color:G[700],marginTop:3}}>{decisions[0].date}</div>
            </div>
          </div>
        )}
        <button style={{...S.btn,width:"100%",marginTop:20}} onClick={onClose}>Fechar Briefing</button>
      </div>
    </div>
  );
}

// ─── USER PROFILE ────────────────────────────────────────────────────────────
function UserProfile() {
  const [name,setName]=useState(()=>LS.get("mx_name",""));
  const [photo,setPhoto]=useState(()=>LS.get("mx_photo",""));
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState("");
  const ref=useRef();
  const save=()=>{LS.set("mx_name",draft);setName(draft);setEditing(false);};
  const handlePhoto=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setPhoto(ev.target.result);LS.set("mx_photo",ev.target.result);};r.readAsDataURL(f);};
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      {editing?(
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} style={{...S.inp,width:130}} placeholder="Seu nome..." autoFocus/>
          <button style={S.btn} onClick={save}>OK</button>
          <button style={S.ghost} onClick={()=>setEditing(false)}>✕</button>
        </div>
      ):(
        <span style={{fontSize:13,color:G[300],cursor:"pointer"}} onClick={()=>{setDraft(name);setEditing(true);}}>
          {name||<span style={{color:G[600]}}>Seu nome</span>}
        </span>
      )}
      <div onClick={()=>ref.current.click()} style={{width:38,height:38,borderRadius:"50%",background:G[700],border:`2px solid ${G[500]}`,overflow:"hidden",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {photo?<img src={photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="user"/>:<span style={{fontSize:9,color:G[600]}}>FOTO</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
    </div>
  );
}

// ─── COMMAND BAR ─────────────────────────────────────────────────────────────
function CommandBar({companies,areas,onNavigate}) {
  const [open,setOpen]=useState(false);
  const [q,setQ]=useState("");
  const ref=useRef();
  useEffect(()=>{
    const h=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setOpen(v=>!v);}if(e.key==="Escape")setOpen(false);};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[]);
  useEffect(()=>{if(open)ref.current?.focus();},[open]);
  const results=[];
  if(q.trim()){
    companies.forEach(c=>{
      if(c.toLowerCase().includes(q.toLowerCase())) results.push({label:c,sub:"Empresa",action:()=>{onNavigate("areas",c,null);setOpen(false);setQ("");}});
      areas.forEach(a=>{
        if((c+" "+a).toLowerCase().includes(q.toLowerCase())) results.push({label:`${c} → ${a}`,sub:"Workspace",action:()=>{onNavigate("workspace",c,a);setOpen(false);setQ("");}});
      });
    });
    if("gestão pessoal".includes(q.toLowerCase())) results.push({label:"Gestão Pessoal",sub:"Finanças",action:()=>{onNavigate("personal",null,null);setOpen(false);setQ("");}});
  }
  if(!open) return (
    <button onClick={()=>setOpen(true)} style={{...S.ghost,display:"flex",alignItems:"center",gap:8,padding:"6px 14px"}}>
      <span style={{fontSize:13}}>⌘</span><span style={{fontSize:11}}>Busca rápida</span><span style={{fontSize:9,color:G[700]}}>Ctrl+K</span>
    </button>
  );
  return (
    <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:999,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:80}} onClick={()=>setOpen(false)}>
      <div style={{background:G[800],border:`1px solid ${G[500]}`,borderRadius:14,width:"90%",maxWidth:520,overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
        <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar empresa, área ou workspace..." style={{...S.inp,width:"100%",boxSizing:"border-box",borderRadius:0,border:"none",borderBottom:`1px solid ${G[700]}`,fontSize:15,padding:"16px 18px"}}/>
        {results.slice(0,6).map((r,i)=>(
          <div key={i} onClick={r.action} style={{padding:"12px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${G[700]}33`}}>
            <span style={{fontSize:13,color:G[100]}}>{r.label}</span>
            <span style={{fontSize:10,color:G[600],letterSpacing:"1px"}}>{r.sub}</span>
          </div>
        ))}
        {q&&results.length===0&&<div style={{padding:"14px 18px",fontSize:12,color:G[600]}}>Nenhum resultado</div>}
        {!q&&<div style={{padding:"12px 18px",fontSize:11,color:G[700]}}>Digite para buscar...</div>}
      </div>
    </div>
  );
}

// ─── ORION — AGENTE IA FLUTUANTE ─────────────────────────────────────────────
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
    const ctx="Você é o ORION — Inteligência Executiva MAXXXI. Especialista em gestão empresarial, finanças, estratégia, compliance e inovação. Responda de forma direta, executiva e em português. Use metodologias modernas (OKR, BSC, PDCA, Lean, 5W2H, Matriz BCG) quando relevante. Seja analítico, prático e objetivo. Empresas do ecossistema: Forme Seguro, Original Fotografia, Doctor Wealth, CDL.";
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
        style={{position:"fixed",bottom:28,right:28,width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${G[600]},${G[500]})`,border:`2px solid ${G[400]}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1,boxShadow:`0 4px 24px ${G[400]}44`,zIndex:300,transition:"all 0.2s"}}>
        <div style={{fontSize:9,fontWeight:800,color:G[100],letterSpacing:"1px"}}>ORION</div>
        <div style={{fontSize:14}}>{open?"✕":"🤖"}</div>
      </button>
      {open&&(
        <div style={{position:"fixed",bottom:98,right:28,width:360,background:G[800],border:`1px solid ${G[500]}`,borderRadius:16,display:"flex",flexDirection:"column",zIndex:300,boxShadow:`0 8px 40px #00000099`,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(135deg,${G[700]},${G[800]})`,padding:"14px 18px",borderBottom:`1px solid ${G[700]}`,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${G[500]},${G[400]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🤖</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:G[100],letterSpacing:"1px"}}>ORION</div>
              <div style={{fontSize:9,color:G[500],letterSpacing:"2px"}}>{AGENT_SUBTITLE}</div>
            </div>
            <div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:"#5bc4a0",boxShadow:"0 0 6px #5bc4a0"}}/>
          </div>
          <div style={{height:300,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:8}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",background:m.role==="user"?`linear-gradient(135deg,${G[600]},${G[500]})`:`${G[700]}`,border:`1px solid ${m.role==="user"?G[500]:G[600]}44`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"9px 12px",fontSize:12,color:G[100],lineHeight:1.55,whiteSpace:"pre-wrap"}}>
                  {m.role==="ai"&&<div style={{fontSize:8,color:G[500],letterSpacing:"2px",marginBottom:4}}>ORION · INTELIGÊNCIA EXECUTIVA</div>}
                  {m.text}
                </div>
              </div>
            ))}
            {loading&&<div style={{display:"flex"}}><div style={{background:G[700],borderRadius:"12px 12px 12px 4px",padding:"9px 12px",fontSize:12,color:G[500]}}>Analisando...</div></div>}
            <div ref={endRef}/>
          </div>
          <div style={{padding:"10px 14px",borderTop:`1px solid ${G[700]}`,display:"flex",gap:8}}>
            <input style={{...S.inp,flex:1,fontSize:12,padding:"8px 12px"}} placeholder="Pergunte ao ORION..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
            <button style={{...S.btn,padding:"8px 14px",minWidth:40}} onClick={send} disabled={loading}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}
function AgentTip() {
  const [idx,setIdx]=useState(0);
  const [loading,setLoading]=useState(false);
  const tip=AGENT_TIPS[idx];
  const next=()=>{setLoading(true);setTimeout(()=>{setIdx(i=>(i+1)%AGENT_TIPS.length);setLoading(false);},350);};
  return (
    <div style={{background:G[800],border:`1px solid ${G[600]}44`,borderLeft:`3px solid ${TC[tip.type]}`,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{fontSize:18,flexShrink:0}}>{TI[tip.type]}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <span style={{fontSize:9,letterSpacing:"2px",color:TC[tip.type],fontWeight:600}}>{TL[tip.type]}</span>
            <span style={{fontSize:9,color:G[700]}}>· Agente MAXXXI</span>
          </div>
          <div style={{fontSize:13,color:G[200],lineHeight:1.6,opacity:loading?0.2:1,transition:"opacity 0.3s"}}>{tip.msg}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
        {tip.type==="melhoria"&&<button onClick={next} style={{background:`${G[400]}22`,border:`1px solid ${G[500]}`,borderRadius:6,padding:"4px 12px",color:G[300],fontSize:10,cursor:"pointer"}}>CONFIRMAR</button>}
        <button onClick={next} style={{background:"none",border:`1px solid ${G[700]}`,borderRadius:6,padding:"4px 12px",color:G[600],fontSize:10,cursor:"pointer"}}>{tip.type==="motivacao"||tip.type==="lei"?"CIENTE":"DISPENSAR"}</button>
      </div>
    </div>
  );
}

// ─── CONSOLIDATED ────────────────────────────────────────────────────────────
function ConsolidatedPanel({companies}) {
  const allKpis=companies.map(c=>({company:c,kpis:LS.get("mx_kpi_"+c,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0})}));
  const totalFat=allKpis.reduce((s,k)=>s+k.kpis.fat,0);
  const totalRes=allKpis.reduce((s,k)=>s+(k.kpis.fat-k.kpis.custo),0);
  const totalCli=allKpis.reduce((s,k)=>s+k.kpis.clientes,0);
  return (
    <div style={S.box}>
      <div style={S.lbl}>Visão CEO — Ecossistema Consolidado</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        {[["Faturamento Total",fmt(totalFat),G[300]],["Resultado Total",fmt(totalRes),totalRes>=0?"#5bc4a0":"#e07a5f"],["Clientes Totais",totalCli,G[200]]].map(([l,v,c])=>(
          <div key={l} style={{background:G[700],borderRadius:9,padding:"12px 14px"}}>
            <div style={{fontSize:9,color:G[600],letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>{l}</div>
            <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      {allKpis.map(({company,kpis})=>{
        const score=calcHealth(kpis);
        const pct=kpis.meta>0?Math.min((kpis.fat/kpis.meta)*100,100):0;
        const color=score>=75?"#5bc4a0":score>=50?G[400]:score>=30?"#e07a5f":"#cc2222";
        return (
          <div key={company} style={{background:`${G[700]}55`,border:`1px solid ${G[700]}`,borderRadius:8,padding:"10px 14px",marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontSize:13,fontWeight:600,color:G[100]}}>{company}</span>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,color:G[500]}}>{fmt(kpis.fat)}</span>
                <div style={{fontSize:9,fontWeight:700,color,background:color+"22",borderRadius:5,padding:"2px 8px"}}>Score {score}</div>
              </div>
            </div>
            <div style={{height:4,background:G[700],borderRadius:2}}>
              <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:2,transition:"width 0.5s"}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DAILY CHECKIN ───────────────────────────────────────────────────────────
function DailyCheckin() {
  const today=new Date().toLocaleDateString("pt-BR");
  const key="mx_checkin_"+today;
  const [tasks,setTasks]=useState(()=>LS.get(key,[]));
  const [input,setInput]=useState("");
  useEffect(()=>{LS.set(key,tasks);},[tasks,key]);
  const add=()=>{const t=input.trim();if(!t)return;setTasks(p=>[...p,{id:Date.now(),text:t,done:false}]);setInput("");};
  const toggle=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const done=tasks.filter(t=>t.done).length;
  return (
    <div style={{background:G[800],border:`1px solid ${G[600]}44`,borderLeft:`3px solid ${G[400]}`,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:9,letterSpacing:"3px",color:G[400]}}>CHECK-IN DO DIA — {today}</div>
        {tasks.length>0&&<span style={{fontSize:10,color:done===tasks.length?"#5bc4a0":G[600]}}>{done}/{tasks.length} concluídas</span>}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <input style={{...S.inp,flex:1}} placeholder="O que é prioridade hoje?" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
        <button style={{...S.btn,padding:"7px 14px"}} onClick={add}>+</button>
      </div>
      {tasks.map(t=>(
        <div key={t.id} onClick={()=>toggle(t.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",cursor:"pointer"}}>
          <div style={{width:14,height:14,borderRadius:3,border:`1px solid ${t.done?"#5bc4a0":G[600]}`,background:t.done?"#5bc4a088":"none",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {t.done&&<span style={{fontSize:10,color:"#5bc4a0"}}>✓</span>}
          </div>
          <span style={{fontSize:13,color:t.done?G[600]:G[200],textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI DASHBOARD ───────────────────────────────────────────────────────────
function KPIDashboard({company}) {
  const stKey="mx_kpi_"+company;
  const [kpis,setKpis]=useState(()=>LS.get(stKey,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0}));
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState({...kpis});
  useEffect(()=>{LS.set(stKey,kpis);},[kpis,stKey]);
  const resultado=kpis.fat-kpis.custo;
  const pct=kpis.meta>0?Math.min((kpis.fat/kpis.meta)*100,200):0;
  const inadPct=kpis.fat>0?((kpis.inadimplencia/kpis.fat)*100).toFixed(1):0;
  const score=calcHealth(kpis);
  const save=()=>{setKpis({...draft});setEditing(false);};
  return (
    <div style={S.box}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={S.lbl}>KPIs — {company}</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <HealthBadge score={score}/>
          <button style={{...S.ghost,fontSize:11,padding:"4px 10px"}} onClick={()=>{setDraft({...kpis});setEditing(v=>!v);}}>{editing?"Cancelar":"Editar"}</button>
        </div>
      </div>
      {editing&&(
        <div style={{background:G[700],borderRadius:10,padding:"14px",marginBottom:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["fat","Faturamento R$"],["custo","Custos R$"],["meta","Meta R$"],["clientes","Clientes ativos"],["inadimplencia","Inadimplência R$"],["caixa","Saldo em caixa R$"],["pipeline","Pipeline R$"]].map(([k,l])=>(
            <div key={k}>
              <div style={{fontSize:9,color:G[500],letterSpacing:"2px",marginBottom:3}}>{l}</div>
              <input type="number" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={draft[k]} onChange={e=>setDraft(p=>({...p,[k]:parseFloat(e.target.value)||0}))}/>
            </div>
          ))}
          <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end"}}>
            <button style={S.btn} onClick={save}>Salvar KPIs</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginBottom:12}}>
        {[[fmt(kpis.fat),"Faturamento",G[300]],[fmt(resultado),"Resultado",resultado>=0?"#5bc4a0":"#e07a5f"],[fmt(kpis.caixa),"Caixa",kpis.caixa>=0?G[200]:"#e07a5f"],[fmt(kpis.inadimplencia),"Inadimpl.",parseFloat(inadPct)>5?"#e07a5f":G[200]],[String(kpis.clientes),"Clientes",G[200]],[fmt(kpis.pipeline),"Pipeline","#a78bfa"]].map(([v,l,c])=>(
          <div key={l} style={{background:G[700],borderRadius:9,padding:"12px 12px"}}>
            <div style={{fontSize:9,color:G[600],letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>{l}</div>
            <div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:9,color:G[500],letterSpacing:"2px",textTransform:"uppercase"}}>Meta x Realizado</span>
          <span style={{fontSize:11,color:pct>=100?"#5bc4a0":G[400],fontWeight:600}}>{pct.toFixed(1)}%</span>
        </div>
        <div style={{height:6,background:G[700],borderRadius:3}}>
          <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:pct>=100?"#5bc4a0":G[400],borderRadius:3,transition:"width 0.5s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
          <span style={{fontSize:9,color:G[700]}}>Meta: {fmt(kpis.meta)}</span>
          <span style={{fontSize:9,color:G[700]}}>Realizado: {fmt(kpis.fat)}</span>
        </div>
      </div>
      <BarChart data={[{label:"Fat.",value:kpis.fat,color:G[400]},{label:"Custo",value:kpis.custo,color:"#e07a5f"},{label:"Caixa",value:kpis.caixa,color:"#5bc4a0"},{label:"Pipl.",value:kpis.pipeline,color:"#a78bfa"}]} height={65}/>
    </div>
  );
}

// ─── OKR ─────────────────────────────────────────────────────────────────────
function OKRPanel({company}) {
  const key="mx_okr_"+company;
  const [okrs,setOkrs]=useState(()=>LS.get(key,[]));
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({objetivo:"",krs:[{desc:"",meta:100,atual:0}]});
  useEffect(()=>{LS.set(key,okrs);},[okrs,key]);
  const addKR=()=>setForm(f=>({...f,krs:[...f.krs,{desc:"",meta:100,atual:0}]}));
  const updateKR=(i,field,val)=>setForm(f=>({...f,krs:f.krs.map((k,idx)=>idx===i?{...k,[field]:val}:k)}));
  const save=()=>{if(!form.objetivo.trim())return;setOkrs(p=>[...p,{...form,id:Date.now()}]);setForm({objetivo:"",krs:[{desc:"",meta:100,atual:0}]});setShowForm(false);};
  const pct=okr=>{const tot=okr.krs.reduce((s,k)=>s+(Math.min(k.atual,k.meta)/k.meta)*100,0);return Math.round(tot/okr.krs.length);};
  return (
    <div style={S.box}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={S.lbl}>OKRs</div>
        <button style={{...S.ghost,fontSize:11,padding:"4px 10px"}} onClick={()=>setShowForm(v=>!v)}>+ Objetivo</button>
      </div>
      {showForm&&(
        <div style={{background:G[700],borderRadius:10,padding:"14px",marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Objetivo..." value={form.objetivo} onChange={e=>setForm(f=>({...f,objetivo:e.target.value}))}/>
          {form.krs.map((kr,i)=>(
            <div key={i} style={{display:"flex",gap:6}}>
              <input style={{...S.inp,flex:2}} placeholder={"Key Result "+(i+1)} value={kr.desc} onChange={e=>updateKR(i,"desc",e.target.value)}/>
              <input type="number" style={{...S.inp,width:70}} placeholder="Meta" value={kr.meta} onChange={e=>updateKR(i,"meta",+e.target.value)}/>
              <input type="number" style={{...S.inp,width:70}} placeholder="Atual" value={kr.atual} onChange={e=>updateKR(i,"atual",+e.target.value)}/>
            </div>
          ))}
          <div style={{display:"flex",gap:8}}>
            <button style={{...S.ghost,fontSize:11}} onClick={addKR}>+ KR</button>
            <div style={{flex:1}}/>
            <button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button>
            <button style={S.btn} onClick={save}>Salvar</button>
          </div>
        </div>
      )}
      {okrs.map(okr=>{
        const p=pct(okr);
        const color=p>=80?"#5bc4a0":p>=50?G[400]:"#e07a5f";
        return (
          <div key={okr.id} style={{background:G[800],border:`1px solid ${G[700]}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:13,fontWeight:600,color:G[100]}}>{okr.objetivo}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:600,color}}>{p}%</span>
                <button style={S.del} onClick={()=>setOkrs(okrs.filter(x=>x.id!==okr.id))}>✕</button>
              </div>
            </div>
            <div style={{height:4,background:G[700],borderRadius:2,marginBottom:6}}>
              <div style={{height:"100%",width:`${p}%`,background:color,borderRadius:2,transition:"width 0.5s"}}/>
            </div>
            {okr.krs.map((kr,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:G[600],marginBottom:2}}>
                <span>{kr.desc||"Key Result "+(i+1)}</span>
                <span style={{color:Math.round(Math.min(kr.atual,kr.meta)/kr.meta*100)>=80?"#5bc4a0":G[400]}}>{kr.atual}/{kr.meta}</span>
              </div>
            ))}
          </div>
        );
      })}
      {okrs.length===0&&<div style={{fontSize:11,color:G[700],textAlign:"center",marginTop:8}}>Nenhum OKR definido</div>}
    </div>
  );
}

// ─── RISK MAP ────────────────────────────────────────────────────────────────
function RiskMap({company}) {
  const key="mx_risks_"+company;
  const [risks,setRisks]=useState(()=>LS.get(key,[]));
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({desc:"",prob:1,impact:1});
  useEffect(()=>{LS.set(key,risks);},[risks,key]);
  const add=()=>{if(!form.desc.trim())return;setRisks(p=>[...p,{...form,id:Date.now()}]);setForm({desc:"",prob:1,impact:1});setShowForm(false);};
  const score=r=>r.prob*r.impact;
  return (
    <div style={S.box}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={S.lbl}>Mapa de Risco</div>
        <button style={{...S.ghost,fontSize:11,padding:"4px 10px"}} onClick={()=>setShowForm(v=>!v)}>+ Risco</button>
      </div>
      {showForm&&(
        <div style={{background:G[700],borderRadius:10,padding:"14px",marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Descreva o risco..." value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:G[500],marginBottom:4}}>PROBABILIDADE (1-4)</div>
              <select style={{...S.sel,width:"100%"}} value={form.prob} onChange={e=>setForm(p=>({...p,prob:+e.target.value}))}>
                {[1,2,3,4].map(v=><option key={v} value={v}>{v} — {RISK_LABELS[v-1]}</option>)}
              </select>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:G[500],marginBottom:4}}>IMPACTO (1-4)</div>
              <select style={{...S.sel,width:"100%"}} value={form.impact} onChange={e=>setForm(p=>({...p,impact:+e.target.value}))}>
                {[1,2,3,4].map(v=><option key={v} value={v}>{v} — {RISK_LABELS[v-1]}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button>
            <button style={S.btn} onClick={add}>Salvar</button>
          </div>
        </div>
      )}
      {[...risks].sort((a,b)=>score(b)-score(a)).map(r=>{
        const s=score(r);const ci=s>=12?3:s>=6?2:s>=3?1:0;
        return (
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,background:`${G[800]}88`,border:`1px solid ${RISK_COLORS[ci]}44`,borderRadius:8,padding:"9px 12px",marginBottom:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:RISK_COLORS[ci],flexShrink:0}}/>
            <div style={{flex:1,fontSize:13,color:G[200]}}>{r.desc}</div>
            <div style={{fontSize:9,color:RISK_COLORS[ci],background:RISK_COLORS[ci]+"22",borderRadius:5,padding:"2px 8px"}}>{RISK_LABELS[ci]}</div>
            <button style={S.del} onClick={()=>setRisks(risks.filter(x=>x.id!==r.id))}>✕</button>
          </div>
        );
      })}
      {risks.length===0&&<div style={{fontSize:11,color:G[700],textAlign:"center",marginTop:8}}>Nenhum risco cadastrado</div>}
    </div>
  );
}

// ─── DECISIONS ───────────────────────────────────────────────────────────────
function DecisionsLog({company}) {
  const key="mx_decisions_"+company;
  const [decisions,setDecisions]=useState(()=>LS.get(key,[]));
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({decisao:"",contexto:"",resultado:""});
  useEffect(()=>{LS.set(key,decisions);},[decisions,key]);
  const add=()=>{if(!form.decisao.trim())return;setDecisions(p=>[{...form,id:Date.now(),date:new Date().toLocaleDateString("pt-BR")},...p]);setForm({decisao:"",contexto:"",resultado:""});setShowForm(false);};
  return (
    <div style={S.box}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={S.lbl}>Histórico de Decisões</div>
        <button style={{...S.ghost,fontSize:11,padding:"4px 10px"}} onClick={()=>setShowForm(v=>!v)}>+ Decisão</button>
      </div>
      {showForm&&(
        <div style={{background:G[700],borderRadius:10,padding:"14px",marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Decisão tomada..." value={form.decisao} onChange={e=>setForm(f=>({...f,decisao:e.target.value}))}/>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Contexto / motivo..." value={form.contexto} onChange={e=>setForm(f=>({...f,contexto:e.target.value}))}/>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Resultado esperado..." value={form.resultado} onChange={e=>setForm(f=>({...f,resultado:e.target.value}))}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button>
            <button style={S.btn} onClick={add}>Salvar</button>
          </div>
        </div>
      )}
      {decisions.map(d=>(
        <div key={d.id} style={{background:G[800],border:`1px solid ${G[700]}`,borderRadius:8,padding:"10px 12px",marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:G[100],marginBottom:3}}>{d.decisao}</div>
              {d.contexto&&<div style={{fontSize:11,color:G[600],marginBottom:2}}>{d.contexto}</div>}
              {d.resultado&&<div style={{fontSize:11,color:G[500]}}>{d.resultado}</div>}
              <div style={{fontSize:9,color:G[700],marginTop:4}}>{d.date}</div>
            </div>
            <button style={S.del} onClick={()=>setDecisions(decisions.filter(x=>x.id!==d.id))}>✕</button>
          </div>
        </div>
      ))}
      {decisions.length===0&&<div style={{fontSize:11,color:G[700],textAlign:"center",marginTop:8}}>Nenhuma decisão registrada</div>}
    </div>
  );
}

// ─── CONTRACTS ───────────────────────────────────────────────────────────────
function Contracts({company}) {
  const key="mx_contracts_"+company;
  const [contracts,setContracts]=useState(()=>LS.get(key,[]));
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({nome:"",cliente:"",valor:"",inicio:"",vencimento:"",status:"Ativo",obs:""});
  useEffect(()=>{LS.set(key,contracts);},[contracts,key]);
  const today=new Date();
  const alerts=contracts.filter(c=>{if(!c.vencimento)return false;const d=new Date(c.vencimento);const diff=Math.ceil((d-today)/(1000*60*60*24));return diff<=30&&c.status!=="Encerrado";}).map(c=>{const diff=Math.ceil((new Date(c.vencimento)-today)/(1000*60*60*24));return{...c,diff};});
  const add=()=>{if(!form.nome.trim())return;setContracts(p=>[...p,{...form,id:Date.now(),valor:parseFloat(form.valor)||0}]);setForm({nome:"",cliente:"",valor:"",inicio:"",vencimento:"",status:"Ativo",obs:""});setShowForm(false);};
  return (
    <div style={S.box}>
      {alerts.length>0&&(
        <div style={{background:"#e07a5f11",border:"1px solid #e07a5f33",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:9,letterSpacing:"2px",color:"#e07a5f",marginBottom:8}}>⚠ ALERTAS DE VENCIMENTO</div>
          {alerts.map(a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:G[200],marginBottom:4}}>
              <span>{a.nome}</span>
              <span style={{color:a.diff<=0?"#e07a5f":a.diff<=15?G[400]:"#edd99a",fontWeight:600}}>{a.diff<=0?"VENCIDO":a.diff===1?"Amanhã":`${a.diff} dias`}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={S.lbl}>Contratos</div>
        <button style={{...S.ghost,fontSize:11,padding:"4px 10px"}} onClick={()=>setShowForm(v=>!v)}>+ Contrato</button>
      </div>
      {showForm&&(
        <div style={{background:G[700],borderRadius:10,padding:"14px",marginBottom:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["nome","Nome do contrato"],["cliente","Cliente/Fornecedor"],["valor","Valor R$"]].map(([k,l])=>(
            <div key={k}><div style={{fontSize:9,color:G[500],marginBottom:3}}>{l}</div><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>
          ))}
          <div><div style={{fontSize:9,color:G[500],marginBottom:3}}>Status</div><select style={{...S.sel,width:"100%"}} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{CONTRACT_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
          {[["inicio","Início"],["vencimento","Vencimento"]].map(([k,l])=>(
            <div key={k}><div style={{fontSize:9,color:G[500],marginBottom:3}}>{l}</div><input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>
          ))}
          <div style={{gridColumn:"1/-1"}}><div style={{fontSize:9,color:G[500],marginBottom:3}}>Obs.</div><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.obs} onChange={e=>setForm(p=>({...p,obs:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end",gap:8}}><button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button><button style={S.btn} onClick={add}>Salvar</button></div>
        </div>
      )}
      {contracts.map(c=>(
        <div key={c.id} style={{background:`${G[800]}88`,border:`1px solid ${G[700]}`,borderRadius:8,padding:"10px 12px",marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:G[100],marginBottom:2}}>{c.nome}</div>
              <div style={{fontSize:11,color:G[600]}}>{c.cliente}{c.vencimento?" · Vence: "+c.vencimento:""}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {c.valor>0&&<span style={{fontSize:12,fontWeight:600,color:G[300]}}>{fmt(c.valor)}</span>}
              <span style={{fontSize:9,color:STATUS_COLORS[c.status],background:STATUS_COLORS[c.status]+"22",borderRadius:5,padding:"2px 8px"}}>{c.status}</span>
              <button style={S.del} onClick={()=>setContracts(contracts.filter(x=>x.id!==c.id))}>✕</button>
            </div>
          </div>
        </div>
      ))}
      {contracts.length===0&&<div style={{fontSize:11,color:G[700],textAlign:"center",marginTop:8}}>Nenhum contrato cadastrado</div>}
    </div>
  );
}

// ─── AI CHAT ─────────────────────────────────────────────────────────────────
function AIChat({company,area,files}) {
  const stKey="mx_chat_"+company+"_"+area;
  const [msgs,setMsgs]=useState(()=>LS.get(stKey,[{role:"ai",text:"Olá! Sou o agente MAXXXI dedicado a "+company+" / "+area+". Como posso ajudar?"}]));
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef();
  useEffect(()=>{LS.set(stKey,msgs.slice(-30));},[msgs,stKey]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=async()=>{
    const q=input.trim();if(!q||loading)return;
    setInput("");
    const newMsgs=[...msgs,{role:"user",text:q}];
    setMsgs(newMsgs);setLoading(true);
          const ctx="Você é o ORION — Inteligência Executiva MAXXXI. Especialista em gestão empresarial, finanças, estratégia e compliance. Empresa: "+company+", Área: "+area+". Responda de forma direta, executiva e em português. Use metodologias modernas (OKR, BSC, PDCA, Lean) quando relevante.";
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:ctx,messages:newMsgs.slice(-10).map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}))})});
      const data=await res.json();
      setMsgs(p=>[...p,{role:"ai",text:data.content?.[0]?.text||"Erro ao processar."}]);
    } catch {
      setMsgs(p=>[...p,{role:"ai",text:"Erro de conexão."}]);
    }
    setLoading(false);
  };
  return (
    <div style={S.box}>
      <div style={S.lbl}>ORION · {company} / {area}</div>
      <div style={{height:260,overflowY:"auto",display:"flex",flexDirection:"column",gap:8,marginBottom:10,paddingRight:2}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"82%",background:m.role==="user"?`linear-gradient(135deg,${G[600]},${G[500]})`:`${G[700]}`,border:`1px solid ${m.role==="user"?G[500]:G[600]}44`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"9px 13px",fontSize:13,color:G[100],lineHeight:1.55,whiteSpace:"pre-wrap"}}>
              {m.role==="ai"&&<div style={{fontSize:9,color:G[500],letterSpacing:"2px",marginBottom:4}}>ORION · INTELIGÊNCIA EXECUTIVA</div>}
              {m.text}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex"}}><div style={{background:G[700],borderRadius:"12px 12px 12px 4px",padding:"9px 13px",fontSize:13,color:G[500]}}>Analisando...</div></div>}
        <div ref={endRef}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <input style={{...S.inp,flex:1}} placeholder="Pergunte sobre dados, estratégia, gestão..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
        <button style={{...S.btn,minWidth:52}} onClick={send} disabled={loading}>↑</button>
      </div>
    </div>
  );
}

// ─── PERSONAL FINANCE ────────────────────────────────────────────────────────
function PersonalFinance() {
  const now=new Date();
  const [mes,setMes]=useState(now.getMonth());
  const [ano,setAno]=useState(now.getFullYear());
  const [entries,setEntries]=useState(()=>LS.get("mx_personal_entries",[]));
  const [form,setForm]=useState({tipo:"despesa",desc:"",valor:"",cat:"Alimentação"});
  const [showForm,setShowForm]=useState(false);
  useEffect(()=>{LS.set("mx_personal_entries",entries);},[entries]);
  const key=`${ano}-${mes}`;
  const filtered=entries.filter(e=>e.key===key);
  const totalR=filtered.filter(e=>e.tipo==="receita").reduce((s,e)=>s+e.valor,0);
  const totalD=filtered.filter(e=>e.tipo==="despesa").reduce((s,e)=>s+e.valor,0);
  const saldo=totalR-totalD;
  const catTotals={};CATS.forEach(c=>{catTotals[c]=filtered.filter(e=>e.tipo==="despesa"&&e.cat===c).reduce((s,e)=>s+e.valor,0);});
  const catMax=Math.max(...Object.values(catTotals),1);
  const addEntry=()=>{const v=parseFloat(form.valor.replace(",","."));if(!form.desc.trim()||isNaN(v)||v<=0)return;setEntries(p=>[...p,{id:Date.now(),key,tipo:form.tipo,desc:form.desc.trim(),valor:v,cat:form.cat,date:new Date().toLocaleDateString("pt-BR")}]);setForm(f=>({...f,desc:"",valor:""}));setShowForm(false);};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <select value={mes} onChange={e=>setMes(+e.target.value)} style={S.sel}>{MESES_FULL.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
        <select value={ano} onChange={e=>setAno(+e.target.value)} style={S.sel}>{[2023,2024,2025,2026].map(y=><option key={y}>{y}</option>)}</select>
        <button onClick={()=>setShowForm(v=>!v)} style={S.btn}>+ Lançamento</button>
      </div>
      {showForm&&(
        <div style={{background:G[800],border:`1px solid ${G[600]}`,borderRadius:12,padding:"16px",display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",gap:8}}>{["receita","despesa"].map(t=><button key={t} onClick={()=>setForm(f=>({...f,tipo:t}))} style={{flex:1,background:form.tipo===t?`linear-gradient(135deg,${G[400]},${G[300]})`:"none",border:`1px solid ${form.tipo===t?G[400]:G[700]}`,borderRadius:8,padding:"7px",color:form.tipo===t?"#000":G[600],fontSize:12,fontWeight:600,cursor:"pointer",textTransform:"uppercase"}}>{t}</button>)}</div>
          <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Descrição..." value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/>
          <div style={{display:"flex",gap:8}}>
            <input style={{...S.inp,flex:1}} placeholder="Valor R$..." value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addEntry()}/>
            {form.tipo==="despesa"&&<select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} style={S.sel}>{CATS.map(c=><option key={c}>{c}</option>)}</select>}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button style={S.ghost} onClick={()=>setShowForm(false)}>Cancelar</button><button style={S.btn} onClick={addEntry}>Salvar</button></div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {[["Receitas",totalR,"#5bc4a0"],["Despesas",totalD,"#e07a5f"],["Saldo",saldo,saldo>=0?"#5bc4a0":"#e07a5f"]].map(([l,v,c])=>(
          <div key={l} style={{background:G[800],border:`1px solid ${G[700]}`,borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:9,color:G[600],letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>{l}</div>
            <div style={{fontSize:18,fontWeight:700,color:c}}>{fmt(v)}</div>
          </div>
        ))}
      </div>
      {CATS.filter(c=>catTotals[c]>0).length>0&&(
        <div style={{background:G[800],border:`1px solid ${G[700]}`,borderRadius:12,padding:"16px"}}>
          <div style={S.lbl}>Despesas por Categoria</div>
          {CATS.filter(c=>catTotals[c]>0).map((c,i)=>(
            <div key={c} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:G[200]}}>{c}</span><span style={{fontSize:12,color:G[400],fontWeight:600}}>{fmt(catTotals[c])}</span></div>
              <div style={{height:5,background:G[700],borderRadius:2}}><div style={{height:"100%",width:`${(catTotals[c]/catMax)*100}%`,background:CAT_COLORS[i%CAT_COLORS.length],borderRadius:2,transition:"width 0.4s"}}/></div>
            </div>
          ))}
          <BarChart data={CATS.filter(c=>catTotals[c]>0).map((c,i)=>({label:c.slice(0,4),value:catTotals[c],color:CAT_COLORS[i%CAT_COLORS.length]}))} height={70}/>
        </div>
      )}
      {filtered.map(e=>(
        <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,background:G[800],border:`1px solid ${G[700]}`,borderRadius:8,padding:"8px 12px"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:e.tipo==="receita"?"#5bc4a0":"#e07a5f",flexShrink:0}}/>
          <div style={{flex:1,fontSize:12,color:G[200]}}>{e.desc}</div>
          {e.tipo==="despesa"&&<span style={{fontSize:9,color:G[500],background:`${G[600]}33`,borderRadius:4,padding:"2px 7px"}}>{e.cat}</span>}
          <span style={{fontSize:12,fontWeight:600,color:e.tipo==="receita"?"#5bc4a0":"#e07a5f"}}>{e.tipo==="receita"?"+":"-"}{fmt(e.valor)}</span>
          <button style={S.del} onClick={()=>setEntries(p=>p.filter(x=>x.id!==e.id))}>✕</button>
        </div>
      ))}
      {filtered.length===0&&<div style={{fontSize:11,color:G[700],textAlign:"center",marginTop:16}}>Nenhum lançamento em {MESES_FULL[mes]} {ano}</div>}
    </div>
  );
}

// ─── WORKSPACE ───────────────────────────────────────────────────────────────
function Workspace({company,area}) {
  const [files,setFiles]=useState([]);
  const [tab,setTab]=useState("ai");
  const fileRef=useRef();
  const handleFiles=fs=>{const arr=Array.from(fs).map(f=>({id:Date.now()+Math.random(),name:f.name,size:f.size,date:new Date().toLocaleDateString("pt-BR"),file:f}));setFiles(p=>[...arr,...p]);};
  const handleDownload=f=>{const url=URL.createObjectURL(f.file);const a=document.createElement("a");a.href=url;a.download=f.name;a.click();URL.revokeObjectURL(url);};
  const TABS=[["ai","🤖 Agente IA"],["kpi","📊 KPIs"],["okr","🎯 OKRs"],["contratos","📋 Contratos"],["riscos","⚠ Riscos"],["decisoes","🧠 Decisões"],["arquivos","📁 Arquivos"]];
  return (
    <div>
      <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
        {TABS.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:tab===k?`linear-gradient(135deg,${G[600]},${G[500]})`:`${G[800]}`,border:`1px solid ${tab===k?G[500]:G[700]}`,borderRadius:8,padding:"6px 12px",color:tab===k?G[100]:G[600],fontSize:11,cursor:"pointer",fontWeight:tab===k?600:400,transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>
      {tab==="ai"&&<AIChat company={company} area={area} files={files}/>}
      {tab==="kpi"&&<KPIDashboard company={company}/>}
      {tab==="okr"&&<OKRPanel company={company}/>}
      {tab==="contratos"&&<Contracts company={company}/>}
      {tab==="riscos"&&<RiskMap company={company}/>}
      {tab==="decisoes"&&<DecisionsLog company={company}/>}
      {tab==="arquivos"&&(
        <div style={S.box}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={S.lbl}>Base de Dados — Arquivos</div>
            {files.length>0&&<span style={{fontSize:10,color:G[600]}}>{files.length} arquivo{files.length>1?"s":""}</span>}
          </div>
          <div onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault();handleFiles(e.dataTransfer.files);}} onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${G[600]}`,borderRadius:10,padding:"20px",textAlign:"center",cursor:"pointer"}}>
            <div style={{fontSize:12,color:G[600],marginBottom:3}}>Arraste ou clique para selecionar</div>
            <div style={{fontSize:10,color:G[700]}}>PDF · WORD · EXCEL · PPT · TXT · JSON</div>
          </div>
          <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.json" style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
          {files.map(f=>(
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,background:`${G[800]}55`,border:`1px solid ${G[700]}`,borderRadius:7,padding:"8px 10px",marginTop:6}}>
              <span style={{fontSize:15}}>{getFileIcon(f.name)}</span>
              <div style={{flex:1,fontSize:12,color:G[200],overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
              <span style={{fontSize:10,color:G[600]}}>{formatSize(f.size)}</span>
              <button onClick={()=>handleDownload(f)} style={{background:"none",border:`1px solid ${G[700]}`,borderRadius:5,padding:"2px 8px",color:G[400],fontSize:10,cursor:"pointer"}}>↓</button>
              <button style={S.del} onClick={()=>setFiles(files.filter(x=>x.id!==f.id))}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMPANY CARD ────────────────────────────────────────────────────────────
function CompanyCard({name,hov,logoUrl,onSelect,onDelete,onLogoUpload,onBriefing}) {
  const ref=useRef();
  const kpis=LS.get("mx_kpi_"+name,{fat:0,custo:0,meta:0,clientes:0,inadimplencia:0,caixa:0,pipeline:0});
  const score=calcHealth(kpis);
  const color=score>=75?"#5bc4a0":score>=50?G[400]:score>=30?"#e07a5f":"#cc2222";
  return (
    <div onClick={onSelect} style={S.card(hov)}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div onClick={e=>{e.stopPropagation();ref.current.click();}} style={{width:34,height:34,borderRadius:7,background:G[700],border:`1px solid ${G[600]}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,cursor:"pointer"}}>
          {logoUrl?<img src={logoUrl} style={{width:"100%",height:"100%",objectFit:"contain"}} alt={name}/>:<span style={{fontSize:8,color:G[600]}}>LOGO</span>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:G[100],overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
          <div style={{fontSize:9,color,letterSpacing:"1px"}}>Score {score}</div>
        </div>
      </div>
      <div style={{height:3,background:G[700],borderRadius:2,marginTop:4}}>
        <div style={{height:"100%",width:`${score}%`,background:color,borderRadius:2}}/>
      </div>
      <button style={{position:"absolute",bottom:8,right:8,background:`${G[600]}44`,border:`1px solid ${G[500]}`,borderRadius:6,padding:"3px 8px",color:G[300],fontSize:9,cursor:"pointer",letterSpacing:"1px"}} onClick={e=>{e.stopPropagation();onBriefing();}}>BRIEF</button>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onClick={e=>e.stopPropagation()} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onLogoUpload(ev.target.result);r.readAsDataURL(f);e.target.value="";}}/>
      <button style={{position:"absolute",top:6,right:6,...S.del}} onClick={e=>{e.stopPropagation();onDelete();}}>✕</button>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
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

      <div style={{padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${G[700]}`,gap:12,flexWrap:"wrap"}}>
        <div style={{cursor:"pointer"}} onClick={goHome}>
          <div style={{fontSize:30,fontWeight:900,letterSpacing:"-3px",lineHeight:1,color:G[300]}}>MAX<span style={{color:G[400]}}>XXI</span></div>
          <div style={{fontSize:8,color:G[600],letterSpacing:"4px",textTransform:"uppercase",marginTop:2}}>Plataforma de Gestão Executiva</div>
        </div>
        <a href="https://drive.google.com/drive/folders/1OnjLvt2-wl_f-KParYc6e7CJ0EPbw4O2" target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,background:G[800],border:`1px solid ${G[600]}`,borderRadius:10,padding:"7px 14px",color:G[300],fontSize:12,textDecoration:"none",letterSpacing:"1px"}}>
          <svg width="14" height="14" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
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

      <div style={{flex:1,padding:"20px 28px"}}>

        {screen==="companies"&&<AgendaWidget/>}
        {screen==="companies"&&<DailyCheckin/>}
        {screen==="companies"&&<AgentTip/>}

        {screen!=="companies"&&(
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:16,fontSize:12}}>
            <span style={{cursor:"pointer",color:G[600]}} onClick={goHome}>Ecossistema</span>
            {selCompany&&<><span style={{color:G[700]}}>›</span><span style={{cursor:screen==="workspace"?"pointer":"default",color:screen==="workspace"?G[600]:G[400]}} onClick={goAreas}>{selCompany}</span></>}
            {screen==="workspace"&&<><span style={{color:G[700]}}>›</span><span style={{color:G[400]}}>{selArea}</span></>}
            {screen==="personal"&&<><span style={{color:G[700]}}>›</span><span style={{color:G[400]}}>Gestão Pessoal</span></>}
          </div>
        )}

        {screen==="companies"&&(
          <>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <button onClick={()=>setShowConsolidated(v=>!v)} style={{...S.ghost,fontSize:11}}>{showConsolidated?"▼ Fechar":"▶ Visão CEO Consolidada"}</button>
            </div>
            {showConsolidated&&<ConsolidatedPanel companies={companies}/>}
            <div style={{fontSize:9,letterSpacing:"4px",color:G[500],textTransform:"uppercase",marginBottom:10}}>Ecossistema</div>
            <div style={{fontSize:18,fontWeight:600,color:G[100],marginBottom:18,letterSpacing:"-0.5px"}}>Qual empresa vamos trabalhar agora?</div>
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
                <div style={{fontSize:20,color:G[400]}}>👤</div>
                <div style={{fontSize:13,fontWeight:600,color:G[100]}}>Gestão Pessoal</div>
                <div style={{fontSize:10,color:G[600]}}>Finanças · Receitas · Despesas</div>
              </div>
              {showAddC?(
                <div style={{gridColumn:"1/-1",display:"flex",gap:8}}>
                  <input autoFocus style={S.inp} placeholder="Nova empresa..." value={newC} onChange={e=>setNewC(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCompany()}/>
                  <button style={S.btn} onClick={addCompany}>Adicionar</button>
                  <button style={S.ghost} onClick={()=>{setShowAddC(false);setNewC("");}}>Cancelar</button>
                </div>
              ):(
                <div style={S.addCard(hov==="addC")} onClick={()=>setShowAddC(true)} onMouseEnter={()=>setHov("addC")} onMouseLeave={()=>setHov(null)}>
                  <div style={{width:20,height:20,borderRadius:"50%",border:"1px solid currentColor",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>+</div>Nova empresa
                </div>
              )}
            </div>
          </>
        )}

        {screen==="areas"&&(
          <>
            <div style={{fontSize:9,letterSpacing:"4px",color:G[500],textTransform:"uppercase",marginBottom:10}}>{"Áreas — "+selCompany}</div>
            <div style={{fontSize:18,fontWeight:600,color:G[100],marginBottom:18}}>Onde vamos focar agora?</div>
            <div style={S.grid}>
              {areas.map(a=>(
                <div key={a} style={S.card(hov===a)} onMouseEnter={()=>setHov(a)} onMouseLeave={()=>setHov(null)} onClick={()=>{setSelArea(a);setScreen("workspace");}}>
                  <div style={{fontSize:18,color:G[400]}}>{getAreaIcon(a)}</div>
                  <div style={{fontSize:13,fontWeight:600,color:G[100]}}>{a}</div>
                  <button style={{position:"absolute",top:6,right:6,...S.del}} onClick={e=>{e.stopPropagation();setAreas(areas.filter(x=>x!==a));}}>✕</button>
                </div>
              ))}
              {showAddA?(
                <div style={{gridColumn:"1/-1",display:"flex",gap:8}}>
                  <input autoFocus style={S.inp} placeholder="Nova área..." value={newA} onChange={e=>setNewA(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addArea()}/>
                  <button style={S.btn} onClick={addArea}>Adicionar</button>
                  <button style={S.ghost} onClick={()=>{setShowAddA(false);setNewA("");}}>Cancelar</button>
                </div>
              ):(
                <div style={S.addCard(hov==="addA")} onClick={()=>setShowAddA(true)} onMouseEnter={()=>setHov("addA")} onMouseLeave={()=>setHov(null)}>
                  <div style={{width:20,height:20,borderRadius:"50%",border:"1px solid currentColor",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>+</div>Nova área
                </div>
              )}
            </div>
          </>
        )}

        {screen==="workspace"&&<Workspace company={selCompany} area={selArea}/>}
        {screen==="personal"&&(
          <>
            <div style={{fontSize:9,letterSpacing:"4px",color:G[500],textTransform:"uppercase",marginBottom:10}}>Gestão Pessoal</div>
            <div style={{fontSize:18,fontWeight:600,color:G[100],marginBottom:18}}>Controle de Receitas & Despesas</div>
            <PersonalFinance/>
          </>
        )}
      </div>

      <div style={{padding:"10px 28px",borderTop:`1px solid ${G[800]}`,display:"flex",justifyContent:"space-between"}}>
        <div style={{fontSize:9,color:G[700],letterSpacing:"3px"}}>MAXXXI ◆ MÁQUINA DE GESTÃO</div>
        <div style={{fontSize:9,color:G[700],letterSpacing:"3px"}}>v5.1</div>
      </div>

      {briefingCompany&&<BriefingModal company={briefingCompany} onClose={()=>setBriefingCompany(null)}/>}
      <OrionAgent/>
    </div>
  );
}
