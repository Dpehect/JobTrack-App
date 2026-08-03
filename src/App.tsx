import {useEffect,useMemo,useState} from 'react';
import {Archive,BarChart3,BriefcaseBusiness,CalendarDays,ChevronDown,Command,FileText,Heart,LayoutDashboard,ListFilter,MapPin,MoreHorizontal,Plus,Search,Settings,SlidersHorizontal,Sparkles,X} from 'lucide-react';
import {stages} from './data';import {listApplications,removeApplication,saveApplication} from './storage';import type {Application,Stage,WorkMode} from './types';

type View='overview'|'applications'|'insights'|'documents';
const today=()=>new Date().toISOString().slice(0,10);
const emptyApp=():Application=>({id:crypto.randomUUID(),company:'',role:'',location:'',workMode:'Remote',stage:'saved',source:'LinkedIn',url:'',appliedAt:today(),favorite:false,createdAt:today(),updatedAt:today()});
const stageMeta=(s:Stage)=>stages.find(x=>x.id===s)!;

function App(){
 const [apps,setApps]=useState<Application[]>([]),[view,setView]=useState<View>('overview'),[query,setQuery]=useState(''),[modal,setModal]=useState<Application|null>(null),[loaded,setLoaded]=useState(false);
 useEffect(()=>{const refresh=()=>listApplications().then(x=>{setApps(x);setLoaded(true)});refresh();window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh)},[]);
 const filtered=useMemo(()=>apps.filter(a=>(a.company+' '+a.role+' '+a.location).toLowerCase().includes(query.toLowerCase())),[apps,query]);
 const active=apps.filter(a=>!['accepted','rejected'].includes(a.stage));const interviews=apps.filter(a=>a.stage==='interview').length;const offers=apps.filter(a=>a.stage==='offer').length;
 async function persist(a:Application){await saveApplication(a);setApps(x=>[a,...x.filter(i=>i.id!==a.id)]);setModal(null)}
 async function move(id:string,stage:Stage){const a=apps.find(x=>x.id===id);if(!a)return;const next={...a,stage,updatedAt:today()};await saveApplication(next);setApps(x=>x.map(i=>i.id===id?next:i))}
 async function trash(id:string){await removeApplication(id);setApps(x=>x.filter(i=>i.id!==id));setModal(null)}
 return <div className="shell">
  <aside className="sidebar">
   <div className="brand"><span className="brand-mark"><BriefcaseBusiness size={18}/></span><span>JobTrack</span><em>LOCAL</em></div>
   <button className="new-btn" onClick={()=>setModal(emptyApp())}><Plus size={17}/>New application <kbd>⌘ N</kbd></button>
   <nav>
    <p>Workspace</p>
    <Nav active={view==='overview'} icon={<LayoutDashboard/>} label="Overview" onClick={()=>setView('overview')}/>
    <Nav active={view==='applications'} icon={<BriefcaseBusiness/>} label="Applications" count={active.length} onClick={()=>setView('applications')}/>
    <Nav active={view==='insights'} icon={<BarChart3/>} label="Insights" onClick={()=>setView('insights')}/>
    <p>Organize</p>
    <Nav active={view==='documents'} icon={<FileText/>} label="Documents" onClick={()=>setView('documents')}/>
    <Nav icon={<CalendarDays/>} label="Interviews" count={interviews}/><Nav icon={<Archive/>} label="Archive"/>
   </nav>
   <div className="privacy"><span><span className="pulse"/>Stored locally</span><small>Your job search stays on this device.</small></div>
   <div className="profile"><div className="avatar">ES</div><div><strong>Elite Store</strong><small>Local workspace</small></div><Settings size={17}/></div>
  </aside>
  <main>
   <header><div className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search companies, roles, locations…"/><kbd>⌘ K</kbd></div><button className="icon-btn"><Command size={18}/></button><button className="avatar mini">ES</button></header>
   {!loaded?<div className="loader">Loading your workspace…</div>:view==='overview'?<Overview apps={filtered} active={active.length} interviews={interviews} offers={offers} open={setModal} go={()=>setView('applications')}/>:view==='applications'?<Applications apps={filtered} open={setModal} move={move}/>:view==='insights'?<Insights apps={apps}/>:<Documents/>}
  </main>
  {modal&&<ApplicationModal value={modal} save={persist} close={()=>setModal(null)} remove={modal.company?()=>trash(modal.id):undefined}/>} 
 </div>
}

function Nav({icon,label,active,count,onClick}:{icon:React.ReactNode;label:string;active?:boolean;count?:number;onClick?:()=>void}){return <button className={'nav-item '+(active?'active':'')} onClick={onClick}><span>{icon}</span>{label}{count!==undefined&&<b>{count}</b>}</button>}

function Overview({apps,active,interviews,offers,open,go}:{apps:Application[];active:number;interviews:number;offers:number;open:(a:Application)=>void;go:()=>void}){
 return <section className="content fade-in">
  <div className="page-title"><div><span className="eyebrow">MONDAY, AUGUST 3</span><h1>Good evening.</h1><p>Here’s where your job search stands today.</p></div><button className="primary" onClick={()=>open(emptyApp())}><Plus size={17}/>Add application</button></div>
  <div className="stats"><Stat label="Active applications" value={active} change="+3 this week"/><Stat label="Interviews" value={interviews} change="1 upcoming" tone="amber"/><Stat label="Offers" value={offers} change="Keep going" tone="green"/><Stat label="Response rate" value={apps.length?`${Math.round(((interviews+offers)/apps.length)*100)}%`:'0%'} change="Based on outcomes"/></div>
  <div className="grid-main">
   <div className="panel pipeline"><div className="panel-head"><div><h2>Application pipeline</h2><p>Your progress across every stage</p></div><button onClick={go}>View board <span>→</span></button></div>
    <div className="pipeline-row">{stages.slice(0,5).map(s=><div className="pipe" key={s.id}><div><span style={{background:s.dot}}/>{s.label}<b>{apps.filter(a=>a.stage===s.id).length}</b></div><i><em style={{width:`${Math.max(8,apps.filter(a=>a.stage===s.id).length/Math.max(1,apps.length)*100)}%`,background:s.dot}}/></i></div>)}</div>
   </div>
   <div className="panel momentum"><div className="panel-head"><div><h2>This week</h2><p>Your momentum</p></div><Sparkles size={18}/></div><strong>3</strong><span>applications added</span><div className="week-bars">{[30,56,42,78,66,18,8].map((n,i)=><i key={i} style={{height:n+'%'}} className={i===3?'hot':''}/>)}</div><div className="days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div>
  </div>
  <div className="panel recent"><div className="panel-head"><div><h2>Recent applications</h2><p>Updated across your pipeline</p></div><button onClick={go}>See all</button></div><ApplicationTable apps={apps.slice(0,5)} open={open}/></div>
 </section>
}
function Stat({label,value,change,tone}:{label:string;value:string|number;change:string;tone?:string}){return <div className="stat"><span>{label}</span><strong>{value}</strong><small className={tone}>{change}</small></div>}

function Applications({apps,open,move}:{apps:Application[];open:(a:Application)=>void;move:(id:string,s:Stage)=>void}){const [board,setBoard]=useState(true);return <section className="content fade-in"><div className="page-title compact"><div><span className="eyebrow">WORKSPACE</span><h1>Applications</h1><p>{apps.length} opportunities in your workspace</p></div><button className="primary" onClick={()=>open(emptyApp())}><Plus size={17}/>Add application</button></div><div className="toolbar"><div className="segmented"><button className={board?'active':''} onClick={()=>setBoard(true)}>Board</button><button className={!board?'active':''} onClick={()=>setBoard(false)}>List</button></div><button><ListFilter size={16}/>Filter</button><button><SlidersHorizontal size={16}/>Sort</button></div>{board?<div className="board">{stages.slice(0,5).map(s=><div className="column" key={s.id} onDragOver={e=>e.preventDefault()} onDrop={e=>move(e.dataTransfer.getData('id'),s.id)}><div className="column-title"><span style={{background:s.dot}}/>{s.label}<b>{apps.filter(a=>a.stage===s.id).length}</b><MoreHorizontal size={16}/></div>{apps.filter(a=>a.stage===s.id).map(a=><Card key={a.id} app={a} open={open}/>)}</div>)}</div>:<div className="panel"><ApplicationTable apps={apps} open={open}/></div>}</section>}

function Card({app,open}:{app:Application;open:(a:Application)=>void}){return <button draggable onDragStart={e=>e.dataTransfer.setData('id',app.id)} className="app-card" onClick={()=>open(app)}><div className="company-logo">{app.company.slice(0,2).toUpperCase()}</div><Heart size={15} fill={app.favorite?'currentColor':'none'} className={app.favorite?'liked':''}/><strong>{app.role}</strong><span>{app.company}</span><small><MapPin size={13}/>{app.location} · {app.workMode}</small><footer>{app.source}<time>{new Date(app.appliedAt).toLocaleDateString('en',{month:'short',day:'numeric'})}</time></footer></button>}

function ApplicationTable({apps,open}:{apps:Application[];open:(a:Application)=>void}){return <div className="table"><div className="tr th"><span>Company & role</span><span>Status</span><span>Location</span><span>Applied</span><span/></div>{apps.map(a=><button className="tr" key={a.id} onClick={()=>open(a)}><span className="who"><i>{a.company.slice(0,2).toUpperCase()}</i><b>{a.role}<small>{a.company}</small></b></span><span><em className="status" style={{'--dot':stageMeta(a.stage).dot} as React.CSSProperties}>{stageMeta(a.stage).label}</em></span><span>{a.location}<small>{a.workMode}</small></span><span>{new Date(a.appliedAt).toLocaleDateString('en',{month:'short',day:'numeric'})}</span><MoreHorizontal size={17}/></button>)}</div>}

function Insights({apps}:{apps:Application[]}){const response=apps.length?Math.round(apps.filter(a=>['screening','interview','offer','accepted'].includes(a.stage)).length/apps.length*100):0;return <section className="content fade-in"><div className="page-title compact"><div><span className="eyebrow">YOUR DATA</span><h1>Insights</h1><p>Clear signals, not made-up scores.</p></div></div><div className="insight-grid"><div className="panel big-number"><span>Response rate</span><strong>{response}%</strong><p>{apps.filter(a=>['screening','interview','offer','accepted'].includes(a.stage)).length} of {apps.length} applications progressed beyond applied.</p></div><div className="panel big-number"><span>Top source</span><strong>{topSource(apps)}</strong><p>Source with the most saved applications.</p></div><div className="panel insight-wide"><h2>Pipeline evidence</h2>{stages.slice(0,6).map(s=><div className="insight-line" key={s.id}><span>{s.label}</span><i><em style={{width:`${apps.filter(a=>a.stage===s.id).length/Math.max(1,apps.length)*100}%`,background:s.dot}}/></i><b>{apps.filter(a=>a.stage===s.id).length}</b></div>)}</div></div></section>}
function topSource(apps:Application[]){const c:Record<string,number>={};apps.forEach(a=>c[a.source]=(c[a.source]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}
function Documents(){return <section className="content fade-in"><div className="page-title compact"><div><span className="eyebrow">LOCAL VAULT</span><h1>Documents</h1><p>Keep each CV version tied to the right application.</p></div><button className="primary"><Plus size={17}/>Add document</button></div><div className="empty"><div><FileText size={26}/></div><h2>Your document vault is ready</h2><p>CVs and cover letters will stay on this device.</p><button className="primary">Choose a file</button></div></section>}

function ApplicationModal({value,save,close,remove}:{value:Application;save:(a:Application)=>void;close:()=>void;remove?:()=>void}){const [a,setA]=useState(value);const update=(k:keyof Application,v:string|boolean)=>setA(x=>({...x,[k]:v,updatedAt:today()}));return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&close()}><form className="modal" onSubmit={e=>{e.preventDefault();save(a)}}><div className="modal-head"><div><span className="eyebrow">APPLICATION</span><h2>{value.company?'Edit application':'Add an opportunity'}</h2><p>Only the essentials are required.</p></div><button type="button" className="close" onClick={close}><X/></button></div><div className="form-grid"><label>Company<input required autoFocus value={a.company} onChange={e=>update('company',e.target.value)} placeholder="e.g. Northstar Labs"/></label><label>Role<input required value={a.role} onChange={e=>update('role',e.target.value)} placeholder="e.g. Product Engineer"/></label><label>Stage<select value={a.stage} onChange={e=>update('stage',e.target.value)}>{stages.map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select><ChevronDown/></label><label>Applied on<input type="date" value={a.appliedAt} onChange={e=>update('appliedAt',e.target.value)}/></label><label>Location<input value={a.location} onChange={e=>update('location',e.target.value)} placeholder="City or country"/></label><label>Work mode<select value={a.workMode} onChange={e=>update('workMode',e.target.value as WorkMode)}><option>Remote</option><option>Hybrid</option><option>On-site</option></select><ChevronDown/></label><label>Source<input value={a.source} onChange={e=>update('source',e.target.value)} placeholder="LinkedIn"/></label><label>Job URL<input type="url" value={a.url} onChange={e=>update('url',e.target.value)} placeholder="https://…"/></label><label className="full">Notes<textarea value={a.notes||''} onChange={e=>update('notes',e.target.value)} placeholder="People, next steps, or anything worth remembering…"/></label></div><div className="modal-footer">{remove&&<button type="button" className="danger" onClick={remove}>Delete</button>}<span/><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary" disabled={!a.company||!a.role}>Save application</button></div></form></div>}
export default App;
